<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\AiConfig;
use App\Models\TnaForm;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /** All form statuses, used to fill zero-count buckets. */
    private const STATUSES = ['draft', 'submitted', 'under_review', 'validated', 'returned'];

    /** The statuses an evaluator's queue is built from (mirrors EvaluationController::index). */
    private const QUEUE_STATUSES = ['submitted', 'under_review', 'validated', 'returned'];

    /**
     * Role-aware dashboard summary. Every authenticated role gets a payload
     * scoped to exactly the forms/data it is allowed to work on. The scoping
     * mirrors TnaFormController::index and EvaluationController::index so the
     * dashboard never exposes data a role cannot otherwise reach.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json(match ($user->role) {
            'admin', 'regional_director' => $this->admin(),
            'regional_evaluator', 'tna_lead' => $this->evaluator(),
            'provincial_director' => $this->director($user),
            'provincial_staff' => $this->provincialStaff($user),
            default => $this->enterprise($user), // enterprise
        });
    }

    // ---- Submitter roles -------------------------------------------------

    private function enterprise(User $user): array
    {
        $scope = fn () => TnaForm::where('submitted_by', $user->id);
        $byStatus = $this->statusCounts($scope());

        return [
            'role' => $user->role,
            'stats' => [
                'total' => array_sum($byStatus),
                'by_status' => $byStatus,
                'needs_attention' => $byStatus['returned'] ?? 0,
            ],
            'recent' => $this->recentForms($scope()),
            'extra' => [],
        ];
    }

    private function provincialStaff(User $user): array
    {
        $scope = function () use ($user): Builder {
            return TnaForm::where(function ($q) use ($user) {
                $q->where('submitted_by', $user->id);
                if (filled($user->province)) {
                    $q->orWhere('province', $user->province);
                }
            });
        };

        $byStatus = $this->statusCounts($scope());

        return [
            'role' => $user->role,
            'stats' => [
                'total' => array_sum($byStatus),
                'by_status' => $byStatus,
                'needs_attention' => ($byStatus['returned'] ?? 0) + ($byStatus['draft'] ?? 0),
            ],
            'recent' => $this->recentForms($scope()),
            'extra' => [
                'mine' => (clone $scope())->where('submitted_by', $user->id)->count(),
                'province' => filled($user->province)
                    ? (clone $scope())->where('province', $user->province)->where('submitted_by', '!=', $user->id)->count()
                    : 0,
            ],
        ];
    }

    private function director(User $user): array
    {
        // The director's own forms, plus provincial-staff forms in their province.
        $scope = function () use ($user): Builder {
            return TnaForm::where(function ($w) use ($user) {
                $w->where('submitted_by', $user->id);
                if (filled($user->province)) {
                    $w->orWhere(function ($s) use ($user) {
                        $s->whereHas('submitter', fn ($x) => $x->where('role', 'provincial_staff'))
                            ->where('province', $user->province);
                    });
                }
            });
        };

        $byStatus = $this->statusCounts($scope());

        // "Top provincial staff" excludes the director's own submissions.
        $byStaff = (clone $scope())
            ->whereHas('submitter', fn ($s) => $s->where('role', 'provincial_staff'))
            ->with('submitter:id,name')
            ->get(['id', 'submitted_by'])
            ->groupBy('submitted_by')
            ->map(fn ($rows) => [
                'name' => $rows->first()->submitter?->name ?? '—',
                'count' => $rows->count(),
            ])
            ->sortByDesc('count')
            ->take(5)
            ->values();

        return [
            'role' => 'provincial_director',
            'stats' => [
                'total' => array_sum($byStatus),
                'by_status' => $byStatus,
                'needs_attention' => $byStatus['returned'] ?? 0,
            ],
            'recent' => $this->recentForms($scope()),
            'extra' => [
                'pending_deletion' => (clone $scope())->whereNotNull('deletion_requested_at')->count(),
                'by_staff' => $byStaff,
            ],
        ];
    }

    // ---- Evaluator roles -------------------------------------------------

    private function evaluator(): array
    {
        $scope = fn (): Builder => TnaForm::whereIn('status', self::QUEUE_STATUSES);
        $byStatus = $this->statusCounts($scope(), self::QUEUE_STATUSES);

        $byProvince = (clone $scope())
            ->get(['id', 'province'])
            ->groupBy(fn ($f) => $f->province ?: '—')
            ->map->count()
            ->sortDesc();

        return [
            'role' => 'evaluator',
            'stats' => [
                'awaiting' => $byStatus['submitted'] ?? 0,
                'in_review' => $byStatus['under_review'] ?? 0,
                'validated' => $byStatus['validated'] ?? 0,
                'returned' => $byStatus['returned'] ?? 0,
                'total' => array_sum($byStatus),
            ],
            'recent' => $this->recentForms($scope(), 'submitted_at'),
            'extra' => [
                'by_province' => $byProvince,
            ],
        ];
    }

    // ---- Admin -----------------------------------------------------------

    private function admin(): array
    {
        $formsByStatus = $this->statusCounts(TnaForm::query());

        $usersByRole = User::query()
            ->get(['id', 'role', 'is_active'])
            ->groupBy('role')
            ->map->count();

        $ai = AiConfig::where('is_active', true)->first();

        return [
            'role' => 'admin',
            'stats' => [
                'forms_total' => array_sum($formsByStatus),
                'forms_by_status' => $formsByStatus,
                'users_total' => User::count(),
                'users_inactive' => User::where('is_active', false)->count(),
                'users_by_role' => $usersByRole,
                'pending_deletions' => TnaForm::whereNotNull('deletion_requested_at')->count(),
            ],
            'recent' => $this->recentForms(TnaForm::query()),
            'extra' => [
                'recent_activity' => ActivityLog::orderByDesc('created_at')
                    ->limit(8)
                    ->get(['id', 'user_name', 'action', 'description', 'created_at']),
                'ai' => $ai ? [
                    'provider' => $ai->provider,
                    'model' => $ai->provider === 'ollama' ? $ai->ollama_model : $ai->model_name,
                    'has_api_key' => filled($ai->getRawOriginal('api_key')),
                ] : null,
            ],
        ];
    }

    // ---- Helpers ---------------------------------------------------------

    /** Count forms grouped by status, filling missing buckets with 0. */
    private function statusCounts(Builder $query, array $statuses = self::STATUSES): array
    {
        $counts = $query->selectRaw('status, count(*) as c')
            ->groupBy('status')
            ->pluck('c', 'status');

        $out = [];
        foreach ($statuses as $s) {
            $out[$s] = (int) ($counts[$s] ?? 0);
        }

        return $out;
    }

    /** Latest 5 forms in the given scope, with submitter name. */
    private function recentForms(Builder $query, string $orderBy = 'updated_at'): array
    {
        return $query->with('submitter:id,name')
            ->orderByDesc($orderBy)
            ->limit(5)
            ->get()
            ->map(fn ($f) => [
                'id' => $f->id,
                'enterprise_name' => $f->enterprise_name,
                'status' => $f->status,
                'province' => $f->province,
                'submitted_by' => $f->submitter?->name,
                'updated_at' => $f->updated_at,
                'submitted_at' => $f->submitted_at,
            ])
            ->all();
    }
}
