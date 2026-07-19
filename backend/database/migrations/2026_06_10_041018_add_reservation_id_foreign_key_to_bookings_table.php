<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * bookings.reservation_id can't be constrained inline in
 * create_bookings_table because that migration and create_reservations_table
 * share the exact same timestamp and bookings sorts first alphabetically —
 * `reservations` doesn't exist yet at that point. This adds the real FK
 * once both tables exist, immediately after both base creates run.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->foreign('reservation_id')
                ->references('reservation_id')->on('reservations')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['reservation_id']);
        });
    }
};
