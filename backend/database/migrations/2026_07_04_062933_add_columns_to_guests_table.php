<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('guests', function (Blueprint $table) {
            $table->renameColumn('id_number_NRC', 'id_number');
        });

        Schema::table('guests', function (Blueprint $table) {
            $table->string('id_type')->default('Passport')->after('nationality');
            $table->boolean('is_vip')->default(false)->after('id_number');
            $table->string('id_front_path')->nullable()->after('is_vip');
            $table->string('id_back_path')->nullable()->after('id_front_path');
        });
    }

    public function down(): void
    {
        Schema::table('guests', function (Blueprint $table) {
            $table->dropColumn(['id_type', 'is_vip', 'id_front_path', 'id_back_path']);
        });

        Schema::table('guests', function (Blueprint $table) {
            $table->renameColumn('id_number', 'id_number_NRC');
        });
    }
};