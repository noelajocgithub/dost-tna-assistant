<?php

namespace Database\Seeders;

use App\Models\AiConfig;
use App\Models\User;
use Illuminate\Database\Seeder;

class AiConfigSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        // Default to a local Ollama provider so AI Assist works without API keys.
        AiConfig::updateOrCreate(
            ['provider' => 'ollama'],
            [
                'ollama_base_url' => 'http://localhost:11434',
                'ollama_model' => 'llama3.1:8b',
                'is_active' => true,
                'created_by' => $admin?->id,
            ],
        );
    }
}
