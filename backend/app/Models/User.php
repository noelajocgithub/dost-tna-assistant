<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasUuids, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'province',
        'unit',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function forms(): HasMany
    {
        return $this->hasMany(TnaForm::class, 'submitted_by');
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isEvaluator(): bool
    {
        return $this->role === 'regional_evaluator';
    }

    public function isTnaLead(): bool
    {
        return $this->role === 'tna_lead';
    }

    public function isProvincialDirector(): bool
    {
        return $this->role === 'provincial_director';
    }

    public function isSubmitter(): bool
    {
        return in_array($this->role, ['enterprise', 'provincial_staff'], true);
    }
}
