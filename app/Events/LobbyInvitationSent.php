<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LobbyInvitationSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public User $inviter;
    public User $invitee;
    public string $lobbyCode;
    public string $gameName;

    public function __construct(User $inviter, User $invitee, string $lobbyCode, string $gameName)
    {
        $this->inviter = $inviter;
        $this->invitee = $invitee;
        $this->lobbyCode = $lobbyCode;
        $this->gameName = $gameName;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->invitee->id)
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'inviter' => [
                'id' => $this->inviter->id,
                'name' => $this->inviter->name,
                'avatar' => $this->inviter->avatar
            ],
            'lobby_code' => $this->lobbyCode,
            'game_name' => $this->gameName,
            'message' => $this->inviter->name . ' invited you to join their ' . $this->gameName . ' lobby'
        ];
    }
}
