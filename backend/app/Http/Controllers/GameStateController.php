<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GameStateController
{
    private function authenticatedUser(Request $request): ?object
    {
        $token = $request->bearerToken();
        if (!$token) return null;

        return DB::table('game_sessions')
            ->join('users', 'users.id', '=', 'game_sessions.user_id')
            ->where('game_sessions.token_hash', hash('sha256', $token))
            ->where('game_sessions.expires_at', '>', now())
            ->select('users.*')
            ->first();
    }

    public function show(Request $request)
    {
        $user = $this->authenticatedUser($request);
        if (!$user) return response()->json(['status' => 'error', 'message' => 'Phien dang nhap khong hop le.'], 401);

        $row = DB::table('game_states')->where('user_id', $user->id)->first();
        return response()->json([
            'status' => 'success',
            'gameState' => $row ? json_decode($row->state, true) : null,
        ]);
    }

    public function update(Request $request)
    {
        $user = $this->authenticatedUser($request);
        if (!$user) return response()->json(['status' => 'error', 'message' => 'Phien dang nhap khong hop le.'], 401);

        $state = $request->input('gameState');
        if (!is_array($state) || !isset($state['character'])) {
            return response()->json(['status' => 'error', 'message' => 'Du lieu game khong hop le.'], 422);
        }

        DB::table('game_states')->updateOrInsert(
            ['user_id' => $user->id],
            ['state' => json_encode($state, JSON_UNESCAPED_UNICODE), 'updated_at' => now(), 'created_at' => now()]
        );

        return response()->json(['status' => 'success', 'savedAt' => now()->toIso8601String()]);
    }
}
