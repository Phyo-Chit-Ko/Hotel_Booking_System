<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_room_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings', 'booking_id')->cascadeOnDelete();
            $table->string('room_number');
            $table->foreign('room_number')->references('room_number')->on('rooms')->restrictOnDelete();
            // Set once the booking is confirmed/converted, so we know which
            // reservation this slot produced without relying on the single
            // legacy bookings.reservation_id column (which can only hold one id).
            $table->foreignId('reservation_id')->nullable()
                ->constrained('reservations', 'reservation_id')->nullOnDelete();
            $table->timestamps();

            $table->unique(['booking_id', 'room_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_room_assignments');
    }
};
