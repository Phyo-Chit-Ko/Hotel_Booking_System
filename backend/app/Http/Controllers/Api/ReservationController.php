<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
        $reservation = Reservation::with(['guest', 'roomType', 'additionalGuests.guest'])->findOrFail($id);

        $ratePerNight = $reservation->nights > 0
            ? (float) $reservation->room_charge / $reservation->nights
            : 0;

        return response()->json([
            'reservation' => [
                'reservationId'     => $reservation->reservation_id,
                'guestId'           => $reservation->guest_id,
                'firstName'         => $reservation->guest->first_name,
                'lastName'          => $reservation->guest->last_name,
                'phone'             => $reservation->guest->phone,
                'email'             => $reservation->guest->email,
                'nationality'       => $reservation->guest->nationality,
                'idType'            => $reservation->guest->id_type,
                'idNumber'          => $reservation->guest->id_number,
                'isVip'             => $reservation->guest->is_vip,
                'roomNumber'        => $reservation->room_number,
                'roomType'          => $reservation->roomType->name ?? '',
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

    /**
     * Confirm check-in for an existing reservation. Optionally records a
     * deposit/payment at the same time. Flips reservation_status -> Checked-In.
     */
    public function checkIn(Request $request, $id)
    {
        $validated = $request->validate([
            'depositAmount' => 'nullable|numeric|min:0',
            'paymentMethod' => 'nullable|string|in:cash,credit_card,bank_transfer,online',
            'transactionNo' => 'nullable|string|max:100',
            'paymentProof'  => 'nullable|file|max:5120',
        ]);

        $reservation = Reservation::findOrFail($id);

        $booking = DB::transaction(function () use ($validated, $request, $reservation) {
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
}