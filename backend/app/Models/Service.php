<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    // Tells Laravel your custom XAMPP table name instead of looking for 'services'
    
    protected $table = 'extra_charges'; 
     
    
    // Allows columns to accept data from your frontend
    protected $fillable = [
        'reservation_id',
        'guest_name',
        'service_type',
        'charge_date',
        'description',
        'quantity',
        'rate',
        'total',        
        'food_items',
        'created_by',
    ];

    public function reservation()
    {
        return $this->belongsTo(Reservation::class, 'reservation_id', 'reservation_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by', 'user_id');
    }

    /**
     * The reservation_charges row synced from this extra charge, if any —
     * see ExtraServiceController for how they're kept in sync.
     */
    public function reservationCharge()
    {
        return $this->hasOne(ReservationCharge::class, 'extra_charge_id', 'id');
    }
}