<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $primaryKey = 'booking_id';

    public $timestamps = false; // migration only has created_at, no updated_at

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
    'deposit',
    'deposit_screenshot',
    'special_requests',
    'payment_method', // add this back
    'status',
];

    protected $casts = [
        'check_in_date' => 'date',
        'check_out_date' => 'date',
    ];

    public function guest()
    {
        return $this->belongsTo(Guest::class, 'guest_id', 'guest_id');
    }

    public function roomType()
    {
        return $this->belongsTo(RoomType::class, 'room_type_id', 'room_type_id');
    }
}