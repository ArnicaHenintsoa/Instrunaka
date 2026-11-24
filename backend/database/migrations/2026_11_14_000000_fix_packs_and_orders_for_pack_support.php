<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Supprimer is_active de packs (on garde active)
        if (Schema::hasColumn('packs', 'is_active')) {
            Schema::table('packs', function (Blueprint $table) {
                $table->dropColumn('is_active');
            });
        }

        // 2. Rendre orders.instrumental_id nullable et ajouter pack_id
        Schema::table('orders', function (Blueprint $table) {
            // Rendre instrumental_id nullable
            $table->foreignId('instrumental_id')->nullable()->change();
            
            // Ajouter pack_id
            if (!Schema::hasColumn('orders', 'pack_id')) {
                $table->foreignId('pack_id')->nullable()->after('instrumental_id')
                      ->constrained('packs')->restrictOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'pack_id')) {
                $table->dropForeign(['pack_id']);
                $table->dropColumn('pack_id');
            }
            
            $table->foreignId('instrumental_id')->nullable(false)->change();
        });

        Schema::table('packs', function (Blueprint $table) {
            if (!Schema::hasColumn('packs', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('cover_path');
            }
        });
    }
};