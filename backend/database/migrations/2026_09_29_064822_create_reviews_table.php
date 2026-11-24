<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('instrumental_id')->constrained()->cascadeOnDelete();

            $table->integer('rating'); // 1 à 5
            $table->text('comment')->nullable();

            // Modération (§11)
            $table->string('status')->default('published');
            // 'published' | 'pending' | 'hidden'

            $table->foreignId('moderated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('moderated_at')->nullable();

            $table->timestamps();

            $table->unique(['user_id', 'instrumental_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};