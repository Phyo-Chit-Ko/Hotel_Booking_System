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
                  ->nullable()
                  ->constrained('guests', 'guest_id')
                  ->onDelete('cascade');
            $table->string('source_booking_number', 12)->nullable()->index();
            $table->string('guest_name')->nullable();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('guest_email')->nullable();
            $table->string('guest_phone')->nullable();
            $table->foreignId('room_type_id')
                  ->constrained('room_types', 'room_type_id')
                  ->onDelete('cascade');
            $table->string('room_number');
            $table->foreign('room_number')->references('room_number')->on('rooms')
                  ->onDelete('cascade');
            $table->date('check_in_date');
            $table->date('check_out_date');
            $table->unsignedTinyInteger('adults')->default(1);
            $table->unsignedTinyInteger('children')->default(0);
            $table->string('booking_source')->default('Direct');
            $table->text('special_requests')->nullable();
            $table->unsignedInteger('nights')->default(0);
            $table->decimal('room_charge', 10, 2)->default(0);
            $table->decimal('extra_person_charge', 10, 2)->default(0);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->decimal('deposit_amount', 10, 2)
                  ->default(0);
            $table->string('reservation_status')
                  ->default('Confirmed');
            $table->string('checkout_override_reason')->nullable();
            $table->foreignId('checkout_override_by')->nullable()
                  ->constrained('users', 'user_id')->nullOnDelete();
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