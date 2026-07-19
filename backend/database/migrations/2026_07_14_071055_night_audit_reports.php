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
            $table->unsignedInteger('total_check_in')->default(0);
            $table->unsignedInteger('total_check_out')->default(0);
            $table->unsignedInteger('total_inhouse')->default(0);
            $table->unsignedInteger('total_no_show_rooms')->default(0);
            $table->decimal('total_revenue', 12, 2)->default(0);
            $table->enum('status', ['success', 'failed'])->default('success');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('night_audit_reports');
    }
};