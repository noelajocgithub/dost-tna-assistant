<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tna_sections', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tna_form_id')->constrained('tna_forms')->cascadeOnDelete();
            $table->string('section_key'); // e.g. enterprise_info, business_profile, production
            $table->jsonb('data')->default('{}');
            $table->timestamps();

            $table->unique(['tna_form_id', 'section_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tna_sections');
    }
};
