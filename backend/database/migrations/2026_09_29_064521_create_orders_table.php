<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            // Code de référence unique affiché dans la popup (§6)
            $table->string('reference')->unique();

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('instrumental_id')->constrained()->cascadeOnDelete();

            // Type d'achat : 7000 Ar ou 20000 Ar (§5)
            $table->string('type'); // 'non_exclusive' | 'exclusive'

            // Montant figé au moment de la commande
            // (le prix est contrôlé par la plateforme - §13)
            $table->integer('amount'); // en Ariary

            // Statut de la commande (§13)
            $table->string('status')->default('pending');
            // 'pending' | 'validated' | 'rejected' | 'cancelled'

            // Traçabilité de la validation par l'admin
            $table->foreignId('validated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('validated_at')->nullable();
            $table->text('admin_note')->nullable();

            $table->timestamps();

            $table->index('status');
            $table->index('reference');
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};