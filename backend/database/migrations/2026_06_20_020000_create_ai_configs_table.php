<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_configs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->enum('provider', ['claude', 'gemini', 'openai', 'qwen', 'ollama']);
            $table->text('api_key')->nullable();          // encrypted at rest via model cast
            $table->string('model_name')->nullable();
            $table->string('ollama_base_url')->nullable();
            $table->string('ollama_model')->nullable();
            $table->boolean('is_active')->default(false);
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_configs');
    }
};
