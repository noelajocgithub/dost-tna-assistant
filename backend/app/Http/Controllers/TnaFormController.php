<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\TnaForm;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TnaFormController extends Controller
{
    /**
     * List forms the user may work on. Enterprise users see their own forms;
     * provincial staff also see enterprise forms in their province.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $forms = TnaForm::with('submitter:id,name,role')
            ->where(function ($q) use ($user) {
                if ($user->role === 'provincial_director') {
                    // Forms submitted by provincial staff in the director's own province.
                    $q->whereHas('submitter', fn ($s) => $s->where('role', 'provincial_staff'));
                    if (filled($user->province)) {
                        $q->where('province', $user->province);
                    } else {
                        $q->whereRaw('1 = 0'); // director without a province sees nothing
                    }
                } elseif ($user->role === 'provincial_staff') {
                    $q->where('submitted_by', $user->id);
                    if (filled($user->province)) {
                        $q->orWhere('province', $user->province);
                    }
                } else {
                    $q->where('submitted_by', $user->id);
                }
            })
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn ($f) => [
                'id' => $f->id,
                'enterprise_name' => $f->enterprise_name,
                'status' => $f->status,
                'province' => $f->province,
                'submitted_by' => $f->submitter?->name,
                'is_own' => $f->submitted_by === $user->id,
                'deletion_requested' => $f->deletion_requested_at !== null,
                'updated_at' => $f->updated_at,
            ]);

        return response()->json($forms);
    }

    /** Create a new draft form for the current user. */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'enterprise_name' => ['nullable', 'string', 'max:255'],
        ]);

        $form = TnaForm::create([
            'enterprise_name' => $data['enterprise_name'] ?? null,
            'submitted_by' => $request->user()->id,
            'province' => $request->user()->province,
            'status' => 'draft',
        ]);

        ActivityLog::record(
            'form.create',
            "Created TNA form" . ($form->enterprise_name ? " for {$form->enterprise_name}" : ''),
            $form,
        );

        return response()->json($form, 201);
    }

    /** Full form with sections (keyed) and attachments. */
    public function show(Request $request, TnaForm $form): JsonResponse
    {
        $this->authorizeOwner($request, $form);

        $form->load(['sections', 'attachments']);

        $sections = $form->sections
            ->keyBy('section_key')
            ->map(fn ($s) => $s->data);

        return response()->json([
            'form' => $form->only([
                'id', 'enterprise_name', 'status', 'province',
                'return_reason', 'submitted_at', 'validated_at',
                'created_at', 'updated_at',
            ]),
            'sections' => $sections,
            'attachments' => $form->attachments,
            'section_keys' => array_keys(config('tna.sections')),
        ]);
    }

    /** Upsert a single section's data (auto-draft save). */
    public function updateSection(Request $request, TnaForm $form): JsonResponse
    {
        $this->authorizeOwner($request, $form);
        $this->ensureEditable($request, $form);

        $valid = $request->validate([
            'section_key' => ['required', 'string', 'in:' . implode(',', array_keys(config('tna.sections')))],
            'data' => ['required', 'array'],
        ]);

        $section = $form->sections()->updateOrCreate(
            ['section_key' => $valid['section_key']],
            ['data' => $valid['data']],
        );

        // Keep the form's enterprise_name in sync from the enterprise_info section.
        if ($valid['section_key'] === 'enterprise_info' && ! empty($valid['data']['enterprise_name'])) {
            $form->update(['enterprise_name' => $valid['data']['enterprise_name']]);
        } else {
            $form->touch();
        }

        ActivityLog::record(
            'form.section_save',
            "Saved section \"{$valid['section_key']}\" of {$form->enterprise_name}",
            $form,
            ['section_key' => $valid['section_key']],
        );

        return response()->json([
            'section_key' => $section->section_key,
            'updated_at' => $section->updated_at,
        ]);
    }

    /** Finalize and submit a draft. */
    public function submit(Request $request, TnaForm $form): JsonResponse
    {
        $this->authorizeOwner($request, $form);
        $this->ensureEditable($request, $form);

        if (blank($form->enterprise_name)) {
            return response()->json([
                'message' => 'Enterprise name is required before submitting.',
            ], 422);
        }

        $form->update([
            'status' => 'submitted',
            'submitted_at' => now(),
            'return_reason' => null,
        ]);

        ActivityLog::record('form.submit', "Submitted TNA form {$form->enterprise_name}", $form);

        return response()->json($form);
    }

    /**
     * Request deletion of a form. The form is flagged pending and only an
     * administrator can approve (actually delete) or reject the request.
     */
    public function requestDeletion(Request $request, TnaForm $form): JsonResponse
    {
        $this->authorizeOwner($request, $form);

        $valid = $request->validate([
            'reason' => ['required', 'string', 'min:3'],
        ]);

        $form->update([
            'deletion_requested_at' => now(),
            'deletion_requested_by' => $request->user()->id,
            'deletion_reason' => $valid['reason'],
        ]);

        ActivityLog::record(
            'form.deletion_request',
            "Requested deletion of {$form->enterprise_name}",
            $form,
            ['reason' => $valid['reason']],
        );

        return response()->json(['message' => 'Deletion request submitted for admin approval.']);
    }

    /** Cancel a pending deletion request (by someone with access to the form). */
    public function cancelDeletion(Request $request, TnaForm $form): JsonResponse
    {
        $this->authorizeOwner($request, $form);

        $form->update([
            'deletion_requested_at' => null,
            'deletion_requested_by' => null,
            'deletion_reason' => null,
        ]);

        ActivityLog::record('form.deletion_cancel', "Cancelled deletion request for {$form->enterprise_name}", $form);

        return response()->json(['message' => 'Deletion request cancelled.']);
    }

    /**
     * A user may access a form if they own it, or if they are provincial staff
     * acting within their own province.
     */
    private function authorizeOwner(Request $request, TnaForm $form): void
    {
        $user = $request->user();

        $allowed = $form->submitted_by === $user->id
            || ($user->role === 'provincial_staff'
                && filled($user->province)
                && $form->province === $user->province)
            || ($user->role === 'provincial_director'
                && filled($user->province)
                && $form->province === $user->province
                && optional($form->submitter)->role === 'provincial_staff');

        abort_unless($allowed, 403, 'Forbidden.');
    }

    private function ensureEditable(Request $request, TnaForm $form): void
    {
        // Provincial staff and the provincial director may edit at any status.
        if (in_array($request->user()->role, ['provincial_staff', 'provincial_director'], true)) {
            return;
        }

        abort_if(
            ! in_array($form->status, ['draft', 'returned'], true),
            422,
            'This form can no longer be edited.'
        );
    }
}
