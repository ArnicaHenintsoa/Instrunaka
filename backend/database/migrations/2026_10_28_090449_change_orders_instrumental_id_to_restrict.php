<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // 1. Supprimer l'ancienne contrainte cascadeOnDelete
            $table->dropForeign(['instrumental_id']);
            
            // 2. Ajouter la nouvelle contrainte restrictOnDelete
            $table->foreign('instrumental_id')
                  ->references('id')
                  ->on('instrumentals')
                  ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['instrumental_id']);
            $table->foreign('instrumental_id')
                  ->references('id')
                  ->on('instrumentals')
                  ->cascadeOnDelete();
        });
    }
};