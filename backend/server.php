<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

function jsonResponse(array $data, int $code = 200): never {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function db(): PDO {
    static $pdo;
    if ($pdo) return $pdo;
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=thien_dao_online;charset=utf8mb4', 'root', '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    return $pdo;
}

function ensureGuildTables(): void {
    static $done = false;
    if ($done) return;
    $done = true;

    try {
        $cols = db()->query("SHOW COLUMNS FROM guilds LIKE 'leader_user_id'")->fetchAll();
        if (empty($cols)) {
            db()->exec("DROP TABLE IF EXISTS guild_requests, guild_members, guilds");
        }
    } catch (\Throwable $e) {}

    db()->exec("
        CREATE TABLE IF NOT EXISTS guilds (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE,
            leader_user_id BIGINT UNSIGNED NOT NULL,
            leader_name VARCHAR(100) NOT NULL,
            level INT DEFAULT 1,
            max_members INT DEFAULT 5,
            vault_stones BIGINT DEFAULT 0,
            notice TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS guild_members (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            guild_id BIGINT UNSIGNED NOT NULL,
            user_id BIGINT UNSIGNED NOT NULL UNIQUE,
            name VARCHAR(100) NOT NULL,
            realm VARCHAR(50) DEFAULT 'Luyện Khí',
            combat_power INT DEFAULT 1000,
            role ENUM('Bang Chủ','Phó Bang Chủ','Trưởng Lão','Tinh Anh','Đệ Tử') DEFAULT 'Đệ Tử',
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS guild_requests (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            guild_id BIGINT UNSIGNED NOT NULL,
            user_id BIGINT UNSIGNED NOT NULL,
            name VARCHAR(100) NOT NULL,
            realm VARCHAR(50) DEFAULT 'Luyện Khí',
            combat_power INT DEFAULT 1000,
            status ENUM('pending','accepted','rejected') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
}

function input(): array {
    return json_decode(file_get_contents('php://input'), true) ?: [];
}

function issueToken(int $userId): string {
    $token = bin2hex(random_bytes(32));
    $stmt = db()->prepare('INSERT INTO game_sessions (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))');
    $stmt->execute([$userId, hash('sha256', $token)]);
    return $token;
}

function currentUser(): array {
    $user = optionalUser();
    if (!$user) jsonResponse(['status' => 'error', 'message' => 'Chua dang nhap.'], 401);
    return $user;
}

function optionalUser(): ?array {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/^Bearer\s+(.+)$/i', $header, $match)) return null;
    $stmt = db()->prepare('SELECT u.* FROM game_sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>NOW() LIMIT 1');
    $stmt->execute([hash('sha256', $match[1])]);
    return $stmt->fetch() ?: null;
}

function gameState(int $userId): ?array {
    $stmt = db()->prepare('SELECT state FROM game_states WHERE user_id=?');
    $stmt->execute([$userId]);
    $row = $stmt->fetch();
    return $row ? json_decode($row['state'], true) : null;
}

function getCharInfo(int $userId): array {
    $state = gameState($userId);
    $char = $state['character'] ?? [];
    return [
        'name' => $char['name'] ?? 'Tu Sĩ',
        'realm' => $char['realm'] ?? 'Luyện Khí',
        'combatPower' => $char['combatPower'] ?? 1000,
        'spiritStones' => $char['spiritStones'] ?? 0,
    ];
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($uri === '/' || $uri === '/api') {
        jsonResponse([
            'status' => 'success',
            'message' => 'Thien Dao Online API dang hoat dong.',
            'frontend' => 'http://127.0.0.1:5173',
            'health' => '/api/health',
        ]);
    }

    if ($uri === '/api/health') jsonResponse(['status' => 'success', 'database' => db()->query('SELECT DATABASE()')->fetchColumn()]);

    if ($uri === '/api/auth/register' && $method === 'POST') {
        $data = input();
        $email = strtolower(trim($data['email'] ?? ''));
        $password = (string) ($data['password'] ?? '');
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 4) jsonResponse(['status' => 'error', 'message' => 'Email hoac mat khau khong hop le.'], 422);
        $check = db()->prepare('SELECT id FROM users WHERE email=?');
        $check->execute([$email]);
        if ($check->fetch()) jsonResponse(['status' => 'error', 'message' => 'Email da duoc dang ky.'], 409);
        $role = str_contains($email, 'admin') ? 'Admin' : 'Player';
        $name = trim($data['name'] ?? '') ?: ucfirst(explode('@', $email)[0]);
        $stmt = db()->prepare("INSERT INTO users (name,email,password,role,status,created_at) VALUES (?,?,?,?, 'Active', NOW())");
        $stmt->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT), $role]);
        $id = (int) db()->lastInsertId();
        jsonResponse(['status' => 'success', 'user' => compact('id', 'name', 'email', 'role'), 'gameState' => null, 'token' => issueToken($id)], 201);
    }

    if ($uri === '/api/auth/login' && $method === 'POST') {
        $data = input();
        $email = strtolower(trim($data['email'] ?? ''));
        $stmt = db()->prepare('SELECT * FROM users WHERE email=? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        if (!$user || !password_verify((string) ($data['password'] ?? ''), $user['password'])) jsonResponse(['status' => 'error', 'message' => 'Email hoac mat khau khong chinh xac.'], 401);
        if (($user['status'] ?? 'Active') === 'Banned') jsonResponse(['status' => 'error', 'message' => 'Tai khoan da bi khoa.'], 403);
        $public = ['id' => (int) $user['id'], 'name' => $user['name'], 'email' => $user['email'], 'role' => $user['role']];
        jsonResponse(['status' => 'success', 'user' => $public, 'gameState' => gameState((int) $user['id']), 'token' => issueToken((int) $user['id'])]);
    }

    if ($uri === '/api/game-state' && in_array($method, ['GET', 'PUT'], true)) {
        $user = currentUser();
        if ($method === 'GET') jsonResponse(['status' => 'success', 'gameState' => gameState((int) $user['id'])]);
        $state = input()['gameState'] ?? null;
        if (!is_array($state) || !isset($state['character'])) jsonResponse(['status' => 'error', 'message' => 'Du lieu game khong hop le.'], 422);
        $stmt = db()->prepare('INSERT INTO game_states (user_id,state) VALUES (?,?) ON DUPLICATE KEY UPDATE state=VALUES(state), updated_at=NOW()');
        $stmt->execute([$user['id'], json_encode($state, JSON_UNESCAPED_UNICODE)]);
        jsonResponse(['status' => 'success', 'savedAt' => date(DATE_ATOM)]);
    }

    // ══════════════════════════════════════════════
    // ══  GUILD API ENDPOINTS
    // ══════════════════════════════════════════════

    // GET /api/guilds — List all guilds (for leaderboard & browsing)
    if ($uri === '/api/guilds' && $method === 'GET') {
        ensureGuildTables();
        $rows = db()->query('
            SELECT g.*, COUNT(gm.id) as member_count, COALESCE(SUM(gm.combat_power),0) as total_combat_power
            FROM guilds g LEFT JOIN guild_members gm ON gm.guild_id=g.id
            GROUP BY g.id ORDER BY g.level DESC, total_combat_power DESC
        ')->fetchAll();

        // Check if current user is in a guild
        $userGuildId = null;
        $user = optionalUser();
        if ($user) {
            $stmt = db()->prepare('SELECT guild_id FROM guild_members WHERE user_id=?');
            $stmt->execute([$user['id']]);
            $row = $stmt->fetch();
            if ($row) $userGuildId = (int)$row['guild_id'];
        }

        jsonResponse(['status' => 'success', 'guilds' => $rows, 'userGuildId' => $userGuildId]);
    }

    // POST /api/guilds — Create a new guild
    if ($uri === '/api/guilds' && $method === 'POST') {
        ensureGuildTables();
        $user = currentUser();
        $data = input();
        $name = trim($data['name'] ?? '');
        if (strlen($name) < 2) jsonResponse(['status' => 'error', 'message' => 'Ten bang phai co it nhat 2 ky tu.'], 422);

        // Check if already in a guild
        $check = db()->prepare('SELECT id FROM guild_members WHERE user_id=?');
        $check->execute([$user['id']]);
        if ($check->fetch()) jsonResponse(['status' => 'error', 'message' => 'Ban da co bang hoi.'], 409);

        // Check duplicate name
        $check2 = db()->prepare('SELECT id FROM guilds WHERE name=?');
        $check2->execute([$name]);
        if ($check2->fetch()) jsonResponse(['status' => 'error', 'message' => 'Ten bang da ton tai.'], 409);

        // Deduct spirit stones from game state
        $charInfo = getCharInfo((int)$user['id']);
        if ($charInfo['spiritStones'] < 1000) jsonResponse(['status' => 'error', 'message' => 'Khong du Linh Thach (can 1000).'], 422);

        $state = gameState((int)$user['id']);
        if ($state) {
            $state['character']['spiritStones'] -= 1000;
            db()->prepare('UPDATE game_states SET state=?, updated_at=NOW() WHERE user_id=?')->execute([json_encode($state, JSON_UNESCAPED_UNICODE), $user['id']]);
        }

        // Create guild
        $stmt = db()->prepare('INSERT INTO guilds (name, leader_user_id, leader_name) VALUES (?,?,?)');
        $stmt->execute([$name, $user['id'], $charInfo['name']]);
        $guildId = (int)db()->lastInsertId();

        // Add leader as member
        $stmt2 = db()->prepare('INSERT INTO guild_members (guild_id, user_id, name, realm, combat_power, role) VALUES (?,?,?,?,?,?)');
        $stmt2->execute([$guildId, $user['id'], $charInfo['name'], $charInfo['realm'], $charInfo['combatPower'], 'Bang Chủ']);

        jsonResponse(['status' => 'success', 'guildId' => $guildId], 201);
    }

    // GET /api/guilds/{id} — Guild detail + members
    if (preg_match('#^/api/guilds/(\d+)$#', $uri, $match) && $method === 'GET') {
        ensureGuildTables();
        $guildId = (int)$match[1];
        $guild = db()->prepare('SELECT * FROM guilds WHERE id=?');
        $guild->execute([$guildId]);
        $g = $guild->fetch();
        if (!$g) jsonResponse(['status' => 'error', 'message' => 'Bang hoi khong ton tai.'], 404);

        $members = db()->prepare('SELECT * FROM guild_members WHERE guild_id=? ORDER BY FIELD(role,"Bang Chủ","Phó Bang Chủ","Trưởng Lão","Tinh Anh","Đệ Tử"), combat_power DESC');
        $members->execute([$guildId]);

        // Pending requests (only if user is leader/vice)
        $requests = [];
        $user = optionalUser();
        if ($user) {
            $myRole = db()->prepare('SELECT role FROM guild_members WHERE guild_id=? AND user_id=?');
            $myRole->execute([$guildId, $user['id']]);
            $roleRow = $myRole->fetch();
            if ($roleRow && in_array($roleRow['role'], ['Bang Chủ', 'Phó Bang Chủ'])) {
                $reqStmt = db()->prepare('SELECT * FROM guild_requests WHERE guild_id=? AND status="pending" ORDER BY created_at DESC');
                $reqStmt->execute([$guildId]);
                $requests = $reqStmt->fetchAll();
            }
        }

        jsonResponse(['status' => 'success', 'guild' => $g, 'members' => $members->fetchAll(), 'requests' => $requests]);
    }

    // POST /api/guilds/{id}/join — Send join request
    if (preg_match('#^/api/guilds/(\d+)/join$#', $uri, $match) && $method === 'POST') {
        ensureGuildTables();
        $user = currentUser();
        $guildId = (int)$match[1];

        // Check already in a guild
        $check = db()->prepare('SELECT id FROM guild_members WHERE user_id=?');
        $check->execute([$user['id']]);
        if ($check->fetch()) jsonResponse(['status' => 'error', 'message' => 'Ban da co bang hoi, khong the xin vao bang khac.'], 409);

        // Check already sent request
        $check2 = db()->prepare('SELECT id FROM guild_requests WHERE guild_id=? AND user_id=? AND status="pending"');
        $check2->execute([$guildId, $user['id']]);
        if ($check2->fetch()) jsonResponse(['status' => 'error', 'message' => 'Ban da gui don xin roi, vui long cho duyet.'], 409);

        // Check guild exists and has room
        $g = db()->prepare('SELECT g.*, COUNT(gm.id) as cnt FROM guilds g LEFT JOIN guild_members gm ON gm.guild_id=g.id WHERE g.id=? GROUP BY g.id');
        $g->execute([$guildId]);
        $guild = $g->fetch();
        if (!$guild) jsonResponse(['status' => 'error', 'message' => 'Bang hoi khong ton tai.'], 404);
        if ($guild['cnt'] >= $guild['max_members']) jsonResponse(['status' => 'error', 'message' => 'Bang hoi da day thanh vien.'], 422);

        $charInfo = getCharInfo((int)$user['id']);
        $stmt = db()->prepare('INSERT INTO guild_requests (guild_id, user_id, name, realm, combat_power) VALUES (?,?,?,?,?)');
        $stmt->execute([$guildId, $user['id'], $charInfo['name'], $charInfo['realm'], $charInfo['combatPower']]);

        jsonResponse(['status' => 'success', 'message' => 'Da gui don xin gia nhap.']);
    }

    // PUT /api/guilds/{id}/requests/{reqId} — Approve/reject (Bang Chủ + Phó Bang Chủ)
    if (preg_match('#^/api/guilds/(\d+)/requests/(\d+)$#', $uri, $match) && $method === 'PUT') {
        ensureGuildTables();
        $user = currentUser();
        $guildId = (int)$match[1];
        $reqId = (int)$match[2];
        $data = input();
        $action = $data['action'] ?? ''; // 'accept' or 'reject'

        // Check permission: must be Bang Chủ or Phó Bang Chủ
        $myRole = db()->prepare('SELECT role FROM guild_members WHERE guild_id=? AND user_id=?');
        $myRole->execute([$guildId, $user['id']]);
        $roleRow = $myRole->fetch();
        if (!$roleRow || !in_array($roleRow['role'], ['Bang Chủ', 'Phó Bang Chủ'])) {
            jsonResponse(['status' => 'error', 'message' => 'Chi Bang Chu hoac Pho Bang Chu moi co quyen duyet don.'], 403);
        }

        $req = db()->prepare('SELECT * FROM guild_requests WHERE id=? AND guild_id=? AND status="pending"');
        $req->execute([$reqId, $guildId]);
        $request = $req->fetch();
        if (!$request) jsonResponse(['status' => 'error', 'message' => 'Don xin khong ton tai hoac da xu ly.'], 404);

        if ($action === 'accept') {
            // Check room
            $cnt = db()->prepare('SELECT COUNT(*) as c FROM guild_members WHERE guild_id=?');
            $cnt->execute([$guildId]);
            $guild = db()->prepare('SELECT max_members FROM guilds WHERE id=?');
            $guild->execute([$guildId]);
            if ($cnt->fetch()['c'] >= $guild->fetch()['max_members']) {
                jsonResponse(['status' => 'error', 'message' => 'Bang hoi da day, khong the duyet them.'], 422);
            }

            // Add member
            $stmt = db()->prepare('INSERT INTO guild_members (guild_id, user_id, name, realm, combat_power, role) VALUES (?,?,?,?,?,?)');
            $stmt->execute([$guildId, $request['user_id'], $request['name'], $request['realm'], $request['combat_power'], 'Đệ Tử']);
            db()->prepare('UPDATE guild_requests SET status="accepted" WHERE id=?')->execute([$reqId]);
            jsonResponse(['status' => 'success', 'message' => 'Da duyet thanh vien moi.']);
        } else {
            db()->prepare('UPDATE guild_requests SET status="rejected" WHERE id=?')->execute([$reqId]);
            jsonResponse(['status' => 'success', 'message' => 'Da tu choi don xin.']);
        }
    }

    // PUT /api/guilds/{id}/members/{userId} — Promote/demote member
    if (preg_match('#^/api/guilds/(\d+)/members/(\d+)$#', $uri, $match) && $method === 'PUT') {
        ensureGuildTables();
        $user = currentUser();
        $guildId = (int)$match[1];
        $targetUserId = (int)$match[2];
        $data = input();
        $newRole = $data['role'] ?? '';

        $validRoles = ['Phó Bang Chủ', 'Trưởng Lão', 'Tinh Anh', 'Đệ Tử'];
        if (!in_array($newRole, $validRoles)) jsonResponse(['status' => 'error', 'message' => 'Chuc vu khong hop le.'], 422);

        // Check permission
        $myRole = db()->prepare('SELECT role FROM guild_members WHERE guild_id=? AND user_id=?');
        $myRole->execute([$guildId, $user['id']]);
        $roleRow = $myRole->fetch();
        if (!$roleRow || $roleRow['role'] !== 'Bang Chủ') {
            jsonResponse(['status' => 'error', 'message' => 'Chi Bang Chu moi co quyen thay doi chuc vu.'], 403);
        }

        // Can't change own role
        if ($targetUserId === (int)$user['id']) jsonResponse(['status' => 'error', 'message' => 'Khong the thay doi chuc vu ban than.'], 422);

        db()->prepare('UPDATE guild_members SET role=? WHERE guild_id=? AND user_id=?')->execute([$newRole, $guildId, $targetUserId]);
        jsonResponse(['status' => 'success']);
    }

    // ══════════════════════════════════════════════
    // ══  ADMIN ENDPOINTS
    // ══════════════════════════════════════════════

    if ($uri === '/api/admin/users' && $method === 'GET') {
        $rows = db()->query('SELECT u.id,u.name,u.email,u.role,u.status,u.created_at,g.state FROM users u LEFT JOIN game_states g ON g.user_id=u.id ORDER BY u.id')->fetchAll();
        $users = array_map(function ($row) {
            $char = $row['state'] ? (json_decode($row['state'], true)['character'] ?? []) : [];
            return ['id'=>(string)$row['id'],'name'=>$char['name']??$row['name'],'email'=>$row['email'],'realm'=>$char['realm']??'Luyen Khi','spiritualRoot'=>$char['spiritualRoot']??'Thien Linh Can','sect'=>$char['sect']??'Thanh Van Tong','combatPower'=>$char['combatPower']??1250,'spiritStones'=>$char['spiritStones']??500,'vipLevel'=>$char['vipLevel']??1,'role'=>$row['role'],'status'=>$row['status'],'createdAt'=>substr($row['created_at'],0,10)];
        }, $rows);
        jsonResponse(['status' => 'success', 'users' => $users]);
    }

    if ($uri === '/api/admin/users' && $method === 'POST') {
        $data = input();
        $email = strtolower(trim($data['email'] ?? ''));
        $name = trim($data['name'] ?? '');
        if (!$name || !filter_var($email, FILTER_VALIDATE_EMAIL)) jsonResponse(['status'=>'error','message'=>'Du lieu tai khoan khong hop le.'],422);
        $stmt = db()->prepare("INSERT INTO users(name,email,password,role,status,created_at) VALUES(?,?,?,?,'Active',NOW())");
        $stmt->execute([$name,$email,password_hash((string)($data['password']??'password'),PASSWORD_DEFAULT),$data['role']??'Player']);
        jsonResponse(['status'=>'success','id'=>(int)db()->lastInsertId()],201);
    }

    if (preg_match('#^/api/admin/users/(\d+)$#', $uri, $match)) {
        $id = (int) $match[1];
        if ($method === 'DELETE') { db()->prepare('DELETE FROM users WHERE id=?')->execute([$id]); jsonResponse(['status'=>'success']); }
        if ($method === 'PUT') {
            $data = input();
            db()->prepare('UPDATE users SET name=COALESCE(?,name),role=COALESCE(?,role),status=COALESCE(?,status),updated_at=NOW() WHERE id=?')->execute([$data['name']??null,$data['role']??null,$data['status']??null,$id]);
            $state = gameState($id);
            if ($state) { foreach (['name','realm','spiritualRoot','sect','combatPower','spiritStones','vipLevel','role','status'] as $key) if (array_key_exists($key,$data)) $state['character'][$key]=$data[$key]; db()->prepare('UPDATE game_states SET state=? WHERE user_id=?')->execute([json_encode($state,JSON_UNESCAPED_UNICODE),$id]); }
            jsonResponse(['status'=>'success']);
        }
    }

    if ($uri === '/api/admin/broadcast' && $method === 'POST') { $content=trim(input()['content']??''); if(!$content) jsonResponse(['status'=>'error'],422); db()->prepare('INSERT INTO announcements(content) VALUES(?)')->execute([$content]); jsonResponse(['status'=>'success']); }
    if ($uri === '/api/announcements/latest') { $content=db()->query('SELECT content FROM announcements ORDER BY id DESC LIMIT 1')->fetchColumn(); jsonResponse(['status'=>'success','content'=>$content?:null]); }

    jsonResponse(['status' => 'error', 'message' => 'Endpoint khong ton tai.'], 404);
} catch (Throwable $error) {
    jsonResponse(['status' => 'error', 'message' => 'Loi may chu hoac MySQL.', 'detail' => $error->getMessage()], 500);
}
