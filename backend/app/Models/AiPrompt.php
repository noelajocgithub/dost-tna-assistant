<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AiPrompt extends Model
{
    use HasUuids;

    protected $fillable = [
        'key',
        'label',
        'scope',
        'instruction',
    ];
}
