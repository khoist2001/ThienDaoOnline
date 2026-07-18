import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Item } from '../../types/game';
import { soundManager } from '../../services/SoundManager';

const ALCHEMY_RECIPES: {
  id: string;
  name: string;
  rarity: 'Phàm' | 'Linh' | 'Huyền' | 'Địa';
  icon: string;
  successRate: number;
  costHerbs: number;
  expBoost?: number;
  successRateBoost?: number;
  description: string;
}[] = [
  {
    id: 'a-1',
    name: 'Tụ Khí Đan',
    rarity: 'Phàm',
    icon: '🧪',
    successRate: 90,
    costHerbs: 2,
    expBoost: 50,
    description: 'Ngưng tụ linh khí天地 gia tăng ngay 50 EXP tu vi.',
  },
  {
    id: 'a-2',
    name: 'Trúc Cơ Đan',
    rarity: 'Linh',
    icon: '💊',
    successRate: 75,
    costHerbs: 5,
    successRateBoost: 0.25,
    description: 'Thần đan hỗ trợ đột phá Trúc Cơ, tăng 25% tỷ lệ thành công.',
  },
  {
    id: 'a-3',
    name: 'Kim Đan Thần Hiệu',
    rarity: 'Huyền',
    icon: '🔮',
    successRate: 60,
    costHerbs: 8,
    expBoost: 300,
    description: 'Viên đan phát ánh hào quang Kim Đan ban thưởng 300 EXP tu vi.',
  },
  {
    id: 'a-4',
    name: 'Hồi Linh Đan',
    rarity: 'Địa',
    icon: '✨',
    successRate: 80,
    costHerbs: 4,
    description: 'Hồi phục ngay lập tức 100% Khí Huyết và Linh Lực.',
  },
];

export const AlchemyPanel: React.FC = () => {
  const { craftItem } = useGameStore();
  const [selectedRecipe, setSelectedRecipe] = useState(ALCHEMY_RECIPES[0]);
  const [isBrewing, setIsBrewing] = useState(false);
  const [herbCount, setHerbCount] = useState(10);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const handleBrew = () => {
    soundManager.playClick();
    if (herbCount < selectedRecipe.costHerbs) {
      setResultMessage('Không đủ Dược Liệu Linh Chi để luyện đan!');
      return;
    }

    setIsBrewing(true);
    setResultMessage(null);

    setTimeout(() => {
      setHerbCount((prev) => prev - selectedRecipe.costHerbs);
      const roll = Math.random() * 100;
      const success = roll <= selectedRecipe.successRate;

      if (success) {
        const newPill: Item = {
          id: `pill-${Date.now()}`,
          name: selectedRecipe.name,
          type: 'Pill',
          rarity: selectedRecipe.rarity,
          description: selectedRecipe.description,
          icon: selectedRecipe.icon,
          stats: {
            expBoost: selectedRecipe.expBoost,
            successRateBoost: selectedRecipe.successRateBoost,
          },
          value: 120,
          quantity: 1,
        };
        craftItem(newPill, []);
        soundManager.playBreakthroughSound(true);
        setResultMessage(`🎉 Luyện đan đại thành công! Thu hoạch [${selectedRecipe.name}]!`);
      } else {
        soundManager.playBreakthroughSound(false);
        setResultMessage('💥 Lửa lò nung quá nhiệt làm cháy xém dược liệu!');
      }

      setIsBrewing(false);
    }, 1800);
  };

  return (
    <div className="w-full bg-slate-950/80 border border-xianxia-jade/30 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="font-title text-2xl sm:text-3xl text-jade-gradient">
            LUYỆN ĐAN PHÒNG
          </h2>
          <p className="font-subheading text-slate-300 text-xs sm:text-sm">
            Thu thập thần dược, luyện chế linh đan nâng cao tu vi và tỷ lệ độ kiếp
          </p>
        </div>

        <div className="bg-slate-900 border border-xianxia-jade/30 px-4 py-2 rounded-xl text-xs font-bold text-xianxia-jade flex items-center space-x-2">
          <span>🌿 Linh Chi Sở Hữu:</span>
          <span className="text-base text-slate-100">{herbCount}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recipes */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-xianxia-jade uppercase tracking-wider">
            Đan Phương Thần Đan
          </h3>
          {ALCHEMY_RECIPES.map((r) => (
            <div
              key={r.id}
              onClick={() => {
                soundManager.playClick();
                setSelectedRecipe(r);
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedRecipe.id === r.id
                  ? 'bg-slate-900 border-xianxia-jade shadow-xianxia-jade'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{r.icon}</span>
                <div>
                  <div className="font-bold text-sm text-slate-100">{r.name}</div>
                  <div className="text-xs text-xianxia-jade font-subheading">
                    Cần: {r.costHerbs} Dược Liệu • Tỷ Lệ: {r.successRate}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Alchemy Pot Center */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-xl border border-slate-800 p-6 flex flex-col items-center justify-between text-center space-y-6">
          <div className="relative flex items-center justify-center py-6">
            <div className={`w-36 h-36 rounded-full border-2 border-dashed border-xianxia-jade flex items-center justify-center transition-all ${
              isBrewing ? 'animate-spin-slow scale-110 shadow-xianxia-jade' : 'opacity-60'
            }`}>
              <span className="text-6xl animate-pulse">🧪</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-title text-2xl text-xianxia-jade">
              {selectedRecipe.name}
            </h4>
            <p className="text-xs text-slate-300 italic max-w-md mx-auto">
              "{selectedRecipe.description}"
            </p>
          </div>

          {resultMessage && (
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-700 text-xs font-subheading text-slate-200">
              {resultMessage}
            </div>
          )}

          <button
            disabled={isBrewing || herbCount < selectedRecipe.costHerbs}
            onClick={handleBrew}
            className="px-8 py-3 rounded-xl font-subheading font-bold text-slate-950 bg-xianxia-jade hover:bg-xianxia-jade-light transition-all shadow-xianxia-jade disabled:opacity-50"
          >
            {isBrewing ? 'Đang Ngưng Tụ Đan Dược...' : 'Khai Lò Luyện Đan'}
          </button>
        </div>
      </div>
    </div>
  );
};
