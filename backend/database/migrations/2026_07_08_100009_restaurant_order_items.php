<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurant_order_items', function (Blueprint $table) {
            $table->increments('order_item_id');

            $table->unsignedInteger('order_id');
            $table->unsignedInteger('item_id');

            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('unit_price', 8, 2);  // snapshot of the item's price at order time
            $table->decimal('subtotal', 8, 2);    // quantity * unit_price, kept as a stored column for fast reads

            $table->timestamps();

            $table->foreign('order_id')
                ->references('order_id')->on('restaurant_orders')
                ->onDelete('cascade'); // deleting an order removes its line items

            $table->foreign('item_id')
                ->references('item_id')->on('restaurant_items')
                ->onDelete('restrict'); // don't allow deleting a menu item that's referenced in past orders
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurant_order_items');
    }
};