<?php

use Illuminate\Support\Facades\Broadcast;

// Allow users to listen to their own private channel
Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('lobby.{lobbyCode}', function ($user, $lobbyCode) {
    $lobby = \App\Models\Lobby::where('lobby_code', $lobbyCode)->first();

    if (!$lobby || !$lobby->players()->where('user_id', $user->id)->exists()) {
        return false;
    }

    // For presence channels, return user data array
    return [
        'id' => $user->id,
        'name' => $user->name,
        'avatar' => $user->avatar ?? null
    ];
});
