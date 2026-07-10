<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('checkout_override_reason')->nullable()->after('reservation_status');
            $table->foreignId('checkout_override_by')->nullable()->after('checkout_override_reason')
                  ->constrained('users', 'user_id')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropForeign(['checkout_override_by']);
            $table->dropColumn(['checkout_override_reason', 'checkout_override_by']);
        });
    }
};
