<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Services\AIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class AIController extends Controller
{
    public function __construct(private AIService $ai) {}

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
        $lines = [
            'You are assisting an MSME with the DOST Technology Needs Assessment (TNA) Form 01.',
            "Section: {$section}",
            '',
            'Use ONLY the context below. Write in clear, professional English suitable for a',
            'Philippine government technology assessment form. Return only the narrative text,',
            'with no preamble, headings, or markdown.',
            '',
            'Context:',
        ];

        if (empty($context)) {
            $lines[] = '(no additional context provided)';
        } else {
            foreach ($context as $key => $value) {
                if (is_array($value)) {
                    $value = json_encode($value);
                }
                $label = str_replace('_', ' ', (string) $key);
                $lines[] = "- {$label}: {$value}";
            }
        }

        $lines[] = '';
        $lines[] = "Task: {$instruction}";

        return implode("\n", $lines);
    }
}
