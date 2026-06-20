<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\AiConfig;
use App\Models\TnaForm;
use App\Models\User;
use App\Services\AIService;
use App\Services\AiPromptService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Throwable;

class AdminController extends Controller
{
    // ---- Users ----

    public function listUsers(): JsonResponse
    {
        return response()->json(
            User::orderBy('name')->get(['id', 'name', 'email', 'role', 'province', 'unit', 'is_active'])
        );
    }

    public function createUser(Request $request): JsonResponse
    {
        $valid = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', Password::min(8)->letters()->numbers()],
            'role' => ['required', Rule::in(config('tna.roles'))],
            'province' => ['nullable', 'string', 'max:255'],
            'unit' => ['nullable', Rule::in(config('tna.units'))],
        ]);

        $user = User::create([
            ...$valid,
            'password' => Hash::make($valid['password']),
            'is_active' => true,
        ]);

        ActivityLog::record('admin.user_create', "Created user {$user->name} ({$user->role})", $user);

        return response()->json(
            $user->only('id', 'name', 'email', 'role', 'province', 'unit', 'is_active'),
            201
        );
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        $valid = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', Password::min(8)->letters()->numbers()],
            'role' => ['sometimes', Rule::in(config('tna.roles'))],
            'province' => ['nullable', 'string', 'max:255'],
            'unit' => ['nullable', Rule::in(config('tna.units'))],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if (! empty($valid['password'])) {
            $valid['password'] = Hash::make($valid['password']);
        } else {
            unset($valid['password']);
        }

        $user->update($valid);

        ActivityLog::record('admin.user_update', "Updated user {$user->name}", $user, [
            'fields' => array_keys($valid),
        ]);

        return response()->json(
            $user->only('id', 'name', 'email', 'role', 'province', 'unit', 'is_active')
        );
    }

    // ---- AI Configuration ----

    public function getAiConfig(): JsonResponse
    {
        $configs = AiConfig::orderBy('provider')->get()->map(fn ($c) => [
            'id' => $c->id,
            'provider' => $c->provider,
            'model_name' => $c->model_name,
            'ollama_base_url' => $c->ollama_base_url,
            'ollama_model' => $c->ollama_model,
            'is_active' => $c->is_active,
            'has_api_key' => filled($c->getRawOriginal('api_key')),
        ]);

        return response()->json([
            'configs' => $configs,
            'active' => optional($configs->firstWhere('is_active', true))['provider'],
        ]);
    }

    public function updateAiConfig(Request $request): JsonResponse
    {
        $valid = $request->validate([
            'provider' => ['required', Rule::in(['claude', 'gemini', 'openai', 'qwen', 'ollama'])],
            'api_key' => ['nullable', 'string'],
            'model_name' => ['nullable', 'string'],
            'ollama_base_url' => ['nullable', 'string'],
            'ollama_model' => ['nullable', 'string'],
            'set_active' => ['sometimes', 'boolean'],
        ]);

        $config = AiConfig::firstOrNew(['provider' => $valid['provider']]);
        $config->model_name = $valid['model_name'] ?? $config->model_name;
        $config->ollama_base_url = $valid['ollama_base_url'] ?? $config->ollama_base_url;
        $config->ollama_model = $valid['ollama_model'] ?? $config->ollama_model;

        // Only overwrite the key when a new (non-empty) one is provided.
        if (filled($valid['api_key'] ?? null)) {
            $config->api_key = $valid['api_key'];
        }

        $config->created_by = $config->created_by ?? $request->user()->id;

        if ($valid['set_active'] ?? true) {
            AiConfig::where('id', '!=', $config->id ?? '')->update(['is_active' => false]);
            $config->is_active = true;
        }

        $config->save();

        // Ensure only this one is active.
        if ($config->is_active) {
            AiConfig::where('id', '!=', $config->id)->update(['is_active' => false]);
        }

        ActivityLog::record(
            'admin.ai_config_update',
            "Updated AI configuration (active provider: {$config->provider})",
            null,
            ['provider' => $config->provider],
        );

        return response()->json(['message' => 'Configuration saved.']);
    }

    public function testAiConfig(Request $request, AIService $ai): JsonResponse
    {
        $valid = $request->validate([
            'provider' => ['required', Rule::in(['claude', 'gemini', 'openai', 'qwen', 'ollama'])],
            'api_key' => ['nullable', 'string'],
            'model_name' => ['nullable', 'string'],
            'ollama_base_url' => ['nullable', 'string'],
            'ollama_model' => ['nullable', 'string'],
        ]);

        // Build a transient config; reuse the stored key if none was supplied.
        $config = AiConfig::firstOrNew(['provider' => $valid['provider']]);
        $config->model_name = $valid['model_name'] ?? $config->model_name;
        $config->ollama_base_url = $valid['ollama_base_url'] ?? $config->ollama_base_url;
        $config->ollama_model = $valid['ollama_model'] ?? $config->ollama_model;
        if (filled($valid['api_key'] ?? null)) {
            $config->api_key = $valid['api_key'];
        }

        try {
            $text = $ai->generateWith($config, 'Reply with the single word: OK');

            return response()->json([
                'ok' => true,
                'message' => 'Connection successful.',
                'sample' => mb_substr($text, 0, 120),
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'ok' => false,
                'message' => 'Connection failed: ' . $e->getMessage(),
            ], 502);
        }
    }

    /** List models installed on a local Ollama server (live query). */
    public function ollamaModels(Request $request): JsonResponse
    {
        $raw = $request->input('base_url')
            ?: optional(AiConfig::where('provider', 'ollama')->first())->ollama_base_url
            ?: 'http://localhost:11434';

        try {
            // SSRF guard: only allow-listed hosts may be reached.
            $base = AIService::assertAllowedOllamaUrl($raw);
        } catch (Throwable $e) {
            return response()->json([
                'ok' => false,
                'models' => [],
                'message' => $e->getMessage(),
            ], 422);
        }

        try {
            $res = \Illuminate\Support\Facades\Http::timeout(10)
                ->get("{$base}/api/tags")
                ->throw()
                ->json();

            $models = collect($res['models'] ?? [])
                ->pluck('name')
                ->filter()
                ->values();

            return response()->json(['ok' => true, 'models' => $models]);
        } catch (Throwable $e) {
            return response()->json([
                'ok' => false,
                'models' => [],
                'message' => 'Could not reach Ollama at ' . $base,
            ], 502);
        }
    }

    // ---- TNA form deletion requests ----

    /** List forms with a pending deletion request. */
    public function deletionRequests(): JsonResponse
    {
        $forms = TnaForm::with(['submitter:id,name', 'deletionRequester:id,name'])
            ->whereNotNull('deletion_requested_at')
            ->orderByDesc('deletion_requested_at')
            ->get()
            ->map(fn ($f) => [
                'id' => $f->id,
                'enterprise_name' => $f->enterprise_name,
                'province' => $f->province,
                'status' => $f->status,
                'submitted_by' => $f->submitter?->name,
                'requested_by' => $f->deletionRequester?->name,
                'reason' => $f->deletion_reason,
                'requested_at' => $f->deletion_requested_at,
            ]);

        return response()->json($forms);
    }

    /** Approve a deletion request — permanently deletes the form. */
    public function approveDeletion(TnaForm $form): JsonResponse
    {
        abort_if($form->deletion_requested_at === null, 422, 'No pending deletion request.');

        $name = $form->enterprise_name;
        ActivityLog::record('form.deletion_approve', "Approved deletion and deleted {$name}", $form, [
            'enterprise_name' => $name,
        ]);

        $form->delete(); // cascades to sections, attachments, evaluations

        return response()->json(['message' => 'Form deleted.']);
    }

    /** Reject a deletion request — clears the pending flag, keeps the form. */
    public function rejectDeletion(TnaForm $form): JsonResponse
    {
        $form->update([
            'deletion_requested_at' => null,
            'deletion_requested_by' => null,
            'deletion_reason' => null,
        ]);

        ActivityLog::record('form.deletion_reject', "Rejected deletion request for {$form->enterprise_name}", $form);

        return response()->json(['message' => 'Deletion request rejected.']);
    }

    // ---- Activity log ----

    /** Recent activity across the app (most recent first), optionally filtered. */
    public function activityLogs(Request $request): JsonResponse
    {
        $logs = ActivityLog::query()
            ->when($request->filled('action'), fn ($q) => $q->where('action', $request->string('action')))
            ->when($request->filled('user_id'), fn ($q) => $q->where('user_id', $request->string('user_id')))
            ->orderByDesc('created_at')
            ->limit(300)
            ->get(['id', 'user_name', 'action', 'description', 'subject_type', 'subject_id', 'ip', 'created_at']);

        return response()->json($logs);
    }

    // ---- AI prompts ----

    /** All AI Assist prompts with their current and default text. */
    public function aiPrompts(AiPromptService $prompts): JsonResponse
    {
        return response()->json($prompts->detailed());
    }

    /** Override a single prompt's instruction. */
    public function updateAiPrompt(Request $request, string $key, AiPromptService $prompts): JsonResponse
    {
        abort_unless($prompts->exists($key), 404, 'Unknown prompt.');

        $valid = $request->validate([
            'instruction' => ['required', 'string', 'max:5000'],
        ]);

        $prompts->update($key, $valid['instruction']);

        ActivityLog::record('ai.prompt_update', "Updated AI prompt \"{$key}\"", null, ['key' => $key]);

        return response()->json(['message' => 'Prompt saved.']);
    }

    /** Restore a prompt to its built-in default. */
    public function resetAiPrompt(string $key, AiPromptService $prompts): JsonResponse
    {
        abort_unless($prompts->exists($key), 404, 'Unknown prompt.');

        $instruction = $prompts->reset($key);

        ActivityLog::record('ai.prompt_reset', "Reset AI prompt \"{$key}\" to default", null, ['key' => $key]);

        return response()->json(['message' => 'Prompt reset to default.', 'instruction' => $instruction]);
    }
}
