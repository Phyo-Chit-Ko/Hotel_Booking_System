<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_types', function (Blueprint $table) {
            $table->id('room_type_id');
            $table->string('code', 10)->unique()->nullable();
            $table->string('image')->nullable();
            $table->string('name', 100);
            $table->decimal('base_price', 10, 2);
            $table->decimal('extra_person_rate', 10, 2)->default(0);
            $table->decimal('extra_bed_fee', 10, 2)->default(0);
            $table->unsignedTinyInteger('capacity');
            $table->unsignedTinyInteger('maximum_capacity');
            $table->boolean('breakfast')->default(false);
            $table->boolean('bathtub')->default(false);
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_types');
    }
};
