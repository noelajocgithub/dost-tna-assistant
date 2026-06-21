<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Evaluation;
use App\Models\TnaForm;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EvaluationController extends Controller
{
    /** List all submitted forms for the evaluation queue (filterable). */
    public function index(Request $request): JsonResponse
    {
        // The regional director oversees everything, including drafts.
        $statuses = $request->user()->role === 'regional_director'
            ? ['draft', 'submitted', 'under_review', 'validated', 'returned']
            : ['submitted', 'under_review', 'validated', 'returned'];

        $query = TnaForm::with('submitter:id,name,email')
            ->whereIn('status', $statuses);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        if ($request->filled('province')) {
            $query->where('province', $request->string('province'));
        }

        $forms = $query->orderByDesc('submitted_at')->get()->map(fn ($f) => [
            'id' => $f->id,
            'enterprise_name' => $f->enterprise_name,
            'province' => $f->province,
            'submitted_by' => $f->submitter?->name,
            'status' => $f->status,
            'submitted_at' => $f->submitted_at,
        ]);

        return response()->json($forms);
    }

    /** Full form for review, including any prior per-section evaluations. */
    public function show(Request $request, TnaForm $form): JsonResponse
    {
        // First open of a submitted form moves it to "under review"
        // (skipped when merely viewing, and only for actual evaluators —
        // the regional director's read-only views never change status).
        if ($form->status === 'submitted'
            && $request->query('mode') !== 'view'
            && in_array($request->user()->role, ['regional_evaluator', 'tna_lead'], true)) {
            $form->update(['status' => 'under_review']);
        }

        $form->load(['sections', 'attachments', 'submitter:id,name,email', 'evaluations']);

        $sections = $form->sections->keyBy('section_key')->map(fn ($s) => $s->data);
        $evaluations = $form->evaluations->keyBy('section_key')->map(fn ($e) => [
            'comment' => $e->comment,
            'action' => $e->action,
        ]);

        return response()->json([
            'form' => [
                'id' => $form->id,
                'enterprise_name' => $form->enterprise_name,
                'province' => $form->province,
                'status' => $form->status,
                'submitted_by' => $form->submitter?->name,
                'submitted_at' => $form->submitted_at,
                'overall_action' => $form->overall_action,
                'overall_comment' => $form->overall_comment,
            ],
            'sections' => $sections,
            'attachments' => $form->attachments,
            'evaluations' => $evaluations,
            'section_keys' => array_keys(config('tna.sections')),
            'section_titles' => config('tna.sections'),
            'evaluation_actions' => config('tna.evaluation_actions'),
        ]);
    }

    /** Add/update a per-section comment + decision. */
    public function comment(Request $request, TnaForm $form): JsonResponse
    {
        abort_if($request->user()->role === 'regional_director', 403, 'Read-only access.');

        $valid = $request->validate([
            'section_key' => ['required', 'string', 'in:' . implode(',', array_keys(config('tna.sections')))],
            'comment' => ['nullable', 'string'],
            'action' => ['required', 'in:' . implode(',', array_keys(config('tna.evaluation_actions')))],
        ]);

        $evaluation = Evaluation::updateOrCreate(
            ['tna_form_id' => $form->id, 'section_key' => $valid['section_key']],
            [
                'evaluator_id' => $request->user()->id,
                'comment' => $valid['comment'] ?? null,
                'action' => $valid['action'],
            ],
        );

        ActivityLog::record(
            'evaluation.comment',
            "Set \"{$valid['section_key']}\" of {$form->enterprise_name} to {$valid['action']}",
            $form,
            ['section_key' => $valid['section_key'], 'action' => $valid['action']],
        );

        return response()->json([
            'section_key' => $evaluation->section_key,
            'comment' => $evaluation->comment,
            'action' => $evaluation->action,
        ]);
    }

    /**
     * Record the overall (whole-form) evaluation. The chosen decision drives
     * the final status:
     *   approve / approve_with_comments -> validated (endorsed)
     *   needs_clarification / not_compliant -> returned to submitter
     */
    public function overall(Request $request, TnaForm $form): JsonResponse
    {
        abort_if($request->user()->role === 'regional_director', 403, 'Read-only access.');

        $valid = $request->validate([
            'action' => ['required', 'in:' . implode(',', array_keys(config('tna.evaluation_actions')))],
            'comment' => ['nullable', 'string'],
        ]);

        $endorsed = in_array($valid['action'], ['approve', 'approve_with_comments'], true);

        $form->update([
            'overall_action' => $valid['action'],
            'overall_comment' => $valid['comment'] ?? null,
            'status' => $endorsed ? 'validated' : 'returned',
            'validated_at' => $endorsed ? now() : null,
            'validated_by' => $endorsed ? $request->user()->id : null,
            'return_reason' => $endorsed ? null : ($valid['comment'] ?? 'Returned by evaluator.'),
        ]);

        ActivityLog::record(
            'evaluation.overall',
            "Overall evaluation of {$form->enterprise_name}: {$valid['action']} (form {$form->status})",
            $form,
            ['action' => $valid['action'], 'status' => $form->status],
        );

        return response()->json([
            'status' => $form->status,
            'overall_action' => $form->overall_action,
            'overall_comment' => $form->overall_comment,
        ]);
    }
}
