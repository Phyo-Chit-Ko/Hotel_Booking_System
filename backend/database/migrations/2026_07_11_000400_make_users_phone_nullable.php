<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Same class of bug already fixed on `guests` (see
     * 2026_07_11_000100_make_guests_email_nullable): `UserController::store()`
     * /`update()` validate `phone` as `nullable`, but the column itself was
     * NOT NULL — creating a staff user without a phone number threw a raw
     * SQL error instead of saving.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable(false)->change();
        });
    }
};
