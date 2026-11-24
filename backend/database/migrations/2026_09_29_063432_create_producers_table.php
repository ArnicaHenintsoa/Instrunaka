<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('producers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('display_name'); // nom public du producteur
            $table->text('bio')->nullable();
            $table->string('avatar_path')->nullable();
            $table->boolean('verified')->default(false); // validé par l'admin
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('producers');
    }
};