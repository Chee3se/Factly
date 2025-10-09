<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lobby extends Model
{
    use HasFactory;

    protected $fillable = [
        'game_id',
        'host_user_id',
        'lobby_code',
        'password',
        'started'
    ];

    protected $casts = [
        'started' => 'boolean',
    ];

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    public function host(): BelongsTo
    {
        return $this->belongsTo(User::class, 'host_user_id');
    }

    public function players(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'lobby_players')
            ->withTimestamps()
            ->withPivot('joined_at', 'ready')
            ->with('decoration');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(LobbyMessage::class);
    }

    public function isHost(User $user): bool
    {
        return $this->host_user_id === $user->id;
    }

    public function isFull(): bool
    {
        return $this->players()->count() >= $this->game->max_players;
    }

    public function canStart(): bool
    {
        $readyCount = $this->players()->wherePivot('ready', true)->count();
        return $readyCount >= $this->game->min_players && $readyCount === $this->players()->count();
    }

    public static function generateCode(): string
    {
        do {
            $code = strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 8));
        } while (self::where('lobby_code', $code)->exists());

        return $code;
    }

    // Override route model binding to use lobby_code instead of ID
    public function getRouteKeyName()
    {
        return 'lobby_code';
    }
}
