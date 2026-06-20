<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tna_forms', function (Blueprint $table) {
            $table->timestamp('deletion_requested_at')->nullable();
            $table->foreignUuid('deletion_requested_by')->nullable()
                ->constrained('users')->nullOnDelete();
            $table->text('deletion_reason')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('tna_forms', function (Blueprint $table) {
            $table->dropConstrainedForeignId('deletion_requested_by');
            $table->dropColumn(['deletion_requested_at', 'deletion_reason']);
        });
    }
};
