import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { soundManager } from '../../services/SoundManager';

interface ArenaOpponent {
  id: string;
  name: string;
  realm: string;
  combatPower: number;
  avatar: string;
  rank: number;
}

const OPPONENTS: ArenaOpponent[] = [
  { id: 'p-1', name: 'Độc Cô Cầu Bại', realm: 'Kim Đan Hậu Kỳ', combatPower: 2800, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', rank: 1 },
  { id: 'p-2', name: 'Tuyết Sơn Tiên Tử', realm: 'Trúc Cơ Đỉnh Phong', combatPower: 1950, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', rank: 2 },
  { id: 'p-3', name: 'Cuồng Kiếm Ma Tôn', realm: 'Trúc Cơ Trung Kỳ', combatPower: 1400, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', rank: 3 },
];

export const PvPArenaPanel: React.FC = () => {
  const { character } = useGameStore();
  const [opponents] = useState(OPPONENTS);
  const [battleResult, setBattleResult] = useState<string | null>(null);

  const handleChallenge = (opp: ArenaOpponent) => {
    soundManager.playClick();
    const isWin = character.combatPower >= opp.combatPower * 0.9;
    if (isWin) {
      soundManager.playBreakthroughSound(true);
      setBattleResult(`🎉 Khiêu chiến thành công! Bạn đánh bại [${opp.name}] và vươn lên Hạng ${opp.rank}!`);
    } else {
      soundManager.playBreakthroughSound(false);
      setBattleResult(`💔 Thất bại! Lực chiến của [${opp.name}] quá vượt trội!`);
    }
  };

  return (
    <div className="w-full bg-slate-950/80 border border-xianxia-gold/30 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="font-title text-2xl sm:text-3xl text-gold-gradient">
          ĐẤU TRƯỜNG TỶ VÕ
        </h2>
        <p className="font-subheading text-slate-300 text-xs sm:text-sm">
          So tài cao thấp cùng chư vị đạo hữu, vinh danh trên Bảng Xếp Hạng Tu Tiên
        </p>
      </div>

      {battleResult && (
        <div className="p-4 rounded-xl bg-slate-900 border border-xianxia-gold text-center text-xs font-subheading text-slate-200">
          {battleResult}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {opponents.map((opp) => (
          <div
            key={opp.id}
            className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-between space-y-4 text-center hover:border-xianxia-gold transition-all"
          >
            <div className="relative">
              <img src={opp.avatar} className="w-20 h-20 rounded-full border-2 border-xianxia-gold object-cover" />
              <span className="absolute -top-2 -right-2 bg-xianxia-gold text-slate-950 text-xs font-extrabold px-2 py-0.5 rounded-full">
                #Hạng {opp.rank}
              </span>
            </div>

            <div>
              <h3 className="font-title text-xl text-slate-100">{opp.name}</h3>
              <div className="text-xs text-amber-400 font-subheading">{opp.realm}</div>
              <div className="text-xs text-slate-400 mt-1">Lực Chiến: {opp.combatPower}</div>
            </div>

            <button
              onClick={() => handleChallenge(opp)}
              className="w-full py-2 bg-xianxia-gold hover:bg-xianxia-gold-light font-subheading font-bold text-slate-950 rounded-xl transition-all shadow-md"
            >
              ⚔️ Tỷ Võ Khiêu Chiến
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
