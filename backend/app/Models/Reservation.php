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
     * Shape this reservation the way ReservationManagement.jsx expects it.
     * Requires guest and roomType to be eager-loaded to avoid N+1 queries.
     */
    public function toTableRow(): array
    {
        return [
            'id'            => $this->reservation_id,
            'bookingNumber' => $this->booking_number,
            'guestName'     => $this->guest?->full_name ?? '',
            'roomNumber'    => $this->room_number,
            'roomType'      => $this->roomType?->name ?? '',
            'checkIn'       => $this->check_in_date->format('Y-m-d'),
            'checkOut'      => $this->check_out_date->format('Y-m-d'),
            'nights'        => $this->nights,
            'source'        => $this->booking_source,
            'status'        => $this->reservation_status,
            'totalAmount'   => '$' . number_format((float) $this->total_amount, 2),
        ];
    }

    public function additionalGuests()
{
    return $this->hasMany(ReservationGuest::class, 'reservation_id', 'reservation_id');
}

public function guests()
{
    return $this->belongsToMany(Guest::class, 'reservation_guests', 'reservation_id', 'guest_id')
        ->withPivot('guest_type')
        ->withTimestamps();
}
}