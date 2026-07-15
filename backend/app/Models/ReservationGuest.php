<?php
// app/Models/ReservationGuest.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReservationGuest extends Model
{
    protected $primaryKey = 'reservation_guest_id';

    protected $fillable = ['reservation_id', 'guest_id', 'guest_type'];

    public function guest()
    {
        return $this->belongsTo(Guest::class, 'guest_id', 'guest_id');
    }

    public function reservation()
    {
        return $this->belongsTo(Reservation::class, 'reservation_id', 'reservation_id');
    }
}