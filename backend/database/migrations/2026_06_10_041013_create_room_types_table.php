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
        Schema::create('room_types', function (Blueprint $table) {
        $table->id('room_type_id');
        $table->string('name');
        $table->integer('numOfRooms');
        $table->decimal('base_price', 10, 2);
        $table->integer('capacity');
        $table->boolean('breakfast')->default(false);
        $table->boolean('bathtub')->default(false);
        $table->string('status')->default('Active'); // <--- ADD THIS LINE
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_types');
    }
};
