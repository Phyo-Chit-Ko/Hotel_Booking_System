<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\ReservationCharge;
use App\Models\Service;
use App\Http\Requests\StoreServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class ExtraServiceController extends Controller
{
    /**
     * Display UI Dashboard Table Data & Top Counter Cards
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $query = Service::with(['reservation', 'createdBy']);

        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('guest_name', 'like', "%{$search}%")
                  ->orWhere('reservation_id', 'like', "%{$search}%")
                  ->orWhere('service_type', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('food_items', 'like', "%{$search}%");
            });
        }

        $charges = $query->orderBy('id', 'asc')->get();

        $laundryCount = 0;
        $carRentalCount = 0;
        $foodCount = 0;

        $formattedData = $charges->map(function ($charge) use (&$laundryCount, &$carRentalCount, &$foodCount) {
            $type = $charge->service_type ?? 'Laundry';

            if ($type === 'Laundry') $laundryCount++;
            if ($type === 'Car Rental') $carRentalCount++;
            if ($type === 'Food') $foodCount++;

            // FIX: If food_items was stored as JSON, cleanly decode it into a readable string or strip brackets for your React column
            $rawFoodItems = $charge->food_items;
            if (!empty($rawFoodItems)) {
                $decoded = json_decode($rawFoodItems, true);
                if (is_array($decoded)) {
                    $rawFoodItems = implode(', ', $decoded);
                } else {
                    $rawFoodItems = trim($rawFoodItems, '"[]');
                }
            }

            return [
                'id'             => $charge->id,
                'reservation_id' => $charge->reservation_id,
                'room_number'    => $charge->reservation->room_number ?? null,
                'guest_name'     => $charge->guest_name ?? 'Unknown',
                'charge_date'    => $charge->charge_date ? \Carbon\Carbon::parse($charge->charge_date)->format('Y-m-d') : null,
                'service_type'   => $type,
                'description'    => $charge->description ?? '',
                'food_items'     => $rawFoodItems ?? '',
                'quantity'       => (int) $charge->quantity,
                'rate'           => (float) $charge->rate,
                'total'          => (float) $charge->total,
                'handled_by'     => $charge->createdBy?->name,
            ];
        });

        return response()->json([
            'success' => true,
            'metrics' => [
                'laundry_count'    => $laundryCount,
                'car_rental_count' => $carRentalCount,
                'food_count'       => $foodCount,
            ],
            'services' => $formattedData
        ]);
    }

    /**
     * Resolve a room number to the reservation currently checked into it.
     * Shared by store()/update() so a bad room number (or a room with no
     * in-house guest) gets a clean 422 instead of a raw FK error.
     */
    private function resolveActiveReservation(string $roomNumber): Reservation
    {
        $reservation = Reservation::where('room_number', $roomNumber)
            ->where('reservation_status', 'Checked-In')
            ->latest('reservation_id')
            ->first();

        if (!$reservation) {
            throw ValidationException::withMessages([
                'room_number' => 'No in-house guest found for this room. Extra charges can only be added to a checked-in reservation.',
            ]);
        }

        return $reservation;
    }

    /**
     * Keep a `reservation_charges` row (charge_type 'service') in sync with
     * this extra charge, so it counts toward the reservation's real balance
     * and shows up in the Check Balance ledger — previously these lived in
     * a completely disconnected table.
     */
    private function syncLedgerCharge(Service $extraCharge, Reservation $reservation): void
    {
        ReservationCharge::updateOrCreate(
            ['extra_charge_id' => $extraCharge->id],
            [
                'reservation_id' => $reservation->reservation_id,
                'charge_type'    => 'service',
                'description'    => trim("{$extraCharge->service_type} — " . ($extraCharge->description ?: 'Extra charge')),
                'amount'         => $extraCharge->total,
            ]
        );
    }

    /**
     * Store a newly created extra charge, linked to the room's current
     * in-house reservation, and mirrored into the reservation's charge ledger.
     */
    public function store(StoreServiceRequest $request): JsonResponse
    {
        $validatedData = $request->validated();

        try {
            $reservation = $this->resolveActiveReservation($validatedData['room_number']);
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => collect($e->errors())->first()[0]], 422);
        }

        unset($validatedData['room_number']);
        $validatedData['reservation_id'] = $reservation->reservation_id;
        $validatedData['guest_name']     = $reservation->guest?->full_name ?? $reservation->guest_name ?? 'Guest';

        $quantity = (int) $validatedData['quantity'];
        $rate = (float) $validatedData['rate'];
        $validatedData['total'] = $quantity * $rate;

        $validatedData['created_by'] = Auth::id() ?? 1;

        // FIX: If frontend sends it as a string instead of an array, don't double-json_encode it
        $foodInput = $request->input('food_items');
        $validatedData['food_items'] = !empty($foodInput) ? (is_array($foodInput) ? json_encode($foodInput) : json_encode([$foodInput])) : null;
        $validatedData['description'] = $request->input('description') ?? null;

        try {
            $extraCharge = DB::transaction(function () use ($validatedData, $reservation) {
                $extraCharge = Service::create($validatedData);
                $this->syncLedgerCharge($extraCharge, $reservation);
                $reservation->increment('total_amount', $validatedData['total']);
                $reservation->refresh();
                return $extraCharge;
            });

            return response()->json([
                'success' => true,
                'message' => 'Extra charge record saved successfully to the database!',
                'data'    => $extraCharge
            ], 201);

        } catch (\Throwable $e) {
            Log::error('Extra charge save failed', ['exception' => $e]);
            return response()->json([
                'success' => false,
                'message' => 'Could not save this charge. Please check the details and try again.',
            ], 500);
        }
    }

    /**
     * Update an existing extra charge record, re-resolving the reservation
     * (in case the room number changed) and keeping the linked ledger charge
     * in sync.
     */
    public function update(StoreServiceRequest $request, $id): JsonResponse
    {
        $extraCharge = Service::find($id);

        if (!$extraCharge) {
            return response()->json([
                'success' => false,
                'message' => 'Record not found.'
            ], 404);
        }

        $validatedData = $request->validated();

        try {
            $reservation = $this->resolveActiveReservation($validatedData['room_number']);
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => collect($e->errors())->first()[0]], 422);
        }

        unset($validatedData['room_number']);
        $validatedData['reservation_id'] = $reservation->reservation_id;
        $validatedData['guest_name']     = $reservation->guest?->full_name ?? $reservation->guest_name ?? 'Guest';

        $quantity = (int) $validatedData['quantity'];
        $rate = (float) $validatedData['rate'];
        $validatedData['total'] = $quantity * $rate;

        $foodInput = $request->input('food_items');
        $validatedData['food_items'] = !empty($foodInput) ? (is_array($foodInput) ? json_encode($foodInput) : json_encode([$foodInput])) : null;
        $validatedData['description'] = $request->input('description') ?? null;

        try {
            DB::transaction(function () use ($extraCharge, $validatedData, $reservation) {
                $extraCharge->update($validatedData);
                $this->syncLedgerCharge($extraCharge, $reservation);
            });

            return response()->json([
                'success' => true,
                'message' => 'Extra charge updated successfully!',
                'data'    => $extraCharge
            ], 200);

        } catch (\Throwable $e) {
            Log::error('Extra charge update failed', ['exception' => $e]);
            return response()->json([
                'success' => false,
                'message' => 'Could not update this charge. Please check the details and try again.',
            ], 500);
        }
    }

    /**
     * Remove the specified extra charge from the database. The linked
     * reservation_charges row is cascade-deleted by the DB FK, but we also
     * delete it explicitly here for clarity/symmetry.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $extraCharge = Service::find($id);

            if (!$extraCharge) {
                return response()->json([
                    'success' => false,
                    'message' => 'Record not found or already deleted.'
                ], 404);
            }

            DB::transaction(function () use ($extraCharge) {
                ReservationCharge::where('extra_charge_id', $extraCharge->id)->delete();
                $extraCharge->delete();
            });

            return response()->json([
                'success' => true,
                'message' => 'Extra charge record deleted successfully!'
            ], 200);

        } catch (\Throwable $e) {
            Log::error('Extra charge delete failed', ['exception' => $e]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete record. Please try again.',
            ], 500);
        }
    }
}
