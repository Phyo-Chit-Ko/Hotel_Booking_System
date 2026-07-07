<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $reservations = Reservation::with(['guest', 'roomType', 'payments'])
            ->orderByDesc('reservation_id')
            ->get();

        return response()->json([
            'bookings' => $reservations->map(fn ($r) => $r->toTableRow()),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'guestId'            => 'required|integer|exists:guests,guest_id',
            'roomNumber'         => 'required|string|exists:rooms,room_number',
            'checkIn'            => 'required|date',
            'checkOut'           => 'required|date|after:checkIn',
            'adults'             => 'required|integer|min:1',
            'children'           => 'nullable|integer|min:0',
            'bookingSource'      => 'nullable|string|max:100',
            'specialRequests'    => 'nullable|string',
            'reservationStatus'  => 'required|in:Reserved,Confirmed,Checked-In,Checked-Out',
        ]);

        $reservation = DB::transaction(function () use ($validated, $request) {
            $room = Room::with('roomType')->where('room_number', $validated['roomNumber'])->firstOrFail();
            $ratePerNight = (float) $room->roomType->base_price;

            $checkIn  = \Carbon\Carbon::parse($validated['checkIn']);
            $checkOut = \Carbon\Carbon::parse($validated['checkOut']);
            $nights   = max(1, $checkIn->diffInDays($checkOut));

            $adults      = (int) $validated['adults'];
            $children    = (int) ($validated['children'] ?? 0);
            $totalGuests = $adults + $children;

            $roomCharge        = $nights * $ratePerNight;
            $extraPersonCharge = max(0, $totalGuests - 2) * 20 * $nights;
            $taxAmount         = ($roomCharge + $extraPersonCharge) * 0.1;
            $totalAmount       = $roomCharge + $extraPersonCharge + $taxAmount;

            return Reservation::create([
                'guest_id'            => $validated['guestId'],
                'room_type_id'        => $room->room_type_id,
                'room_number'         => $room->room_number,
                'check_in_date'       => $checkIn,
                'check_out_date'      => $checkOut,
                'adults'              => $adults,
                'children'            => $children,
                'booking_source'      => $validated['bookingSource'] ?? 'Direct',
                'special_requests'    => $validated['specialRequests'] ?? null,
                'nights'              => $nights,
                'room_charge'         => $roomCharge,
                'extra_person_charge' => $extraPersonCharge,
                'tax_amount'          => $taxAmount,
                'total_amount'        => $totalAmount,
                'deposit_amount'      => 0,
                'reservation_status'  => $validated['reservationStatus'],
                'created_by'          => $request->user()?->user_id ?? 1, // swap for auth()->id()
            ]);
        });

        return response()->json([
            'reservation' => [
                'reservationId'      => $reservation->reservation_id,
                'nights'             => $reservation->nights,
                'roomCharge'         => $reservation->room_charge,
                'extraPersonCharge'  => $reservation->extra_person_charge,
                'taxAmount'          => $reservation->tax_amount,
                'totalAmount'        => $reservation->total_amount,
            ],
        ], 201);
    }

  
    public function destroy($id)
    {
        $reservation = Reservation::where('reservation_id', $id)->firstOrFail();

        if ($reservation->payments()->exists()) {
            return response()->json([
                'message' => 'Cannot delete a reservation that already has a recorded payment.',
            ], 422);
        }

        $reservation->delete();

        return response()->json(['message' => 'Reservation deleted.']);
    }
}
