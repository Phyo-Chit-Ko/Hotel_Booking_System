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
            $table->decimal('extra_person_rate', 10, 2)
                  ->default(0.00);                                // ERD: Extra_person_rate

            // ── Grid Layout Fields (for RoomLayoutEditor) ─────────────────
            // These store WHERE and HOW LARGE the room appears on the
            // visual floor map. Saved when user clicks "Save Layout".
            $table->unsignedTinyInteger('grid_col')->default(1)
                  ->comment('Column position on floor blueprint (1-based)');
            $table->unsignedTinyInteger('grid_row')->default(1)
                  ->comment('Row position on floor blueprint (1-based)');
            $table->unsignedTinyInteger('grid_w')->default(1)
                  ->comment('Width in grid cells (1 = normal, 2 = suite spanning 2 cols)');
            $table->unsignedTinyInteger('grid_h')->default(1)
                  ->comment('Height in grid cells (1 = normal, 2 = suite spanning 2 rows)');

            $table->timestamps();                                 // ERD: created_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
