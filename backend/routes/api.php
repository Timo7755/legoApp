<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SetController;
use App\Http\Controllers\UserSetController;
use App\Http\Controllers\UserPartController;
use App\Http\Controllers\UserController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post("/register", [AuthController::class, "register"]);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/email/verify/{id}/{hash}', function (\Illuminate\Http\Request $request) {
    $user = \App\Models\User::findOrFail($request->route('id'));

    if (!hash_equals(
        sha1($user->getEmailForVerification()),
        (string) $request->route('hash')
    )) {
        return response()->json(['message' => 'Invalid verification link.'], 403);
    }

    if ($user->hasVerifiedEmail()) {
        return response()->json(['message' => 'Email already verified.']);
    }

    $user->markEmailAsVerified();
    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => 'Email verified successfully.',
        'token' => $token,
        'user' => $user,
    ]);
})->name('verification.verify');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user-sets', [UserSetController::class, 'index']);
    Route::post('/user-sets', [UserSetController::class, 'store']);
    Route::delete('/user-sets/{userSet}', [UserSetController::class, 'destroy']);
    Route::post('/user-parts', [UserPartController::class, 'upsert']);
    Route::get('/user-parts/{setNum}', [UserPartController::class, 'forSet']);
    Route::get('/user-sets/{setNum}/missing', [UserPartController::class, 'missingForSet']);
    Route::patch('/user', [UserController::class, 'update']);
    Route::patch('/user/password', [UserController::class, 'updatePassword']);
    Route::post('/email/resend', function (\Illuminate\Http\Request $request) {
        $request->user()->sendEmailVerificationNotification();
        return response()->json(['message' => 'Verification link sent.']);
    })->middleware('throttle:6,1');
});

Route::get("/sets/search", [SetController::class, "search"]);
Route::get('/sets/{setNum}', [SetController::class, 'show']);
Route::get('/sets/{setNum}/parts', [SetController::class, 'parts']);
Route::get('/themes/featured', [SetController::class, 'featuredThemes']);
Route::get('/themes', [SetController::class, 'themes']);
Route::post('/forgot-password', function (\Illuminate\Http\Request $request) {
    $request->validate(['email' => 'required|email']);

    $status = \Illuminate\Support\Facades\Password::sendResetLink(
        $request->only('email')
    );

    return $status === \Illuminate\Support\Facades\Password::RESET_LINK_SENT
        ? response()->json(['message' => 'Reset link sent to your email.'])
        : response()->json(['message' => 'Unable to send reset link.'], 400);
});

Route::post('/reset-password', function (\Illuminate\Http\Request $request) {
    $request->validate([
        'token' => 'required',
        'email' => 'required|email',
        'password' => 'required|min:8|confirmed',
    ]);

    $status = \Illuminate\Support\Facades\Password::reset(
        $request->only('email', 'password', 'password_confirmation', 'token'),
        function (\App\Models\User $user, string $password) {
            $user->forceFill([
                'password' => \Illuminate\Support\Facades\Hash::make($password),
            ])->save();
        }
    );

    return $status === \Illuminate\Support\Facades\Password::PASSWORD_RESET
        ? response()->json(['message' => 'Password reset successfully.'])
        : response()->json(['message' => 'Invalid or expired reset token.'], 400);
});
Route::get('/email/verify-pending/{id}/{hash}', function (\Illuminate\Http\Request $request) {
    $user = \App\Models\User::findOrFail($request->route('id'));

    if (!$user->pending_email || !hash_equals(
        sha1($user->pending_email),
        (string) $request->route('hash')
    )) {
        return response()->json(['message' => 'Invalid or expired link.'], 403);
    }

    $user->email = $user->pending_email;
    $user->pending_email = null;
    $user->email_verified_at = now();
    $user->save();

    return response()->json(['message' => 'Email updated successfully.']);
})->name('verification.verify-pending');