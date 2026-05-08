<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function update(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'current_password' => 'required|string',
    ]);

    $user = $request->user();

    if (!Hash::check($validated['current_password'], $user->password)) {
        return response()->json([
            'message' => 'Password is incorrect.',
            'errors' => ['current_password' => ['Password is incorrect.']],
        ], 422);
    }

    if ($user->name_changed_at) {
        $daysSince = now()->diffInDays($user->name_changed_at);
        if ($daysSince < 7) {
            $daysLeft = 7 - $daysSince;
            return response()->json([
                'message' => "You can only change your name once every 7 days. Try again in {$daysLeft} day(s).",
            ], 422);
        }
    }

    $user->update([
        'name' => $validated['name'],
        'name_changed_at' => now(),
    ]);

    return response()->json($user->fresh());
}

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => ['required', 'string', 'min:8', 'confirmed', Password::defaults()],
        ]);

        if (!Hash::check($request->current_password, $request->user()->password)) {
            return response()->json([
                'message' => 'Current password is incorrect.',
                'errors' => ['current_password' => ['Current password is incorrect.']],
            ], 422);
        }

        $request->user()->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Password updated successfully.']);
    }
}