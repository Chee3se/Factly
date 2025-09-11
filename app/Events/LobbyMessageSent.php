<?php

namespace App\Events;

use App\Models\Lobby;
use App\Models\LobbyMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LobbyMessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $lobby;
    public $message;

    public function __construct(Lobby $lobby, LobbyMessage $message)
    {
        $this->lobby = $lobby;
        $this->message = $message;
    }

    public function broadcastOn()
    {
        return new PresenceChannel('lobby.' . $this->lobby->lobby_code);
    }

    public function broadcastWith()
    {
        return [
            'message' => $this->message->toArray(),
            'lobby' => $this->lobby->lobby_code,
        ];
    }
}
