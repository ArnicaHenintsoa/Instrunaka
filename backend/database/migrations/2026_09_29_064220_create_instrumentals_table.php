<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('instrumentals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('genre_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('mood_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('rhythm_id')->nullable()->constrained()->nullOnDelete();

            // Métadonnées principales
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('bpm')->nullable();
            $table->string('musical_key')->nullable();   // ex: 'Am', 'C#m'
            $table->integer('duration_seconds')->nullable();
            $table->string('cover_path')->nullable();    // image de couverture

            // Statut et prix (contrôlés par la plateforme - §13)
            $table->string('status')->default('pending'); // pending | available | removed | sold_exclusive
            $table->integer('non_exclusive_price')->default(7000);   // Ariary
            $table->integer('exclusive_price')->default(20000);      // Ariary

            // Traçabilité
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('published_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instrumentals');
    }
};