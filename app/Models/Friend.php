<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Friend extends Model
{
    protected $fillable = [
        'user_id',
        'friend_id',
        'accepted'
    ];

    protected $casts = [
        'accepted' => 'boolean'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id')->with('decoration');
    }

    public function friendUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'friend_id')->with('decoration');
    }
}
