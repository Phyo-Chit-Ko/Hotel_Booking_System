<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\ReservationGuest;
use App\Models\RoomTransfer;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $reservations = Reservation::with(['guest', 'roomType', 'payments', 'additionalGuests.guest'])
            ->orderByDesc('reservation_id')
            ->get();

        $rows = $reservations->flatMap(fn ($r) => $r->toTableRows())->values();

        return response()->json(['bookings' => $rows]);
    }

    /**
     * Full detail for the Check-In flow — feeds AddReservation's prefill.
     */
    public function detail($id)
{
    $reservation = Reservation::with(['guest', 'roomType','room', 'additionalGuests.guest'])->findOrFail($id);

    $ratePerNight = $reservation->nights > 0
        ? (float) $reservation->room_charge / $reservation->nights
        : 0;

    $guest = $reservation->guest; // null if not yet linked

    // split "First Last" snapshot back into two fields for the form
    [$snapFirst, $snapLast] = array_pad(explode(' ', $reservation->guest_name ?? '', 2), 2, '');

    return response()->json([
        'reservation' => [
            'reservationId'     => $reservation->reservation_id,
            'guestId'           => $reservation->guest_id, // null until real check-in
            'firstName'         => $guest->first_name ?? $snapFirst,
            'lastName'          => $guest->last_name ?? $snapLast,
            'phone'             => $guest->phone ?? $reservation->guest_phone,
            'email'             => $guest->email ?? $reservation->guest_email,
            'nationality'       => $guest->nationality ?? '',
            'idType'            => $guest->id_type ?? 'Passport',
            'idNumber'          => $guest->id_number ?? '',
            'isVip'             => $guest->is_vip ?? false,
            'roomNumber'        => $reservation->room_number,
            'roomType'          => $reservation->roomType->name ?? '',
            'extraPersonRate'   => (float) ($reservation->room->extra_person_rate ?? 0), 
            'checkIn'           => $reservation->check_in_date->format('Y-m-d'),
            'checkOut'          => $reservation->check_out_date->format('Y-m-d'),
            'adults'            => $reservation->adults,
            'children'          => $reservation->children,
            'bookingSource'     => $reservation->booking_source,
            'specialRequests'   => $reservation->special_requests,
            'reservationStatus' => $reservation->reservation_status,
            'nights'            => $reservation->nights,
            'roomCharge'        => $reservation->room_charge,
            'extraPersonCharge' => $reservation->extra_person_charge,
            'taxAmount'         => $reservation->tax_amount,
            'totalAmount'       => $reservation->total_amount,
            'ratePerNight'      => $ratePerNight,
        ],
        'additionalGuests' => $reservation->additionalGuests->map(fn ($ag) => [
            'guestId'     => $ag->guest_id,
            'guestType'   => $ag->guest_type,
            'firstName'   => $ag->guest->first_name,
            'lastName'    => $ag->guest->last_name,
            'phone'       => $ag->guest->phone,
            'email'       => $ag->guest->email,
            'nationality' => $ag->guest->nationality,
            'idNumber'    => $ag->guest->id_number,
        ]),
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
            $extraPersonCharge = max(0, $totalGuests - 2) * (float) $room->extra_person_rate * $nights;
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

    /**
     * Confirm check-in for an existing reservation. Optionally records a
     * deposit/payment at the same time. Flips reservation_status -> Checked-In.
     */
    public function checkIn(Request $request, $id)
{
    $validated = $request->validate([
        'guestId'       => 'nullable|integer|exists:guests,guest_id',
        'depositAmount' => 'nullable|numeric|min:0',
        'paymentMethod' => 'nullable|string|in:cash,credit_card,bank_transfer,online',
        'transactionNo' => 'nullable|string|max:100',
        'paymentProof'  => 'nullable|file|max:5120',
    ]);

    $reservation = Reservation::findOrFail($id);

    if (!$reservation->guest_id && empty($validated['guestId'])) {
        return response()->json([
            'message' => 'Guest identification is required before check-in.',
        ], 422);
    }

    $booking = DB::transaction(function () use ($validated, $request, $reservation) {
        if (!empty($validated['guestId'])) {
            $reservation->guest_id = $validated['guestId'];
        }

        $deposit = (float) ($validated['depositAmount'] ?? 0);

        if ($deposit > 0) {
            $paymentData = [
                'reservation_id' => $reservation->reservation_id,
                'amount'         => $deposit,
                'payment_method' => $validated['paymentMethod'] ?? 'cash',
                'date'           => now()->toDateString(),
                'transaction_no' => $validated['transactionNo'] ?? null,
                'description'    => 'Payment recorded at check-in',
            ];

            if ($request->hasFile('paymentProof')) {
                $paymentData['payment_proof_path'] = $request->file('paymentProof')->store('payment-proofs', 'public');
            }

            Payment::create($paymentData);
            $reservation->deposit_amount = (float) $reservation->deposit_amount + $deposit;
        }

        $reservation->reservation_status = 'Checked-In';
        $reservation->save();
        $reservation->load(['guest', 'roomType', 'payments', 'additionalGuests.guest']);

        return $reservation;
    });

    return response()->json(['booking' => $booking->toTableRow()], 200);
}

    /**
     * Confirm check-out for an existing (currently occupied) reservation.
     */
    public function checkOut($id)
    {
        $reservation = Reservation::findOrFail($id);

        if ($reservation->reservation_status !== 'Checked-In') {
            return response()->json([
                'message' => 'Only checked-in reservations can be checked out.',
            ], 422);
        }

        $reservation->reservation_status = 'Checked-Out';
        $reservation->save();
        $reservation->load(['guest', 'roomType', 'payments', 'additionalGuests.guest']);

        return response()->json(['booking' => $reservation->toTableRow()]);
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


    /**
 * Push back check-out date on an active reservation. Recalculates
 * nights/charges the same way store() does; existing payments are untouched.
 */
public function extend(Request $request, $id)
{
    $validated = $request->validate([
        'checkOut' => 'required|date',
    ]);

   $reservation = Reservation::with(['roomType', 'room'])->findOrFail($id);

    if (!in_array($reservation->reservation_status, ['Reserved', 'Confirmed', 'No-Show', 'Checked-In'])) {
        return response()->json(['message' => 'This reservation can no longer be extended.'], 422);
    }

    $newCheckOut = Carbon::parse($validated['checkOut']);

    if ($newCheckOut->lte($reservation->check_out_date)) {
        return response()->json(['message' => 'New check-out date must be after the current one.'], 422);
    }

    $conflict = Reservation::where('room_number', $reservation->room_number)
        ->where('reservation_id', '!=', $reservation->reservation_id)
        ->whereNotIn('reservation_status', ['Checked-Out', 'No-Show'])
        ->where('check_in_date', '<', $newCheckOut)
        ->where('check_out_date', '>', $reservation->check_out_date)
        ->exists();

    if ($conflict) {
        return response()->json(['message' => "Room {$reservation->room_number} is booked by someone else during the extended dates."], 422);
    }

     DB::transaction(function () use ($reservation, $newCheckOut) {
        $nights            = max(1, $reservation->check_in_date->diffInDays($newCheckOut));
        $rateNight         = (float) ($reservation->roomType->base_price ?? 0);
        $extraRate         = (float) ($reservation->room->extra_person_rate ?? 0);
        $totalGuests       = $reservation->adults + $reservation->children;
        $roomCharge        = $nights * $rateNight;
        $extraPersonCharge = max(0, $totalGuests - 2) * $extraRate * $nights;
        $taxAmount         = ($roomCharge + $extraPersonCharge) * 0.1;

        $reservation->update([
            'check_out_date'      => $newCheckOut,
            'nights'              => $nights,
            'room_charge'         => $roomCharge,
            'extra_person_charge' => $extraPersonCharge,
            'tax_amount'          => $taxAmount,
            'total_amount'        => $roomCharge + $extraPersonCharge + $taxAmount,
        ]);
    });

    $reservation->load(['guest', 'roomType', 'payments', 'additionalGuests.guest']);
    return response()->json(['booking' => $reservation->toTableRow()]);
}

/**
 * Reassign this reservation to a different room, recalculating charges
 * against the new room's rate (nights stay the same).
 */

    /**
 * Reassign this reservation to a different room, recalculating charges
 * against the new room's rate, and logging the move in room_transfers.
 */
public function moveRoom(Request $request, $id)
{
    $validated = $request->validate([
        'roomNumber' => 'required|string|exists:rooms,room_number',
        'reason'     => 'nullable|string|max:255',
    ]);

    $reservation = Reservation::with(['roomType', 'additionalGuests'])->findOrFail($id);

    if (!in_array($reservation->reservation_status, ['Reserved', 'Confirmed', 'No-Show', 'Checked-In'])) {
        return response()->json(['message' => 'This reservation can no longer be moved.'], 422);
    }

    if ($validated['roomNumber'] === $reservation->room_number) {
        return response()->json(['message' => 'Reservation is already in that room.'], 422);
    }

    $newRoom = Room::with('roomType')->where('room_number', $validated['roomNumber'])->firstOrFail();

    $isOccupied     = $reservation->reservation_status === 'Checked-In';
    $conflictStart  = $isOccupied ? Carbon::today() : $reservation->check_in_date;

    $conflict = Reservation::where('room_number', $newRoom->room_number)
        ->where('reservation_id', '!=', $reservation->reservation_id)
        ->whereNotIn('reservation_status', ['Checked-Out', 'No-Show'])
        ->where('check_in_date', '<', $reservation->check_out_date)
        ->where('check_out_date', '>', $conflictStart)
        ->exists();

    if ($conflict) {
        return response()->json([
            'message' => "Room {$newRoom->room_number} is already booked for these dates.",
        ], 422);
    }

    $oldRoomNum = $reservation->room_number;

    $result = DB::transaction(function () use ($reservation, $newRoom, $oldRoomNum, $validated, $request, $isOccupied) {

        if ($isOccupied) {
            // Guest is mid-stay: close the old room's record as history and
            // open a fresh record for the new room, instead of overwriting
            // the room_number in place and losing the first leg of the stay.
            $today            = Carbon::today();
            $originalCheckOut = $reservation->check_out_date->copy();
            $totalGuests      = $reservation->adults + $reservation->children;

            // Recalculate the OLD reservation for the shortened stay actually spent there.
            $oldNights    = max(1, $reservation->check_in_date->diffInDays($today));
            $oldRate      = (float) ($reservation->roomType->base_price ?? 0);
            $oldExtraRate = (float) (Room::where('room_number', $oldRoomNum)->value('extra_person_rate') ?? 0);

            $oldRoomCharge  = $oldNights * $oldRate;
            $oldExtraCharge = max(0, $totalGuests - 2) * $oldExtraRate * $oldNights;
            $oldTax         = ($oldRoomCharge + $oldExtraCharge) * 0.1;

            $reservation->update([
                'check_out_date'      => $today,
                'nights'              => $oldNights,
                'room_charge'         => $oldRoomCharge,
                'extra_person_charge' => $oldExtraCharge,
                'tax_amount'          => $oldTax,
                'total_amount'        => $oldRoomCharge + $oldExtraCharge + $oldTax,
                'reservation_status'  => 'Checked-Out',
            ]);

            // Create the NEW reservation covering the rest of the stay in the new room.
            $newNights    = max(1, $today->diffInDays($originalCheckOut));
            $newRate      = (float) ($newRoom->roomType->base_price ?? 0);
            $newExtraRate = (float) ($newRoom->extra_person_rate ?? 0);

            $newRoomCharge  = $newNights * $newRate;
            $newExtraCharge = max(0, $totalGuests - 2) * $newExtraRate * $newNights;
            $newTax         = ($newRoomCharge + $newExtraCharge) * 0.1;

            $newReservation = Reservation::create([
                'guest_id'            => $reservation->guest_id,
                'guest_name'          => $reservation->guest_name,
                'guest_email'         => $reservation->guest_email,
                'guest_phone'         => $reservation->guest_phone,
                'room_type_id'        => $newRoom->room_type_id,
                'room_number'         => $newRoom->room_number,
                'check_in_date'       => $today,
                'check_out_date'      => $originalCheckOut,
                'adults'              => $reservation->adults,
                'children'            => $reservation->children,
                'booking_source'      => $reservation->booking_source,
                'special_requests'    => $reservation->special_requests,
                'nights'              => $newNights,
                'room_charge'         => $newRoomCharge,
                'extra_person_charge' => $newExtraCharge,
                'tax_amount'          => $newTax,
                'total_amount'        => $newRoomCharge + $newExtraCharge + $newTax,
                'deposit_amount'      => 0,
                'reservation_status'  => 'Checked-In',
                'created_by'          => $request->user()?->user_id ?? 1,
            ]);

            // Carry over any additional guests sharing the room to the new record.
            foreach ($reservation->additionalGuests as $ag) {
                ReservationGuest::create([
                    'reservation_id' => $newReservation->reservation_id,
                    'guest_id'       => $ag->guest_id,
                    'guest_type'     => $ag->guest_type,
                ]);
            }

            RoomTransfer::create([
                'reservation_id' => $newReservation->reservation_id,
                'old_room_num'   => $oldRoomNum,
                'new_room_num'   => $newRoom->room_number,
                'transferred_by' => $request->user()?->user_id,
                'transfer_date'  => $today->toDateString(),
                'reason'         => $validated['reason'] ?? null,
            ]);

            return ['oldReservationId' => $reservation->reservation_id, 'newReservationId' => $newReservation->reservation_id];
        }

        // Not yet checked in — nothing to split yet, just reassign the room.
        $rateNight   = (float) ($newRoom->roomType->base_price ?? 0);
        $extraRate   = (float) ($newRoom->extra_person_rate ?? 0);
        $totalGuests = $reservation->adults + $reservation->children;
        $roomCharge  = $reservation->nights * $rateNight;
        $extraCharge = max(0, $totalGuests - 2) * $extraRate * $reservation->nights;
        $taxAmount   = ($roomCharge + $extraCharge) * 0.1;

        $reservation->update([
            'room_number'         => $newRoom->room_number,
            'room_type_id'        => $newRoom->room_type_id,
            'room_charge'         => $roomCharge,
            'extra_person_charge' => $extraCharge,
            'tax_amount'          => $taxAmount,
            'total_amount'        => $roomCharge + $extraCharge + $taxAmount,
        ]);

        RoomTransfer::create([
            'reservation_id' => $reservation->reservation_id,
            'old_room_num'   => $oldRoomNum,
            'new_room_num'   => $newRoom->room_number,
            'transferred_by' => $request->user()?->user_id,
            'transfer_date'  => now()->toDateString(),
            'reason'         => $validated['reason'] ?? null,
        ]);

        return ['oldReservationId' => null, 'newReservationId' => $reservation->reservation_id];
    });

    return response()->json(['message' => 'Room moved successfully.', 'result' => $result]);
}
}