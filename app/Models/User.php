<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the scores for the user.
     */
    public function scores(): HasMany
    {
        return $this->hasMany(Score::class, 'player_id');
    }

    /**
     * Get the user's best score for a specific game.
     */
    public function bestScoreForGame($gameId): int
    {
        return $this->scores()
            ->where('game_id', $gameId)
            ->max('score') ?? 0;
    }

    /**
     * Get the user's recent scores.
     */
    public function recentScores($limit = 10): Collection
    {
        return $this->scores()
            ->with('game')
            ->latest()
            ->limit($limit)
            ->get();
    }
}
