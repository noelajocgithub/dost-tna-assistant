<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\AuthorizesFormAccess;
use App\Models\ActivityLog;
use App\Models\TnaAttachment;
use App\Models\TnaForm;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AttachmentController extends Controller
{
    use AuthorizesFormAccess;

    private const TYPES = ['org_chart', 'plant_layout', 'process_flow', 'other'];

    /** Upload (or replace) an image attachment for a form. */
    public function store(Request $request, TnaForm $form): JsonResponse
    {
        $this->authorizeOwner($request, $form);
        $this->ensureEditable($request, $form);

        $valid = $request->validate([
            'type' => ['required', 'string', 'in:' . implode(',', self::TYPES)],
            // Images only (PNG/JPG), max 5 MB. `image` + `mimes` guards content type.
            'file' => ['required', 'file', 'image', 'mimes:png,jpg,jpeg', 'max:5120'],
        ]);

        $file = $request->file('file');

        // One attachment per type: remove any existing of the same type first.
        foreach ($form->attachments()->where('type', $valid['type'])->get() as $old) {
            Storage::disk('local')->delete($old->file_path);
            $old->delete();
        }

        $path = $file->store("attachments/{$form->id}", 'local');

        $attachment = $form->attachments()->create([
            'type' => $valid['type'],
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getClientMimeType(),
            'size' => $file->getSize(),
            'uploaded_at' => now(),
        ]);

        ActivityLog::record(
            'form.attachment_upload',
            "Uploaded {$valid['type']} image for {$form->enterprise_name}",
            $form,
            ['type' => $valid['type']],
        );

        return response()->json($attachment, 201);
    }

    /** Stream a stored attachment back to an authorized viewer. */
    public function show(Request $request, TnaForm $form, TnaAttachment $attachment): StreamedResponse
    {
        $this->authorizeOwner($request, $form);
        abort_unless($attachment->tna_form_id === $form->id, 404);
        abort_unless(Storage::disk('local')->exists($attachment->file_path), 404);

        return Storage::disk('local')->response(
            $attachment->file_path,
            $attachment->original_name,
            ['Content-Type' => $attachment->mime_type ?: 'application/octet-stream'],
        );
    }

    /** Delete an attachment and its stored file. */
    public function destroy(Request $request, TnaForm $form, TnaAttachment $attachment): JsonResponse
    {
        $this->authorizeOwner($request, $form);
        $this->ensureEditable($request, $form);
        abort_unless($attachment->tna_form_id === $form->id, 404);

        Storage::disk('local')->delete($attachment->file_path);
        $attachment->delete();

        ActivityLog::record(
            'form.attachment_delete',
            "Removed {$attachment->type} image from {$form->enterprise_name}",
            $form,
            ['type' => $attachment->type],
        );

        return response()->json(['message' => 'Attachment removed.']);
    }
}
