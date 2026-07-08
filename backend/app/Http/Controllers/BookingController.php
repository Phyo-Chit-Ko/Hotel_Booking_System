<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\Reservation;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::with('roomType');

        // Search by booking id, guest name, or email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('booking_id', 'like', "%{$search}%")
                  ->orWhere('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->filled('status') && $request->status !== 'All Status') {
            $query->where('status', strtolower($request->status));
        }

        // Filter by check-in date
        if ($request->filled('date')) {
            $query->whereDate('check_in_date', $request->date);
        }

        $bookings = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'data' => $bookings->map(function ($b) {
                return [
                    'id'                 => 'BK' . str_pad($b->booking_id, 3, '0', STR_PAD_LEFT),
                    'raw_id'             => $b->booking_id,
                    'first_name'         => $b->first_name,
                    'last_name'          => $b->last_name,
                    'email'              => $b->email,
                    'phone'              => $b->phone,
                    'roomType'           => $b->roomType->name ?? 'N/A',
                    'roomNumber'         => $b->room_number,
                    'adult'              => $b->adult,
                    'child'              => $b->child,
                    'checkIn'            => $b->check_in_date ? $b->check_in_date->format('Y-m-d') : null,
                    'checkOut'           => $b->check_out_date ? $b->check_out_date->format('Y-m-d') : null,
                    'amount'             => (float) $b->deposit,
                    'depositScreenshot'  => $b->deposit_screenshot
                        ? Storage::disk('public')->url($b->deposit_screenshot)
                        : null,
                    'status'             => ucfirst($b->status),
                ];
            }),
            'stats' => [
                'total'     => Booking::count(),
                'confirmed' => Booking::where('status', 'confirmed')->count(),
                'pending'   => Booking::where('status', 'pending')->count(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        // 1. Validate your incoming data
        $validated = $request->validate([
            'first_name'         => 'required|string',
            'last_name'          => 'required|string',
            'email'              => 'required|email',
            'phone'              => 'required|string',
            'adult'              => 'required|integer',
            'child'              => 'nullable|integer',
            'total_room'         => 'required|integer',
            'bed_preference'     => 'required|string',
            'check_in_date'      => 'required|date',
            'check_out_date'     => 'required|date',
            'special_requests'   => 'nullable|string',
            'payment_method'     => 'required|string',
            'room_type_id'       => 'required|integer',
            'payment_screenshot' => 'required|image|max:5120',
        ]);

        // 2. Handle file upload safely
        if ($request->hasFile('payment_screenshot')) {
            $path = $request->file('payment_screenshot')->store('deposit_screenshots', 'public');
            $validated['deposit_screenshot'] = $path;
        }

        // Hardcode your 45$ deposit value since it's a fixed read-only property on your UI
        $validated['deposit'] = 45;
        $validated['status'] = 'pending';

        // 3. Save directly via the Model
        $booking = Booking::create($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Booking saved successfully!',
            'data'    => $booking,
        ], 201);
    }

    /**
     * Update an existing booking record. If the admin confirms the booking
     * AND assigns a room in the same request, the booking is converted into
     * a real Reservation:
     *   - No Guest record is created here. guest_name / guest_email /
     *     guest_phone are snapshotted directly onto the reservation.
     *     A real Guest (with ID type/number) only gets created later,
     *     at actual front-desk check-in.
     *   - room_charge / extra_person_charge / tax_amount / total_amount
     *     are calculated the same way as ReservationController::store(),
     *     so both creation paths stay consistent.
     *   - The booking's $45 deposit is recorded as an actual Payment row,
     *     so Reservation Management's Balance column (which is derived
     *     from payments.sum('amount'), not deposit_amount) reflects it
     *     correctly.
     */
    public function update(Request $request, $id)
    {
        $booking = Booking::where('booking_id', $id)->firstOrFail();

        $validated = $request->validate([
            'first_name'  => 'required|string|max:255',
            'last_name'   => 'required|string|max:255',
            'phone'       => 'required|string|max:50',
            'status'      => 'required|string',
            'room_number' => 'nullable|string|exists:rooms,room_number',
        ]);

        if (isset($validated['status'])) {
            $validated['status'] = strtolower($validated['status']);
        }

        $booking->update($validated);

        // Only attempt conversion when the admin confirmed AND assigned a room.
        $shouldConvert = $validated['status'] === 'confirmed'
            && !empty($validated['room_number']);

        if ($shouldConvert) {
            $conflict = Reservation::where('room_number', $validated['room_number'])
                ->whereNotIn('reservation_status', ['Checked-Out', 'Cancelled'])
                ->where('check_in_date', '<', $booking->check_out_date)
                ->where('check_out_date', '>', $booking->check_in_date)
                ->exists();

            if ($conflict) {
                return response()->json([
                    'status'  => 'error',
                    'message' => "Room {$validated['room_number']} is already booked for those dates.",
                ], 422);
            }

            DB::transaction(function () use ($booking, $validated) {
                $nights = Carbon::parse($booking->check_in_date)
                    ->diffInDays(Carbon::parse($booking->check_out_date));
                $nights = max(1, $nights);

                $room      = Room::with('roomType')->where('room_number', $validated['room_number'])->firstOrFail();
                $rateNight = (float) ($room->roomType->base_price ?? 0);

                $adults      = (int) $booking->adult;
                $children    = (int) $booking->child;
                $totalGuests = $adults + $children;

                $roomCharge        = $nights * $rateNight;
                $extraPersonCharge = max(0, $totalGuests - 2) * 20 * $nights;
                $taxAmount         = ($roomCharge + $extraPersonCharge) * 0.1;
                $totalAmount       = $roomCharge + $extraPersonCharge + $taxAmount;
                $deposit           = (float) $booking->deposit;

                $reservation = Reservation::create([
                    'guest_id'            => null,
                    'guest_name'          => trim($booking->first_name . ' ' . $booking->last_name),
                    'guest_email'         => $booking->email,
                    'guest_phone'         => $booking->phone,
                    'room_type_id'        => $booking->room_type_id,
                    'room_number'         => $validated['room_number'],
                    'check_in_date'       => $booking->check_in_date,
                    'check_out_date'      => $booking->check_out_date,
                    'adults'              => $adults,
                    'children'            => $children,
                    'booking_source'      => 'Website',
                    'special_requests'    => $booking->special_requests,
                    'nights'              => $nights,
                    'room_charge'         => $roomCharge,
                    'extra_person_charge' => $extraPersonCharge,
                    'tax_amount'          => $taxAmount,
                    'total_amount'        => $totalAmount,
                    'deposit_amount'      => $deposit,
                    'reservation_status'  => 'Confirmed',
                    'created_by'          => Auth::id(),
                ]);

                if ($deposit > 0) {
                    Payment::create([
                        'reservation_id' => $reservation->reservation_id,
                        'amount'         => $deposit,
                        'payment_method' => $booking->payment_method ?? 'online',
                        'date'           => now()->toDateString(),
                        'description'    => 'Deposit paid at online booking',
                    ]);
                }

                $booking->update(['status' => 'converted']);
            });
        }

        return response()->json([
            'status'  => 'success',
            'message' => $shouldConvert ? 'Booking confirmed and reservation created!' : 'Booking updated successfully!',
            'data'    => $booking->fresh(),
        ], 200);
    }
}