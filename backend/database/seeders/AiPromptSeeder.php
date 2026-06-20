<?php

namespace Database\Seeders;

use App\Models\AiPrompt;
use Illuminate\Database\Seeder;

class AiPromptSeeder extends Seeder
{
    public function run(): void
    {
        // Create any missing prompt from defaults; never overwrite an existing
        // row so administrator edits survive re-seeding. Labels/scope are kept
        // in sync on each run (only the instruction is owned by the admin).
        foreach (config('ai_prompts', []) as $key => $def) {
            $prompt = AiPrompt::firstOrNew(['key' => $key]);
            $prompt->label = $def['label'];
            $prompt->scope = $def['scope'];
            if (! $prompt->exists) {
                $prompt->instruction = $def['instruction'];
            }
            $prompt->save();
        }
    }
}
