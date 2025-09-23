<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FriendRequestDeclined implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public User $decliner;
    public User $requester;

    public function __construct(User $decliner, User $requester)
    {
        $this->decliner = $decliner;
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
            'message' => 'Your friend request was declined'
        ];
    }
}
