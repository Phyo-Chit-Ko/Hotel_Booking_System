<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tracks which staff user confirmed/handled a booking, mirroring the
     * existing reservations.created_by / extra_charges.created_by pattern.
     * Nullable because a booking starts out submitted by the public guest,
     * with no staff user attached until an admin acts on it.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->foreignId('handled_by')
                ->nullable()
                ->constrained('users', 'user_id')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropConstrainedForeignId('handled_by');
        });
    }
};
