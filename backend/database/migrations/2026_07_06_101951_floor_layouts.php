<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Create floor_layouts table.
 * Stores all non-room cells on a floor: pool, gym, elevator,
 * walkway, emergency_exit, stairs, and any custom zones.
 *
 * This replaces the hardcoded AMENITIES array in RoomLayoutEditor.jsx.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('floor_layouts', function (Blueprint $table) {
            $table->id();

            $table->string('floor', 10)->default('1')
                  ->comment('Floor identifier e.g. 1, 2, 3');

            $table->enum('type', [
                'pool',
                'gym',
                'elevator',
                'walkway',
                'emergency_exit',
                'stairs',
                'reception',
                'restaurant',
                'parking',
                'custom',
            ])->default('custom');

            $table->string('label', 100)
                  ->comment('Display text on the cell e.g. Pool, GYM, Exit A');

            $table->unsignedTinyInteger('col')
                  ->comment('Grid column start (1-based)');
            $table->unsignedTinyInteger('row')
                  ->comment('Grid row start (1-based)');
            $table->unsignedTinyInteger('w')->default(1)
                  ->comment('Width in grid cells');
            $table->unsignedTinyInteger('h')->default(1)
                  ->comment('Height in grid cells');

            $table->boolean('vertical')->default(false)
                  ->comment('Rotate label text 90° — used for walkway corridors');

            $table->string('color', 50)->nullable()
                  ->comment('Optional Tailwind bg class override e.g. bg-red-800');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('floor_layouts');
    }
};
