<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AdminController
{
    public function indexUsers()
    {
        return response()->json([
            'status' => 'success',
            'users' => [
                [
                    'id' => 'u-101',
                    'name' => 'Bắc Phong',
                    'email' => 'bactien.tudao@gmail.com',
                    'realm' => 'Luyện Khí',
                    'spiritualRoot' => 'Thiên Linh Căn',
                    'sect' => 'Thanh Vân Tông',
                    'combatPower' => 1250,
                    'spiritStones' => 500,
                    'vipLevel' => 1,
                    'role' => 'Player',
                    'status' => 'Active',
                ],
                [
                    'id' => 'u-102',
                    'name' => 'Quản Trị Viên Huyết Lệnh',
                    'email' => 'admin@thiendao.online',
                    'realm' => 'Tiên Đế',
                    'spiritualRoot' => 'Thiên Linh Căn',
                    'sect' => 'Thái Hư Cung',
                    'combatPower' => 999999,
                    'spiritStones' => 999999,
                    'vipLevel' => 10,
                    'role' => 'Admin',
                    'status' => 'Active',
                ]
            ]
        ]);
    }

    public function createUser(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Admin đã khởi tạo tài khoản tu sĩ mới thành công!',
            'user' => $request->all()
        ]);
    }

    public function updateUser(Request $request, $id)
    {
        return response()->json([
            'status' => 'success',
            'message' => "Đã cập nhật thông tin tu sĩ #{$id} thành công!",
            'user' => $request->all()
        ]);
    }

    public function deleteUser($id)
    {
        return response()->json([
            'status' => 'success',
            'message' => "Đã xóa hoàn toàn tài khoản tu sĩ #{$id} khỏi cõi Thiên Đạo!",
        ]);
    }

    public function toggleBan($id)
    {
        return response()->json([
            'status' => 'success',
            'message' => "Đã thay đổi trạng thái khóa/mở khóa cho tu sĩ #{$id}!",
        ]);
    }

    public function broadcast(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Đã phát thông báo thiên hạ tới tất cả tu sĩ online!',
            'content' => $request->input('content')
        ]);
    }
}
