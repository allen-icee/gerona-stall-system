<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // 1. Validate 'username', not 'email'
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string'
        ]);

        // 2. Attempt login with 'username'
        if (!Auth::attempt($request->only('username', 'password'))) {
            return response()->json(['message' => 'Invalid username or password'], 401);
        }

        // Tell the code editor this is specifically our App\Models\User class
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Load their roles (admin, staff, etc)
        $user->load('roles');

        // Generate the Sanctum API token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }

    public function logout(Request $request)
    {
        // Tell the code editor this is specifically our App\Models\User class
        /** @var \App\Models\User $user */
        $user = $request->user();

        // Tell the code editor this is specifically a Sanctum Token Model
        /** @var \Laravel\Sanctum\PersonalAccessToken $token */
        $token = $user->currentAccessToken();

        $token->delete(); // The red squiggly line will now disappear!

        return response()->json(['message' => 'Logged out successfully']);
    }
}
