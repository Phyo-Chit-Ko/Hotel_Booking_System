<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_moves', function (Blueprint $table) {
            $table->id();
            $table->foreignId('old_reservation_id')->constrained('reservations', 'reservation_id')->cascadeOnDelete();
            $table->foreignId('new_reservation_id')->constrained('reservations', 'reservation_id')->cascadeOnDelete();
            $table->foreignId('moved_by')->nullable()->constrained('users', 'user_id')->nullOnDelete();
            $table->dateTime('moved_at');
            $table->string('reason')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_moves');
    }
};
