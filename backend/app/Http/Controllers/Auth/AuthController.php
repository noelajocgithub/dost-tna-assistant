<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        // Always run a hash comparison (against a dummy hash when the user does
        // not exist) so response timing doesn't reveal which emails are registered.
        $hash = $user?->password ?? '$2y$12$' . str_repeat('0', 53);
        $passwordOk = Hash::check($credentials['password'], $hash);

        if (! $user || ! $passwordOk) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['This account has been deactivated.'],
            ]);
        }

        // Single active token per session; revoke old ones.
        $user->tokens()->delete();
        $token = $user->createToken('spa')->plainTextToken;

        ActivityLog::record('auth.login', "{$user->name} logged in", $user, [], $user);

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    public function logout(Request $request): JsonResponse
    {
        ActivityLog::record('auth.logout', "{$request->user()->name} logged out");

        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }
}
