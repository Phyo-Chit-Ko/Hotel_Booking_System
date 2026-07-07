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
}