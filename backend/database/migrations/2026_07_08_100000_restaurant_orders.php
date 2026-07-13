<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
         Schema::create('restaurant_orders', function (Blueprint $table) {
            $table->increments('order_id'); // 
 
            $table->string('order_date');

            $table->string('order_time'); 
            $table->decimal('total_amount'); 

            $table->string('status', 20)->default('Available'); // Available | Out of Stock
 
            $table->timestamps(); // created_at / updated_at
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('restaurant_orders');

    }
};
