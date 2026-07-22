<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Booking extends Model
{
    protected $primaryKey = 'booking_id';

    // Disabling default timestamps since your table only tracks created_at
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'room_type_id',
        'booking_number',
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
        'payment_method',
        'status',
        'reservation_id',
        'handled_by',
    ];

    protected $casts = [
        // CHANGED: Using 'datetime' guarantees a Carbon object is returned,
        // preventing "format() on string/object" errors in your Controller index method.
        'check_in_date'  => 'datetime',
        'check_out_date' => 'datetime',
        'created_at'     => 'datetime',
    ];

    /**
     * Get the guest associated with the booking.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    /**
     * Get the room type associated with the booking.
     */
    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class, 'room_type_id', 'room_type_id');
    }

    public function handledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handled_by', 'user_id');
    }

    public function roomAssignments(): HasMany
    {
        return $this->hasMany(BookingRoomAssignment::class, 'booking_id', 'booking_id');
    }
}