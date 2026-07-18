import React from 'react';
import { useGameStore } from '../../store/gameStore';

const REALM_LEVEL_NAMES: Record<number, string> = {
  1: 'Sơ Kỳ',
  2: 'Trung Kỳ',
  3: 'Hậu Kỳ',
  4: 'Đỉnh Phong',
};

export const CharacterDashboard: React.FC<{ onOpenBreakthrough: () => void }> = ({
  onOpenBreakthrough,
}) => {
  const { character } = useGameStore();

  const expPercentage = Math.min(100, Math.floor((character.exp / character.maxExp) * 100));

  return (
    <div className="w-full bg-slate-950/80 backdrop-blur-md border border-xianxia-gold/30 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6">
      {/* Top Main Section */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        {/* Avatar & Frame */}
        <div className="relative flex-shrink-0">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-xianxia-gold via-amber-500 to-amber-200 shadow-xianxia-gold animate-glow-pulse">
            <img
              src={character.avatar}
              alt={character.name}
              className="w-full h-full object-cover rounded-full border-2 border-slate-950"
            />
          </div>
          {/* VIP Badge */}
          <div className="absolute -bottom-2 right-0 bg-gradient-to-r from-amber-500 to-xianxia-gold text-slate-950 font-extrabold text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full border border-yellow-200 shadow-lg">
            VIP {character.vipLevel}
          </div>
        </div>

        {/* Character Info & Realm */}
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3">
            <h1 className="font-title text-2xl sm:text-3xl text-gold-gradient tracking-wider">
              {character.name}
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-subheading text-xianxia-jade bg-xianxia-jade/10 border border-xianxia-jade/30 rounded-full">
              {character.title}
            </span>
            <span className="px-2.5 py-0.5 text-xs font-subheading text-purple-300 bg-purple-900/30 border border-purple-500/30 rounded-full">
              {character.sect} ({character.sectRole})
            </span>
          </div>

          {/* Realm & Spiritual Root */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <div className="flex items-center space-x-2 bg-amber-950/60 border border-amber-500/40 px-3 py-1 rounded-lg">
              <span className="text-amber-400 font-bold text-sm">Cảnh Giới:</span>
              <span className="text-xianxia-gold font-bold text-base font-subheading">
                {character.realm} - {REALM_LEVEL_NAMES[character.realmLevel] || 'Sơ Kỳ'}
              </span>
            </div>

            <div className="flex items-center space-x-2 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-lg">
              <span className="text-emerald-400 font-bold text-sm">Linh Căn:</span>
              <span className="text-emerald-200 font-semibold text-xs sm:text-sm">
                {character.spiritualRoot} (+{Math.round((character.spiritualRootBonus - 1) * 100)}% Speed)
              </span>
            </div>
          </div>
        </div>

        {/* Combat Power & Action Buttons */}
        <div className="flex flex-col items-center md:items-end justify-between space-y-3">
          <div className="text-center md:text-right bg-slate-900/90 border border-amber-500/30 px-4 py-2 rounded-xl">
            <div className="text-xs text-slate-400 font-subheading">LỰC CHIẾN BÁ ĐẠO</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gold-gradient tracking-widest drop-shadow-md">
              ⚡ {character.combatPower.toLocaleString('vi-VN')}
            </div>
          </div>

          <button
            onClick={onOpenBreakthrough}
            className={`px-5 py-2 rounded-lg font-subheading font-bold text-slate-950 transition-all transform hover:scale-105 shadow-lg ${
              expPercentage >= 100
                ? 'bg-gradient-to-r from-amber-300 via-xianxia-gold to-yellow-500 animate-bounce shadow-xianxia-gold'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            ⚡ Đột Phá Cảnh Giới
          </button>
        </div>
      </div>

      {/* Progress Bars (EXP, HP, Mana, Spiritual Power) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
        {/* EXP Bar */}
        <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-amber-400">Tu Vi EXP</span>
            <span className="text-slate-300">{character.exp} / {character.maxExp} ({expPercentage}%)</span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-600 via-xianxia-gold to-yellow-300 transition-all duration-500 shadow-xianxia-gold"
              style={{ width: `${expPercentage}%` }}
            />
          </div>
        </div>

        {/* HP Bar */}
        <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-rose-400">Khí Huyết (HP)</span>
            <span className="text-slate-300">{character.hp} / {character.maxHp}</span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-700 to-rose-400 transition-all duration-500"
              style={{ width: `${Math.min(100, (character.hp / character.maxHp) * 100)}%` }}
            />
          </div>
        </div>

        {/* Mana Bar */}
        <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-cyan-400">Pháp Lực (Mana)</span>
            <span className="text-slate-300">{character.mana} / {character.maxMana}</span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-700 to-cyan-400 transition-all duration-500"
              style={{ width: `${Math.min(100, (character.mana / character.maxMana) * 100)}%` }}
            />
          </div>
        </div>

        {/* Spiritual Power Bar */}
        <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-purple-400">Linh Lực Tích Lũy</span>
            <span className="text-slate-300">{character.spiritualPower} / {character.maxSpiritualPower}</span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-700 to-purple-400 transition-all duration-500"
              style={{ width: `${Math.min(100, (character.spiritualPower / character.maxSpiritualPower) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Currency & Attribute Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="flex items-center space-x-3 bg-amber-950/30 border border-amber-500/20 p-2.5 rounded-xl">
          <span className="text-2xl">💎</span>
          <div>
            <div className="text-[11px] text-slate-400">Linh Thạch</div>
            <div className="font-bold text-xianxia-gold text-sm">{character.spiritStones.toLocaleString('vi-VN')}</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-emerald-950/30 border border-emerald-500/20 p-2.5 rounded-xl">
          <span className="text-2xl">⏳</span>
          <div>
            <div className="text-[11px] text-slate-400">Tuổi Thọ</div>
            <div className="font-bold text-emerald-300 text-sm">{character.lifespan} / {character.maxLifespan} Năm</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-purple-950/30 border border-purple-500/20 p-2.5 rounded-xl">
          <span className="text-2xl">🏆</span>
          <div>
            <div className="text-[11px] text-slate-400">Danh Vọng</div>
            <div className="font-bold text-purple-300 text-sm">{character.reputation}</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-rose-950/30 border border-rose-500/20 p-2.5 rounded-xl">
          <span className="text-2xl">⛩️</span>
          <div>
            <div className="text-[11px] text-slate-400">Tông Môn</div>
            <div className="font-bold text-rose-300 text-sm">{character.sect}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
