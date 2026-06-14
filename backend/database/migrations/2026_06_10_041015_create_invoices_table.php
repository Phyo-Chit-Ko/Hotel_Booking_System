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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id('invoice_id'); // (pk)
            $table->foreignId('reservation_id')->constrained('reservations', 'reservation_id')->onDelete('cascade'); // (fk)
            $table->decimal('room_charge', 10, 2);
            $table->decimal('service_charge', 10, 2);
            $table->decimal('tax_amount', 10, 2);
            $table->decimal('deposit_paid', 10, 2);
            $table->decimal('total_amount', 10, 2);
            $table->date('date');
            $table->decimal('remain_amount', 10, 2);
            $table->string('status');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
