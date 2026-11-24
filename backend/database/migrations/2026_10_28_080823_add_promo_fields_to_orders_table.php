<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->integer('original_amount')->nullable()->after('amount');
            $table->integer('discount_amount')->default(0)->after('original_amount');
            $table->foreignId('promo_code_id')->nullable()->after('discount_amount')
                  ->constrained('promo_codes')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['promo_code_id']);
            $table->dropColumn(['original_amount', 'discount_amount', 'promo_code_id']);
        });
    }
};