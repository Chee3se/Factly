<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Score extends Model
{
    protected $fillable = [
        'user_id',
        'game_id',
        'score',
    ];

    protected $casts = [
        'score' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    public function scopeBestScoresForGame($query, $gameId, $limit = 10)
    {
        return $query->where('game_id', $gameId)
            ->selectRaw('user_id, MAX(score) as best_score')
            ->with('user:id,name,avatar')
            ->groupBy('user_id')
            ->orderByDesc('best_score')
            ->limit($limit);
    }

    public function scopeUserBestForGame($query, $userId, $gameId)
    {
        return $query->where('user_id', $userId)
            ->where('game_id', $gameId)
            ->max('score');
    }
}
