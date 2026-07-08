<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $table = 'reservations';
    protected $primaryKey = 'reservation_id';

    protected $fillable = [
        'guest_id',
        'room_type_id',
        'room_number',
        'check_in_date',
        'check_out_date',
        'adults',
        'children',
        'booking_source',
        'special_requests',
        'nights',
        'room_charge',
        'extra_person_charge',
        'tax_amount',
        'total_amount',
        'deposit_amount',
        'reservation_status',
        'created_by',
    ];

    protected $casts = [
        'check_in_date'  => 'date',
        'check_out_date' => 'date',
        'room_charge'         => 'decimal:2',
        'extra_person_charge' => 'decimal:2',
        'tax_amount'          => 'decimal:2',
        'total_amount'        => 'decimal:2',
        'deposit_amount'      => 'decimal:2',
    ];

    /**
     * Fields computed on the fly, not stored — included automatically
     * whenever this model is converted to an array/JSON.
     */
    protected $appends = ['booking_number', 'remaining_amount'];

    // ── Relationships ───────────────────────────────────────────────────

    public function guest()
    {
        return $this->belongsTo(Guest::class, 'guest_id', 'guest_id');
    }

    public function roomType()
    {
        return $this->belongsTo(RoomType::class, 'room_type_id', 'room_type_id');
    }

    public function room()
    {
        return $this->belongsTo(Room::class, 'room_number', 'room_number');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by', 'user_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'reservation_id', 'reservation_id');
    }

    /**
     * Pivot rows linking additional guests (beyond the primary guest_id)
     * to this reservation, via the reservation_guests table.
     */
    public function additionalGuests()
    {
        return $this->hasMany(ReservationGuest::class, 'reservation_id', 'reservation_id');
    }

    /**
     * Convenience many-to-many view of the same relationship, if you
     * ever want direct Guest models with the pivot's guest_type attached.
     */
    public function guests()
    {
        return $this->belongsToMany(Guest::class, 'reservation_guests', 'reservation_id', 'guest_id')
            ->withPivot('guest_type')
            ->withTimestamps();
    }

    // ── Computed attributes ─────────────────────────────────────────────

    /**
     * e.g. "BK-2026-0001"
     */
    public function getBookingNumberAttribute(): string
    {
        return 'BK-' . $this->created_at->format('Y') . '-' . str_pad((string) $this->reservation_id, 4, '0', STR_PAD_LEFT);
    }

    /**
     * total_amount minus whatever's actually been paid so far.
     * Always derived — never trust a stored snapshot for this.
     */
    public function getRemainingAmountAttribute(): float
    {
        $paid = $this->relationLoaded('payments')
            ? $this->payments->sum('amount')
            : $this->payments()->sum('amount');

        return max(0, (float) $this->total_amount - (float) $paid);
    }

    /**
     * The status shown to staff, derived from reservation_status + today's date.
     *
     * - Reserved/Confirmed + check-in date is today  -> "Check-In" (action needed, not stored)
     * - No-Show (set nightly by reservations:mark-no-shows) -> "No-Show"
     * - Checked-In -> "Occupied"
     * - anything else (Reserved/Confirmed in the future, Checked-Out) -> unchanged
     */
    public function computeDisplayStatus(): string
    {
        $status = $this->reservation_status;
        $today  = \Carbon\Carbon::today();

        if (in_array($status, ['Reserved', 'Confirmed']) && $this->check_in_date->isSameDay($today)) {
            return 'Check-In';
        }

        return match ($status) {
            'No-Show'    => 'No-Show',
            'Checked-In' => 'Occupied',
            default      => $status,
        };
    }

    // ── Presentation helpers for ReservationManagement.jsx ──────────────

    /**
     * Shape one guest's view of this reservation for the table.
     * Pass the primary guest by default, or an additional guest + their type.
     *
     * NOTE: 'remainingAmount' / 'totalAmountRaw' require the 'payments'
     * relation to be eager-loaded on the reservation (see index()/detail()
     * in ReservationController) to avoid an N+1 query per row.
     */
    public function toTableRow(?Guest $guestOverride = null, string $guestType = 'Primary'): array
    {
        $g = $guestOverride ?? $this->guest;

        return [
            'id'            => $this->reservation_id,
            'rowId'         => $this->reservation_id . '-' . ($g?->guest_id ?? 'na'),
            'bookingNumber' => $this->booking_number,
            'guestName'     => $g?->full_name ?? '',
            'guestType'     => $guestType,
            'roomNumber'    => $this->room_number,
            'roomType'      => $this->roomType?->name ?? '',
            'checkIn'       => $this->check_in_date->format('Y-m-d'),
            'checkOut'      => $this->check_out_date->format('Y-m-d'),
            'nights'        => $this->nights,
            'source'        => $this->booking_source,
            'status'        => $this->computeDisplayStatus(),
            'rawStatus'     => $this->reservation_status,
            'totalAmount'   => '$' . number_format((float) $this->total_amount, 2),
            // Numeric (unformatted) counterparts — used by the payment /
            // checkout UI for math and > 0 comparisons instead of parsing
            // the display string above.
            'totalAmountRaw'  => (float) $this->total_amount,
            'remainingAmount' => $this->remaining_amount,
        ];
    }

    /**
     * Expand this single reservation into one row per guest sharing the room:
     * the primary guest, plus every guest linked via reservation_guests.
     * Requires 'guest', 'roomType', 'payments', and 'additionalGuests.guest'
     * to be eager-loaded to avoid N+1 queries.
     */
    public function toTableRows(): array
    {
        $rows = [$this->toTableRow($this->guest, 'Primary')];

        foreach ($this->additionalGuests as $link) {
            $rows[] = $this->toTableRow($link->guest, $link->guest_type ?? 'Additional');
        }

        return $rows;
    }
}
