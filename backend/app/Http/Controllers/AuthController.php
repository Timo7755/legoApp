<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            "name" => "required|string|max:255",
            "email" => "required|string|email|unique:users",
            "password" => "required|string|min:6",
        ]);

        $user = User::create([
            "name" => $validated["name"],
            "email" => $validated["email"],
            "password" => Hash::make($validated["password"]),
        ]);

        $user->sendEmailVerificationNotification();

        return response()->json([
            "message" => "Registration successful. Please check your email to verify your account.",
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            "email" => "required|string|email",
            "password" => "required|string|min:6",
        ]);

        $user = User::where("email", $validated["email"])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                "message" => "Invalid credentials",
            ], 401);
        }

        if (!$user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Please verify your email address before logging in.',
                'email_unverified' => true,
            ], 403);
        }

        $token = $user->createToken("auth_token")->plainTextToken;

        return response()->json([
            "user" => $user,
            "token" => $token,
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            "message" => "Logged out successfully",
        ], 200);
    }
}