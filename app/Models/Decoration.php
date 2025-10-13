<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Decoration extends Model
{
    protected $fillable = [
        'name',
        'description',
        'image_url',
        'unlock_type',
        'unlock_game_slug',
        'unlock_score',
        'unlock_description'
    ];
}
