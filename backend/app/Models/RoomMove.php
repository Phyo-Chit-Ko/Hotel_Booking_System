<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomMove extends Model
{
    protected $table = 'room_moves';
    public $timestamps = false;

    protected $fillable = [
        'old_reservation_id',
        'new_reservation_id',
        'moved_by',
        'moved_at',
        'reason',
    ];

    protected $casts = [
        'moved_at' => 'datetime',
    ];

    public function oldReservation()
    {
        return $this->belongsTo(Reservation::class, 'old_reservation_id', 'reservation_id');
    }

    public function newReservation()
    {
        return $this->belongsTo(Reservation::class, 'new_reservation_id', 'reservation_id');
    }

    public function movedBy()
    {
        return $this->belongsTo(User::class, 'moved_by', 'user_id');
    }
}
