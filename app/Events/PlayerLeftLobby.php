<?php

namespace App\Events;

use App\Models\Lobby;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PlayerLeftLobby implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Lobby $lobby,
        public User $user
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('lobby.' . $this->lobby->lobby_code),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'lobby' => $this->lobby->load(['players', 'host', 'game']),
            'user' => $this->user,
            'message' => $this->user->name . ' left the lobby'
        ];
    }
}
