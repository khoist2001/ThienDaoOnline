import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { soundManager } from '../../services/SoundManager';

export const MeditationPanel: React.FC = () => {
  const { meditate, character } = useGameStore();
  const [isMeditating, setIsMeditating] = useState(false);
  const [activeDuration, setActiveDuration] = useState<number | null>(null);

  const handleStartMeditation = (minutes: number) => {
    soundManager.playClick();
    setIsMeditating(true);
    setActiveDuration(minutes);

    setTimeout(() => {
      meditate(minutes);
      setIsMeditating(false);
      setActiveDuration(null);
    }, 1500);
  };

  return (
    <div className="w-full bg-slate-950/80 border border-xianxia-gold/30 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="font-title text-2xl sm:text-3xl text-gold-gradient">
            BẾ QUAN TU LUYỆN
          </h2>
          <p className="font-subheading text-slate-300 text-xs sm:text-sm">
            Tĩnh tâm ngộ đạo, hấp thu thiên địa linh khí gia tăng tu vi và linh thạch
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 border border-xianxia-gold/20 px-3 py-1.5 rounded-lg text-xs font-semibold text-xianxia-gold">
          <span>✨ Tốc độ tu luyện:</span>
          <span>x{character.spiritualRootBonus} (Linh Căn)</span>
        </div>
      </div>

      {/* Meditation Visual Canvas Effect Container */}
      <div className="relative w-full h-48 sm:h-56 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col items-center justify-center overflow-hidden">
        {/* Animated Meditation Aura */}
        <div className="relative flex items-center justify-center">
          <div className={`w-32 h-32 rounded-full border-2 border-dashed border-xianxia-gold transition-all duration-1000 ${
            isMeditating ? 'animate-spin-slow scale-110 shadow-xianxia-gold' : 'opacity-40'
          }`} />
          
          <div className="absolute text-5xl sm:text-6xl animate-pulse">
            🧘‍♂️
          </div>
        </div>

        {isMeditating ? (
          <p className="mt-4 font-subheading text-xianxia-gold animate-pulse tracking-widest text-sm">
            Đang bế quan cảm ngộ ({activeDuration} phút)...
          </p>
        ) : (
          <p className="mt-4 font-subheading text-slate-400 text-xs tracking-wider">
            Lựa chọn thời gian nhập định bên dưới để tích lũy tu vi
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          disabled={isMeditating}
          onClick={() => handleStartMeditation(1)}
          className="p-4 rounded-xl border border-xianxia-gold/30 bg-slate-900 hover:bg-slate-800 text-xianxia-gold font-subheading font-bold text-sm sm:text-base transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          ⏱️ Tu Luyện 1 Phút
          <div className="text-[11px] font-normal text-slate-400 mt-1">+15 EXP • +3 Linh Thạch</div>
        </button>

        <button
          disabled={isMeditating}
          onClick={() => handleStartMeditation(10)}
          className="p-4 rounded-xl border border-xianxia-jade/30 bg-slate-900 hover:bg-slate-800 text-xianxia-jade font-subheading font-bold text-sm sm:text-base transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          ⏳ Tu Luyện 10 Phút
          <div className="text-[11px] font-normal text-slate-400 mt-1">+150 EXP • +30 Linh Thạch</div>
        </button>

        <button
          disabled={isMeditating}
          onClick={() => handleStartMeditation(60)}
          className="p-4 rounded-xl border border-purple-500/30 bg-slate-900 hover:bg-slate-800 text-purple-300 font-subheading font-bold text-sm sm:text-base transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          🌌 Tu Luyện 1 Giờ
          <div className="text-[11px] font-normal text-slate-400 mt-1">+900 EXP • +180 Linh Thạch</div>
        </button>

        <button
          disabled={isMeditating}
          onClick={() => handleStartMeditation(120)}
          className="p-4 rounded-xl border border-rose-500/30 bg-slate-900 hover:bg-slate-800 text-rose-300 font-subheading font-bold text-sm sm:text-base transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          💤 Treo Máy AFK
          <div className="text-[11px] font-normal text-slate-400 mt-1">Tự động nhận thưởng</div>
        </button>
      </div>
    </div>
  );
};
