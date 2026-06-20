<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AiConfig extends Model
{
    use HasUuids;

    protected $fillable = [
        'provider',
        'api_key',
        'model_name',
        'ollama_base_url',
        'ollama_model',
        'is_active',
        'created_by',
    ];

    protected $hidden = [
        'api_key',
    ];

    protected function casts(): array
    {
        return [
            'api_key' => 'encrypted',
            'is_active' => 'boolean',
        ];
    }
}
