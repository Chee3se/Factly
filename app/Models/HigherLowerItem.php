<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HigherLowerItem extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'image_url',
        'value',
        'description',
    ];
}
