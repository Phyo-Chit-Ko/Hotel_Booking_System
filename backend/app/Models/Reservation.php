<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $primaryKey = 'reservation_id';

    protected $fillable = [
        'guest_id',
        'room_type_id',
        'room_number',
        'check_in_date',
        'check_out_date',
        'deposit_amount',
        'reservation_status',
        'created_by',
    ];

    protected $casts = [
        'check_in_date'  => 'date',
        'check_out_date' => 'date',
        'deposit_amount' => 'decimal:2',
    ];

    public function guest()
    {
        return $this->belongsTo(
            Guest::class,
            'guest_id',
            'guest_id'
        );
    }

    public function room()
    {
        return $this->belongsTo(
            Room::class,
            'room_number',
            'room_number'
        );
    }

    public function roomType()
    {
        return $this->belongsTo(
            RoomType::class,
            'room_type_id',
            'room_type_id'
        );
    }
}