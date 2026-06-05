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
        $table->id(); // Creates an auto-incrementing id column
        
        // Add your custom columns here:
        $table->foreignId('customer_id'); // Connects to your customers table
        $table->date('check_in_date');
        $table->date('check_out_date');
        $table->string('room_type');
        $table->decimal('total_price', 8, 2); // 8 digits total, 2 after decimal
        $table->string('status')->default('pending'); 
        
        $table->timestamps(); // Creates created_at and updated_at columns
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
