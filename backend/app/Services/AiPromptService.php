<?php

namespace App\Services;

use App\Models\AiPrompt;

/**
 * Resolves AI Assist prompts, merging the canonical defaults in
 * config/ai_prompts.php with any administrator overrides stored in the
 * ai_prompts table. The DB is the source of truth at runtime; config is the
 * fallback (and the "reset" target).
 */
class AiPromptService
{
    /** All default definitions from config, keyed by prompt key. */
    public function defaults(): array
    {
        return config('ai_prompts', []);
    }

    /** Stored overrides keyed by prompt key => instruction. */
    private function overrides(): array
    {
        return AiPrompt::pluck('instruction', 'key')->all();
    }

    /** key => instruction map for every prompt (DB value, else default). */
    public function map(): array
    {
        $overrides = $this->overrides();
        $out = [];
        foreach ($this->defaults() as $key => $def) {
            $out[$key] = $overrides[$key] ?? $def['instruction'];
        }
        // Include any DB-only keys that aren't in config (forward-compatible).
        foreach ($overrides as $key => $instruction) {
            $out[$key] ??= $instruction;
        }
        return $out;
    }

    /** The system scaffold template (with {section} {context} {instruction}). */
    public function system(): string
    {
        return $this->map()['system']
            ?? ($this->defaults()['system']['instruction'] ?? '');
    }

    /** Detailed list for the admin editor. */
    public function detailed(): array
    {
        $overrides = $this->overrides();
        $rows = [];
        foreach ($this->defaults() as $key => $def) {
            $current = $overrides[$key] ?? $def['instruction'];
            $rows[] = [
                'key' => $key,
                'label' => $def['label'],
                'scope' => $def['scope'],
                'instruction' => $current,
                'default_instruction' => $def['instruction'],
                'is_customized' => $current !== $def['instruction'],
            ];
        }
        return $rows;
    }

    /** True if the key is a known prompt. */
    public function exists(string $key): bool
    {
        return array_key_exists($key, $this->defaults());
    }

    public function update(string $key, string $instruction): AiPrompt
    {
        $def = $this->defaults()[$key];
        return AiPrompt::updateOrCreate(
            ['key' => $key],
            ['instruction' => $instruction, 'label' => $def['label'], 'scope' => $def['scope']],
        );
    }

    /** Restore a prompt to its config default. */
    public function reset(string $key): string
    {
        $def = $this->defaults()[$key];
        AiPrompt::updateOrCreate(
            ['key' => $key],
            ['instruction' => $def['instruction'], 'label' => $def['label'], 'scope' => $def['scope']],
        );
        return $def['instruction'];
    }
}
