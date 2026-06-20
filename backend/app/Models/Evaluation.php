<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Evaluation extends Model
{
    use HasUuids;

    protected $fillable = [
        'tna_form_id',
        'evaluator_id',
        'section_key',
        'comment',
        'action',
    ];

    public function form(): BelongsTo
    {
        return $this->belongsTo(TnaForm::class, 'tna_form_id');
    }

    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluator_id');
    }
}
