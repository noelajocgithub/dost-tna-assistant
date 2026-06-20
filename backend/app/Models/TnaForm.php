<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TnaForm extends Model
{
    use HasUuids;

    protected $fillable = [
        'enterprise_name',
        'submitted_by',
        'status',
        'province',
        'return_reason',
        'overall_action',
        'overall_comment',
        'deletion_requested_at',
        'deletion_requested_by',
        'deletion_reason',
        'submitted_at',
        'validated_at',
        'validated_by',
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
            'validated_at' => 'datetime',
            'deletion_requested_at' => 'datetime',
        ];
    }

    public function sections(): HasMany
    {
        return $this->hasMany(TnaSection::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(TnaAttachment::class);
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class);
    }

    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function validator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validated_by');
    }

    public function deletionRequester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'deletion_requested_by');
    }
}
