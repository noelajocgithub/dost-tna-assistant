<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TnaAttachment extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'tna_form_id',
        'type',
        'file_path',
        'original_name',
        'mime_type',
        'size',
        'uploaded_at',
    ];

    protected function casts(): array
    {
        return [
            'uploaded_at' => 'datetime',
        ];
    }

    public function form(): BelongsTo
    {
        return $this->belongsTo(TnaForm::class, 'tna_form_id');
    }
}
