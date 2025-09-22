<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizLadderItem extends Model
{
    protected $fillable = [
        'question',
        'options',
        'correct_answer',
        'difficulty',
        'points',
    ];
}
