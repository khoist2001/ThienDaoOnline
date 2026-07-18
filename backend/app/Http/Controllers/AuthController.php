<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use PDO;
use Exception;

class AuthController
{
    private function applyCorsHeaders()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    }

    private function getPdoConnection(&$dbNameUsed = null, &$errorMessage = null)
    {
        $host = env('DB_HOST', '127.0.0.1');
        $port = env('DB_PORT', '3306');
        $db   = env('DB_DATABASE', 'thien_dao_online');
        $user = env('DB_USERNAME', 'root');
        $pass = env('DB_PASSWORD', '');
        $charset = 'utf8mb4';

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        // 1. Try connecting directly to configured database
        try {
            $dsn = "mysql:host={$host};port={$port};dbname={$db};charset={$charset}";
            $pdo = new PDO($dsn, $user, $pass, $options);
            $dbNameUsed = $db;
            return $pdo;
        } catch (Exception $e1) {
            $errorMessage = $e1->getMessage();

            // 2. Try connecting without database name and auto-create database & tables
            try {
                $dsnNoDb = "mysql:host={$host};port={$port};charset={$charset}";
                $pdoServer = new PDO($dsnNoDb, $user, $pass, $options);
                $pdoServer->exec("CREATE DATABASE IF NOT EXISTS `thien_dao_online` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                $pdoServer->exec("USE `thien_dao_online`");

                // Auto create users & characters table if missing
                $pdoServer->exec("
                    CREATE TABLE IF NOT EXISTS `users` (
                      `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                      `name` VARCHAR(255) NOT NULL,
                      `email` VARCHAR(255) UNIQUE NOT NULL,
                      `password` VARCHAR(255) NOT NULL,
                      `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

                    CREATE TABLE IF NOT EXISTS `characters` (
                      `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                      `user_id` BIGINT UNSIGNED NOT NULL,
                      `name` VARCHAR(255) NOT NULL,
                      `title` VARCHAR(255) DEFAULT 'Vô Danh Tu Sĩ',
                      `realm_id` INT DEFAULT 1,
                      `spiritual_root_id` INT DEFAULT 8,
                      `sect_id` INT DEFAULT 1,
                      `combat_power` INT DEFAULT 1250,
                      `spirit_stones` INT DEFAULT 500,
                      `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                ");

                $dbNameUsed = 'thien_dao_online (Auto-Created)';
                return $pdoServer;
            } catch (Exception $e2) {
                $errorMessage = "Direct DB Error: " . $e1->getMessage() . " | Auto-Create DB Error: " . $e2->getMessage();
                return null;
            }
        }
    }

    public function testDatabase()
    {
        $this->applyCorsHeaders();
        $dbName = null;
        $errMsg = null;
        $pdo = $this->getPdoConnection($dbName, $errMsg);

        if (!$pdo) {
            return response()->json([
                'status' => 'error',
                'connected' => false,
                'message' => 'Khái niệm kết nối MySQL thất bại. Hãy kiểm tra xem MySQL Service (XAMPP/Laragon) đã được bật chưa!',
                'error_detail' => $errMsg,
            ], 500);
        }

        try {
            $stmt = $pdo->query("SELECT count(*) as total FROM `users`");
            $totalUsers = $stmt->fetch()['total'] ?? 0;

            $usersStmt = $pdo->query("SELECT `id`, `name`, `email`, `created_at` FROM `users` ORDER BY `id` DESC LIMIT 10");
            $recentUsers = $usersStmt->fetchAll();

            return response()->json([
                'status' => 'success',
                'connected' => true,
                'message' => 'Kết nối MySQL Database thành công 100%!',
                'database_name' => $dbName,
                'total_registered_users' => $totalUsers,
                'recent_users_in_db' => $recentUsers,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'connected' => true,
                'message' => 'Kết nối MySQL thành công nhưng chưa tìm thấy bảng users! Vui lòng Import file SQL!',
                'error_detail' => $e->getMessage(),
            ], 500);
        }
    }

    public function register(Request $request)
    {
        $this->applyCorsHeaders();

        $email = $request->input('email', 'bactien.tudao@gmail.com');
        $name = $request->input('name') ?: ucfirst(explode('@', $email)[0]);
        $password = password_hash($request->input('password', '123456'), PASSWORD_DEFAULT);
        $role = str_contains(strtolower($email), 'admin') ? 'Admin' : 'Player';

        $dbName = null;
        $errMsg = null;
        $pdo = $this->getPdoConnection($dbName, $errMsg);
        $savedToDb = false;
        $userId = rand(100, 999);

        if ($pdo) {
            try {
                // Check if user already exists
                $checkStmt = $pdo->prepare("SELECT `id` FROM `users` WHERE `email` = ?");
                $checkStmt->execute([$email]);
                $existing = $checkStmt->fetch();

                if ($existing) {
                    $userId = $existing['id'];
                    $savedToDb = true;
                } else {
                    // Insert into MySQL users table
                    $stmt = $pdo->prepare("INSERT INTO `users` (`name`, `email`, `password`) VALUES (?, ?, ?)");
                    $stmt->execute([$name, $email, $password]);
                    $userId = $pdo->lastInsertId();

                    // Insert into MySQL characters table
                    $charStmt = $pdo->prepare("INSERT INTO `characters` (`user_id`, `name`, `title`, `realm_id`, `spiritual_root_id`, `sect_id`, `combat_power`, `spirit_stones`) VALUES (?, ?, 'Vô Danh Tu Sĩ', 1, 8, 1, 1250, 500)");
                    $charStmt->execute([$userId, $name]);
                    $savedToDb = true;
                }
            } catch (Exception $e) {
                $errMsg = $e->getMessage();
            }
        }

        return response()->json([
            'status' => 'success',
            'saved_to_mysql' => $savedToDb,
            'database_used' => $dbName,
            'db_error' => $errMsg,
            'message' => $savedToDb ? "Đã đăng ký và lưu tu sĩ [{$name}] thành công vào MySQL Database!" : "Đăng ký thành công trên giao diện client!",
            'user' => [
                'id' => $userId,
                'email' => $email,
                'name' => $name,
                'role' => $role,
            ],
            'token' => 'thien_dao_token_'.bin2hex(random_bytes(16)),
        ]);
    }

    public function login(Request $request)
    {
        $this->applyCorsHeaders();

        $email = $request->input('email', 'bactien.tudao@gmail.com');
        $isAdmin = str_contains(strtolower($email), 'admin');
        $role = $isAdmin ? 'Admin' : 'Player';

        $dbName = null;
        $errMsg = null;
        $pdo = $this->getPdoConnection($dbName, $errMsg);
        $savedToDb = false;
        $userRecord = null;

        if ($pdo) {
            try {
                $stmt = $pdo->prepare("SELECT * FROM `users` WHERE `email` = ? LIMIT 1");
                $stmt->execute([$email]);
                $userRecord = $stmt->fetch();

                if (!$userRecord) {
                    $name = $isAdmin ? 'Quản Trị Viên Huyết Lệnh' : 'Tu Sĩ ' . ucfirst(explode('@', $email)[0]);
                    $pass = password_hash('123456', PASSWORD_DEFAULT);
                    $insStmt = $pdo->prepare("INSERT INTO `users` (`name`, `email`, `password`) VALUES (?, ?, ?)");
                    $insStmt->execute([$name, $email, $pass]);
                    $userId = $pdo->lastInsertId();

                    $charStmt = $pdo->prepare("INSERT INTO `characters` (`user_id`, `name`, `title`, `realm_id`, `spiritual_root_id`, `sect_id`, `combat_power`, `spirit_stones`) VALUES (?, ?, ?, ?, 8, 1, ?, ?)");
                    $charStmt->execute([
                        $userId,
                        $name,
                        $isAdmin ? 'Chủ Tể Thiên Đạo' : 'Vô Danh Tu Sĩ',
                        $isAdmin ? 11 : 1,
                        $isAdmin ? 999999 : 1250,
                        $isAdmin ? 999999 : 500,
                    ]);
                    $savedToDb = true;
                } else {
                    $savedToDb = true;
                }
            } catch (Exception $e) {
                $errMsg = $e->getMessage();
            }
        }

        return response()->json([
            'status' => 'success',
            'saved_to_mysql' => $savedToDb,
            'database_used' => $dbName,
            'db_error' => $errMsg,
            'message' => $isAdmin ? 'Mở cửa Tiên Môn với quyền Administrator!' : 'Đăng nhập thành công vào cõi Tiên Giới!',
            'user' => [
                'id' => $userRecord['id'] ?? ($isAdmin ? 1 : 2),
                'name' => $userRecord['name'] ?? ($isAdmin ? 'Quản Trị Viên Huyết Lệnh' : 'Bắc Phong'),
                'email' => $email,
                'role' => $role,
            ],
            'token' => 'thien_dao_token_'.bin2hex(random_bytes(16)),
        ]);
    }

    public function logout(Request $request)
    {
        $this->applyCorsHeaders();
        return response()->json([
            'status' => 'success',
            'message' => 'Đã rời khỏi Tiên Giới an toàn!',
        ]);
    }

    public function me(Request $request)
    {
        $this->applyCorsHeaders();
        return response()->json([
            'status' => 'success',
            'user' => [
                'id' => 2,
                'name' => 'Bắc Phong',
                'email' => 'bactien.tudao@gmail.com',
                'role' => 'Player',
            ],
        ]);
    }
}
