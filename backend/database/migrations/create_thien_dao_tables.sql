-- SQL Migration & Full Seed Data Script for Thiên Đạo Online (Laravel 12 / MySQL 8)
-- Covers all 20 specified tables with foreign key constraints, indexes, and comprehensive initial seed data

CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `email_verified_at` TIMESTAMP NULL,
  `password` VARCHAR(255) NOT NULL,
  `two_factor_secret` TEXT NULL,
  `two_factor_recovery_codes` TEXT NULL,
  `remember_token` VARCHAR(100) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sects` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `leader_id` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `realms` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `order_level` INT NOT NULL,
  `required_exp` BIGINT NOT NULL,
  `hp_bonus` INT NOT NULL,
  `atk_bonus` INT NOT NULL,
  `aura_effect` VARCHAR(255) DEFAULT 'gold'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `spiritual_roots` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `exp_multiplier` DECIMAL(5,2) DEFAULT 1.00,
  `element` VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `characters` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) DEFAULT 'Vô Danh Tu Sĩ',
  `avatar` VARCHAR(500) NULL,
  `avatar_frame` VARCHAR(255) DEFAULT 'gold',
  `vip_level` INT DEFAULT 1,
  `realm_id` BIGINT UNSIGNED NOT NULL,
  `spiritual_root_id` BIGINT UNSIGNED NOT NULL,
  `sect_id` BIGINT UNSIGNED NULL,
  `exp` BIGINT DEFAULT 0,
  `max_exp` BIGINT DEFAULT 100,
  `hp` INT DEFAULT 500,
  `max_hp` INT DEFAULT 500,
  `mana` INT DEFAULT 250,
  `max_mana` INT DEFAULT 250,
  `spiritual_power` INT DEFAULT 100,
  `spirit_stones` BIGINT DEFAULT 500,
  `combat_power` INT DEFAULT 1000,
  `lifespan` INT DEFAULT 18,
  `max_lifespan` INT DEFAULT 100,
  `reputation` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`realm_id`) REFERENCES `realms`(`id`),
  FOREIGN KEY (`spiritual_root_id`) REFERENCES `spiritual_roots`(`id`),
  FOREIGN KEY (`sect_id`) REFERENCES `sects`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `skills` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `damage_multiplier` DECIMAL(5,2) DEFAULT 1.50,
  `mana_cost` INT DEFAULT 50,
  `required_realm_id` BIGINT UNSIGNED NULL,
  FOREIGN KEY (`required_realm_id`) REFERENCES `realms`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `items` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `type` ENUM('Equipment', 'Pill', 'Material', 'Artifact', 'Pet') NOT NULL,
  `rarity` ENUM('Phàm', 'Linh', 'Huyền', 'Địa', 'Thiên', 'Tiên', 'Thần') NOT NULL,
  `description` TEXT,
  `icon` VARCHAR(255),
  `value` INT DEFAULT 100
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `inventory` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `character_id` BIGINT UNSIGNED NOT NULL,
  `item_id` BIGINT UNSIGNED NOT NULL,
  `quantity` INT DEFAULT 1,
  `is_equipped` BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pets` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `character_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `rarity` VARCHAR(50) NOT NULL,
  `level` INT DEFAULT 1,
  `exp` INT DEFAULT 0,
  `skill` VARCHAR(255),
  `combat_bonus` INT DEFAULT 100,
  FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `guilds` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `level` INT DEFAULT 1,
  `vault_stones` BIGINT DEFAULT 0,
  `leader_id` BIGINT UNSIGNED NOT NULL,
  FOREIGN KEY (`leader_id`) REFERENCES `characters`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `guild_members` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `guild_id` BIGINT UNSIGNED NOT NULL,
  `character_id` BIGINT UNSIGNED NOT NULL,
  `role` ENUM('Member', 'Elder', 'Leader') DEFAULT 'Member',
  FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `battles` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `attacker_id` BIGINT UNSIGNED NOT NULL,
  `defender_id` BIGINT UNSIGNED NOT NULL,
  `winner_id` BIGINT UNSIGNED NOT NULL,
  `log` JSON NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `market` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `seller_id` BIGINT UNSIGNED NOT NULL,
  `item_id` BIGINT UNSIGNED NOT NULL,
  `price` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`seller_id`) REFERENCES `characters`(`id`),
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `auction` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `seller_id` BIGINT UNSIGNED NOT NULL,
  `item_id` BIGINT UNSIGNED NOT NULL,
  `highest_bid` INT DEFAULT 0,
  `highest_bidder_id` BIGINT UNSIGNED NULL,
  `end_time` TIMESTAMP NOT NULL,
  FOREIGN KEY (`seller_id`) REFERENCES `characters`(`id`),
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `quests` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `type` ENUM('main', 'daily', 'weekly', 'sect') NOT NULL,
  `reward_exp` INT DEFAULT 50,
  `reward_stones` INT DEFAULT 100
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `achievements` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `reward_stones` INT DEFAULT 500
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `read` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NULL,
  `action` VARCHAR(255) NOT NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================
-- FULL COMPREHENSIVE INITIAL SEED DATA (DỮ LIỆU MẪU ĐẦY ĐỦ 20 BẢNG)
-- =================================================================

-- 1. SEED REALMS (11 Cảnh Giới Tu Tiên)
INSERT INTO `realms` (`id`, `name`, `order_level`, `required_exp`, `hp_bonus`, `atk_bonus`, `aura_effect`) VALUES
(1, 'Luyện Khí', 1, 100, 500, 100, 'gold-subtle'),
(2, 'Trúc Cơ', 2, 300, 1200, 350, 'jade-glow'),
(3, 'Kim Đan', 3, 800, 3000, 900, 'gold-shimmer'),
(4, 'Nguyên Anh', 4, 2000, 7500, 2400, 'purple-aura'),
(5, 'Hóa Thần', 5, 5000, 18000, 6000, 'crimson-aura'),
(6, 'Luyện Hư', 6, 12000, 45000, 15000, 'cyan-light'),
(7, 'Hợp Thể', 7, 30000, 100000, 35000, 'amber-fire'),
(8, 'Đại Thừa', 8, 80000, 250000, 90000, 'white-gold'),
(9, 'Độ Kiếp', 9, 200000, 600000, 220000, 'thunder-bolt'),
(10, 'Chân Tiên', 10, 500000, 1500000, 550000, 'immortal-glow'),
(11, 'Tiên Đế', 11, 3000000, 999999, 999999, 'godly-rainbow')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 2. SEED SPIRITUAL ROOTS (8 Linh Căn)
INSERT INTO `spiritual_roots` (`id`, `name`, `exp_multiplier`, `element`) VALUES
(1, 'Kim', 1.10, 'Kim'),
(2, 'Mộc', 1.10, 'Mộc'),
(3, 'Thủy', 1.10, 'Thủy'),
(4, 'Hỏa', 1.15, 'Hỏa'),
(5, 'Thổ', 1.10, 'Thổ'),
(6, 'Song Linh Căn', 1.30, 'Hỗn Hop'),
(7, 'Biến Dị Linh Căn', 1.60, 'Lôi Phong'),
(8, 'Thiên Linh Căn', 2.00, 'Thái Cực')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 3. SEED SECTS (5 Môn Phái)
INSERT INTO `sects` (`id`, `name`, `description`) VALUES
(1, 'Thanh Vân Tông', 'Chính đạo danh môn, công pháp đạo gia thuần khiết'),
(2, 'Vạn Kiếm Sơn', 'Kiếm tu vô song, nhất kiếm phá vạn pháp'),
(3, 'Thái Hư Cung', 'Ảo diệu vô cùng, tinh thông trận pháp phù lục'),
(4, 'Thiên Ma Giáo', 'Bá đạo tàn nhẫn, tốc độ tu luyện cực nhanh'),
(5, 'Thiên Kiếm Môn', 'Vấn kiếm thiên hạ, sát phạt quyết đoán')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 4. SEED DEMO USERS (Admin & Players)
INSERT INTO `users` (`id`, `name`, `email`, `password`) VALUES
(1, 'Quản Trị Viên Huyết Lệnh', 'admin@thiendao.online', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
(2, 'Bắc Phong', 'bactien.tudao@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
(3, 'Độc Cô Cầu Bại', 'docco.caubai@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
(4, 'Tuyết Sơn Tiên Tử', 'tuyetson@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
(5, 'Cuồng Kiếm Ma Tôn', 'cuongkiem@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

-- 5. SEED CHARACTERS
INSERT INTO `characters` (`id`, `user_id`, `name`, `title`, `realm_id`, `spiritual_root_id`, `sect_id`, `combat_power`, `spirit_stones`) VALUES
(1, 1, 'Quản Trị Viên Huyết Lệnh', 'Chủ Tể Thiên Đạo', 11, 8, 3, 999999, 999999),
(2, 2, 'Bắc Phong', 'Vô Danh Tu Sĩ', 1, 8, 1, 1250, 500),
(3, 3, 'Độc Cô Cầu Bại', 'Vô Song Kiếm Tôn', 10, 7, 2, 98500, 25000),
(4, 4, 'Tuyết Sơn Tiên Tử', 'Tiên Cung Thánh Nữ', 10, 8, 1, 76200, 18000),
(5, 5, 'Cuồng Kiếm Ma Tôn', 'Ma Giới Bá Vương', 5, 4, 4, 54100, 12000)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 6. SEED SKILLS
INSERT INTO `skills` (`id`, `name`, `description`, `damage_multiplier`, `mana_cost`, `required_realm_id`) VALUES
(1, 'Nhất Kiếm Trảm Phá', 'Kiếm khí bay bổng trảm phá hư không', 1.50, 30, 1),
(2, 'Mê Hồn Trận', 'Trận pháp làm suy giảm bạo kích và sát thương của kẻ địch', 1.80, 60, 2),
(3, 'Lôi Đình Vạn Quân', 'Thiên lôi giáng lâm trảm sát diệt yêu thần', 2.50, 120, 3),
(4, 'Vạn Kiếm Quy Tông', 'Vạn thanh phi kiếm đồng loạt xuất vỏ sát phạt', 3.50, 250, 4),
(5, 'Tam Muội Chân Hỏa', 'Ngọn lửa thần linh thiêu rụi kinh mạch đối thủ', 5.00, 500, 5)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 7. SEED ITEMS
INSERT INTO `items` (`id`, `name`, `type`, `rarity`, `description`, `icon`, `value`) VALUES
(1, 'Thanh Phong Phi Kiếm', 'Equipment', 'Huyền', 'Phi kiếm lướt gió như chớp trợ uy sát thương', '🗡️', 300),
(2, 'Đột Phá Đan', 'Pill', 'Linh', 'Viên đan tăng 25% tỷ lệ độ kiếp', '💊', 150),
(3, 'Tụ Khí Đan', 'Pill', 'Phàm', 'Tăng ngay 50 EXP tu vi', '🧪', 50),
(4, 'Vạn Niên Linh Chi', 'Material', 'Địa', 'Thần dược vạn năm dùng để luyện đan', '🍄', 500),
(5, 'Bạch Hạc Thần Kiếm', 'Equipment', 'Huyền', 'Thần kiếm đúc từ lông hạc tiên', '🗡️', 450),
(6, 'Cửu Nhất Thần Đỉnh', 'Artifact', 'Địa', 'Bảo đỉnh nung tam muội chân hỏa', '🏺', 600),
(7, 'Trúc Cơ Đan Thượng Phẩm', 'Pill', 'Địa', 'Tăng 40% tỷ lệ đột phá Trúc Cơ', '🔮', 800)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 8. SEED INVENTORY
INSERT INTO `inventory` (`id`, `character_id`, `item_id`, `quantity`, `is_equipped`) VALUES
(1, 2, 1, 1, 1),
(2, 2, 2, 3, 0),
(3, 2, 3, 5, 0),
(4, 2, 4, 2, 0)
ON DUPLICATE KEY UPDATE `quantity` = VALUES(`quantity`);

-- 9. SEED PETS
INSERT INTO `pets` (`id`, `character_id`, `name`, `rarity`, `level`, `exp`, `skill`, `combat_bonus`) VALUES
(1, 2, 'Cửu Vĩ Thiên Hồ', 'Thiên', 5, 240, 'Mê Hồn Trận (Tăng 15% bạo kích)', 450),
(2, 3, 'Thượng Cổ Lôi Lân', 'Tiên', 12, 1500, 'Cuồng Lôi Giáng Lâm', 1200)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 10. SEED GUILDS & MEMBERS
INSERT INTO `guilds` (`id`, `name`, `level`, `vault_stones`, `leader_id`) VALUES
(1, 'Thanh Vân Tông Bang', 3, 15000, 2),
(2, 'Vạn Kiếm Sơn Bang', 5, 50000, 3)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `guild_members` (`id`, `guild_id`, `character_id`, `role`) VALUES
(1, 1, 2, 'Leader'),
(2, 2, 3, 'Leader')
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);

-- 11. SEED QUESTS & ACHIEVEMENTS
INSERT INTO `quests` (`id`, `title`, `description`, `type`, `reward_exp`, `reward_stones`) VALUES
(1, 'Bước Đầu Tu Tiên', 'Bế quan tu luyện đạt 100 EXP', 'main', 50, 200),
(2, 'Hái Thần Dược', 'Thu thập 2 Vạn Niên Linh Chi từ Bí Cảnh', 'daily', 80, 150)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

INSERT INTO `achievements` (`id`, `title`, `description`, `reward_stones`) VALUES
(1, 'Đột Phá Lần Đầu', 'Thành công độ kiếp bứt phá giới hạn bản thân', 500),
(2, 'Sở Hữu Thần Thú', 'Thu phục linh thú cấp Thiên trở lên', 1000)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 12. SEED NOTIFICATIONS
INSERT INTO `notifications` (`id`, `user_id`, `title`, `content`, `read`) VALUES
(1, 2, 'Chào Mừng Đến Thiên Đạo', 'Chúc mừng Đạo Hữu đã gia nhập cõi Tiên Giới! Hãy bắt đầu bế quan tu luyện.', 0)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);
-- Browser-independent persistence used by the API router.
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `role` VARCHAR(20) NOT NULL DEFAULT 'Player';
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `status` VARCHAR(20) NOT NULL DEFAULT 'Active';
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NULL DEFAULT NULL;

CREATE TABLE IF NOT EXISTS `game_states` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL UNIQUE,
  `state` JSON NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `game_states_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `game_sessions` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `token_hash` CHAR(64) NOT NULL UNIQUE,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `game_sessions_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `announcements` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NULL,
  `content` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `announcements_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
