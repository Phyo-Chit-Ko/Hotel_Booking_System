<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->unsignedTinyInteger('adults')->default(1)->after('check_out_date');
            $table->unsignedTinyInteger('children')->default(0)->after('adults');
            $table->string('booking_source')->default('Direct')->after('children');
            $table->text('special_requests')->nullable()->after('booking_source');
            $table->unsignedInteger('nights')->default(0)->after('special_requests');
            $table->decimal('room_charge', 10, 2)->default(0)->after('nights');
            $table->decimal('extra_person_charge', 10, 2)->default(0)->after('room_charge');
            $table->decimal('tax_amount', 10, 2)->default(0)->after('extra_person_charge');
            $table->decimal('total_amount', 10, 2)->default(0)->after('tax_amount');
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn([
                'adults', 'children', 'booking_source', 'special_requests',
                'nights', 'room_charge', 'extra_person_charge', 'tax_amount', 'total_amount',
            ]);
        });
    }
};