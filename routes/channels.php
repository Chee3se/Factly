<?php

use Illuminate\Support\Facades\Broadcast;

// Allow users to listen to their own private channel
Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Global presence channel - any authenticated user is considered online
Broadcast::channel('online', function ($user) {
    return [
        'id' => $user->id,
        'name' => $user->name,
    ];
});

Broadcast::channel('lobby.{lobbyCode}', function ($user, $lobbyCode) {
    $lobby = \App\Models\Lobby::where('lobby_code', $lobbyCode)->first();

    if (!$lobby || !$lobby->players()->where('user_id', $user->id)->exists()) {
        return false;
    }

    return [
        'id' => $user->id,
        'name' => $user->name,
        'avatar' => $user->avatar ?? null
    ];
});
