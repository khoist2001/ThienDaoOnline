import React from 'react';
import { soundManager } from '../../services/SoundManager';
import { useGameStore } from '../../store/gameStore';

interface LandingHeroProps {
  onStartCultivating: () => void;
  onOpenAuth: () => void;
  onOpenLeaderboard: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartCultivating,
  onOpenAuth,
  onOpenLeaderboard,
}) => {
  const { isDemonMode, toggleTheme } = useGameStore();
  const [isMuted, setIsMuted] = React.useState(soundManager.getMuted());

  const handleToggleAudio = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center text-center p-6 space-y-8 z-10">
      {/* Sound & Theme Controls */}
      <div className="absolute top-6 right-6 flex items-center space-x-3 z-30">
        <button
          onClick={handleToggleAudio}
          className="p-3 bg-slate-900/80 border border-xianxia-gold/40 rounded-full text-xianxia-gold hover:scale-110 transition-all shadow-xianxia-gold"
          title="Bật/Tắt Nhạc Tiên Hiệp"
        >
          {isMuted ? '🔇' : '🎵'}
        </button>

        <button
          onClick={toggleTheme}
          className={`px-4 py-2 rounded-full font-subheading text-xs font-bold transition-all border shadow-lg ${
            isDemonMode
              ? 'bg-purple-950 border-purple-500 text-purple-300 shadow-xianxia-demon'
              : 'bg-amber-950/80 border-amber-500 text-xianxia-gold shadow-xianxia-gold'
          }`}
        >
          {isDemonMode ? '🔥 Ma Giới Theme' : '✨ Tiên Giới Theme'}
        </button>
      </div>

      {/* Hero Header */}
      <div className="space-y-4 max-w-4xl mx-auto">
        <div className="inline-block px-4 py-1.5 rounded-full border border-xianxia-gold/40 bg-xianxia-gold/10 text-xianxia-gold text-xs font-subheading font-bold tracking-widest uppercase animate-pulse">
          ☯ THIÊN ĐẠO ONLINE • WEBGAME TU TIÊN 2D AAA
        </div>

        <h1 className="font-title text-5xl sm:text-7xl md:text-8xl text-gold-gradient tracking-widest drop-shadow-[0_0_25px_rgba(243,198,105,0.6)]">
          THIÊN ĐẠO ONLINE
        </h1>

        <p className="font-subheading text-xl sm:text-3xl text-xianxia-gold-light tracking-widest italic">
          "Một niệm thành tiên, nghịch thiên cải mệnh."
        </p>

        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-body leading-relaxed">
          Bước vào thế giới Tiên Hiệp hùng vĩ, lướt phi kiếm xé gió, luyện đan rèn khí, thu phục Thần Thú, nghênh chiến Thiên Kiếp bứt phá cảnh giới xưng bá Tiên Giới!
        </p>
      </div>

      {/* Main Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <button
          onClick={() => {
            soundManager.playClick();
            onStartCultivating();
          }}
          className="px-8 py-4 rounded-xl font-subheading font-extrabold text-slate-950 text-lg bg-gradient-to-r from-amber-300 via-xianxia-gold to-yellow-500 hover:scale-105 transition-all shadow-xianxia-gold animate-glow-pulse"
        >
          ☯ BẮT ĐẦU TU TIÊN
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            onOpenAuth();
          }}
          className="px-8 py-4 rounded-xl font-subheading font-bold text-xianxia-gold text-base bg-slate-900/90 border border-xianxia-gold/50 hover:bg-slate-800 transition-all shadow-lg"
        >
          ⛩️ MỞ CỬA TIÊN MÔN
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            onOpenLeaderboard();
          }}
          className="px-8 py-4 rounded-xl font-subheading font-bold text-xianxia-jade text-base bg-slate-900/90 border border-xianxia-jade/50 hover:bg-slate-800 transition-all shadow-lg"
        >
          🏆 BẢNG XẾP HẠNG
        </button>
      </div>
    </div>
  );
};
