<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AIController;
use App\Http\Controllers\AttachmentController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\TnaFormController;
use Illuminate\Support\Facades\Route;

// --- Public auth ---
// Throttle login to slow brute-force / credential-stuffing (per IP + email).
Route::post('/auth/login', [AuthController::class, 'login'])
    ->middleware('throttle:6,1');

// --- Authenticated ---
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Role-aware dashboard summary (available to all authenticated roles)
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Export (owner, evaluator, or admin — controller enforces access)
    Route::get('/forms/{form}/export/pdf', [ExportController::class, 'pdf']);
    Route::get('/forms/{form}/export/docx', [ExportController::class, 'docx']);

    // TNA forms (submitters + provincial director oversight)
    Route::middleware('role:enterprise,provincial_staff,provincial_director')->group(function () {
        Route::get('/forms', [TnaFormController::class, 'index']);
        Route::post('/forms', [TnaFormController::class, 'store']);
        Route::get('/forms/{form}', [TnaFormController::class, 'show']);
        Route::put('/forms/{form}/section', [TnaFormController::class, 'updateSection']);
        Route::post('/forms/{form}/submit', [TnaFormController::class, 'submit']);
        Route::post('/forms/{form}/request-deletion', [TnaFormController::class, 'requestDeletion']);
        Route::post('/forms/{form}/cancel-deletion', [TnaFormController::class, 'cancelDeletion']);

        // Image attachments (e.g. organizational structure chart).
        Route::post('/forms/{form}/attachments', [AttachmentController::class, 'store']);
        Route::get('/forms/{form}/attachments/{attachment}', [AttachmentController::class, 'show']);
        Route::delete('/forms/{form}/attachments/{attachment}', [AttachmentController::class, 'destroy']);
    });

    // AI Assist (form drafting + evaluator/lead comment drafting)
    // Throttled to curb LLM cost abuse / resource exhaustion.
    Route::post('/ai/assist', [AIController::class, 'assist'])
        ->middleware('role:enterprise,provincial_staff,provincial_director,regional_evaluator,tna_lead', 'throttle:20,1');

    // Resolved prompt defaults (admin overrides + config) for the AI panels.
    Route::get('/ai/prompts', [AIController::class, 'promptMap'])
        ->middleware('role:enterprise,provincial_staff,provincial_director,regional_evaluator,tna_lead');

    // Evaluation (regional evaluators + TNA lead; regional director views read-only)
    Route::middleware('role:regional_evaluator,tna_lead,regional_director')->group(function () {
        Route::get('/evaluations', [EvaluationController::class, 'index']);
        Route::get('/evaluations/{form}', [EvaluationController::class, 'show']);
        Route::post('/evaluations/{form}/comment', [EvaluationController::class, 'comment']);
        Route::post('/evaluations/{form}/overall', [EvaluationController::class, 'overall']);
    });

    // Admin (regional director has full admin parity)
    Route::middleware('role:admin,regional_director')->prefix('admin')->group(function () {
        Route::get('/users', [AdminController::class, 'listUsers']);
        Route::post('/users', [AdminController::class, 'createUser']);
        Route::put('/users/{user}', [AdminController::class, 'updateUser']);
        Route::get('/ai-config', [AdminController::class, 'getAiConfig']);
        Route::put('/ai-config', [AdminController::class, 'updateAiConfig']);
        Route::post('/ai-config/test', [AdminController::class, 'testAiConfig']);
        Route::get('/ai-config/ollama-models', [AdminController::class, 'ollamaModels']);
        Route::get('/deletion-requests', [AdminController::class, 'deletionRequests']);
        Route::post('/deletion-requests/{form}/approve', [AdminController::class, 'approveDeletion']);
        Route::post('/deletion-requests/{form}/reject', [AdminController::class, 'rejectDeletion']);
        Route::get('/activity-logs', [AdminController::class, 'activityLogs']);
        Route::get('/ai-prompts', [AdminController::class, 'aiPrompts']);
        Route::put('/ai-prompts/{key}', [AdminController::class, 'updateAiPrompt']);
        Route::post('/ai-prompts/{key}/reset', [AdminController::class, 'resetAiPrompt']);
    });
});
