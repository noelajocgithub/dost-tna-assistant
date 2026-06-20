<?php

namespace App\Http\Controllers\Concerns;

use App\Models\TnaForm;
use Illuminate\Http\Request;

/**
 * Shared access checks for TNA forms. Used by the form and attachment
 * controllers so ownership/edit rules live in exactly one place.
 */
trait AuthorizesFormAccess
{
    /**
     * A user may access a form if they own it, or if they are provincial staff
     * acting within their own province (the director only over staff forms).
     */
    protected function authorizeOwner(Request $request, TnaForm $form): void
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

    protected function ensureEditable(Request $request, TnaForm $form): void
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
