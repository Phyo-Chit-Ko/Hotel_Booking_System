<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('night_audit_reports', function (Blueprint $table) {
            $table->id();
            $table->date('audit_date')->unique();
            $table->decimal('total_room_revenue', 12, 2);
            $table->decimal('total_tax', 12, 2);
            $table->decimal('total_extra_person_revenue', 12, 2);
            $table->decimal('total_payments_received', 12, 2);
            $table->decimal('grand_total', 12, 2);
            $table->unsignedInteger('occupied_rooms');
            $table->unsignedInteger('no_show_count');
            $table->enum('status', ['success', 'failed'])->default('success');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('night_audit_reports');
    }
};