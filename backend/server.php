<?php
// Thiên Đạo Online PHP Backend API Router

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Helper function to connect MySQL via PDO
function connectMySQL() {
    $host = '127.0.0.1';
    $port = '3306';
    $user = 'root';
    $pass = '';

    // 1. Try connecting to thien_dao_online or create_thien_dao_tables
    $databases = ['thien_dao_online', 'create_thien_dao_tables'];

    foreach ($databases as $db) {
        try {
            $pdo = new PDO("mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4", $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            return [$pdo, $db, null];
        } catch (Exception $e) {
            // continue fallback
        }
    }

    // 2. Try creating database automatically
    try {
        $pdoServer = new PDO("mysql:host={$host};port={$port};charset=utf8mb4", $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        $pdoServer->exec("CREATE DATABASE IF NOT EXISTS `thien_dao_online` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $pdoServer->exec("USE `thien_dao_online`");

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

        return [$pdoServer, 'thien_dao_online (Auto-Created)', null];
    } catch (Exception $err) {
        return [null, null, $err->getMessage()];
    }
}

// 1. Health Route
if ($uri === '/api/health') {
    echo json_encode([
        'status' => 'success',
        'message' => 'Thiên Đạo Online PHP Backend API Server is running smoothly!',
        'timestamp' => date('c'),
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 2. Test DB Route
if ($uri === '/api/test-db') {
    list($pdo, $dbName, $err) = connectMySQL();

    if (!$pdo) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'connected' => false,
            'message' => 'Khái niệm kết nối MySQL thất bại. Hãy kiểm tra xem MySQL Service (XAMPP/Laragon) đã được bấm Start chưa!',
            'error_detail' => $err,
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    try {
        $stmt = $pdo->query("SELECT count(*) as total FROM `users`");
        $totalUsers = $stmt->fetch()['total'] ?? 0;

        $usersStmt = $pdo->query("SELECT `id`, `name`, `email`, `created_at` FROM `users` ORDER BY `id` DESC LIMIT 10");
        $recentUsers = $usersStmt->fetchAll();

        echo json_encode([
            'status' => 'success',
            'connected' => true,
            'message' => 'Kết nối MySQL Database thành công 100%!',
            'database_name' => $dbName,
            'total_registered_users' => $totalUsers,
            'recent_users_in_db' => $recentUsers,
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'connected' => true,
            'message' => 'Kết nối MySQL thành công nhưng chưa tìm thấy bảng users! Vui lòng Import file SQL!',
            'error_detail' => $e->getMessage(),
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// 3. Register Route
if ($uri === '/api/auth/register') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?? $_POST;

    $email = $input['email'] ?? 'bactien.tudao@gmail.com';
    $name = $input['name'] ?? ucfirst(explode('@', $email)[0]);
    $password = password_hash($input['password'] ?? '123456', PASSWORD_DEFAULT);
    $role = str_contains(strtolower($email), 'admin') ? 'Admin' : 'Player';

    list($pdo, $dbName, $err) = connectMySQL();
    $saved = false;
    $userId = rand(100, 999);

    if ($pdo) {
        try {
            $checkStmt = $pdo->prepare("SELECT `id` FROM `users` WHERE `email` = ?");
            $checkStmt->execute([$email]);
            $existing = $checkStmt->fetch();

            if ($existing) {
                $userId = $existing['id'];
                $saved = true;
            } else {
                $insStmt = $pdo->prepare("INSERT INTO `users` (`name`, `email`, `password`) VALUES (?, ?, ?)");
                $insStmt->execute([$name, $email, $password]);
                $userId = $pdo->lastInsertId();

                $charStmt = $pdo->prepare("INSERT INTO `characters` (`user_id`, `name`, `title`, `realm_id`, `spiritual_root_id`, `sect_id`, `combat_power`, `spirit_stones`) VALUES (?, ?, 'Vô Danh Tu Sĩ', 1, 8, 1, 1250, 500)");
                $charStmt->execute([$userId, $name]);
                $saved = true;
            }
        } catch (Exception $e) {
            $err = $e->getMessage();
        }
    }

    echo json_encode([
        'status' => 'success',
        'saved_to_mysql' => $saved,
        'database_used' => $dbName,
        'db_error' => $err,
        'message' => $saved ? "Đã đăng ký và lưu tu sĩ [{$name}] thành công vào MySQL Database!" : "Đăng ký trên client!",
        'user' => [
            'id' => $userId,
            'email' => $email,
            'name' => $name,
            'role' => $role,
        ],
        'token' => 'thien_dao_token_' . bin2hex(random_bytes(16)),
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 4. Admin Users Route
if ($uri === '/api/admin/users') {
    list($pdo, $dbName, $err) = connectMySQL();
    if ($pdo) {
        try {
            $stmt = $pdo->query("
                SELECT 
                    u.id, 
                    u.name, 
                    u.email, 
                    COALESCE(r.name, 'Luyện Khí') as realm, 
                    COALESCE(sr.name, 'Thiên Linh Căn') as spiritualRoot, 
                    COALESCE(s.name, 'Thanh Vân Tông') as sect, 
                    COALESCE(c.combat_power, 1250) as combatPower, 
                    COALESCE(c.spirit_stones, 500) as spiritStones, 
                    COALESCE(c.vip_level, 1) as vipLevel, 
                    IF(LOWER(u.email) LIKE '%admin%', 'Admin', 'Player') as role, 
                    'Active' as status, 
                    DATE_FORMAT(u.created_at, '%Y-%m-%d') as createdAt
                FROM `users` u
                LEFT JOIN `characters` c ON c.user_id = u.id
                LEFT JOIN `realms` r ON r.id = c.realm_id
                LEFT JOIN `spiritual_roots` sr ON sr.id = c.spiritual_root_id
                LEFT JOIN `sects` s ON s.id = c.sect_id
                ORDER BY u.id ASC
            ");
            $dbUsers = $stmt->fetchAll();

            echo json_encode([
                'status' => 'success',
                'database_used' => $dbName,
                'users' => $dbUsers,
            ], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            // fallback
        }
    }
}

// Default Catch-all
echo json_encode([
    'status' => 'active',
    'message' => 'Thiên Đạo Online Backend API Router Active!',
    'uri' => $uri,
], JSON_UNESCAPED_UNICODE);
