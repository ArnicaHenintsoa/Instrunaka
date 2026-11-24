<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('order_id')->constrained()->cascadeOnDelete();

            // Informations du paiement Mobile Banking (§6)
            // Aucune intégration automatique dans la v1
            $table->string('method')->default('mobile_banking');
            $table->string('mobile_number')->nullable();       // numéro vers lequel l'utilisateur a envoyé
            $table->string('sender_reference')->nullable();    // référence transaction côté opérateur
            $table->integer('amount');

            // Statut du paiement
            $table->string('status')->default('pending');
            // 'pending' | 'confirmed' | 'failed'

            $table->foreignId('confirmed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('confirmed_at')->nullable();
            $table->text('note')->nullable();

            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};