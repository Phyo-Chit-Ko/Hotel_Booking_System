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
            $table->foreignId('room_type_id')->constrained('room_types', 'room_type_id')->onDelete('cascade');
           
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
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};