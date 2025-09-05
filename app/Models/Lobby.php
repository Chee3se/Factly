<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lobby extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'game_id',
        'host_user_id',
        'lobby_code',
        'password',
    ];
}
