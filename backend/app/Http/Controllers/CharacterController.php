<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CharacterController
{
    public function show(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'character' => [
                'id' => 'char-001',
                'name' => 'Bắc Phong',
                'title' => 'Vô Danh Tu Sĩ',
                'vipLevel' => 1,
                'realm' => 'Luyện Khí',
                'realmLevel' => 1,
                'exp' => 80,
                'maxExp' => 100,
                'hp' => 500,
                'maxHp' => 500,
                'mana' => 250,
                'maxMana' => 250,
                'spiritualPower' => 120,
                'spiritStones' => 500,
                'combatPower' => 1250,
                'spiritualRoot' => 'Thiên Linh Căn',
                'spiritualRootBonus' => 1.5,
                'sect' => 'Thanh Vân Tông',
                'role' => 'Player',
            ]
        ]);
    }

    public function create(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Tạo nhân vật tu tiên thành công!',
            'character' => [
                'name' => $request->input('name', 'Bắc Phong'),
                'spiritualRoot' => $request->input('spiritualRoot', 'Thiên Linh Căn'),
                'sect' => $request->input('sect', 'Thanh Vân Tông'),
                'realm' => 'Luyện Khí',
            ]
        ]);
    }
}
