<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomType extends Model
{
    // 1. Tell Laravel the custom column name of your primary key
    protected $primaryKey = 'room_type_id';

    // 2. Ensure your fields are mass-assignable
    protected $fillable = [
        'name',
        'numOfRooms',
        'base_price',
        'capacity',
        'breakfast',
        'bathtub',
        'status', 
    ];
}