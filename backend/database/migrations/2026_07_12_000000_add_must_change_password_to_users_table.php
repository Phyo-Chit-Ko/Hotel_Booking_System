<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Force-password-change-on-first-login: staff accounts created by an
     * admin/manager (UserController::store) start with a password the new
     * user didn't pick themselves, so they must be prompted to set their own
     * on first login. Default false so this does NOT retroactively force
     * existing accounts (including seeded admin/manager/receptionist rows)
     * to change anything — UserController is what flips it to true, only
     * for rows created/updated going forward.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('must_change_password')->default(false)->after('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('must_change_password');
        });
    }
};
