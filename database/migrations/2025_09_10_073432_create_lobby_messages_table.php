<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Izveido tabulu "lobby_messages"
     */
    public function up(): void
    {
        Schema::create('lobby_messages', function (Blueprint $table) {
            // Primārā atslēga
            $table->id();
            // Ārējā atslēga uz istabu tabulu
            $table->foreignId('lobby_id')->constrained('lobbies')->onDelete('cascade');
            // Ārējā atslēga uz lietotāju tabulu
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            // Ziņas teksts
            $table->string('message');
            // Automātiski izveido "created_at" un "updated_at" kolonnas
            $table->timestamps();
        });
    }

    /**
     * Dzēš tabulu "lobby_messages"
     */
    public function down(): void
    {
        // Dzēš tabulu, ja tā pastāv
        Schema::dropIfExists('lobby_messages');
    }
};
