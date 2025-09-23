<?php

namespace App\Events;

use App\Models\User;
use App\Models\Friend;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FriendRequestSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public User $sender;
    public User $recipient;
    public Friend $friendRequest;

    public function __construct(User $sender, User $recipient, Friend $friendRequest)
    {
        $this->sender = $sender;
        $this->recipient = $recipient;
        $this->friendRequest = $friendRequest;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->recipient->id)
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'sender' => [
                'id' => $this->sender->id,
                'name' => $this->sender->name,
                'email' => $this->sender->email,
                'avatar' => $this->sender->avatar
            ],
            'request_id' => $this->friendRequest->id,
            'message' => $this->sender->name . ' sent you a friend request'
        ];
    }
}
