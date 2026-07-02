<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_types', function (Blueprint $table) {
            $table->id('room_type_id');
            $table->string('code', 10)->unique()->nullable();     
            $table->string('name', 100);
            $table->unsignedSmallInteger('num_of_rooms')->default(0);
            $table->decimal('base_price', 10, 2);
            $table->unsignedTinyInteger('capacity');
            $table->boolean('breakfast')->default(false);
            $table->boolean('bathtub')->default(false);
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_types');
    }
};
