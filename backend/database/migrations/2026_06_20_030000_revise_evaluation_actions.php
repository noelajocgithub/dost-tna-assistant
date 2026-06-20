<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Replace the old action check constraint with the new decision set.
        DB::statement('ALTER TABLE evaluations DROP CONSTRAINT IF EXISTS evaluations_action_check');

        // Migrate any existing rows to the new vocabulary.
        DB::statement("UPDATE evaluations SET action = 'approve' WHERE action = 'approved'");
        DB::statement("UPDATE evaluations SET action = 'not_compliant' WHERE action = 'flagged'");
        DB::statement("UPDATE evaluations SET action = 'needs_clarification' WHERE action = 'noted'");

        DB::statement("ALTER TABLE evaluations ALTER COLUMN action SET DEFAULT 'needs_clarification'");
        DB::statement("ALTER TABLE evaluations ADD CONSTRAINT evaluations_action_check CHECK (action IN ('approve','approve_with_comments','needs_clarification','not_compliant'))");

        // Overall (whole-form) evaluation.
        Schema::table('tna_forms', function (Blueprint $table) {
            $table->string('overall_action')->nullable();
            $table->text('overall_comment')->nullable();
        });
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE evaluations DROP CONSTRAINT IF EXISTS evaluations_action_check');
        DB::statement("ALTER TABLE evaluations ALTER COLUMN action SET DEFAULT 'noted'");
        DB::statement("ALTER TABLE evaluations ADD CONSTRAINT evaluations_action_check CHECK (action IN ('noted','flagged','approved'))");

        Schema::table('tna_forms', function (Blueprint $table) {
            $table->dropColumn(['overall_action', 'overall_comment']);
        });
    }
};
