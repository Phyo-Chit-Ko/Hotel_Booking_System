<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReservationCharge extends Model
{
    protected $table = 'reservation_charges';
    public $timestamps = false;

    protected $fillable = [
        'reservation_id',
        'charge_type',
        'description',
        'amount',
    ];

    protected $casts = [
        'amount'     => 'decimal:2',
        'created_at' => 'datetime',
    ];

    public function reservation()
    {
        return $this->belongsTo(Reservation::class, 'reservation_id', 'reservation_id');
    }
}
