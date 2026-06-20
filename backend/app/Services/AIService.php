<?php

namespace App\Services;

use App\Models\AiConfig;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class AIService
{
    /** Generate text using the currently active provider config. */
    public function assist(string $prompt): string
    {
        $config = AiConfig::where('is_active', true)->first();

        if (! $config) {
            throw new RuntimeException('No active AI provider is configured. Ask an admin to set one up.');
        }

        return $this->dispatch($config, $prompt);
    }

    /** Generate using a specific config (used by the admin "test connection"). */
    public function generateWith(AiConfig $config, string $prompt): string
    {
        return $this->dispatch($config, $prompt);
    }

    private function dispatch(AiConfig $config, string $prompt): string
    {
        // LLM calls (especially a local Ollama model loading into memory) can run
        // well past PHP's default 30s max_execution_time. Without this, the request
        // fatals and takes down the single-process `php artisan serve` dev server.
        // Allow a little more than the longest HTTP client timeout below (120s).
        @set_time_limit(150);

        return match ($config->provider) {
            'claude' => $this->callClaude($config, $prompt),
            'gemini' => $this->callGemini($config, $prompt),
            'openai' => $this->callOpenAI($config, $prompt),
            'qwen'   => $this->callQwen($config, $prompt),
            'ollama' => $this->callOllama($config, $prompt),
            default  => throw new RuntimeException("Unsupported provider: {$config->provider}"),
        };
    }

    private function callClaude(AiConfig $config, string $prompt): string
    {
        $res = Http::withHeaders([
            'x-api-key' => $config->api_key,
            'anthropic-version' => '2023-06-01',
        ])->timeout(60)->post('https://api.anthropic.com/v1/messages', [
            'model' => $config->model_name ?: 'claude-haiku-3-5',
            'max_tokens' => 1024,
            'messages' => [['role' => 'user', 'content' => $prompt]],
        ])->throw()->json();

        return trim($res['content'][0]['text'] ?? '');
    }

    private function callGemini(AiConfig $config, string $prompt): string
    {
        $model = $config->model_name ?: 'gemini-2.0-flash-lite';
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent";

        $res = Http::timeout(60)
            ->withQueryParameters(['key' => $config->api_key])
            ->post($url, [
                'contents' => [['parts' => [['text' => $prompt]]]],
            ])->throw()->json();

        return trim($res['candidates'][0]['content']['parts'][0]['text'] ?? '');
    }

    private function callOpenAI(AiConfig $config, string $prompt): string
    {
        $res = Http::withToken($config->api_key)
            ->timeout(60)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => $config->model_name ?: 'gpt-4o-mini',
                'messages' => [['role' => 'user', 'content' => $prompt]],
            ])->throw()->json();

        return trim($res['choices'][0]['message']['content'] ?? '');
    }

    private function callQwen(AiConfig $config, string $prompt): string
    {
        // Alibaba DashScope, OpenAI-compatible endpoint.
        $res = Http::withToken($config->api_key)
            ->timeout(60)
            ->post('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', [
                'model' => $config->model_name ?: 'qwen-flash',
                'messages' => [['role' => 'user', 'content' => $prompt]],
            ])->throw()->json();

        return trim($res['choices'][0]['message']['content'] ?? '');
    }

    /**
     * Validate an Ollama base URL against the allow-list and return it
     * trimmed of any trailing slash. Blocks SSRF to arbitrary internal hosts.
     */
    public static function assertAllowedOllamaUrl(string $url): string
    {
        $url = rtrim(trim($url), '/');
        $host = parse_url($url, PHP_URL_HOST);
        $scheme = parse_url($url, PHP_URL_SCHEME);

        if (! $host || ! in_array($scheme, ['http', 'https'], true)) {
            throw new RuntimeException('Invalid Ollama base URL.');
        }

        $allowed = config('tna.ollama_allowed_hosts', ['localhost', '127.0.0.1', '::1']);
        if (! in_array($host, $allowed, true)) {
            throw new RuntimeException("Ollama host \"{$host}\" is not allowed.");
        }

        return $url;
    }

    private function callOllama(AiConfig $config, string $prompt): string
    {
        $base = self::assertAllowedOllamaUrl($config->ollama_base_url ?: 'http://localhost:11434');

        $res = Http::timeout(120)->post("{$base}/api/generate", [
            'model' => $config->ollama_model ?: 'llama3.1',
            'prompt' => $prompt,
            'stream' => false,
        ])->throw()->json();

        return trim($res['response'] ?? '');
    }
}
