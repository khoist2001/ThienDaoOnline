import { create } from 'zustand';
import { Character, Item, Pet, Quest, Achievement, MarketListing, RealmTier, SpiritualRootType } from '../types/game';
import { apiClient } from '../services/apiClient';

export const REALM_ORDER: RealmTier[] = [
  'Luyện Khí',
  'Trúc Cơ',
  'Kim Đan',
  'Nguyên Anh',
  'Hóa Thần',
  'Luyện Hư',
  'Hợp Thể',
  'Đại Thừa',
  'Độ Kiếp',
  'Chân Tiên',
  'Kim Tiên',
  'Tiên Đế',
];

export const REALM_MAX_EXP: Record<RealmTier, number> = {
  'Luyện Khí': 100,
  'Trúc Cơ': 300,
  'Kim Đan': 800,
  'Nguyên Anh': 2000,
  'Hóa Thần': 5000,
  'Luyện Hư': 12000,
  'Hợp Thể': 30000,
  'Đại Thừa': 80000,
  'Độ Kiếp': 200000,
  'Chân Tiên': 500000,
  'Kim Tiên': 1200000,
  'Tiên Đế': 3000000,
};

const INITIAL_CHARACTER: Character = {
  id: 'user-001',
  name: 'Bắc Phong',
  title: 'Vô Danh Tu Sĩ',
  avatar: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=80',
  avatarFrame: 'gold',
  vipLevel: 1,
  realm: 'Luyện Khí',
  realmLevel: 1, // 1: Sơ Kỳ, 2: Trung Kỳ, 3: Hậu Kỳ, 4: Đỉnh Phong
  exp: 80,
  maxExp: 100,
  spiritualPower: 120,
  maxSpiritualPower: 200,
  hp: 500,
  maxHp: 500,
  mana: 250,
  maxMana: 250,
  spiritStones: 500,
  combatPower: 1250,
  lifespan: 18,
  maxLifespan: 100,
  reputation: 50,
  spiritualRoot: 'Thiên Linh Căn',
  spiritualRootBonus: 1.5,
  sect: 'Thanh Vân Tông',
  sectRole: 'Đệ Tử',
  role: 'Player',
  isAutoMeditation: false,
  equippedItems: {},
};

const INITIAL_INVENTORY: Item[] = [
  {
    id: 'item-1',
    name: 'Thanh Phong Phi Kiếm',
    type: 'Equipment',
    rarity: 'Huyền',
    description: 'Phi kiếm lướt gió như chớp, đao khí bén ngót trợ uy sát thương.',
    icon: '🗡️',
    stats: { atk: 120, expBoost: 0.1 },
    value: 300,
    quantity: 1,
  },
  {
    id: 'item-2',
    name: 'Đột Phá Đan',
    type: 'Pill',
    rarity: 'Linh',
    description: 'Viên đan chứa linh khí thuần khiết, tăng 25% tỷ lệ thành công khi độ kiếp.',
    icon: '💊',
    stats: { successRateBoost: 0.25 },
    value: 150,
    quantity: 3,
  },
  {
    id: 'item-3',
    name: 'Tụ Khí Đan',
    type: 'Pill',
    rarity: 'Phàm',
    description: 'Tăng ngay 50 EXP tu vi.',
    icon: '🧪',
    stats: { expBoost: 50 },
    value: 50,
    quantity: 5,
  },
  {
    id: 'item-4',
    name: 'Vạn Niên Linh Chi',
    type: 'Material',
    rarity: 'Địa',
    description: 'Dược liệu quý hiếm hàng vạn năm dùng để luyện đan cao cấp.',
    icon: '🍄',
    value: 500,
    quantity: 2,
  },
];

const INITIAL_PETS: Pet[] = [
  {
    id: 'pet-1',
    name: 'Cửu Vĩ Thiên Hồ',
    rarity: 'Thiên',
    level: 5,
    exp: 240,
    maxExp: 500,
    avatar: '🦊',
    skill: 'Mê Hồn Trận (Tăng 15% bạo kích)',
    combatBonus: 450,
    element: 'Hỏa',
  },
];

const INITIAL_QUESTS: Quest[] = [
  {
    id: 'q-1',
    title: 'Bước Đầu Tu Tiên',
    description: 'Bế quan tu luyện đạt 100 EXP.',
    type: 'main',
    target: 100,
    current: 80,
    rewardExp: 50,
    rewardStones: 200,
    completed: false,
    claimed: false,
  },
  {
    id: 'q-2',
    title: 'Hái Thần Dược',
    description: 'Thu thập 2 Vạn Niên Linh Chi từ Bí Cảnh.',
    type: 'daily',
    target: 2,
    current: 2,
    rewardExp: 80,
    rewardStones: 150,
    completed: true,
    claimed: false,
  },
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    title: 'Đột Phá Lần Đầu',
    description: 'Thành công độ kiếp bứt phá giới hạn bản thân.',
    icon: '⚡',
    unlocked: false,
    rewardStones: 500,
  },
  {
    id: 'ach-2',
    title: 'Sở Hữu Thần Thú',
    description: 'Thu phục linh thú cấp Thiên trở lên.',
    icon: '🦊',
    unlocked: true,
    rewardStones: 1000,
  },
];

export interface GameSnapshot {
  character: Character;
  inventory: Item[];
  pets: Pet[];
  quests: Quest[];
  achievements: Achievement[];
}

interface GameState extends GameSnapshot {
  character: Character;
  inventory: Item[];
  pets: Pet[];
  quests: Quest[];
  achievements: Achievement[];
  marketListings: MarketListing[];
  isDemonMode: boolean;
  activeTribulation: boolean;
  tribulationSuccess: boolean;
  currentAccountEmail: string;
  isAuthenticated: boolean;

  // Actions
  loginAccount: (email: string, role?: 'Player' | 'Admin', savedState?: Partial<GameSnapshot> | null) => void;
  logoutAccount: () => void;
  setRole: (role: 'Player' | 'Moderator' | 'Admin') => void;
  toggleTheme: () => void;
  createCharacter: (name: string, root: SpiritualRootType, sect: string) => void;
  addExp: (amount: number) => void;
  meditate: (durationMinutes: number) => void;
  attemptBreakthrough: (usePill?: boolean) => boolean;
  equipItem: (item: Item) => void;
  unequipItem: (slot: keyof Character['equippedItems']) => void;
  usePill: (item: Item) => void;
  sellItem: (itemId: string) => void;
  craftItem: (craftedItem: Item, materialsUsed: string[], costStones?: number) => void;
  buyMarketItem: (listingId: string) => void;
  claimQuestReward: (questId: string) => void;
  closeTribulationModal: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  character: INITIAL_CHARACTER,
  inventory: INITIAL_INVENTORY,
  pets: INITIAL_PETS,
  quests: INITIAL_QUESTS,
  achievements: INITIAL_ACHIEVEMENTS,
  currentAccountEmail: '',
  isAuthenticated: false,
  marketListings: [
    {
      id: 'm-1',
      sellerName: 'Thanh Vân Lão Tổ',
      item: {
        id: 'm-item-1',
        name: 'Trúc Cơ Đan Thượng Phẩm',
        type: 'Pill',
        rarity: 'Địa',
        description: 'Tăng 40% tỷ lệ đột phá Trúc Cơ.',
        icon: '🔮',
        value: 800,
      },
      price: 650,
      isAuction: true,
      auctionEndTime: '10:00',
      highestBid: 700,
      highestBidder: 'Tiên Tôn Huyết Ma',
    },
  ],
  isDemonMode: false,
  activeTribulation: false,
  tribulationSuccess: false,

  loginAccount: (email, role, savedState) => {
    const cleanEmail = email.toLowerCase();
    const isAdmin = role === 'Admin' || cleanEmail.includes('admin');

    if (savedState?.character) {
      set({
        currentAccountEmail: cleanEmail,
        isAuthenticated: true,
        character: { ...savedState.character, role: isAdmin ? 'Admin' : savedState.character.role },
        inventory: savedState.inventory || INITIAL_INVENTORY,
        pets: savedState.pets || INITIAL_PETS,
        quests: savedState.quests || INITIAL_QUESTS,
        achievements: savedState.achievements || INITIAL_ACHIEVEMENTS,
      });
      return;
    }

    if (isAdmin) {
      const adminChar = {
        id: 'admin-001',
        name: 'Quản Trị Viên Huyết Lệnh',
        title: 'Chủ Tể Thiên Đạo',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        avatarFrame: 'gold',
        vipLevel: 10,
        realm: 'Tiên Đế' as RealmTier,
        realmLevel: 4,
        exp: 2900000,
        maxExp: 3000000,
        spiritualPower: 9999,
        maxSpiritualPower: 9999,
        hp: 99999,
        maxHp: 99999,
        mana: 50000,
        maxMana: 50000,
        spiritStones: 999999,
        combatPower: 999999,
        lifespan: 9999,
        maxLifespan: 9999,
        reputation: 9999,
        spiritualRoot: 'Thiên Linh Căn' as SpiritualRootType,
        spiritualRootBonus: 2.5,
        sect: 'Thái Hư Cung',
        sectRole: 'Tông Chủ' as const,
        role: 'Admin' as const,
        isAutoMeditation: false,
        equippedItems: {},
      };
      set({
        currentAccountEmail: cleanEmail,
        isAuthenticated: true,
        character: adminChar,
        inventory: INITIAL_INVENTORY,
        pets: INITIAL_PETS,
        quests: INITIAL_QUESTS,
        achievements: INITIAL_ACHIEVEMENTS,
      });
    } else {
      // Normal Player profile switch
      const userName = email.split('@')[0];
      const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);
      const playerChar = {
        ...INITIAL_CHARACTER,
        id: `usr-${Date.now()}`,
        name: formattedName === 'Bactien.tudao' ? 'Bắc Phong' : `Tu Sĩ ${formattedName}`,
        role: 'Player' as const,
      };
      set({
        currentAccountEmail: cleanEmail,
        isAuthenticated: true,
        character: playerChar,
        inventory: INITIAL_INVENTORY,
        pets: INITIAL_PETS,
        quests: INITIAL_QUESTS,
        achievements: INITIAL_ACHIEVEMENTS,
      });
    }
  },

  logoutAccount: () => {
    apiClient.clearSession();
    set({
      character: INITIAL_CHARACTER,
      currentAccountEmail: '',
      isAuthenticated: false,
    });
  },

  setRole: (role) =>
    set((state) => ({
      character: {
        ...state.character,
        role,
      },
    })),

  toggleTheme: () => set((state) => ({ isDemonMode: !state.isDemonMode })),

  createCharacter: (name, spiritualRoot, sect) => {
    const rootBonusMap: Record<SpiritualRootType, number> = {
      'Kim': 1.1,
      'Mộc': 1.1,
      'Thủy': 1.1,
      'Hỏa': 1.15,
      'Thổ': 1.1,
      'Song Linh Căn': 1.3,
      'Biến Dị Linh Căn': 1.6,
      'Thiên Linh Căn': 2.0,
    };

    set((state) => ({
      character: {
        ...state.character,
        name,
        spiritualRoot,
        spiritualRootBonus: rootBonusMap[spiritualRoot] || 1.2,
        sect,
        exp: 0,
        realm: 'Luyện Khí',
        realmLevel: 1,
      },
    }));
  },

  addExp: (amount) => {
    set((state) => {
      const char = state.character;
      const bonusAmount = Math.floor(amount * char.spiritualRootBonus);
      const newExp = char.exp + bonusAmount;
      return {
        character: {
          ...char,
          exp: Math.min(newExp, char.maxExp),
        },
      };
    });
  },

  meditate: (durationMinutes) => {
    const state = get();
    const expGain = durationMinutes * 15 * state.character.spiritualRootBonus;
    const stonesGain = Math.floor(durationMinutes * 3);
    const spGain = durationMinutes * 10;

    set((s) => ({
      character: {
        ...s.character,
        exp: Math.min(s.character.exp + expGain, s.character.maxExp),
        spiritStones: s.character.spiritStones + stonesGain,
        spiritualPower: Math.min(s.character.spiritualPower + spGain, s.character.maxSpiritualPower),
      },
    }));
  },

  attemptBreakthrough: (usePill = false) => {
    const state = get();
    const { character, inventory } = state;

    let baseRate = 0.6; // 60% base chance
    if (usePill) {
      baseRate += 0.25; // Pill adds 25%
      // Consume one Breakthrough pill
      const pillIndex = inventory.findIndex((i) => i.name === 'Đột Phá Đan');
      if (pillIndex !== -1) {
        const updatedInventory = [...inventory];
        if ((updatedInventory[pillIndex].quantity || 1) > 1) {
          updatedInventory[pillIndex].quantity! -= 1;
        } else {
          updatedInventory.splice(pillIndex, 1);
        }
        set({ inventory: updatedInventory });
      }
    }

    const success = Math.random() <= baseRate;

    if (success) {
      const currentIdx = REALM_ORDER.indexOf(character.realm);
      let nextRealm = character.realm;
      let nextLevel = character.realmLevel + 1;

      if (nextLevel > 4) {
        nextLevel = 1;
        if (currentIdx < REALM_ORDER.length - 1) {
          nextRealm = REALM_ORDER[currentIdx + 1];
        }
      }

      const newMaxExp = REALM_MAX_EXP[nextRealm] * nextLevel;
      const newCombatPower = Math.floor(character.combatPower * 1.35);

      set({
        activeTribulation: true,
        tribulationSuccess: true,
        character: {
          ...character,
          realm: nextRealm,
          realmLevel: nextLevel,
          exp: 0,
          maxExp: newMaxExp,
          combatPower: newCombatPower,
          maxHp: Math.floor(character.maxHp * 1.25),
          hp: Math.floor(character.maxHp * 1.25),
        },
      });
    } else {
      // Failure penalties: lose 30% exp
      const penalizedExp = Math.floor(character.exp * 0.7);
      set({
        activeTribulation: true,
        tribulationSuccess: false,
        character: {
          ...character,
          exp: penalizedExp,
        },
      });
    }

    return success;
  },

  equipItem: (item) => {
    set((state) => {
      const equipped = { ...state.character.equippedItems };
      if (item.type === 'Equipment') {
        equipped.weapon = item;
      }
      return {
        character: {
          ...state.character,
          equippedItems: equipped,
          combatPower: state.character.combatPower + (item.stats?.atk || 50),
        },
      };
    });
  },

  unequipItem: (slot) => {
    set((state) => {
      const equipped = { ...state.character.equippedItems };
      const item = equipped[slot];
      delete equipped[slot];
      return {
        character: {
          ...state.character,
          equippedItems: equipped,
          combatPower: Math.max(100, state.character.combatPower - (item?.stats?.atk || 50)),
        },
      };
    });
  },

  usePill: (item) => {
    set((state) => {
      const newExp = state.character.exp + (item.stats?.expBoost || 50);
      return {
        character: {
          ...state.character,
          exp: Math.min(newExp, state.character.maxExp),
        },
      };
    });
  },

  sellItem: (itemId) => {
    set((state) => {
      const idx = state.inventory.findIndex((i) => i.id === itemId);
      if (idx === -1) return state;

      const item = state.inventory[idx];
      const sellPrice = item.value || 50;
      const updatedInv = [...state.inventory];

      if ((updatedInv[idx].quantity || 1) > 1) {
        updatedInv[idx] = {
          ...updatedInv[idx],
          quantity: updatedInv[idx].quantity! - 1,
        };
      } else {
        updatedInv.splice(idx, 1);
      }

      return {
        character: {
          ...state.character,
          spiritStones: state.character.spiritStones + sellPrice,
        },
        inventory: updatedInv,
      };
    });
  },

  craftItem: (craftedItem, materialsUsed, costStones = 0) => {
    set((state) => ({
      character: {
        ...state.character,
        spiritStones: state.character.spiritStones - costStones,
      },
      inventory: [...state.inventory, craftedItem],
    }));
  },

  buyMarketItem: (listingId) => {
    set((state) => {
      const listing = state.marketListings.find((m) => m.id === listingId);
      if (!listing || state.character.spiritStones < listing.price) return state;

      return {
        character: {
          ...state.character,
          spiritStones: state.character.spiritStones - listing.price,
        },
        inventory: [...state.inventory, listing.item],
        marketListings: state.marketListings.filter((m) => m.id !== listingId),
      };
    });
  },

  claimQuestReward: (questId) => {
    set((state) => {
      const quest = state.quests.find((q) => q.id === questId);
      if (!quest || quest.claimed) return state;

      return {
        character: {
          ...state.character,
          exp: Math.min(state.character.exp + quest.rewardExp, state.character.maxExp),
          spiritStones: state.character.spiritStones + quest.rewardStones,
        },
        quests: state.quests.map((q) => (q.id === questId ? { ...q, claimed: true } : q)),
      };
    });
  },

  closeTribulationModal: () => set({ activeTribulation: false }),
}));

let saveTimer: ReturnType<typeof setTimeout> | undefined;

useGameStore.subscribe((state, previousState) => {
  if (!state.isAuthenticated) return;

  const gameDataChanged =
    state.character !== previousState.character ||
    state.inventory !== previousState.inventory ||
    state.pets !== previousState.pets ||
    state.quests !== previousState.quests ||
    state.achievements !== previousState.achievements;

  if (!gameDataChanged && previousState.isAuthenticated) return;

  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    void apiClient.saveGameState({
      character: state.character,
      inventory: state.inventory,
      pets: state.pets,
      quests: state.quests,
      achievements: state.achievements,
    });
  }, 350);
});
