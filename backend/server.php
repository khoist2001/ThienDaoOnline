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
            db()->exec("DROP TABLE IF EXISTS guild_donations, guild_requests, guild_members, guilds");
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
            total_donated BIGINT DEFAULT 0,
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

        CREATE TABLE IF NOT EXISTS guild_donations (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            guild_id BIGINT UNSIGNED NOT NULL,
            user_id BIGINT UNSIGNED NOT NULL,
            name VARCHAR(100) NOT NULL,
            amount BIGINT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    try {
        $cols = db()->query("SHOW COLUMNS FROM guild_members LIKE 'total_donated'")->fetchAll();
        if (empty($cols)) {
            db()->exec("ALTER TABLE guild_members ADD COLUMN total_donated BIGINT DEFAULT 0");
        }
    } catch (\Throwable $e) {}
}

function ensureShopAndGiftcodeTables(): void {
    static $done = false;
    if ($done) return;
    $done = true;

    db()->exec("
        CREATE TABLE IF NOT EXISTS shop_items (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            type ENUM('Equipment','Pill','Material','Artifact','Pet') DEFAULT 'Equipment',
            rarity ENUM('Phàm','Linh','Huyền','Địa','Thiên','Tiên','Thần') DEFAULT 'Linh',
            description TEXT,
            icon VARCHAR(50) DEFAULT '⚔️',
            price BIGINT NOT NULL DEFAULT 100,
            stock INT DEFAULT -1,
            stats JSON NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS giftcodes (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            code VARCHAR(50) NOT NULL UNIQUE,
            spirit_stones BIGINT DEFAULT 0,
            item_name VARCHAR(100) NULL,
            item_type VARCHAR(50) NULL,
            item_rarity VARCHAR(50) NULL,
            item_icon VARCHAR(50) NULL,
            item_description TEXT NULL,
            item_stats JSON NULL,
            max_uses INT DEFAULT 100,
            used_count INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS giftcode_redemptions (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            giftcode_id BIGINT UNSIGNED NOT NULL,
            user_id BIGINT UNSIGNED NOT NULL,
            redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY user_code_unique (giftcode_id, user_id),
            FOREIGN KEY (giftcode_id) REFERENCES giftcodes(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    $cnt = (int)db()->query("SELECT COUNT(*) FROM shop_items")->fetchColumn();
    if ($cnt === 0) {
        db()->exec("
            INSERT INTO shop_items (name, type, rarity, description, icon, price, stock, stats) VALUES
            ('Thanh Vân Kiếm', 'Equipment', 'Linh', 'Thanh kiếm gia trì linh khí Thanh Vân Tông.', '⚔️', 500, -1, '{\"atk\":150,\"hp\":200}'),
            ('Tụ Linh Đan', 'Pill', 'Phàm', 'Viên đan dược hỗ trợ tích tụ linh khí bế quan.', '🧪', 100, -1, '{\"exp\":300}'),
            ('Cửu Thần Giáp', 'Equipment', 'Địa', 'Bảo giáp được rèn từ quặng thiên thạch thượng giới.', '🛡️', 2000, -1, '{\"hp\":1500,\"def\":400}'),
            ('Hóa Thần Phù', 'Material', 'Huyền', 'Bùa hộ mệnh gia tăng tỷ lệ đột phá.', '📜', 800, -1, '{\"successRate\":15}')
        ");
    }

    $gcnt = (int)db()->query("SELECT COUNT(*) FROM giftcodes")->fetchColumn();
    if ($gcnt === 0) {
        db()->exec("
            INSERT INTO giftcodes (code, spirit_stones, item_name, item_type, item_rarity, item_icon, item_description, item_stats, max_uses) VALUES
            ('TUDAO2026', 10000, 'Tụ Linh Thần Đan', 'Pill', 'Thiên', '💊', 'Thần đan giúp tăng 5.000 Tu Vi EXP tức thì!', '{\"exp\":5000}', 1000),
            ('THIENDAO100K', 100000, NULL, NULL, NULL, NULL, NULL, NULL, 500)
        ");
    }
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

    // POST /api/guilds/leave — Leave current guild
    if ($uri === '/api/guilds/leave' && $method === 'POST') {
        ensureGuildTables();
        $user = currentUser();

        $myMem = db()->prepare('SELECT * FROM guild_members WHERE user_id=?');
        $myMem->execute([$user['id']]);
        $member = $myMem->fetch();

        if (!$member) jsonResponse(['status' => 'error', 'message' => 'Ban khong o trong bang hoi nao.'], 422);

        $guildId = (int)$member['guild_id'];

        if ($member['role'] === 'Bang Chủ') {
            $otherMems = db()->prepare('SELECT * FROM guild_members WHERE guild_id=? AND user_id!=? ORDER BY FIELD(role,"Phó Bang Chủ","Trưởng Lão","Tinh Anh","Đệ Tử"), combat_power DESC');
            $otherMems->execute([$guildId, $user['id']]);
            $nextLeader = $otherMems->fetch();

            if ($nextLeader) {
                db()->prepare('UPDATE guild_members SET role="Bang Chủ" WHERE id=?')->execute([$nextLeader['id']]);
                db()->prepare('UPDATE guilds SET leader_user_id=?, leader_name=? WHERE id=?')->execute([$nextLeader['user_id'], $nextLeader['name'], $guildId]);
                db()->prepare('DELETE FROM guild_members WHERE user_id=?')->execute([$user['id']]);
            } else {
                db()->prepare('DELETE FROM guilds WHERE id=?')->execute([$guildId]);
            }
        } else {
            db()->prepare('DELETE FROM guild_members WHERE user_id=?')->execute([$user['id']]);
        }

        jsonResponse(['status' => 'success', 'message' => 'Da roi bang hoi thanh cong.']);
    }

    // POST /api/guilds/donate — Donate spirit stones to guild vault
    if ($uri === '/api/guilds/donate' && $method === 'POST') {
        ensureGuildTables();
        $user = currentUser();
        $data = input();
        $amount = (int)($data['amount'] ?? 200);
        if ($amount < 10) jsonResponse(['status' => 'error', 'message' => 'So Linh Thach cong hien it nhat 10.'], 422);

        $myMem = db()->prepare('SELECT * FROM guild_members WHERE user_id=?');
        $myMem->execute([$user['id']]);
        $member = $myMem->fetch();
        if (!$member) jsonResponse(['status' => 'error', 'message' => 'Ban khong o trong bang hoi nao.'], 422);

        $guildId = (int)$member['guild_id'];

        $charInfo = getCharInfo((int)$user['id']);
        if ($charInfo['spiritStones'] < $amount) jsonResponse(['status' => 'error', 'message' => "Khong du Linh Thach (can {$amount} 💎)."], 422);

        $state = gameState((int)$user['id']);
        if ($state) {
            $state['character']['spiritStones'] -= $amount;
            db()->prepare('UPDATE game_states SET state=?, updated_at=NOW() WHERE user_id=?')->execute([json_encode($state, JSON_UNESCAPED_UNICODE), $user['id']]);
        }

        db()->prepare('UPDATE guilds SET vault_stones=vault_stones+? WHERE id=?')->execute([$amount, $guildId]);
        db()->prepare('UPDATE guild_members SET total_donated=total_donated+? WHERE id=?')->execute([$amount, $member['id']]);
        db()->prepare('INSERT INTO guild_donations (guild_id, user_id, name, amount) VALUES (?,?,?,?)')->execute([$guildId, $user['id'], $charInfo['name'], $amount]);

        jsonResponse(['status' => 'success', 'message' => "Da cong hien {$amount} Linh Thach vao kho bang!"]);
    }

    // POST /api/guilds/upgrade-slots — Upgrade member slots
    if ($uri === '/api/guilds/upgrade-slots' && $method === 'POST') {
        ensureGuildTables();
        $user = currentUser();

        $myMem = db()->prepare('SELECT * FROM guild_members WHERE user_id=?');
        $myMem->execute([$user['id']]);
        $member = $myMem->fetch();
        if (!$member) jsonResponse(['status' => 'error', 'message' => 'Ban khong o trong bang hoi nao.'], 422);
        if (!in_array($member['role'], ['Bang Chủ', 'Phó Bang Chủ'])) jsonResponse(['status' => 'error', 'message' => 'Chi Bang Chu hoac Pho Bang Chu moi co quyen nang cap.'], 403);

        $guildId = (int)$member['guild_id'];
        $guild = db()->prepare('SELECT * FROM guilds WHERE id=?');
        $guild->execute([$guildId]);
        $g = $guild->fetch();

        $step = max(0, floor(($g['max_members'] - 5) / 3));
        $cost = 500 * pow(2, $step);

        if ($g['vault_stones'] < $cost) jsonResponse(['status' => 'error', 'message' => "Kho bang khong du Linh Thach (can {$cost} 💎)."], 422);

        db()->prepare('UPDATE guilds SET vault_stones=vault_stones-?, max_members=max_members+3, level=level+1 WHERE id=?')->execute([$cost, $guildId]);

        jsonResponse(['status' => 'success', 'message' => "Nang cap thanh cong! Slot thành viên +3, Cấp Bang +1!"]);
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

        $donations = db()->prepare('SELECT * FROM guild_donations WHERE guild_id=? ORDER BY created_at DESC LIMIT 30');
        $donations->execute([$guildId]);

        jsonResponse([
            'status' => 'success',
            'guild' => $g,
            'members' => $members->fetchAll(),
            'requests' => $requests,
            'donations' => $donations->fetchAll(),
        ]);
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

    // ══════════════════════════════════════════════
    // ══  SYSTEM SHOP ENDPOINTS
    // ══════════════════════════════════════════════

    // GET /api/shop/items — Browse system shop items
    if ($uri === '/api/shop/items' && $method === 'GET') {
        ensureShopAndGiftcodeTables();
        $items = db()->query('SELECT * FROM shop_items ORDER BY price ASC')->fetchAll();
        $formatted = array_map(function ($i) {
            return [
                'id' => (int)$i['id'],
                'name' => $i['name'],
                'type' => $i['type'],
                'rarity' => $i['rarity'],
                'description' => $i['description'],
                'icon' => $i['icon'] ?: '⚔️',
                'price' => (int)$i['price'],
                'stock' => (int)$i['stock'],
                'stats' => $i['stats'] ? json_decode($i['stats'], true) : [],
            ];
        }, $items);
        jsonResponse(['status' => 'success', 'items' => $formatted]);
    }

    // POST /api/shop/buy — Buy system shop item
    if ($uri === '/api/shop/buy' && $method === 'POST') {
        ensureShopAndGiftcodeTables();
        $user = currentUser();
        $itemId = (int)(input()['itemId'] ?? 0);

        $stmt = db()->prepare('SELECT * FROM shop_items WHERE id=?');
        $stmt->execute([$itemId]);
        $item = $stmt->fetch();
        if (!$item) jsonResponse(['status' => 'error', 'message' => 'Vat pham khong ton tai.'], 404);

        $price = (int)$item['price'];
        $state = gameState((int)$user['id']);
        if (!$state || !isset($state['character'])) jsonResponse(['status' => 'error', 'message' => 'Loi du lieu nhan vat.'], 422);

        $currentStones = (int)($state['character']['spiritStones'] ?? 0);
        if ($currentStones < $price) jsonResponse(['status' => 'error', 'message' => "Khong du Linh Thach (can {$price} 💎)."], 422);

        $state['character']['spiritStones'] = $currentStones - $price;

        if (!isset($state['inventory'])) $state['inventory'] = [];
        $newItem = [
          'id' => 'item-' . time() . '-' . rand(100, 999),
          'name' => $item['name'],
          'type' => $item['type'],
          'rarity' => $item['rarity'],
          'description' => $item['description'],
          'icon' => $item['icon'] ?: '⚔️',
          'value' => (int)($item['price'] / 2),
          'stats' => $item['stats'] ? json_decode($item['stats'], true) : [],
          'isEquipped' => false,
        ];
        $state['inventory'][] = $newItem;

        db()->prepare('UPDATE game_states SET state=?, updated_at=NOW() WHERE user_id=?')->execute([json_encode($state, JSON_UNESCAPED_UNICODE), $user['id']]);

        jsonResponse(['status' => 'success', 'message' => "Da mua thanh cong [{$item['name']}]!", 'item' => $newItem, 'spiritStones' => $state['character']['spiritStones'], 'gameState' => $state]);
    }

    // POST /api/admin/shop/items — Admin create shop item
    if ($uri === '/api/admin/shop/items' && $method === 'POST') {
        ensureShopAndGiftcodeTables();
        $data = input();
        $name = trim($data['name'] ?? '');
        if (!$name) jsonResponse(['status' => 'error', 'message' => 'Ten vat pham khong duoc de trong.'], 422);

        $type = $data['type'] ?? 'Equipment';
        $rarity = $data['rarity'] ?? 'Linh';
        $description = $data['description'] ?? '';
        $icon = $data['icon'] ?? '⚔️';
        $price = (int)($data['price'] ?? 100);
        $stock = (int)($data['stock'] ?? -1);
        $stats = is_array($data['stats'] ?? null) ? json_encode($data['stats'], JSON_UNESCAPED_UNICODE) : null;

        $stmt = db()->prepare('INSERT INTO shop_items (name, type, rarity, description, icon, price, stock, stats) VALUES (?,?,?,?,?,?,?,?)');
        $stmt->execute([$name, $type, $rarity, $description, $icon, $price, $stock, $stats]);

        jsonResponse(['status' => 'success', 'id' => (int)db()->lastInsertId()], 201);
    }

    // DELETE /api/admin/shop/items/{id} — Admin delete shop item
    if (preg_match('#^/api/admin/shop/items/(\d+)$#', $uri, $match) && $method === 'DELETE') {
        ensureShopAndGiftcodeTables();
        $id = (int)$match[1];
        db()->prepare('DELETE FROM shop_items WHERE id=?')->execute([$id]);
        jsonResponse(['status' => 'success']);
    }

    // ══════════════════════════════════════════════
    // ══  GIFTCODE ENDPOINTS
    // ══════════════════════════════════════════════

    // GET /api/admin/giftcodes — Admin list giftcodes
    if ($uri === '/api/admin/giftcodes' && $method === 'GET') {
        ensureShopAndGiftcodeTables();
        $codes = db()->query('SELECT * FROM giftcodes ORDER BY id DESC')->fetchAll();
        $formatted = array_map(function ($g) {
            return [
                'id' => (int)$g['id'],
                'code' => $g['code'],
                'spiritStones' => (int)$g['spirit_stones'],
                'itemName' => $g['item_name'],
                'itemType' => $g['item_type'],
                'itemRarity' => $g['item_rarity'],
                'itemIcon' => $g['item_icon'],
                'itemDescription' => $g['item_description'],
                'maxUses' => (int)$g['max_uses'],
                'usedCount' => (int)$g['used_count'],
                'createdAt' => substr($g['created_at'], 0, 10),
            ];
        }, $codes);
        jsonResponse(['status' => 'success', 'giftcodes' => $formatted]);
    }

    // POST /api/admin/giftcodes — Admin create giftcode
    if ($uri === '/api/admin/giftcodes' && $method === 'POST') {
        ensureShopAndGiftcodeTables();
        $data = input();
        $code = strtoupper(trim($data['code'] ?? ''));
        if (strlen($code) < 3) jsonResponse(['status' => 'error', 'message' => 'Ma Giftcode phai co it nhat 3 ky tu.'], 422);

        $check = db()->prepare('SELECT id FROM giftcodes WHERE code=?');
        $check->execute([$code]);
        if ($check->fetch()) jsonResponse(['status' => 'error', 'message' => 'Ma Giftcode da ton tai.'], 409);

        $spiritStones = (int)($data['spiritStones'] ?? 0);
        $itemName = trim($data['itemName'] ?? '') ?: null;
        $itemType = $data['itemType'] ?? 'Pill';
        $itemRarity = $data['itemRarity'] ?? 'Thiên';
        $itemIcon = $data['itemIcon'] ?? '🎁';
        $itemDescription = $data['itemDescription'] ?? 'Quà tặng từ Giftcode';
        $itemStats = is_array($data['itemStats'] ?? null) ? json_encode($data['itemStats'], JSON_UNESCAPED_UNICODE) : null;
        $maxUses = (int)($data['maxUses'] ?? 100);

        $stmt = db()->prepare('INSERT INTO giftcodes (code, spirit_stones, item_name, item_type, item_rarity, item_icon, item_description, item_stats, max_uses) VALUES (?,?,?,?,?,?,?,?,?)');
        $stmt->execute([$code, $spiritStones, $itemName, $itemType, $itemRarity, $itemIcon, $itemDescription, $itemStats, $maxUses]);

        jsonResponse(['status' => 'success', 'id' => (int)db()->lastInsertId()], 201);
    }

    // DELETE /api/admin/giftcodes/{id} — Admin delete giftcode
    if (preg_match('#^/api/admin/giftcodes/(\d+)$#', $uri, $match) && $method === 'DELETE') {
        ensureShopAndGiftcodeTables();
        $id = (int)$match[1];
        db()->prepare('DELETE FROM giftcodes WHERE id=?')->execute([$id]);
        jsonResponse(['status' => 'success']);
    }

    // POST /api/giftcodes/redeem — User redeem giftcode
    if ($uri === '/api/giftcodes/redeem' && $method === 'POST') {
        ensureShopAndGiftcodeTables();
        $user = currentUser();
        $code = strtoupper(trim(input()['code'] ?? ''));
        if (!$code) jsonResponse(['status' => 'error', 'message' => 'Vui long nhap ma Giftcode.'], 422);

        $stmt = db()->prepare('SELECT * FROM giftcodes WHERE code=?');
        $stmt->execute([$code]);
        $g = $stmt->fetch();
        if (!$g) jsonResponse(['status' => 'error', 'message' => 'Ma Giftcode khong hop le hoac da het han.'], 404);

        if ((int)$g['used_count'] >= (int)$g['max_uses']) jsonResponse(['status' => 'error', 'message' => 'Ma Giftcode da het luot su dung.'], 422);

        $check = db()->prepare('SELECT id FROM giftcode_redemptions WHERE giftcode_id=? AND user_id=?');
        $check->execute([$g['id'], $user['id']]);
        if ($check->fetch()) jsonResponse(['status' => 'error', 'message' => 'Ban da su dung ma Giftcode nay roi!'], 409);

        db()->prepare('INSERT INTO giftcode_redemptions (giftcode_id, user_id) VALUES (?,?)')->execute([$g['id'], $user['id']]);
        db()->prepare('UPDATE giftcodes SET used_count=used_count+1 WHERE id=?')->execute([$g['id']]);

        $state = gameState((int)$user['id']);
        if (!$state || !isset($state['character'])) jsonResponse(['status' => 'error', 'message' => 'Loi du lieu nhan vat.'], 422);

        $rewardStones = (int)$g['spirit_stones'];
        if ($rewardStones > 0) {
            $state['character']['spiritStones'] = (int)($state['character']['spiritStones'] ?? 0) + $rewardStones;
        }

        $newItem = null;
        if (!empty($g['item_name'])) {
            if (!isset($state['inventory'])) $state['inventory'] = [];
            $newItem = [
                'id' => 'item-code-' . time() . '-' . rand(100, 999),
                'name' => $g['item_name'],
                'type' => $g['item_type'] ?: 'Pill',
                'rarity' => $g['item_rarity'] ?: 'Thiên',
                'description' => $g['item_description'] ?: 'Quà tặng từ Giftcode',
                'icon' => $g['item_icon'] ?: '🎁',
                'value' => 500,
                'stats' => $g['item_stats'] ? json_decode($g['item_stats'], true) : [],
                'isEquipped' => false,
            ];
            $state['inventory'][] = $newItem;
        }

        db()->prepare('UPDATE game_states SET state=?, updated_at=NOW() WHERE user_id=?')->execute([json_encode($state, JSON_UNESCAPED_UNICODE), $user['id']]);

        jsonResponse([
            'status' => 'success',
            'message' => "Doi ma Giftcode [{$code}] thanh cong!",
            'reward' => [
                'spiritStones' => $rewardStones,
                'item' => $newItem,
            ],
            'gameState' => $state,
        ]);
    }

    jsonResponse(['status' => 'error', 'message' => 'Endpoint khong ton tai.'], 404);
} catch (Throwable $error) {
    jsonResponse(['status' => 'error', 'message' => 'Loi may chu hoac MySQL.', 'detail' => $error->getMessage()], 500);
}
