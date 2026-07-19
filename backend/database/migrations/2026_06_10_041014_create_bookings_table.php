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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id('booking_id');
            $table->foreignId('user_id')
                ->constrained('users', 'user_id')
                ->cascadeOnDelete();
            $table->string('booking_number', 12)->nullable()->unique();
            $table->foreignId('room_type_id')->constrained('room_types', 'room_type_id')->onDelete('cascade');
            // Not a hard FK constraint — booking.room_number can be entered
            // before we're 100% sure it matches, and validated in the controller.
            $table->string('room_number')->nullable();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email');
            $table->string('phone');
            $table->string('bed_preference')->nullable();
            $table->date('check_in_date');
            $table->date('check_out_date');
            $table->unsignedInteger('total_room')->default(1);
            $table->unsignedInteger('adult')->default(1);
            $table->unsignedInteger('child')->default(0);
            $table->decimal('deposit', 10, 2)->default(0.00);
            $table->string('deposit_screenshot')->nullable();
            $table->string('special_requests')->nullable();
            $table->string('payment_method')->nullable();
            $table->string('status')->default('pending');
            // Not constrained here: this file and create_reservations_table
            // share the exact same migration timestamp, and this one sorts
            // first alphabetically, so `reservations` doesn't exist yet at
            // this point. The FK itself is added right after by
            // add_reservation_id_foreign_key_to_bookings_table.
            $table->unsignedBigInteger('reservation_id')->nullable();
            $table->timestamp('created_at')->useCurrent();
            // Tracks which staff user confirmed/handled a booking. Nullable
            // because a booking starts out submitted by the public guest,
            // with no staff user attached until an admin acts on it.
            $table->foreignId('handled_by')
                ->nullable()
                ->constrained('users', 'user_id')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};