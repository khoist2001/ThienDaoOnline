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

const INITIAL_OPPONENTS: ArenaOpponent[] = [
  { id: 'p-1', name: 'Độc Cô Cầu Bại', realm: 'Kim Đan Hậu Kỳ', combatPower: 2800, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', rank: 1 },
  { id: 'p-2', name: 'Tuyết Sơn Tiên Tử', realm: 'Trúc Cơ Đỉnh Phong', combatPower: 1950, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', rank: 2 },
  { id: 'p-3', name: 'Cuồng Kiếm Ma Tôn', realm: 'Trúc Cơ Trung Kỳ', combatPower: 1400, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', rank: 3 },
];

export const PvPArenaPanel: React.FC = () => {
  const { character } = useGameStore();
  const [opponents, setOpponents] = useState(INITIAL_OPPONENTS);
  const [playerRank, setPlayerRank] = useState<number | null>(null); // null = chưa có hạng
  const [battleResult, setBattleResult] = useState<string | null>(null);

  const handleChallenge = (opp: ArenaOpponent) => {
    soundManager.playClick();
    const isWin = character.combatPower >= opp.combatPower * 0.9;

    if (isWin) {
      soundManager.playBreakthroughSound(true);
      const wonRank = opp.rank;

      setOpponents((prev) => {
        const updated = prev.map((o) => {
          if (o.id === opp.id) {
            // Người thua nhận hạng cũ của người chơi (hoặc tụt 1 bậc nếu chưa có hạng)
            return { ...o, rank: playerRank ?? o.rank + 1 };
          }
          // Nếu người chơi đã có hạng, các đối thủ có rank nằm giữa (wonRank < rank < playerRank) thì tụt 1 bậc
          if (playerRank !== null && o.rank > wonRank && o.rank < playerRank) {
            return { ...o, rank: o.rank + 1 };
          }
          // Nếu người chơi chưa có hạng, đối thủ có rank > wonRank thì tụt 1 bậc
          if (playerRank === null && o.rank > wonRank) {
            return { ...o, rank: o.rank + 1 };
          }
          return o;
        });
        return updated.sort((a, b) => a.rank - b.rank);
      });

      setPlayerRank(wonRank);
      setBattleResult(`🎉 Khiêu chiến thành công! Đánh bại [${opp.name}] và vươn lên Hạng ${wonRank}!`);
    } else {
      soundManager.playBreakthroughSound(false);
      setBattleResult(`💔 Thất bại! Lực chiến của [${opp.name}] quá vượt trội!`);
    }
  };

  return (
    <div className="w-full bg-slate-950/80 border border-xianxia-gold/30 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="font-title text-2xl sm:text-3xl text-gold-gradient">
            ĐẤU TRƯỜNG TỶ VÕ
          </h2>
          <p className="font-subheading text-slate-300 text-xs sm:text-sm">
            So tài cao thấp cùng chư vị đạo hữu, vinh danh trên Bảng Xếp Hạng Tu Tiên
          </p>
        </div>

        <div className="bg-slate-900 border border-xianxia-gold/30 px-4 py-2 rounded-xl text-xs font-bold text-xianxia-gold flex items-center space-x-2">
          <span>🏆 Hạng của bạn:</span>
          <span className="text-base text-slate-100">
            {playerRank !== null ? `#${playerRank}` : 'Chưa xếp hạng'}
          </span>
        </div>
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
              disabled={playerRank !== null && playerRank <= opp.rank}
              className="w-full py-2 bg-xianxia-gold hover:bg-xianxia-gold-light font-subheading font-bold text-slate-950 rounded-xl transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {playerRank !== null && playerRank <= opp.rank
                ? '🔒 Hạng thấp hơn bạn'
                : '⚔️ Tỷ Võ Khiêu Chiến'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
