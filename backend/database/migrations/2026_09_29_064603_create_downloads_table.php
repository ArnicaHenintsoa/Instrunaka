<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('downloads', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('instrumental_file_id')->constrained()->cascadeOnDelete();

            // Type de fichier téléchargé (mp3 ou wav)
            $table->string('file_type'); // 'mp3' | 'wav'

            // Traçabilité (§17)
            $table->ipAddress('ip_address')->nullable();
            $table->string('user_agent')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'order_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('downloads');
    }
};