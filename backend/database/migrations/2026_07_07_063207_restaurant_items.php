<?php
 
use Illuminate\Database\Migrations\Migration;

use Illuminate\Database\Schema\Blueprint;

use Illuminate\Support\Facades\Schema;
 
return new class extends Migration

{

    public function up(): void

    {

        Schema::create('restaurant_items', function (Blueprint $table) {

            $table->increments('item_id'); // custom PK name, matches Guest/Room/Reservation convention
 
            $table->string('item_name');

            $table->string('category', 50)->default('Food'); // Food | Snack | Drink | Dessert (validated in controller, not enum, so new categories don't need a migration)

            $table->decimal('price', 8, 2);

            $table->string('status', 20)->default('Available'); // Available | Out of Stock
 
            $table->timestamps(); // created_at / updated_at

        });

    }
 
    public function down(): void

    {

        Schema::dropIfExists('restaurant_items');

    }

};
 