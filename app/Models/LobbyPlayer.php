<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LobbyPlayer extends Model
{

    protected $fillable = [
        'lobby_id',
        'user_id',
        'joined_at',
        'ready',
    ];
}
