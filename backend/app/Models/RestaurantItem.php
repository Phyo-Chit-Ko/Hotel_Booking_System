<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RestaurantItem extends Model
{
    protected $table = 'restaurant_items';
    protected $primaryKey = 'item_id';

    protected $fillable = [
        'item_name',
        'category',
        'price',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    // Restaurant_Order_Item.item_id -> Restaurant_Item.item_id
    // public function orderItems()
    // {
    //     return $this->hasMany(RestaurantOrderItem::class, 'item_id', 'item_id');
    // }
}