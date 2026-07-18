<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminController
{
    public function indexUsers()
    {
        $users = DB::table('users as u')
            ->leftJoin('game_states as gs', 'gs.user_id', '=', 'u.id')
            ->select('u.id', 'u.name', 'u.email', 'u.role', 'u.status', 'u.created_at', 'gs.state')
            ->orderBy('u.id')
            ->get()
            ->map(function ($user) {
                $character = $user->state ? (json_decode($user->state, true)['character'] ?? []) : [];
                return [
                    'id' => (string) $user->id,
                    'name' => $character['name'] ?? $user->name,
                    'email' => $user->email,
                    'realm' => $character['realm'] ?? 'Luyá»‡n KhÃ­',
                    'spiritualRoot' => $character['spiritualRoot'] ?? 'ThiÃªn Linh CÄƒn',
                    'sect' => $character['sect'] ?? 'Thanh VÃ¢n TÃ´ng',
                    'combatPower' => $character['combatPower'] ?? 1250,
                    'spiritStones' => $character['spiritStones'] ?? 500,
                    'vipLevel' => $character['vipLevel'] ?? 1,
                    'role' => $user->role,
                    'status' => $user->status,
                    'createdAt' => substr((string) $user->created_at, 0, 10),
                ];
            });

        return response()->json(['status' => 'success', 'users' => $users]);
    }

    public function createUser(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255', 'email' => 'required|email|unique:users,email']);
        $id = DB::table('users')->insertGetId([
            'name' => $request->input('name'),
            'email' => strtolower($request->input('email')),
            'password' => Hash::make($request->input('password', '123456')),
            'role' => $request->input('role', 'Player'),
            'status' => 'Active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        return response()->json(['status' => 'success', 'id' => $id], 201);
    }

    public function updateUser(Request $request, $id)
    {
        $user = DB::table('users')->where('id', $id)->first();
        if (!$user) return response()->json(['status' => 'error', 'message' => 'Khong tim thay tai khoan.'], 404);

        DB::table('users')->where('id', $id)->update([
            'name' => $request->input('name', $user->name),
            'role' => $request->input('role', $user->role),
            'status' => $request->input('status', $user->status),
            'updated_at' => now(),
        ]);

        $row = DB::table('game_states')->where('user_id', $id)->first();
        if ($row) {
            $state = json_decode($row->state, true);
            foreach (['name', 'realm', 'spiritualRoot', 'sect', 'combatPower', 'spiritStones', 'vipLevel', 'role', 'status'] as $field) {
                if ($request->has($field)) $state['character'][$field] = $request->input($field);
            }
            DB::table('game_states')->where('user_id', $id)->update([
                'state' => json_encode($state, JSON_UNESCAPED_UNICODE),
                'updated_at' => now(),
            ]);
        }

        return response()->json(['status' => 'success']);
    }

    public function deleteUser($id)
    {
        DB::table('users')->where('id', $id)->delete();
        return response()->json(['status' => 'success']);
    }

    public function toggleBan($id)
    {
        $user = DB::table('users')->where('id', $id)->first();
        if (!$user) return response()->json(['status' => 'error'], 404);
        $status = $user->status === 'Banned' ? 'Active' : 'Banned';
        DB::table('users')->where('id', $id)->update(['status' => $status, 'updated_at' => now()]);
        return response()->json(['status' => 'success', 'accountStatus' => $status]);
    }

    public function broadcast(Request $request)
    {
        $request->validate(['content' => 'required|string|max:1000']);
        DB::table('announcements')->insert(['content' => $request->input('content'), 'created_at' => now(), 'updated_at' => now()]);
        return response()->json(['status' => 'success']);
    }

    public function latestBroadcast()
    {
        $announcement = DB::table('announcements')->latest('id')->first();
        return response()->json(['status' => 'success', 'content' => $announcement?->content]);
    }
}
