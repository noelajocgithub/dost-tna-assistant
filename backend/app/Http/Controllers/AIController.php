<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Services\AIService;
use App\Services\AiPromptService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class AIController extends Controller
{
    public function __construct(
        private AIService $ai,
        private AiPromptService $prompts,
    ) {}

    /** Resolved prompt map (defaults + admin overrides) for the frontend. */
    public function promptMap(): JsonResponse
    {
        return response()->json($this->prompts->map());
    }

    /** Proxy a narrative-generation prompt to the active LLM provider. */
    public function assist(Request $request): JsonResponse
    {
        $valid = $request->validate([
            'section' => ['required', 'string'],
            'context' => ['nullable', 'array'],
            'instruction' => ['required', 'string'],
        ]);

        $prompt = $this->buildPrompt(
            $valid['section'],
            $valid['context'] ?? [],
            $valid['instruction'],
        );

        try {
            $text = $this->ai->assist($prompt);

            ActivityLog::record(
                'ai.assist',
                "Used AI Assist for field \"{$valid['section']}\"",
                null,
                ['field' => $valid['section']],
            );

            return response()->json(['text' => $text]);
        } catch (Throwable $e) {
            // Log the detail server-side; return a generic message to the client
            // so internal hosts / provider errors aren't leaked.
            Log::warning('AI assist failed', [
                'field' => $valid['section'],
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'AI generation is currently unavailable. Please try again later.',
            ], 502);
        }
    }

    private function buildPrompt(string $section, array $context, string $instruction): string
    {
        // Render the context block as "- label: value" lines.
        if (empty($context)) {
            $contextBlock = '(no additional context provided)';
        } else {
            $lines = [];
            foreach ($context as $key => $value) {
                if (is_array($value)) {
                    $value = json_encode($value);
                }
                $label = str_replace('_', ' ', (string) $key);
                $lines[] = "- {$label}: {$value}";
            }
            $contextBlock = implode("\n", $lines);
        }

        // The scaffold is admin-editable; substitute the placeholders.
        return strtr($this->prompts->system(), [
            '{section}' => $section,
            '{context}' => $contextBlock,
            '{instruction}' => $instruction,
        ]);
    }
}
