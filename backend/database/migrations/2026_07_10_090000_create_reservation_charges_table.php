<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservation_charges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained('reservations', 'reservation_id')->cascadeOnDelete();
            // Links back to the extra_charges (Laundry/Car Rental/Food) row
            // this was generated from, if any. Nullable because most charge
            // rows (room/extra_person/tax/adjustment/carried_over) have no
            // originating extra charge.
            $table->foreignId('extra_charge_id')
                ->nullable()
                ->constrained('extra_charges')
                ->cascadeOnDelete();
            $table->string('charge_type'); // room | extra_person | service | adjustment | carried_over | refund | tax
            $table->string('description');
            $table->decimal('amount', 10, 2); // refunds/adjustments may be negative
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservation_charges');
    }
};
