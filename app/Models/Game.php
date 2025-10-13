<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Game extends Model
{
    /** @use HasFactory<\Database\Factories\GameFactory> */
    use HasFactory;
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'thumbnail',
        'min_players',
        'max_players',
    ];

    /**
     * Get the game items for the game.
     */
    public function gameItems(): HasMany
    {
        return $this->hasMany(GameItem::class);
    }

    /**
     * Get the scores for the game.
     */
    public function scores(): HasMany
    {
        return $this->hasMany(Score::class);
    }
}
