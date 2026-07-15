<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RoomType extends Model
{
    protected $primaryKey = 'room_type_id';

    protected $fillable = [
        'name',
        'code',
        'image',
        'num_of_rooms',
        'base_price',
        'extra_person_rate',
        'capacity',
        'breakfast',
        'bathtub',
        'status',
    ];

    protected $casts = [
        'breakfast'    => 'boolean',
        'bathtub'      => 'boolean',
        'base_price'   => 'decimal:2',
        'extra_person_rate' => 'decimal:2',
        'num_of_rooms' => 'integer',
        'capacity'     => 'integer',
    ];

    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class, 'room_type_id', 'room_type_id');
    }
}
