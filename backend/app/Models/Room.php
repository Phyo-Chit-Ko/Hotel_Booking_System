<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

    // Tell Laravel that the primary key is a custom string (room_number), not an auto-incrementing integer 'id'
    protected $primaryKey = 'room_number';
    public $incrementing = false;
    protected $keyType = 'string';

    // ADD ALL YOUR VISIBLE FIELD KEYS HERE
    protected $fillable = [
        'room_number',
        'room_type_id',
        'floor',
        'capacity',
        'bed_type',
        'extra_person_rate',
        'status'
    ];

    /**
     * Relationship with the RoomType blueprint model
     */
    public function roomType()
    {
        return $this->belongsTo(RoomType::class, 'room_type_id', 'room_type_id');
    }
}