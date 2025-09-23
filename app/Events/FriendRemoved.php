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

class FriendRemoved implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public User $removedBy;
    public User $removedUser;

    public function __construct(User $removedBy, User $removedUser)
    {
        $this->removedBy = $removedBy;
        $this->removedUser = $removedUser;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->removedUser->id)
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'removed_by_id' => $this->removedBy->id,
            'removed_by_name' => $this->removedBy->name,
            'removed_user_id' => $this->removedUser->id,
            'message' => $this->removedBy->name . ' removed you as a friend'
        ];
    }
}
