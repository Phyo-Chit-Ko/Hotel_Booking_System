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
        Schema::create('extra_charges', function (Blueprint $table) {
            $table->id();

            // Link to the reservation this charge belongs to.
            $table->foreignId('reservation_id')
                ->constrained('reservations', 'reservation_id')
                ->cascadeOnDelete();

            $table->string('guest_name');

            $table->enum('service_type', ['Laundry', 'Car Rental', 'Food'])
                ->default('Laundry');

            $table->date('charge_date');

            $table->text('description')->nullable();

            // Cost accounting fields
            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('rate', 10, 2)->default(0);

            $table->decimal('total', 10, 2)->default(0);

            $table->json('food_items')->nullable();

            $table->foreignId('created_by')
                ->constrained('users', 'user_id');

            $table->timestamps();

            $table->index(['reservation_id', 'charge_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('extra_charges');
    }
};
