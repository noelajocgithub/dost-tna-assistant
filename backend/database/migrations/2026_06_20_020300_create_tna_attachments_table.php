<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tna_attachments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tna_form_id')->constrained('tna_forms')->cascadeOnDelete();
            $table->enum('type', ['org_chart', 'plant_layout', 'process_flow', 'other']);
            $table->string('file_path');
            $table->string('original_name');
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size')->nullable();
            $table->timestamp('uploaded_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tna_attachments');
    }
};
