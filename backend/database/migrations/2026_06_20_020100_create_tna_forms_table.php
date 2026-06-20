<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tna_forms', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('enterprise_name')->nullable();
            $table->foreignUuid('submitted_by')->constrained('users')->cascadeOnDelete();
            $table->enum('status', ['draft', 'submitted', 'under_review', 'validated', 'returned'])
                ->default('draft');
            $table->string('province')->nullable();
            $table->text('return_reason')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('validated_at')->nullable();
            $table->foreignUuid('validated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tna_forms');
    }
};
