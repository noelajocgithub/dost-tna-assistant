<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tna_form_id')->constrained('tna_forms')->cascadeOnDelete();
            $table->foreignUuid('evaluator_id')->constrained('users')->cascadeOnDelete();
            $table->string('section_key');
            $table->text('comment')->nullable();
            $table->enum('action', ['noted', 'flagged', 'approved'])->default('noted');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluations');
    }
};
