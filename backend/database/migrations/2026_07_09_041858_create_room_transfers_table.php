<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_transfers', function (Blueprint $table) {
            $table->id('transfer_id');
            $table->foreignId('reservation_id')->constrained('reservations', 'reservation_id')->cascadeOnDelete();
            $table->string('old_room_num');
            $table->foreign('old_room_num')->references('room_number')->on('rooms');
            $table->string('new_room_num');
            $table->foreign('new_room_num')->references('room_number')->on('rooms');
            $table->foreignId('transferred_by')->nullable()->constrained('users', 'user_id')->nullOnDelete();
            $table->date('transfer_date');
            $table->string('reason')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_transfers');
    }
};