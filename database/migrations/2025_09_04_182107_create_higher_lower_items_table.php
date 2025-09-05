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
        Schema::create('higher_lower_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('image_url');
            $table->bigInteger('value');
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index('value');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('higher_lower_items');
    }
};
