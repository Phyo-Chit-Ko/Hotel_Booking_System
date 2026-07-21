<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\ReservationCharge;
use App\Models\ReservationGuest;
use App\Models\RoomMove;
use App\Models\RoomTransfer;
use App\Models\Room;
use App\Models\Guest;
use App\Support\IdNumberOverlapChecker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $query = Reservation::with(['guest', 'roomType', 'payments', 'charges', 'additionalGuests.guest', 'roomMoveTo.newReservation', 'createdBy']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('source_booking_number', 'like', "%{$search}%")
                  ->orWhere('guest_name', 'like', "%{$search}%")
                  ->orWhere('room_number', 'like', "%{$search}%")
                  ->orWhereHas('guest', fn ($g) => $g->where('first_name', 'like', "%{$search}%")
                                                      ->orWhere('last_name', 'like', "%{$search}%"));
            });
        }

        $reservations = $query->orderByDesc('reservation_id')->get();
        $rows = $reservations->flatMap(fn ($r) => $r->toTableRows())->values();

        $today = Carbon::today();

        $dailyCheckInDue = Reservation::whereDate('check_in_date', $today)
            ->whereIn('reservation_status', ['Reserved', 'Confirmed', 'Checked-In'])
            ->count();
        $dailyCheckInCompleted = Reservation::whereDate('check_in_date', $today)
            ->where('reservation_status', 'Checked-In')
            ->count();

        $dailyCheckOutDue = Reservation::whereDate('check_out_date', $today)
            ->where('reservation_status', 'Checked-In')
            ->count();
        $dailyCheckOutCompleted = Reservation::whereDate('check_out_date', $today)
            ->where('reservation_status', 'Checked-Out')
            ->count();

        // Rooms that will be occupied tonight: guests already checked in,
        // plus today's expected arrivals still Reserved/Confirmed.
        $occupiedRooms = Reservation::where(function ($q) use ($today) {
                $q->whereDate('check_in_date', $today)->whereIn('reservation_status', ['Reserved', 'Confirmed']);
            })->orWhere('reservation_status', 'Checked-In')->count();

        return response()->json([
            'bookings' => $rows,
            'stats' => [
                'daily_check_in'  => ['completed' => $dailyCheckInCompleted, 'due' => $dailyCheckInDue],
                'daily_check_out' => ['completed' => $dailyCheckOutCompleted, 'due' => $dailyCheckOutDue],
                'occupied_rooms'  => $occupiedRooms,
            ],
        ]);
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

    $guest = $reservation->guest; // null if not yet linked

    // split "First Last" snapshot back into two fields for the form
    [$snapFirst, $snapLast] = array_pad(explode(' ', $reservation->guest_name ?? '', 2), 2, '');

    return response()->json([
        'reservation' => [
            'reservationId'     => $reservation->reservation_id,
            'sourceBookingNumber' => $reservation->source_booking_number,
            'guestId'           => $reservation->guest_id, // null until real check-in
            'firstName'         => $guest->first_name ?? $reservation->first_name ?? $snapFirst,
            'lastName'          => $guest->last_name ?? $reservation->last_name ?? $snapLast,
            'phone'             => $guest->phone ?? $reservation->guest_phone,
            'email'             => $guest->email ?? $reservation->guest_email,
            'nationality'       => $guest->nationality ?? '',
            'gender'            => $guest->gender ?? '',
            'idType'            => $guest->id_type ?? 'Passport',
            'idNumber'          => $guest->id_number ?? '',
            'isVip'             => $guest->is_vip ?? false,
            'roomNumber'        => $reservation->room_number,
            'roomType'          => $reservation->roomType->name ?? '',
            'extraPersonRate'   => (float) ($reservation->roomType->extra_person_rate ?? 0),
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
            'gender'      => $ag->guest->gender,
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

        $checkInDate  = \Carbon\Carbon::parse($validated['checkIn']);
        $checkOutDate = \Carbon\Carbon::parse($validated['checkOut']);
        $guest        = Guest::find($validated['guestId']);

        if ($guest && $guest->id_number && IdNumberOverlapChecker::hasConflict($guest->id_number, $checkInDate, $checkOutDate)) {
            return response()->json([
                'message' => "This guest's Identification Document Number is already used on another reservation that overlaps these dates.",
            ], 422);
        }

        $room = Room::with('roomType')->where('room_number', $validated['roomNumber'])->firstOrFail();

        if (in_array($room->status, ['Maintenance', 'Cleaning'], true)) {
            return response()->json([
                'message' => "Room {$room->room_number} is currently {$room->status} and cannot be booked.",
            ], 422);
        }

        if (($room->roomType->status ?? 'Active') !== 'Active') {
            return response()->json([
                'message' => "The room type for Room {$room->room_number} is not currently available for booking.",
            ], 422);
        }

        $requestedGuests = (int) $validated['adults'] + (int) ($validated['children'] ?? 0);
        $maxCapacity     = (int) ($room->roomType->maximum_capacity ?? 999);
        if ($requestedGuests > $maxCapacity) {
            return response()->json([
                'message' => "This room can host at most {$maxCapacity} guest(s).",
            ], 422);
        }

        $reservation = DB::transaction(function () use ($validated, $request, $room) {
            $ratePerNight = (float) $room->roomType->base_price;

            $checkIn  = \Carbon\Carbon::parse($validated['checkIn']);
            $checkOut = \Carbon\Carbon::parse($validated['checkOut']);
            $nights   = max(1, $checkIn->diffInDays($checkOut));

            $adults      = (int) $validated['adults'];
            $children    = (int) ($validated['children'] ?? 0);
            $totalGuests = $adults + $children;
            $stdCapacity = (int) ($room->roomType->capacity ?? 2);

            $roomCharge        = $nights * $ratePerNight;
            $extraPersonCharge = max(0, $totalGuests - $stdCapacity) * (float) ($room->roomType->extra_person_rate ?? 0) * $nights;
            $taxAmount         = ($roomCharge + $extraPersonCharge) * 0.1;
            $totalAmount       = $roomCharge + $extraPersonCharge + $taxAmount;

            $reservation = Reservation::create([
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
                'created_by'          => $request->user()->user_id,
            ]);

            $this->seedInitialCharges($reservation, $nights, $roomCharge, $extraPersonCharge, $taxAmount);

            return $reservation;
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
     * Confirm check-in for an existing reservation. No payment step here —
     * payment is handled exclusively through the Check Balance modal.
     * Blocks if adults > 1 and not enough additional guest profiles have
     * been recorded yet (via ReservationGuestController).
     */
    public function checkIn(Request $request, $id)
{
    $validated = $request->validate([
        'guestId' => 'nullable|integer|exists:guests,guest_id',
    ]);

    $reservation = Reservation::with('additionalGuests')->findOrFail($id);

    if (!$reservation->guest_id && empty($validated['guestId'])) {
        return response()->json([
            'message' => 'Guest identification is required before check-in.',
        ], 422);
    }

    $requiredAdultProfiles = max(0, $reservation->adults - 1);
    $providedAdultProfiles = $reservation->additionalGuests->where('guest_type', 'Adult')->count();

    if ($providedAdultProfiles < $requiredAdultProfiles) {
        return response()->json([
            'message' => "Add a guest profile for each additional adult before checking in ({$providedAdultProfiles}/{$requiredAdultProfiles} completed).",
        ], 422);
    }

    if (!empty($validated['guestId'])) {
        $guest = Guest::find($validated['guestId']);
        if ($guest && $guest->id_number && IdNumberOverlapChecker::hasConflict(
            $guest->id_number, $reservation->check_in_date, $reservation->check_out_date, $reservation->reservation_id
        )) {
            return response()->json([
                'message' => "This guest's Identification Document Number is already used on another reservation that overlaps these dates.",
            ], 422);
        }
    }

    $booking = DB::transaction(function () use ($validated, $reservation) {
        if (!empty($validated['guestId'])) {
            $reservation->guest_id = $validated['guestId'];
        }

        $reservation->reservation_status = 'Checked-In';
        $reservation->save();

        // Keep the room's own status in sync — Room Management otherwise
        // keeps showing 'Available' for an occupied room.
        Room::where('room_number', $reservation->room_number)->update(['status' => 'Occupied']);

        $reservation->load(['guest', 'roomType', 'payments', 'charges', 'additionalGuests.guest']);

        return $reservation;
    });

    return response()->json(['booking' => $booking->toTableRow()], 200);
}

    /**
     * Confirm check-out for a checked-in reservation. Hard-gated on the live
     * ledger balance — room charges, extra charges, and taxes must all be
     * fully paid first. There is no override: front desk must record the
     * remaining payment (or dispute/adjust the charge) before checkout can
     * proceed.
     */
    public function checkOut(Request $request, $id)
    {
        $reservation = Reservation::with(['charges', 'payments'])->findOrFail($id);

        if ($reservation->reservation_status !== 'Checked-In') {
            return response()->json([
                'message' => 'Only checked-in reservations can be checked out.',
            ], 422);
        }

        $balance = $reservation->remaining_amount;

        if ($balance > 0) {
            return response()->json([
                'message' => 'Cannot check out — there is an outstanding balance of ' . number_format($balance, 2) . ' MMK. Record the remaining payment before checking out.',
                'balance' => $balance,
            ], 422);
        }

        $reservation->reservation_status = 'Checked-Out';

        // If the guest is leaving before the planned check-out date, correct
        // check_out_date (and nights, so it stays consistent with the date
        // range) to reflect the actual departure day. Charges/total_amount
        // are intentionally left untouched — early checkout is not an
        // automatic refund.
        $today = Carbon::today();
        if ($today->lt($reservation->check_out_date)) {
            $reservation->check_out_date = $today;
            $reservation->nights = max(1, $reservation->check_in_date->diffInDays($today));
        }

        $reservation->save();

        // Free the room back up now that the guest has left.
        Room::where('room_number', $reservation->room_number)->update(['status' => 'Available']);

        $reservation->load(['guest', 'roomType', 'payments', 'charges', 'additionalGuests.guest']);

        return response()->json(['booking' => $reservation->toTableRow()]);
    }

    /**
     * Itemized charges + payments + live balance for the Check Balance modal.
     */
    public function ledger($id)
    {
        $reservation = Reservation::with([
            'charges' => fn ($q) => $q->orderBy('created_at'),
            'payments' => fn ($q) => $q->orderBy('date'),
            'roomMoveFrom.oldReservation',
        ])->findOrFail($id);

        $movedFrom = $reservation->roomMoveFrom
            ? [
                'reservationId' => $reservation->roomMoveFrom->old_reservation_id,
                'roomNumber'    => $reservation->roomMoveFrom->oldReservation->room_number ?? null,
                'reason'        => $reservation->roomMoveFrom->reason,
            ]
            : null;

        return response()->json([
            'charges' => $reservation->charges->map(fn ($c) => [
                'id'          => $c->id,
                'chargeType'  => $c->charge_type,
                'description' => $c->description,
                'amount'      => (float) $c->amount,
                'createdAt'   => optional($c->created_at)->toDateTimeString(),
            ])->values(),
            'payments' => $reservation->payments->map(fn ($p) => [
                'id'            => $p->payment_id,
                'amount'        => (float) $p->amount,
                'method'        => $p->payment_method,
                'date'          => optional($p->date)->toDateString(),
                'transactionNo' => $p->transaction_no,
                'comment'       => $p->comment,
            ])->values(),
            'balance'   => $reservation->remaining_amount,
            'movedFrom' => $movedFrom,
        ]);
    }

    /**
     * Lightweight edit: guest name/phone/special requests, plus (new) the
     * guest count (adults/children) — e.g. when more people join an existing
     * stay. No availability/date changes here — those still go through
     * Extend Stay / Move Room on purpose.
     *
     * Raising the guest count above what's already been charged for adds a
     * NEW extra_person charge row scoped to the remaining nights only
     * (today→check-out, or the full stay if not yet checked in) — existing
     * charge rows are never touched, mirroring extend()/moveRoom()'s
     * append-only ledger approach. Lowering the count does not auto-refund.
     */
    public function edit(Request $request, $id)
    {
        $validated = $request->validate([
            'guestName'       => ['nullable', 'string', 'max:255', 'regex:' . \App\Support\ValidationPatterns::NAME],
            'guestPhone'      => ['nullable', 'string', 'max:50', 'regex:' . \App\Support\ValidationPatterns::PHONE],
            'specialRequests' => 'nullable|string',
            'adults'          => 'sometimes|integer|min:1',
            'children'        => 'sometimes|integer|min:0',
        ]);

        $reservation = Reservation::with(['guest', 'roomType', 'additionalGuests'])->findOrFail($id);

        if (array_key_exists('adults', $validated)) {
            $requiredAdultProfiles = max(0, $validated['adults'] - 1);
            $providedAdultProfiles = $reservation->additionalGuests->where('guest_type', 'Adult')->count();

            if ($providedAdultProfiles > $requiredAdultProfiles) {
                return response()->json([
                    'message' => 'Cannot reduce adults below the number of additional guest profiles already recorded for this reservation.',
                ], 422);
            }
        }

        if (array_key_exists('adults', $validated) || array_key_exists('children', $validated)) {
            $checkAdults   = $validated['adults'] ?? $reservation->adults;
            $checkChildren = $validated['children'] ?? $reservation->children;
            $maxCapacity   = (int) ($reservation->roomType->maximum_capacity ?? 999);

            if ($checkAdults + $checkChildren > $maxCapacity) {
                return response()->json([
                    'message' => "This room can host at most {$maxCapacity} guest(s).",
                ], 422);
            }
        }

        $chargeAdded = DB::transaction(function () use ($reservation, $validated) {
            if (!empty($validated['guestName'])) {
                $reservation->guest_name = $validated['guestName'];
                if ($reservation->guest) {
                    [$first, $last] = array_pad(explode(' ', $validated['guestName'], 2), 2, '');
                    $reservation->guest->update(['first_name' => $first, 'last_name' => $last]);
                }
            }

            if (!empty($validated['guestPhone'])) {
                $reservation->guest_phone = $validated['guestPhone'];
                $reservation->guest?->update(['phone' => $validated['guestPhone']]);
            }

            if (array_key_exists('specialRequests', $validated)) {
                $reservation->special_requests = $validated['specialRequests'];
            }

            $chargeAdded = null;
            if (array_key_exists('adults', $validated) || array_key_exists('children', $validated)) {
                $newAdults   = $validated['adults'] ?? $reservation->adults;
                $newChildren = $validated['children'] ?? $reservation->children;
                $chargeAdded = $this->applyGuestCountCharge($reservation, $newAdults, $newChildren);
            }

            $reservation->save();

            return $chargeAdded;
        });

        $reservation->load(['guest', 'roomType', 'payments', 'charges', 'additionalGuests.guest']);
        return response()->json([
            'booking'     => $reservation->toTableRow(),
            'chargeAdded' => $chargeAdded,
        ]);
    }

    /**
     * Nights left to charge for: from today (or check-in, if that's later)
     * through check-out. Shared by edit()'s guest-count-increase charge so
     * it never retroactively charges for nights already stayed.
     */
    private function remainingNights(Reservation $reservation): int
    {
        $today = Carbon::today();
        $from  = $today->gt($reservation->check_in_date) ? $today : $reservation->check_in_date->copy();

        return max(0, $from->diffInDays($reservation->check_out_date));
    }

    /**
     * Updates adults/children on the (in-memory, not-yet-saved) reservation
     * and, if the guest count increased, appends a new extra_person (+ tax)
     * charge row for just the added person(s) over the remaining nights.
     * Decreasing the count updates the stored adult/children columns but
     * does not add a refund/adjustment row.
     *
     * @return array{amount: float, nights: int, addedCount: int}|null
     */
    private function applyGuestCountCharge(Reservation $reservation, int $newAdults, int $newChildren): ?array
    {
        $stdCapacity = (int) ($reservation->roomType->capacity ?? 2);
        $oldExtra = max(0, $reservation->adults + $reservation->children - $stdCapacity);
        $newExtra = max(0, $newAdults + $newChildren - $stdCapacity);

        $reservation->adults   = $newAdults;
        $reservation->children = $newChildren;

        if ($newExtra <= $oldExtra) {
            return null;
        }

        $nights = $this->remainingNights($reservation);
        if ($nights <= 0) {
            return null;
        }

        $addedCount       = $newExtra - $oldExtra;
        $extraRate        = (float) ($reservation->roomType->extra_person_rate ?? 0);
        $addedExtraCharge = $addedCount * $extraRate * $nights;

        if ($addedExtraCharge <= 0) {
            return null;
        }

        $addedTax = $addedExtraCharge * 0.1;

        ReservationCharge::create([
            'reservation_id' => $reservation->reservation_id,
            'charge_type'    => 'extra_person',
            'description'    => "Extra person charge — {$addedCount} additional guest(s), {$nights} remaining night(s)",
            'amount'         => $addedExtraCharge,
        ]);

        if ($addedTax > 0) {
            ReservationCharge::create([
                'reservation_id' => $reservation->reservation_id,
                'charge_type'    => 'tax',
                'description'    => 'Tax — added guest(s)',
                'amount'         => $addedTax,
            ]);
        }

        $reservation->extra_person_charge = (float) $reservation->extra_person_charge + $addedExtraCharge;
        $reservation->tax_amount          = (float) $reservation->tax_amount + $addedTax;
        $reservation->total_amount        = (float) $reservation->total_amount + $addedExtraCharge + $addedTax;

        return ['amount' => $addedExtraCharge + $addedTax, 'nights' => $nights, 'addedCount' => $addedCount];
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
 * Push back check-out date on an active reservation. Appends NEW charge
 * rows scoped to just the added nights instead of recalculating the whole
 * stay — existing charge rows and payments are untouched. If the room isn't
 * free for the extra nights, hands off to Move Room instead of failing.
 */
public function extend(Request $request, $id)
{
    $validated = $request->validate([
        'checkOut' => 'required|date',
    ]);

   $reservation = Reservation::with(['roomType'])->findOrFail($id);

    if (!in_array($reservation->reservation_status, ['Reserved', 'Confirmed', 'No-Show', 'Checked-In'])) {
        return response()->json(['message' => 'This reservation can no longer be extended.'], 422);
    }

    $newCheckOut = Carbon::parse($validated['checkOut']);

    if ($newCheckOut->lte($reservation->check_out_date)) {
        return response()->json(['message' => 'New check-out date must be after the current one.'], 422);
    }

    $conflict = Reservation::where('room_number', $reservation->room_number)
        ->where('reservation_id', '!=', $reservation->reservation_id)
        ->whereNotIn('reservation_status', ['Checked-Out', 'No-Show', 'Moved'])
        ->where('check_in_date', '<', $newCheckOut)
        ->where('check_out_date', '>', $reservation->check_out_date)
        ->exists();

    if ($conflict) {
        return response()->json([
            'requiresMove' => true,
            'message'      => "Room {$reservation->room_number} is booked by someone else during the extended dates — move to a different room to add these nights.",
            'checkOut'     => $newCheckOut->toDateString(),
        ]);
    }

     DB::transaction(function () use ($reservation, $newCheckOut) {
        $addedNights = max(1, $reservation->check_out_date->diffInDays($newCheckOut));
        $rateNight   = (float) ($reservation->roomType->base_price ?? 0);
        $extraRate   = (float) ($reservation->roomType->extra_person_rate ?? 0);
        $stdCapacity = (int) ($reservation->roomType->capacity ?? 2);
        $totalGuests = $reservation->adults + $reservation->children;

        $addedRoomCharge  = $addedNights * $rateNight;
        $addedExtraCharge = max(0, $totalGuests - $stdCapacity) * $extraRate * $addedNights;
        $addedTax         = ($addedRoomCharge + $addedExtraCharge) * 0.1;

        ReservationCharge::create([
            'reservation_id' => $reservation->reservation_id,
            'charge_type'    => 'room',
            'description'    => "Room charge — {$addedNights} extra night(s) (extended stay)",
            'amount'         => $addedRoomCharge,
        ]);

        if ($addedExtraCharge > 0) {
            ReservationCharge::create([
                'reservation_id' => $reservation->reservation_id,
                'charge_type'    => 'extra_person',
                'description'    => "Extra person charge — {$addedNights} extra night(s) (extended stay)",
                'amount'         => $addedExtraCharge,
            ]);
        }

        ReservationCharge::create([
            'reservation_id' => $reservation->reservation_id,
            'charge_type'    => 'tax',
            'description'    => 'Tax — extended stay',
            'amount'         => $addedTax,
        ]);

        $reservation->update([
            'check_out_date'      => $newCheckOut,
            'nights'              => $reservation->nights + $addedNights,
            'room_charge'         => (float) $reservation->room_charge + $addedRoomCharge,
            'extra_person_charge' => (float) $reservation->extra_person_charge + $addedExtraCharge,
            'tax_amount'          => (float) $reservation->tax_amount + $addedTax,
            'total_amount'        => (float) $reservation->total_amount + $addedRoomCharge + $addedExtraCharge + $addedTax,
        ]);
    });

    $reservation->load(['guest', 'roomType', 'payments', 'charges', 'additionalGuests.guest']);
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
        'reason'     => 'required|string|max:255',
        'checkOut'   => 'nullable|date',
    ]);

    $reservation = Reservation::with(['roomType', 'additionalGuests', 'charges', 'payments'])->findOrFail($id);

    if (!in_array($reservation->reservation_status, ['Reserved', 'Confirmed', 'No-Show', 'Checked-In'])) {
        return response()->json(['message' => 'This reservation can no longer be moved.'], 422);
    }

    if ($validated['roomNumber'] === $reservation->room_number) {
        return response()->json(['message' => 'Reservation is already in that room.'], 422);
    }

    $newRoom = Room::with('roomType')->where('room_number', $validated['roomNumber'])->firstOrFail();

    $totalGuestsForCap = $reservation->adults + $reservation->children;
    $newMaxCapacity    = (int) ($newRoom->roomType->maximum_capacity ?? 999);
    if ($totalGuestsForCap > $newMaxCapacity) {
        return response()->json([
            'message' => "Room {$newRoom->room_number} can host at most {$newMaxCapacity} guest(s).",
        ], 422);
    }

    // Optional target checkout — used by the Extend Stay handoff, so the new
    // room covers the extended stay in one motion instead of just relocating
    // the original date range.
    $targetCheckOut = !empty($validated['checkOut'])
        ? Carbon::parse($validated['checkOut'])
        : $reservation->check_out_date->copy();

    if ($targetCheckOut->lt($reservation->check_out_date)) {
        return response()->json(['message' => 'New check-out date cannot be before the current one.'], 422);
    }

    $isOccupied     = $reservation->reservation_status === 'Checked-In';
    $conflictStart  = $isOccupied ? Carbon::today() : $reservation->check_in_date;

    $conflict = Reservation::where('room_number', $newRoom->room_number)
        ->where('reservation_id', '!=', $reservation->reservation_id)
        ->whereNotIn('reservation_status', ['Checked-Out', 'No-Show', 'Moved'])
        ->where('check_in_date', '<', $targetCheckOut)
        ->where('check_out_date', '>', $conflictStart)
        ->exists();

    if ($conflict) {
        return response()->json([
            'message' => "Room {$newRoom->room_number} is already booked for these dates.",
        ], 422);
    }

    $oldRoomNum = $reservation->room_number;

    $result = DB::transaction(function () use ($reservation, $newRoom, $oldRoomNum, $validated, $request, $isOccupied, $targetCheckOut) {

        if ($isOccupied) {
            // Guest is mid-stay: close the old reservation out (status
            // 'Moved', NOT 'Checked-Out' — the guest hasn't left the hotel)
            // and open a fresh reservation for the new room, instead of
            // overwriting room_number in place and losing the first leg.
            $today          = Carbon::today();
            // The stay actually booked in the OLD room ends here — used to
            // size the refund/adjustment on the old reservation. The NEW
            // reservation's range uses $targetCheckOut instead, which may
            // be further out when this move is an Extend Stay handoff.
            $oldStayCheckOut  = $reservation->check_out_date->copy();
            $newStayCheckOut  = $targetCheckOut->copy();
            $totalGuests      = $reservation->adults + $reservation->children;
            $unusedNights     = max(0, $today->diffInDays($oldStayCheckOut));

            $shortenFields = ['reservation_status' => 'Moved'];

            // Charge rows already written for the full original stay are
            // left as history; add a negative adjustment for the nights
            // not actually spent there instead of mutating them, so the
            // ledger stays append-only.
            if ($unusedNights > 0) {
                $oldRate      = (float) ($reservation->roomType->base_price ?? 0);
                $oldExtraRate = (float) ($reservation->roomType->extra_person_rate ?? 0);
                $oldStdCapacity = (int) ($reservation->roomType->capacity ?? 2);
                $unusedRoomCharge  = $unusedNights * $oldRate;
                $unusedExtraCharge = max(0, $totalGuests - $oldStdCapacity) * $oldExtraRate * $unusedNights;
                $unusedTax         = ($unusedRoomCharge + $unusedExtraCharge) * 0.1;
                $unusedTotal       = $unusedRoomCharge + $unusedExtraCharge + $unusedTax;

                if ($unusedTotal > 0) {
                    ReservationCharge::create([
                        'reservation_id' => $reservation->reservation_id,
                        'charge_type'    => 'adjustment',
                        'description'    => "Unused nights removed — moved to Room {$newRoom->room_number}",
                        'amount'         => -$unusedTotal,
                    ]);
                }

                $shortenFields += [
                    'check_out_date'      => $today,
                    'nights'              => max(1, $reservation->nights - $unusedNights),
                    'room_charge'         => max(0, (float) $reservation->room_charge - $unusedRoomCharge),
                    'extra_person_charge' => max(0, (float) $reservation->extra_person_charge - $unusedExtraCharge),
                    'tax_amount'          => max(0, (float) $reservation->tax_amount - $unusedTax),
                    'total_amount'        => max(0, (float) $reservation->total_amount - $unusedTotal),
                ];
            }

            $reservation->update($shortenFields);
            // Raw, unclamped balance (charged - paid) — deliberately NOT using
            // remaining_amount, which clamps to max(0, ...) and would hide a
            // credit. If the guest already paid for the old room in full, the
            // adjustment above leaves a negative balance here (a credit for
            // the prepaid-but-unused nights), which then reduces the new
            // reservation's charge down to just the rate difference instead
            // of re-billing the full new-room rate on top of what was paid.
            $reservationFresh = $reservation->fresh(['charges', 'payments']);
            $oldBalance = $reservationFresh->charges->sum('amount') - $reservationFresh->payments->sum('amount');

            // Create the NEW reservation covering the rest of the stay in the new room.
            $newNights    = max(1, $today->diffInDays($newStayCheckOut));
            $newRate      = (float) ($newRoom->roomType->base_price ?? 0);
            $newExtraRate = (float) ($newRoom->roomType->extra_person_rate ?? 0);
            $newStdCapacity = (int) ($newRoom->roomType->capacity ?? 2);

            $newRoomCharge  = $newNights * $newRate;
            $newExtraCharge = max(0, $totalGuests - $newStdCapacity) * $newExtraRate * $newNights;
            $newTax         = ($newRoomCharge + $newExtraCharge) * 0.1;
            $carriedOver    = $oldBalance; // may be negative — a credit for nights already paid

            $newReservation = Reservation::create([
                'guest_id'            => $reservation->guest_id,
                'guest_name'          => $reservation->guest_name,
                'guest_email'         => $reservation->guest_email,
                'guest_phone'         => $reservation->guest_phone,
                'room_type_id'        => $newRoom->room_type_id,
                'room_number'         => $newRoom->room_number,
                'check_in_date'       => $today,
                'check_out_date'      => $newStayCheckOut,
                'adults'              => $reservation->adults,
                'children'            => $reservation->children,
                'booking_source'      => $reservation->booking_source,
                'special_requests'    => $reservation->special_requests,
                'nights'              => $newNights,
                'room_charge'         => $newRoomCharge,
                'extra_person_charge' => $newExtraCharge,
                'tax_amount'          => $newTax,
                // Running total across BOTH legs of the stay: the old
                // (already-shortened) reservation's total_amount + this
                // leg's own new charges. Deliberately NOT $carriedOver here
                // — that's the raw paid-vs-charged balance, not a total-cost
                // figure, and mixing the two under/over-counts once any
                // payment has been made on the old leg. remaining_amount
                // is unaffected — it's driven purely by the carried_over
                // ReservationCharge row created below.
                'total_amount'        => (float) $reservation->total_amount + $newRoomCharge + $newExtraCharge + $newTax,
                'deposit_amount'      => 0,
                'reservation_status'  => 'Checked-In',
                'created_by'          => $request->user()->user_id,
            ]);

            $this->seedInitialCharges($newReservation, $newNights, $newRoomCharge, $newExtraCharge, $newTax);

            if ($carriedOver != 0) {
                ReservationCharge::create([
                    'reservation_id' => $newReservation->reservation_id,
                    'charge_type'    => 'carried_over',
                    'description'    => $carriedOver > 0
                        ? "Balance carried from Reservation #{$reservation->reservation_id}"
                        : "Credit from Reservation #{$reservation->reservation_id} (prepaid nights)",
                    'amount'         => $carriedOver,
                ]);
            }

            // Carry over any additional guests sharing the room to the new record.
            foreach ($reservation->additionalGuests as $ag) {
                ReservationGuest::create([
                    'reservation_id' => $newReservation->reservation_id,
                    'guest_id'       => $ag->guest_id,
                    'guest_type'     => $ag->guest_type,
                ]);
            }

            RoomMove::create([
                'old_reservation_id' => $reservation->reservation_id,
                'new_reservation_id' => $newReservation->reservation_id,
                'moved_by'           => $request->user()->user_id,
                'moved_at'           => $today->toDateTimeString(),
                'reason'             => $validated['reason'],
            ]);

            // Guest has physically left the old room and is now in the new
            // one — sync both rooms' status.
            Room::where('room_number', $oldRoomNum)->update(['status' => 'Available']);
            Room::where('room_number', $newRoom->room_number)->update(['status' => 'Occupied']);

            return ['oldReservationId' => $reservation->reservation_id, 'newReservationId' => $newReservation->reservation_id];
        }

        // Not yet checked in — nothing to split yet, just reassign the room
        // (and stretch to $targetCheckOut if this is an Extend Stay handoff).
        // No stay has started, so it's safe to fully reseed this
        // reservation's charge rows against the new room's rate rather than
        // layering an adjustment on top.
        $nights      = max(1, $reservation->check_in_date->diffInDays($targetCheckOut));
        $rateNight   = (float) ($newRoom->roomType->base_price ?? 0);
        $extraRate   = (float) ($newRoom->roomType->extra_person_rate ?? 0);
        $stdCapacity = (int) ($newRoom->roomType->capacity ?? 2);
        $totalGuests = $reservation->adults + $reservation->children;
        $roomCharge  = $nights * $rateNight;
        $extraCharge = max(0, $totalGuests - $stdCapacity) * $extraRate * $nights;
        $taxAmount   = ($roomCharge + $extraCharge) * 0.1;

        $reservation->update([
            'room_number'         => $newRoom->room_number,
            'room_type_id'        => $newRoom->room_type_id,
            'check_out_date'      => $targetCheckOut,
            'nights'              => $nights,
            'room_charge'         => $roomCharge,
            'extra_person_charge' => $extraCharge,
            'tax_amount'          => $taxAmount,
            'total_amount'        => $roomCharge + $extraCharge + $taxAmount,
        ]);

        $reservation->charges()->delete();
        $this->seedInitialCharges($reservation, $reservation->nights, $roomCharge, $extraCharge, $taxAmount);

        RoomTransfer::create([
            'reservation_id' => $reservation->reservation_id,
            'old_room_num'   => $oldRoomNum,
            'new_room_num'   => $newRoom->room_number,
            'transferred_by' => $request->user()->user_id,
            'transfer_date'  => now()->toDateString(),
            'reason'         => $validated['reason'],
        ]);

        return ['oldReservationId' => null, 'newReservationId' => $reservation->reservation_id];
    });

    return response()->json(['message' => 'Room moved successfully.', 'result' => $result]);
}

    /**
     * Insert the initial room / extra_person / tax charge rows for a
     * newly-created reservation, mirroring its snapshot columns.
     */
    private function seedInitialCharges(Reservation $reservation, int $nights, float $roomCharge, float $extraPersonCharge, float $taxAmount): void
    {
        ReservationCharge::create([
            'reservation_id' => $reservation->reservation_id,
            'charge_type'    => 'room',
            'description'    => "Room charge — {$nights} night(s)",
            'amount'         => $roomCharge,
        ]);

        if ($extraPersonCharge > 0) {
            ReservationCharge::create([
                'reservation_id' => $reservation->reservation_id,
                'charge_type'    => 'extra_person',
                'description'    => "Extra person charge — {$nights} night(s)",
                'amount'         => $extraPersonCharge,
            ]);
        }

        if ($taxAmount > 0) {
            ReservationCharge::create([
                'reservation_id' => $reservation->reservation_id,
                'charge_type'    => 'tax',
                'description'    => 'Tax',
                'amount'         => $taxAmount,
            ]);
        }
    }
}