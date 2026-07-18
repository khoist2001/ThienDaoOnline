// Game Models and Types for Thiên Đạo Online

export type RealmTier = 
  | 'Luyện Khí'
  | 'Trúc Cơ'
  | 'Kim Đan'
  | 'Nguyên Anh'
  | 'Hóa Thần'
  | 'Luyện Hư'
  | 'Hợp Thể'
  | 'Đại Thừa'
  | 'Độ Kiếp'
  | 'Chân Tiên'
  | 'Kim Tiên'
  | 'Tiên Đế';

export type SpiritualRootType =
  | 'Kim'
  | 'Mộc'
  | 'Thủy'
  | 'Hỏa'
  | 'Thổ'
  | 'Song Linh Căn'
  | 'Thiên Linh Căn'
  | 'Biến Dị Linh Căn';

export type ItemRarity = 'Phàm' | 'Linh' | 'Huyền' | 'Địa' | 'Thiên' | 'Tiên' | 'Thần';
export type ItemType = 'Equipment' | 'Pill' | 'Material' | 'Pet' | 'Artifact';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  description: string;
  icon: string;
  stats?: {
    atk?: number;
    def?: number;
    hp?: number;
    exp?: number;
    expBoost?: number;
    successRateBoost?: number;
  };
  value: number; // In spirit stones (Linh Thạch)
  quantity?: number;
}

export interface Pet {
  id: string;
  name: string;
  rarity: ItemRarity;
  level: number;
  exp: number;
  maxExp: number;
  avatar: string;
  skill: string;
  combatBonus: number;
  element: string;
}

export interface Character {
  id: string;
  name: string;
  title: string;
  avatar: string;
  avatarFrame: string;
  vipLevel: number;
  realm: RealmTier;
  realmLevel: number; // e.g., Sơ Kỳ, Trung Kỳ, Hậu Kỳ, Đỉnh Phong (1 to 4)
  exp: number;
  maxExp: number;
  spiritualPower: number; // Linh lực
  maxSpiritualPower: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  spiritStones: number; // Linh thạch
  combatPower: number; // Lực chiến
  lifespan: number; // Tuổi thọ (years)
  maxLifespan: number;
  reputation: number; // Danh vọng
  spiritualRoot: SpiritualRootType;
  spiritualRootBonus: number; // Speed multiplier %
  sect: string;
  sectRole: 'Đệ Tử' | 'Trưởng Lão' | 'Tông Chủ';
  role: 'Player' | 'Moderator' | 'Admin';
  status?: 'Active' | 'Banned';
  isAutoMeditation: boolean;
  equippedItems: {
    weapon?: Item;
    armor?: Item;
    artifact?: Item;
    ring?: Item;
  };
  activePet?: Pet;
}

export interface DungeonBoss {
  id: string;
  name: string;
  realm: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  avatar: string;
  rewards: {
    exp: number;
    spiritStones: number;
    itemDropRate: number;
  };
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'main' | 'daily' | 'weekly' | 'sect';
  target: number;
  current: number;
  rewardExp: number;
  rewardStones: number;
  completed: boolean;
  claimed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  rewardStones: number;
}

export interface MarketListing {
  id: string;
  sellerName: string;
  item: Item;
  price: number;
  isAuction: boolean;
  auctionEndTime?: string;
  highestBid?: number;
  highestBidder?: string;
}
