<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * `guests.email` was required + unique, but every place that creates a
     * guest (GuestController::store/update, ReservationGuestController::store)
     * always treats email as optional ('nullable|email') — front-desk check-in
     * routinely has no email on file. Inserting a guest without one threw a
     * raw "Column 'email' cannot be null" SQL error straight back to the user
     * instead of a clean validation message. A unique index still allows
     * multiple NULLs in MySQL, so uniqueness for guests who DO have an email
     * is preserved.
     */
    public function up(): void
    {
        Schema::table('guests', function (Blueprint $table) {
            $table->string('email')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('guests', function (Blueprint $table) {
            $table->string('email')->nullable(false)->change();
        });
    }
};
