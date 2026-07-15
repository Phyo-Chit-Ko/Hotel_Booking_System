<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Same class of bug as the `email` column (see
     * 2026_07_11_000100_make_guests_email_nullable): every guest-creating
     * endpoint validates `nationality` as `nullable`, but the column itself
     * was NOT NULL — so leaving it blank threw a raw SQL error instead of
     * saving the guest.
     */
    public function up(): void
    {
        Schema::table('guests', function (Blueprint $table) {
            $table->string('nationality')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('guests', function (Blueprint $table) {
            $table->string('nationality')->nullable(false)->change();
        });
    }
};
