<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('instrumental_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instrumental_id')->constrained()->cascadeOnDelete();

            // Type de fichier : preview (public), mp3 (protégé), wav (protégé)
            $table->string('type'); // 'preview' | 'mp3' | 'wav'

            // Chemin relatif dans storage/app/private/audio/
            $table->string('path');

            // Métadonnées du fichier
            $table->string('original_name')->nullable();
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->string('mime_type')->nullable();

            $table->timestamps();

            $table->unique(['instrumental_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instrumental_files');
    }
};