<?php
// database/migrations/xxxx_xx_xx_create_reservation_guests_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservation_guests', function (Blueprint $table) {
            $table->id('reservation_guest_id');
            $table->foreignId('reservation_id')
                  ->constrained('reservations', 'reservation_id')
                  ->onDelete('cascade');
            $table->foreignId('guest_id')
                  ->constrained('guests', 'guest_id')
                  ->onDelete('cascade');
            $table->string('guest_type')->default('Adult'); // Adult | Child
            $table->timestamps();

            $table->unique(['reservation_id', 'guest_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservation_guests');
    }
};