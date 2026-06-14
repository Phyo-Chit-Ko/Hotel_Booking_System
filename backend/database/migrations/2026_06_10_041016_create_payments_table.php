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
        Schema::create('payments', function (Blueprint $table) {
            $table->id('payment_id'); // (pk)
            $table->foreignId('reservation_id')->constrained('reservations', 'reservation_id')->onDelete('cascade'); // (fk)
            $table->decimal('amount', 10, 2);
            $table->string('payment_method');
            $table->date('date');
            $table->string('transaction_no');
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
