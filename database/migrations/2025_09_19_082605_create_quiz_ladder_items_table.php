<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('quiz_ladder_items', function (Blueprint $table) {
            $table->id();
            $table->string('question');
            $table->json('options');
            $table->string('correct_answer');
            $table->enum('difficulty', ['easy', 'medium', 'hard']);
            $table->integer('points');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quiz_ladder_items');
    }
};
