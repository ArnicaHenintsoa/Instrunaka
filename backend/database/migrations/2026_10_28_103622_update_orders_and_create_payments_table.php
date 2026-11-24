<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Ajouter la colonne refund_required à orders (si elle n'existe pas déjà)
        if (!Schema::hasColumn('orders', 'refund_required')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->boolean('refund_required')->default(false)->after('status');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('orders', 'refund_required')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropColumn('refund_required');
            });
        }
    }
};