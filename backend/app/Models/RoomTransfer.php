<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomTransfer extends Model
{
    protected $table = 'room_transfers';
    protected $primaryKey = 'transfer_id';
    public $timestamps = false;

    protected $fillable = [
        'reservation_id',
        'old_room_num',
        'new_room_num',
        'transferred_by',
        'transfer_date',
        'reason',
    ];

    public function reservation()
    {
        return $this->belongsTo(Reservation::class, 'reservation_id', 'reservation_id');
    }

    public function oldRoom()
    {
        return $this->belongsTo(Room::class, 'old_room_num', 'room_number');
    }

    public function newRoom()
    {
        return $this->belongsTo(Room::class, 'new_room_num', 'room_number');
    }

    public function transferredBy()
    {
        return $this->belongsTo(User::class, 'transferred_by', 'user_id');
    }
}