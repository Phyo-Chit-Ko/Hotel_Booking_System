<?php

namespace App\Support;

use App\Models\Reservation;
use Carbon\Carbon;

/**
 * A guest's Identification Document Number is allowed to repeat across the
 * SAME guest's separate, non-overlapping stays (e.g. a returning guest) —
 * it must NOT be usable for two different reservations whose date ranges
 * overlap at the same time. This is intentionally not a DB unique index or
 * a blanket "unique" validation rule; it's a date-range collision check.
 */
class IdNumberOverlapChecker
{
    /**
     * @param  int|null  $excludeReservationId  Ignore this reservation when
     *         checking (e.g. the one currently being edited).
     */
    public static function hasConflict(
        string $idNumber,
        Carbon $checkIn,
        Carbon $checkOut,
        ?int $excludeReservationId = null
    ): bool {
        // A reservation that has already ended (checked out, no-show, or
        // superseded by a room move) no longer genuinely occupies these
        // dates — same exclusion set already used for room double-booking
        // conflicts in ReservationController::extend()/moveRoom().
        return Reservation::whereNotIn('reservation_status', ['Checked-Out', 'No-Show', 'Moved'])
            ->when($excludeReservationId, fn ($q) => $q->where('reservation_id', '!=', $excludeReservationId))
            ->where('check_in_date', '<', $checkOut)
            ->where('check_out_date', '>', $checkIn)
            ->where(function ($q) use ($idNumber) {
                $q->whereHas('guest', fn ($g) => $g->where('id_number', $idNumber))
                  ->orWhereHas('additionalGuests.guest', fn ($g) => $g->where('id_number', $idNumber));
            })
            ->exists();
    }
}
