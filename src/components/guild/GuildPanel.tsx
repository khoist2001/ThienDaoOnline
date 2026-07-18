import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { soundManager } from '../../services/SoundManager';

export const GuildPanel: React.FC = () => {
  const { character } = useGameStore();
  const [guildLevel, setGuildLevel] = useState(3);
  const [guildVaultStones, setGuildVaultStones] = useState(15000);
  const [notice, setNotice] = useState('Chào mừng chư vị huynh đệ gia nhập Thanh Vân Tông! Cùng nhau xông pha Bang Chiến!');

  const handleDonate = () => {
    soundManager.playClick();
    setGuildVaultStones((prev) => prev + 500);
  };

  return (
    <div className="w-full bg-slate-950/80 border border-xianxia-jade/30 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="font-title text-2xl sm:text-3xl text-jade-gradient">
            BANG HỘI MÔN PHÁI - {character.sect}
          </h2>
          <p className="font-subheading text-slate-300 text-xs sm:text-sm">
            Tụ họp đồng đạo tu tiên, xây dựng kho bang, đánh Boss Bang và Trận Chiến Bang
          </p>
        </div>

        <div className="bg-slate-900 border border-xianxia-jade/30 px-4 py-2 rounded-xl text-xs font-bold text-xianxia-jade">
          Cấp Bang: <span className="text-slate-100 font-extrabold text-base">Cấp {guildLevel}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Notice & Admin */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
          <h3 className="font-title text-xl text-xianxia-jade">📜 Cáo Thị Bang Hội</h3>
          <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950 p-4 rounded-xl border border-slate-800">
            "{notice}"
          </p>
          <div className="text-xs text-slate-400">
            Chức vụ của bạn: <strong className="text-xianxia-gold">{character.sectRole}</strong>
          </div>
        </div>

        {/* Vault & Donation */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-title text-xl text-xianxia-gold">💎 Kho Bang Hội</h3>
            <div className="text-2xl font-bold text-gold-gradient mt-2">
              {guildVaultStones.toLocaleString('vi-VN')} Linh Thạch
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Đóng góp linh thạch để tăng cấp kỹ năng bang và mở rộng kho chứa.
            </p>
          </div>

          <button
            onClick={handleDonate}
            className="w-full py-2.5 bg-xianxia-jade hover:bg-xianxia-jade-light text-slate-950 font-subheading font-bold rounded-xl transition-all shadow-md"
          >
            💰 Cống Hiến Bang (+500 Linh Thạch)
          </button>
        </div>

        {/* Guild Boss & Wars */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-title text-xl text-rose-400">🐉 Boss Bang & Bang Chiến</h3>
            <p className="text-xs text-slate-300 mt-2">
              Boss Bang mở vào 20:00 hằng ngày. Tham gia khiêu chiến cùng toàn bang để nhận trang bị Tiên Cấp.
            </p>
          </div>

          <button
            onClick={() => soundManager.playClick()}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-subheading font-bold rounded-xl transition-all shadow-md"
          >
            ⚔️ Khiêu Chiến Boss Bang
          </button>
        </div>
      </div>
    </div>
  );
};
