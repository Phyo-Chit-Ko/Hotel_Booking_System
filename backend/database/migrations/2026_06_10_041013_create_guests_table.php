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
        Schema::create('guests', function (Blueprint $table) {
            $table->id('guest_id');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->nullable()->unique();
            $table->string('phone');
            $table->string('id_number');
            $table->boolean('is_vip')->default(false);
            $table->string('id_front_path')->nullable();
            $table->string('id_back_path')->nullable();
            $table->string('nationality')->nullable();
            $table->string('gender')->nullable(); // Male | Female | Other
            $table->string('id_type')->default('Passport');
            $table->timestamps();
        });
    }

  
    public function down(): void
    {
        Schema::dropIfExists('guests');
    }
};
