import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Item } from '../../types/game';
import { soundManager } from '../../services/SoundManager';

const FORGING_RECIPES: {
  id: string;
  name: string;
  type: 'Equipment' | 'Artifact';
  rarity: 'Huyền' | 'Địa' | 'Thiên' | 'Tiên' | 'Thần';
  icon: string;
  costStones: number;
  successRate: number;
  stats: { atk: number; def?: number };
  description: string;
}[] = [
  {
    id: 'f-1',
    name: 'Bạch Hạc Thần Kiếm',
    type: 'Equipment',
    rarity: 'Huyền',
    icon: '🗡️',
    costStones: 300,
    successRate: 85,
    stats: { atk: 250 },
    description: 'Thần kiếm đúc từ lông Tiên Hạc, kiếm khí bay bổng như hạc múa.',
  },
  {
    id: 'f-2',
    name: 'Cửu Nhất Thần Đỉnh',
    type: 'Artifact',
    rarity: 'Địa',
    icon: '🏺',
    costStones: 600,
    successRate: 70,
    stats: { atk: 400, def: 200 },
    description: 'Thần đỉnh chứa ngọn lửa tam muội, trợ uy luyện đan và trấn áp tà ma.',
  },
  {
    id: 'f-3',
    name: 'Thiên Ma Trảm Thần Đao',
    type: 'Equipment',
    rarity: 'Thiên',
    icon: '⚔️',
    costStones: 1200,
    successRate: 50,
    stats: { atk: 850 },
    description: 'Bá đao tàn nhẫn của Ma Giới, uấn thiềm sát khí khiến thần ma khiếp sợ.',
  },
];

export const ForgingPanel: React.FC = () => {
  const { character, craftItem } = useGameStore();
  const [selectedRecipe, setSelectedRecipe] = useState(FORGING_RECIPES[0]);
  const [isForging, setIsForging] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const handleForge = () => {
    soundManager.playClick();
    if (character.spiritStones < selectedRecipe.costStones) {
      setResultMessage('Không đủ Linh Thạch để đúc pháp bảo!');
      return;
    }

    setIsForging(true);
    setResultMessage(null);

    setTimeout(() => {
      const roll = Math.random() * 100;
      const success = roll <= selectedRecipe.successRate;

      if (success) {
        const newItem: Item = {
          id: `crafted-${Date.now()}`,
          name: selectedRecipe.name,
          type: selectedRecipe.type,
          rarity: selectedRecipe.rarity,
          description: selectedRecipe.description,
          icon: selectedRecipe.icon,
          stats: selectedRecipe.stats,
          value: selectedRecipe.costStones * 1.5,
          quantity: 1,
        };
        craftItem(newItem, [], selectedRecipe.costStones);
        soundManager.playBreakthroughSound(true);
        setResultMessage(`🎉 Rèn đúc đại thành công! Nhận được [${selectedRecipe.name}]!`);
      } else {
        // Deduct spirit stones on failure (materials consumed)
        useGameStore.setState((state) => ({
          character: {
            ...state.character,
            spiritStones: state.character.spiritStones - selectedRecipe.costStones,
          },
        }));
        soundManager.playBreakthroughSound(false);
        setResultMessage('💥 Lò luyện bộc phát, rèn đúc thất bại làm hao tổn nguyên liệu!');
      }

      setIsForging(false);
    }, 2000);
  };

  return (
    <div className="w-full bg-slate-950/80 border border-xianxia-gold/30 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="space-y-1 text-center md:text-left">
        <h2 className="font-title text-2xl sm:text-3xl text-gold-gradient">
          LUYỆN KHÍ - ĐÚC PHÁP BẢO
        </h2>
        <p className="font-subheading text-slate-300 text-xs sm:text-sm">
          Sử dụng lò nung linh khí để chế tạo Thần Kiếm, Bảo Đỉnh và Trang Bị quý hiếm
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recipe List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-xianxia-gold uppercase tracking-wider">
            Bản Thiết Kế Pháp Bảo
          </h3>
          {FORGING_RECIPES.map((r) => (
            <div
              key={r.id}
              onClick={() => {
                soundManager.playClick();
                setSelectedRecipe(r);
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedRecipe.id === r.id
                  ? 'bg-slate-900 border-xianxia-gold shadow-xianxia-gold'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{r.icon}</span>
                <div>
                  <div className="font-bold text-sm text-slate-100">{r.name}</div>
                  <div className="text-xs text-amber-400 font-subheading">
                    Phẩm cấp: {r.rarity} • Tỷ lệ: {r.successRate}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cauldron Furnace Center */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-xl border border-slate-800 p-6 flex flex-col items-center justify-between text-center space-y-6">
          <div className="relative flex items-center justify-center py-6">
            <div className={`w-36 h-36 rounded-full border-2 border-dashed border-rose-500 flex items-center justify-center transition-all ${
              isForging ? 'animate-spin-slow scale-110 shadow-xianxia-cinnabar' : 'opacity-60'
            }`}>
              <span className="text-6xl animate-pulse">🔥</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-title text-2xl text-xianxia-gold">
              {selectedRecipe.name}
            </h4>
            <p className="text-xs text-slate-300 italic max-w-md mx-auto">
              "{selectedRecipe.description}"
            </p>
            <div className="text-xs text-amber-400 font-bold">
              Chi phí đúc: {selectedRecipe.costStones} 💎 Linh Thạch
            </div>
          </div>

          {resultMessage && (
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-700 text-xs font-subheading text-slate-200 animate-fade-in">
              {resultMessage}
            </div>
          )}

          <button
            disabled={isForging || character.spiritStones < selectedRecipe.costStones}
            onClick={handleForge}
            className="px-8 py-3 rounded-xl font-subheading font-bold text-slate-950 bg-xianxia-gold hover:bg-xianxia-gold-light transition-all shadow-xianxia-gold disabled:opacity-50"
          >
            {isForging ? 'Đang Khai Lò Luyện Khí...' : 'Khai Lò Rèn Đúc'}
          </button>
        </div>
      </div>
    </div>
  );
};
