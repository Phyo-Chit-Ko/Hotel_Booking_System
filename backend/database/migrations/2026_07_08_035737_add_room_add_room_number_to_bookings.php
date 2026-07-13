<?php
// database/migrations/2026_07_08_000000_add_room_number_to_bookings_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('room_number')->nullable()->after('room_type_id');
            // Not a hard FK constraint — booking.room_number can be entered
            // before we're 100% sure it matches, and validated in the controller.
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn('room_number');
        });
    }
};