<?php

namespace App\Http\Controllers;

use App\Models\TnaForm;
use App\Services\ExportService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class ExportController extends Controller
{
    public function __construct(private ExportService $export) {}

    public function pdf(Request $request, TnaForm $form): Response
    {
        $this->authorizeAccess($request, $form);

        $filename = $this->filename($form, 'pdf');

        return $this->export->pdf($form)->download($filename);
    }

    public function docx(Request $request, TnaForm $form): Response
    {
        $this->authorizeAccess($request, $form);

        $path = $this->export->docx($form);

        return response()
            ->download($path, $this->filename($form, 'docx'))
            ->deleteFileAfterSend(true);
    }

    private function authorizeAccess(Request $request, TnaForm $form): void
    {
        $user = $request->user();
        $allowed = $form->submitted_by === $user->id
            || in_array($user->role, ['regional_evaluator', 'admin'], true);

        abort_unless($allowed, 403, 'Forbidden.');
    }

    private function filename(TnaForm $form, string $ext): string
    {
        $base = Str::slug($form->enterprise_name ?: 'tna-form');

        return "{$base}.{$ext}";
    }
}
