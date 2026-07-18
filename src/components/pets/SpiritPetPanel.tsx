import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Pet } from '../../types/game';
import { soundManager } from '../../services/SoundManager';

export const SpiritPetPanel: React.FC = () => {
  const { pets, character } = useGameStore();
  const [activePetList, setActivePetList] = useState<Pet[]>(pets);
  const [selectedPet, setSelectedPet] = useState<Pet>(pets[0] || {
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
  });

  const handleFeed = () => {
    soundManager.playClick();
    if (!selectedPet) return;
    const newExp = selectedPet.exp + 100;
    let newLevel = selectedPet.level;
    let newMaxExp = selectedPet.maxExp;
    let newBonus = selectedPet.combatBonus;

    if (newExp >= selectedPet.maxExp) {
      newLevel += 1;
      newMaxExp += 250;
      newBonus += 120;
    }

    const updated = {
      ...selectedPet,
      level: newLevel,
      exp: newExp >= selectedPet.maxExp ? 0 : newExp,
      maxExp: newMaxExp,
      combatBonus: newBonus,
    };

    setSelectedPet(updated);
    setActivePetList((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleCaptureNewPet = () => {
    soundManager.playClick();
    const newPetList: Pet[] = [
      {
        id: `pet-${Date.now()}`,
        name: 'Thượng Cổ Lôi Lân',
        rarity: 'Tiên',
        level: 1,
        exp: 0,
        maxExp: 300,
        avatar: '🦄',
        skill: 'Cuồng Lôi Giáng Lâm (Tăng 20% sát thương)',
        combatBonus: 300,
        element: 'Lôi',
      },
      {
        id: `pet-${Date.now() + 1}`,
        name: 'Hắc Ma Ưu Đản',
        rarity: 'Huyền',
        level: 1,
        exp: 0,
        maxExp: 200,
        avatar: '🦅',
        skill: 'Ám Ma Khí (Giảm 10% phòng thủ địch)',
        combatBonus: 180,
        element: 'Thần',
      },
    ];
    const rolled = newPetList[Math.floor(Math.random() * newPetList.length)];
    setActivePetList((prev) => [...prev, rolled]);
    setSelectedPet(rolled);
  };

  return (
    <div className="w-full bg-slate-950/80 border border-purple-500/30 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="font-title text-2xl sm:text-3xl text-purple-300">
            LINH THÚ THẦN DƯỠNG
          </h2>
          <p className="font-subheading text-slate-300 text-xs sm:text-sm">
            Thu phục linh thú, nuôi dưỡng tiến hóa và gia tăng lực chiến trợ chiến
          </p>
        </div>

        <button
          onClick={handleCaptureNewPet}
          className="px-4 py-2 bg-purple-900/40 border border-purple-500/40 hover:bg-purple-900/70 text-purple-200 text-xs font-bold rounded-xl transition-all"
        >
          🕸️ Bắt Linh Thú Mới
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pet List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
            Linh Thú Đã Thu Phục ({activePetList.length})
          </h3>
          {activePetList.map((p) => (
            <div
              key={p.id}
              onClick={() => {
                soundManager.playClick();
                setSelectedPet(p);
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedPet.id === p.id
                  ? 'bg-slate-900 border-purple-400 shadow-xianxia-demon'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-4xl p-2 bg-slate-950 rounded-full">{p.avatar}</span>
                <div>
                  <div className="font-bold text-sm text-slate-100">{p.name}</div>
                  <div className="text-xs text-purple-300">
                    Cấp {p.level} • Phẩm: {p.rarity} • Hệ: {p.element}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pet Details & Evolution */}
        {selectedPet && (
          <div className="lg:col-span-2 bg-slate-900/90 rounded-xl border border-slate-800 p-6 flex flex-col justify-between space-y-6">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="text-7xl p-6 bg-slate-950 rounded-full border border-purple-500/40 shadow-xl">
                {selectedPet.avatar}
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <h3 className="font-title text-3xl text-purple-300">{selectedPet.name}</h3>
                <div className="text-xs text-slate-300">
                  Kỹ năng đặc biệt: <strong className="text-xianxia-gold">{selectedPet.skill}</strong>
                </div>
                <div className="text-xs text-amber-400 font-bold">
                  ⚡ Cộng Lực Chiến Trợ Chiến: +{selectedPet.combatBonus}
                </div>
              </div>
            </div>

            {/* EXP Bar */}
            <div className="space-y-1 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Cấp Độ: {selectedPet.level}</span>
                <span>EXP: {selectedPet.exp} / {selectedPet.maxExp}</span>
              </div>
              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-400 transition-all duration-300"
                  style={{ width: `${(selectedPet.exp / selectedPet.maxExp) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleFeed}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 font-subheading font-bold text-white rounded-xl transition-all shadow-lg"
              >
                🍖 Cho Ăn Linh Đan (+100 EXP)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
