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
        Schema::create('rooms', function (Blueprint $table) {
    $table->string('room_number')->primary(); // (pk)
    $table->foreignId('room_type_id')->constrained('room_types', 'room_type_id')->onDelete('cascade'); // (fk)
    
    // Grid Row Fields from your UI image
    $table->string('floor'); 
    $table->integer('capacity')->default(2);
    $table->string('bed_type')->default('Single'); // e.g., Single, Double, King
    $table->decimal('extra_person_rate', 10, 2)->default(0.00);
    $table->string('status')->default('Available'); // Operational: Available, Occupied, Maintenance
    
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
