<?php

namespace App\Http\Controllers;

use App\Models\Service; 
use App\Http\Requests\StoreServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;

class ExtraServiceController extends Controller
{
    /**
     * Display UI Dashboard Table Data & Top Counter Cards
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');

        $query = Service::query();

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

            return [
                'id'             => $charge->id,
                'reservation_id' => $charge->reservation_id,
                'guest_name'     => $charge->guest_name ?? 'Unknown',
                'charge_date'    => $charge->charge_date ? \Carbon\Carbon::parse($charge->charge_date)->format('Y-m-d') : null,
                'service_type'   => $type,
                'description'    => $charge->description ?? '',
                'food_items'     => $charge->food_items ?? '',
                'quantity'       => (int) $charge->quantity,
                'rate'           => (float) $charge->rate,
                'total'          => (float) $charge->total,
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
     * Store a newly created extra charge in the XAMPP database.
     */
    public function store(StoreServiceRequest $request): JsonResponse
    {
        $validatedData = $request->validated();

        $quantity = (int) $validatedData['quantity'];
        $rate = (float) $validatedData['rate'];
        $validatedData['total'] = $quantity * $rate;

        // Ensure these fallbacks are set directly on the array going into the database
        $validatedData['created_by'] = Auth::id() ?? 1; 
        $validatedData['food_items'] = !empty($request->input('food_items')) ? json_encode($request->input('food_items')) : null;
$validatedData['description'] = $request->input('description') ?? null;

        try {
            $extraCharge = Service::create($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Extra charge record saved successfully to the database!',
                'data'    => $extraCharge
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                // 👇 CRUCIAL: Appending the real message here forces your React alert window to show the SQL error text!
                'message' => 'Database persistence failed. SQL Error: ' . $e->getMessage(),
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing extra charge record.
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
        
        $quantity = (int) $validatedData['quantity'];
        $rate = (float) $validatedData['rate'];
        $validatedData['total'] = $quantity * $rate;
        
        $validatedData['food_items'] = !empty($request->input('food_items')) ? json_encode($request->input('food_items')) : null;
$validatedData['description'] = $request->input('description') ?? null;

        try {
            $extraCharge->update($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Extra charge updated successfully!',
                'data'    => $extraCharge
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Database modification failed. SQL Error: ' . $e->getMessage(),
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}