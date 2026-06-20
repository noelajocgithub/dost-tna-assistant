<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $users = [
            ['name' => 'Admin User',          'email' => 'admin@dost.gov.ph',      'role' => 'admin',              'province' => null],
            ['name' => 'Regional Evaluator',  'email' => 'evaluator@dost.gov.ph',  'role' => 'regional_evaluator', 'province' => 'Region IV-A'],
            ['name' => 'Provincial Staff',    'email' => 'staff@dost.gov.ph',      'role' => 'provincial_staff',   'province' => 'Laguna'],
            ['name' => 'Enterprise Owner',    'email' => 'enterprise@dost.gov.ph', 'role' => 'enterprise',         'province' => 'Laguna'],
        ];

        foreach ($users as $u) {
            User::updateOrCreate(
                ['email' => $u['email']],
                [
                    'name' => $u['name'],
                    'password' => Hash::make('password'),
                    'role' => $u['role'],
                    'province' => $u['province'],
                    'is_active' => true,
                ]
            );
        }

        $this->call(AiConfigSeeder::class);
    }
}
