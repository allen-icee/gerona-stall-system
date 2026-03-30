<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required', // CHANGED FROM EMAIL
            'password' => 'required'
        ]);

        // Attempt login with username
        if (!Auth::attempt($request->only('username', 'password'))) {
            return response()->json(['message' => 'Invalid username or password'], 401);
        }

        $user = Auth::user();
        $user->load('roles');

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}