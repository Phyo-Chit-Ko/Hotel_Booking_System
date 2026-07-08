<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    protected $primaryKey = 'booking_id';

    // Disabling default timestamps since your table only tracks created_at
    public $timestamps = false; 

    protected $fillable = [
        'guest_id',
        'room_type_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'bed_preference',
        'check_in_date',
        'check_out_date',
        'total_room',
        'adult',
        'child',
        'room_number',
        'deposit',
        'deposit_screenshot',
        'special_requests',
        'payment_method', // Safely mass-assignable now!
        'status',
    ];

    protected $casts = [
        // CHANGED: Using 'datetime' guarantees a Carbon object is returned,
        // preventing "format() on string/object" errors in your Controller index method.
        'check_in_date'  => 'datetime',
        'check_out_date' => 'datetime',
    ];

    /**
     * Get the guest associated with the booking.
     */
    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class, 'guest_id', 'guest_id');
    }

    /**
     * Get the room type associated with the booking.
     */
    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class, 'room_type_id', 'room_type_id');
    }
}