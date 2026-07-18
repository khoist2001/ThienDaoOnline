import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { soundManager } from '../../services/SoundManager';

export const MarketAuctionPanel: React.FC = () => {
  const { marketListings, buyMarketItem, character } = useGameStore();
  const [activeTab, setActiveTab] = useState<'market' | 'auction'>('market');
  const [bidAmount, setBidAmount] = useState(750);
  const [bidMessage, setBidMessage] = useState<string | null>(null);

  const handleBuy = (id: string) => {
    soundManager.playClick();
    buyMarketItem(id);
  };

  const handlePlaceBid = () => {
    soundManager.playClick();
    if (character.spiritStones < bidAmount) {
      setBidMessage('Không đủ Linh Thạch để đấu giá!');
      return;
    }
    soundManager.playBreakthroughSound(true);
    setBidMessage(`🎉 Ra giá thành công ${bidAmount} Linh Thạch! Bạn đang dẫn đầu cuộc đấu giá!`);
  };

  return (
    <div className="w-full bg-slate-950/80 border border-xianxia-gold/30 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="font-title text-2xl sm:text-3xl text-gold-gradient">
            CHỢ GIAO DỊCH & ĐẤU GIÁ
          </h2>
          <p className="font-subheading text-slate-300 text-xs sm:text-sm">
            Tự do mua bán Linh Đan, Phi Kiếm, Trang Bị và Đấu Giá Thần Vật
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('market');
            }}
            className={`px-4 py-2 rounded-lg font-subheading font-bold text-xs transition-all ${
              activeTab === 'market'
                ? 'bg-xianxia-gold text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🛒 Chợ Giao Dịch
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('auction');
            }}
            className={`px-4 py-2 rounded-lg font-subheading font-bold text-xs transition-all ${
              activeTab === 'auction'
                ? 'bg-xianxia-gold text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🏛️ Sàn Đấu Giá
          </button>
        </div>
      </div>

      {activeTab === 'market' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketListings.map((m) => (
            <div
              key={m.id}
              className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between space-y-4 hover:border-xianxia-gold transition-all"
            >
              <div className="flex items-center space-x-3">
                <span className="text-4xl p-2 bg-slate-950 rounded-xl border border-slate-800">
                  {m.item.icon}
                </span>
                <div>
                  <h4 className="font-bold text-sm text-slate-100">{m.item.name}</h4>
                  <div className="text-xs text-slate-400">
                    Người bán: <span className="text-xianxia-gold">{m.sellerName}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 italic">{m.item.description}</p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-xianxia-gold">
                  Giá: {m.price} 💎 Linh Thạch
                </div>
                <button
                  onClick={() => handleBuy(m.id)}
                  disabled={character.spiritStones < m.price}
                  className="px-4 py-1.5 bg-xianxia-gold hover:bg-xianxia-gold-light text-slate-950 font-subheading font-bold text-xs rounded-lg transition-all disabled:opacity-50"
                >
                  Mua Ngay
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/90 rounded-2xl border border-xianxia-gold/40 p-6 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <span className="text-6xl p-4 bg-slate-950 rounded-2xl border border-xianxia-gold">🔮</span>
              <div>
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-xianxia-gold border border-xianxia-gold/40 text-xs font-bold rounded-full">
                  ĐẤU GIÁ HOT
                </span>
                <h3 className="font-title text-2xl text-gold-gradient mt-1">Trúc Cơ Đan Thượng Phẩm</h3>
                <p className="text-xs text-slate-300">Tăng 40% tỷ lệ đột phá cảnh giới Trúc Cơ</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-1">
              <div className="text-xs text-slate-400">Thời Gian Còn Lại</div>
              <div className="text-2xl font-mono text-amber-300 font-bold">08:45</div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div>
              Giá cao nhất hiện tại: <strong className="text-xianxia-gold font-bold text-sm">700 💎</strong> bởi <span className="text-purple-300">Tiên Tôn Huyết Ma</span>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                className="w-28 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded text-white font-bold outline-none"
              />
              <button
                onClick={handlePlaceBid}
                className="px-5 py-1.5 bg-xianxia-gold hover:bg-xianxia-gold-light text-slate-950 font-bold rounded-lg transition-all"
              >
                Ra Giá
              </button>
            </div>
          </div>

          {bidMessage && (
            <div className="p-3 bg-slate-950 border border-xianxia-gold text-center text-xs font-subheading text-slate-200">
              {bidMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
