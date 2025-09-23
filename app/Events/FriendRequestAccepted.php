<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FriendRequestAccepted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public User $accepter;
    public User $requester;

    public function __construct(User $accepter, User $requester)
    {
        $this->accepter = $accepter;
        $this->requester = $requester;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->requester->id)
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'friend' => [
                'id' => $this->accepter->id,
                'name' => $this->accepter->name,
                'avatar' => $this->accepter->avatar
            ],
            'message' => $this->accepter->name . ' accepted your friend request'
        ];
    }
}
