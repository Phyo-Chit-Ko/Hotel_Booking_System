<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('room_types', function (Blueprint $table) {
            $table->decimal('extra_person_rate', 10, 2)->default(0)->after('base_price');
        });

        // Backfill from the per-room values this replaces, so existing data isn't
        // silently zeroed out. Rooms of the same type may have disagreed on this
        // value before; take the highest as the new type-level rate.
        DB::statement('
            UPDATE room_types rt
            JOIN (
                SELECT room_type_id, MAX(extra_person_rate) AS rate
                FROM rooms
                GROUP BY room_type_id
            ) r ON r.room_type_id = rt.room_type_id
            SET rt.extra_person_rate = r.rate
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('room_types', function (Blueprint $table) {
            $table->dropColumn('extra_person_rate');
        });
    }
};
