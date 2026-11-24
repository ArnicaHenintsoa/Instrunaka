<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('packs', function (Blueprint $table) {
            if (!Schema::hasColumn('packs', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('cover_path');
            }
        });
    }

    public function down(): void
    {
        Schema::table('packs', function (Blueprint $table) {
            if (Schema::hasColumn('packs', 'is_active')) {
                $table->dropColumn('is_active');
            }
        });
    }
};