<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rhythms', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();   // 'slow', 'medium', 'fast'
            $table->string('label');            // 'Lent', 'Moyen', 'Rapide'
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rhythms');
    }
};