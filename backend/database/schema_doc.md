# Documentation: Database Architecture & Schema for Thiên Đạo Online (Laravel 12)

This document describes the complete 20 database tables configured for the **Thiên Đạo Online (天道 Online)** Web Game backend architecture.

## Table Inventory & Descriptions

1. **`users`**: Stores user authentication data, email verification, Sanctum tokens, and 2FA secrets.
2. **`characters`**: Stores cultivator attributes: Name, Title, Avatar, VIP Level, Realm ID, Spiritual Root ID, Sect ID, EXP, HP, Mana, Spiritual Power, Spirit Stones, Combat Power, Lifespan, Reputation.
3. **`realms`**: Cảnh giới definitions (Luyện Khí → Tiên Đế), required EXP thresholds, attribute multipliers, and aura effects.
4. **`spiritual_roots`**: 8 Spiritual root variants (Kim, Mộc, Thủy, Hỏa, Thổ, Song Linh Căn, Thiên Linh Căn, Biến Dị Linh Căn) and meditation speed multipliers.
5. **`sects`**: Môn phái data (Thanh Vân Tông, Vạn Kiếm Sơn, Thái Hư Cung, Thiên Ma Giáo, Thiên Kiếm Môn).
6. **`skills`**: Unlockable active and passive gongfa skills with mana cost and damage multipliers.
7. **`items`**: Master item dictionary (weapons, armors, potions/pills, alchemy materials, artifacts) categorized by 7 rarity tiers (Phàm → Thần).
8. **`inventory`**: Character item inventory mapping grid, item quantities, and equipment status.
9. **`pets`**: Spirit pets (Linh Thú) owned by characters with levels, skills, and combat power bonuses.
10. **`guilds`**: Player guilds with vault spirit stones, levels, and guild leader associations.
11. **`guild_members`**: Guild membership mappings and roles (Member, Elder, Leader).
12. **`battles`**: Replay logs of secret realm boss fights and PvP arena challenges.
13. **`market`**: Active marketplace listings with prices and seller character IDs.
14. **`auction`**: Live auction items with bidding timers, starting prices, and highest bidders.
15. **`quests`**: Daily, main, weekly, and sect quests with target counts and rewards.
16. **`missions`**: Sect mission assignments and status tracking.
17. **`achievements`**: Achievements log and milestone reward triggers.
18. **`notifications`**: In-game notifications and system announcements.
19. **`logs`**: Audit trail for security, trade logs, and admin action tracking.
20. **`sessions`**: Active user session management.
