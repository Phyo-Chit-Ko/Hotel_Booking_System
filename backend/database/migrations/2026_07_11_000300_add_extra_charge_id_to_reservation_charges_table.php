<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Links a `reservation_charges` row back to the `extra_charges`
     * (Laundry/Car Rental/Food) row it was generated from, so extra
     * charges finally count toward the reservation's real balance/ledger
     * instead of living in a disconnected table. Nullable because most
     * charge rows (room/extra_person/tax/adjustment/carried_over) have no
     * originating extra charge.
     */
    public function up(): void
    {
        Schema::table('reservation_charges', function (Blueprint $table) {
            $table->foreignId('extra_charge_id')
                ->nullable()
                ->after('reservation_id')
                ->constrained('extra_charges')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('reservation_charges', function (Blueprint $table) {
            $table->dropConstrainedForeignId('extra_charge_id');
        });
    }
};
