<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Statut du compte
            $table->string('status')->default('active'); // 'active', 'suspended', 'disabled'
            // Lien vers le rôle
            $table->foreignId('role_id')->nullable()->after('id')->constrained()->nullOnDelete();
            // Capacité producteur (un user peut être aussi producteur)
            $table->boolean('is_producer')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn(['role_id', 'status', 'is_producer']);
        });
    }
};