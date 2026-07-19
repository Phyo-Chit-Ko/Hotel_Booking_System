<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {

            // ── ERD Core Fields ───────────────────────────────────────────
            $table->string('room_number', 10)->primary();         // ERD: room_number (PK)

            $table->unsignedBigInteger('room_type_id');           // ERD: room_type_id (FK)
            $table->foreign('room_type_id')
                  ->references('room_type_id')
                  ->on('room_types')
                  ->onDelete('restrict');                         // don't delete type if rooms exist

            $table->string('floor', 10)->default('1');            // ERD: floor
            $table->enum('status', [                              // ERD: status
                'Available',
                'Occupied',
                'Cleaning',
                'Reserved',
                'Maintenance',
            ])->default('Available');
            $table->string('bed_type', 50)->default('Single');    // ERD: Bed_Type

            $table->timestamps();                                 // ERD: created_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
