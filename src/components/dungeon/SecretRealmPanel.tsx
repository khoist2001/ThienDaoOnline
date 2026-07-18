import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { DungeonBoss } from '../../types/game';
import { CombatReplayModal } from './CombatReplayModal';
import { soundManager } from '../../services/SoundManager';

const DUNGEON_BOSSES: DungeonBoss[] = [
  {
    id: 'boss-1',
    name: 'Vạn Niên Huyết Mãng',
    realm: 'Trúc Cơ Kỳ',
    hp: 1200,
    maxHp: 1200,
    atk: 180,
    def: 60,
    avatar: '🐍',
    rewards: { exp: 200, spiritStones: 350, itemDropRate: 0.8 },
  },
  {
    id: 'boss-2',
    name: 'Cửu Thiên Hỏa Phượng',
    realm: 'Kim Đan Kỳ',
    hp: 3500,
    maxHp: 3500,
    atk: 450,
    def: 180,
    avatar: '🦅',
    rewards: { exp: 600, spiritStones: 900, itemDropRate: 0.9 },
  },
  {
    id: 'boss-3',
    name: 'Thượng Cổ Ma Long',
    realm: 'Nguyên Anh Kỳ',
    hp: 8000,
    maxHp: 8000,
    atk: 950,
    def: 400,
    avatar: '🐉',
    rewards: { exp: 1500, spiritStones: 2500, itemDropRate: 1.0 },
  },
];

export const SecretRealmPanel: React.FC = () => {
  const { character } = useGameStore();
  const [selectedBoss, setSelectedBoss] = useState<DungeonBoss>(DUNGEON_BOSSES[0]);
  const [activeBattle, setActiveBattle] = useState<DungeonBoss | null>(null);

  const handleStartChallenge = (boss: DungeonBoss) => {
    soundManager.playClick();
    setActiveBattle(boss);
  };

  return (
    <div className="w-full bg-slate-950/80 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="font-title text-2xl sm:text-3xl text-gold-gradient">
          BÍ CẢNH THƯỢNG CỔ
        </h2>
        <p className="font-subheading text-slate-300 text-xs sm:text-sm">
          Khám phá di tích cổ đại, khiêu chiến Yêu Thần và thu thập Linh Thạch, Dược Liệu
        </p>
      </div>

      {/* Boss Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DUNGEON_BOSSES.map((boss) => (
          <div
            key={boss.id}
            className={`bg-slate-900/90 rounded-2xl border p-6 flex flex-col justify-between space-y-4 transition-all hover:scale-105 ${
              selectedBoss.id === boss.id
                ? 'border-amber-400 shadow-xianxia-gold'
                : 'border-slate-800 hover:border-slate-600'
            }`}
          >
            <div className="text-center space-y-2">
              <div className="text-6xl p-4 bg-slate-950 rounded-full w-24 h-24 mx-auto flex items-center justify-center border border-amber-500/30 shadow-lg">
                {boss.avatar}
              </div>
              <h3 className="font-title text-2xl text-amber-300">{boss.name}</h3>
              <span className="inline-block px-3 py-1 bg-amber-950/60 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-full">
                Cảnh giới: {boss.realm}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span>Khí Huyết (HP):</span>
                <span className="text-rose-400 font-bold">{boss.hp}</span>
              </div>
              <div className="flex justify-between">
                <span>Sức Tấn Công:</span>
                <span className="text-amber-400 font-bold">{boss.atk}</span>
              </div>
              <div className="flex justify-between">
                <span>Phần Thưởng:</span>
                <span className="text-xianxia-gold font-bold">+{boss.rewards.exp} EXP • {boss.rewards.spiritStones} 💎</span>
              </div>
            </div>

            <button
              onClick={() => handleStartChallenge(boss)}
              className="w-full py-2.5 rounded-xl font-subheading font-bold text-slate-950 bg-xianxia-gold hover:bg-xianxia-gold-light transition-all shadow-xianxia-gold"
            >
              ⚔️ Khiêu Chiến Bí Cảnh
            </button>
          </div>
        ))}
      </div>

      {/* Battle Replay Modal */}
      {activeBattle && (
        <CombatReplayModal
          boss={activeBattle}
          player={character}
          onClose={() => setActiveBattle(null)}
        />
      )}
    </div>
  );
};
