<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {

            $table->id('reservation_id');

            $table->foreignId('guest_id')
                  ->constrained('guests', 'guest_id')
                  ->onDelete('cascade');

            $table->foreignId('room_type_id')
                  ->constrained('room_types', 'room_type_id')
                  ->onDelete('cascade');

            $table->string('room_number');

            $table->foreign('room_number')
                  ->references('room_number')
                  ->on('rooms')
                  ->onDelete('cascade');

            $table->date('check_in_date');
            $table->date('check_out_date');

            $table->decimal('deposit_amount', 10, 2)
                  ->default(0);

            $table->string('reservation_status')
                  ->default('Confirmed');

            $table->foreignId('created_by')
                  ->constrained('users', 'user_id');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};