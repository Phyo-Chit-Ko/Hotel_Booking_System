<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('night_audit_reports', function (Blueprint $table) {
            $table->dropColumn([
                'total_room_revenue', 'total_tax', 'total_extra_person_revenue',
                'total_payments_received', 'grand_total', 'occupied_rooms', 'no_show_count',
            ]);
            $table->unsignedInteger('total_check_in')->default(0)->after('audit_date');
            $table->unsignedInteger('total_check_out')->default(0)->after('total_check_in');
            $table->unsignedInteger('total_inhouse')->default(0)->after('total_check_out');
            $table->unsignedInteger('total_no_show_rooms')->default(0)->after('total_inhouse');
            $table->decimal('total_revenue', 12, 2)->default(0)->after('total_no_show_rooms');
        });
    }

    public function down(): void
    {
        Schema::table('night_audit_reports', function (Blueprint $table) {
            $table->dropColumn([
                'total_check_in', 'total_check_out', 'total_inhouse',
                'total_no_show_rooms', 'total_revenue',
            ]);
            $table->decimal('total_room_revenue', 12, 2)->default(0);
            $table->decimal('total_tax', 12, 2)->default(0);
            $table->decimal('total_extra_person_revenue', 12, 2)->default(0);
            $table->decimal('total_payments_received', 12, 2)->default(0);
            $table->decimal('grand_total', 12, 2)->default(0);
            $table->unsignedInteger('occupied_rooms')->default(0);
            $table->unsignedInteger('no_show_count')->default(0);
        });
    }
};