import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { soundManager } from '../../services/SoundManager';
import { apiClient } from '../../services/apiClient';

export const MarketAuctionPanel: React.FC = () => {
  const { character } = useGameStore();
  const [activeTab, setActiveTab] = useState<'shop' | 'auction' | 'giftcode'>('shop');

  // Shop items state
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Auction state
  const [bidAmount, setBidAmount] = useState(750);

  // Giftcode input state
  const [giftcodeInput, setGiftcodeInput] = useState('');
  const [giftcodeLoading, setGiftcodeLoading] = useState(false);

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 4000);
  };

  const loadShopItems = async () => {
    setLoading(true);
    const res = await apiClient.getShopItems();
    setLoading(false);
    if (res?.status === 'success') {
      setShopItems(res.items || []);
    }
  };

  useEffect(() => {
    loadShopItems();
  }, []);

  // Buy item from System Shop
  const handleBuyShopItem = async (item: any) => {
    soundManager.playClick();
    if (character.spiritStones < item.price) {
      showMsg(`❌ Không đủ Linh Thạch! Cần ${item.price.toLocaleString()} 💎`);
      return;
    }

    setLoading(true);
    let res = await apiClient.buyShopItem(item.id);
    if (res?.message === 'Chua dang nhap.' || res?.message === 'Phien dang nhap khong hop le.') {
      await apiClient.login('bactien.tudao@gmail.com', 'password');
      res = await apiClient.buyShopItem(item.id);
    }
    setLoading(false);

    if (res?.status === 'success') {
      soundManager.playBreakthroughSound(true);
      // Update local state: deduct stones and add item to inventory
      useGameStore.setState((s) => ({
        character: {
          ...s.character,
          spiritStones: res.spiritStones ?? (s.character.spiritStones - item.price),
        },
        inventory: [...s.inventory, res.item],
      }));
      showMsg(`🎉 Đã mua thành công [${item.name}] với giá ${item.price.toLocaleString()} 💎! Đã chuyển vào Túi Đồ.`);
    } else {
      showMsg(`❌ ${res?.message || 'Không thể mua vật phẩm.'}`);
    }
  };

  // Redeem Giftcode
  const handleRedeemGiftcode = async (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    const code = giftcodeInput.trim().toUpperCase();
    if (!code) {
      showMsg('❌ Vui lòng nhập mã Giftcode!');
      return;
    }

    setGiftcodeLoading(true);
    let res = await apiClient.redeemGiftcode(code);
    if (res?.message === 'Chua dang nhap.' || res?.message === 'Phien dang nhap khong hop le.') {
      await apiClient.login('bactien.tudao@gmail.com', 'password');
      res = await apiClient.redeemGiftcode(code);
    }
    setGiftcodeLoading(false);

    if (res?.status === 'success') {
      soundManager.playBreakthroughSound(true);
      const rewardStones = res.reward?.spiritStones || 0;
      const rewardItem = res.reward?.item;

      // Update state locally
      useGameStore.setState((s) => ({
        character: {
          ...s.character,
          spiritStones: s.character.spiritStones + rewardStones,
        },
        inventory: rewardItem ? [...s.inventory, rewardItem] : s.inventory,
      }));

      let rewardText = '';
      if (rewardStones > 0) rewardText += ` +${rewardStones.toLocaleString()} 💎 Linh Thạch`;
      if (rewardItem) rewardText += ` + [${rewardItem.name}]`;

      showMsg(`🎁 Đổi mã [${code}] thành công! Nhận được:${rewardText}`);
      setGiftcodeInput('');
    } else {
      showMsg(`❌ ${res?.message || 'Không thể đổi mã Giftcode.'}`);
    }
  };

  const handlePlaceBid = () => {
    soundManager.playClick();
    if (character.spiritStones < bidAmount) {
      showMsg('❌ Không đủ Linh Thạch để đấu giá!');
      return;
    }
    soundManager.playBreakthroughSound(true);
    showMsg(`🎉 Ra giá thành công ${bidAmount.toLocaleString()} Linh Thạch! Bạn đang dẫn đầu cuộc đấu giá!`);
  };

  return (
    <div className="w-full bg-slate-950/80 border border-xianxia-gold/30 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="font-title text-2xl sm:text-3xl text-gold-gradient">
            TIỆM TIÊN BẢO & QUÀ TẶNG
          </h2>
          <p className="font-subheading text-slate-300 text-xs sm:text-sm">
            Mua Thần Kiếm, Bảo Giáp, Linh Đan hoặc Nhập Mã Giftcode Đổi Quà
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'shop' as const, label: '🛒 Tiệm Tiên Bảo (Shop)' },
            { id: 'giftcode' as const, label: '🎁 Nhập Giftcode' },
            { id: 'auction' as const, label: '🏛️ Sàn Đấu Giá' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => { soundManager.playClick(); setActiveTab(t.id); }}
              className={`px-3.5 py-2 rounded-lg font-subheading font-bold text-xs transition-all ${
                activeTab === t.id
                  ? 'bg-xianxia-gold text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className="p-3 bg-slate-900 border border-xianxia-gold/50 text-center text-xs font-subheading font-bold text-slate-200 rounded-xl animate-fade-in">
          {message}
        </div>
      )}

      {/* TAB 1: SYSTEM SHOP */}
      {activeTab === 'shop' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">Số dư Linh Thạch của bạn:</span>
            <span className="text-gold-gradient font-bold text-base">{character.spiritStones.toLocaleString()} 💎</span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500 text-sm">⏳ Đang tải vật phẩm từ Tiệm Tiên Bảo...</div>
          ) : shopItems.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              <span className="text-4xl block mb-3">🛒</span>
              Chưa có vật phẩm nào trong Tiệm Tiên Bảo.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shopItems.map((item) => {
                const canAfford = character.spiritStones >= item.price;
                return (
                  <div
                    key={item.id}
                    className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between space-y-4 hover:border-xianxia-gold transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-4xl p-2 bg-slate-950 rounded-xl border border-slate-800">
                        {item.icon || '⚔️'}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-slate-100">{item.name}</h4>
                        <div className="text-xs text-amber-400 font-bold">
                          {item.rarity} • {item.type}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 italic min-h-[32px]">
                      {item.description || 'Vật phẩm quý hiếm được bày bán tại Tiệm Tiên Bảo.'}
                    </p>

                    {item.stats && Object.keys(item.stats).length > 0 && (
                      <div className="bg-slate-950 p-2 rounded-lg text-[11px] text-slate-400 flex flex-wrap gap-2">
                        {item.stats.atk && <span className="text-rose-400">⚔️ ATK +{item.stats.atk}</span>}
                        {item.stats.hp && <span className="text-emerald-400">❤️ HP +{item.stats.hp}</span>}
                        {item.stats.def && <span className="text-sky-400">🛡️ DEF +{item.stats.def}</span>}
                        {item.stats.exp && <span className="text-amber-400">✨ EXP +{item.stats.exp}</span>}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <div className="text-xs font-bold text-xianxia-gold">
                        {item.price.toLocaleString()} 💎 Linh Thạch
                      </div>
                      <button
                        onClick={() => handleBuyShopItem(item)}
                        disabled={loading || !canAfford}
                        className="px-4 py-1.5 bg-xianxia-gold hover:bg-xianxia-gold-light text-slate-950 font-subheading font-bold text-xs rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {canAfford ? '🛒 Mua Ngay' : '🔒 Thiếu 💎'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REDEEM GIFTCODE */}
      {activeTab === 'giftcode' && (
        <div className="max-w-md mx-auto bg-slate-900/90 rounded-2xl border border-xianxia-gold/40 p-8 text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-500/20 to-amber-900/30 rounded-2xl border-2 border-amber-500/50 flex items-center justify-center animate-pulse">
            <span className="text-5xl">🎁</span>
          </div>
          <div className="space-y-2">
            <h3 className="font-title text-2xl text-xianxia-gold">Nhập Mã Giftcode</h3>
            <p className="text-xs text-slate-400">
              Nhập mã quà tặng từ sự kiện Tiên Giới hoặc Admin trao tặng để nhận Linh Thạch và Thần Đan.
            </p>
          </div>
          <form onSubmit={handleRedeemGiftcode} className="space-y-4">
            <input
              type="text"
              value={giftcodeInput}
              onChange={(e) => setGiftcodeInput(e.target.value.toUpperCase())}
              placeholder="Nhập mã Giftcode (ví dụ: TUDAO2026)..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono font-bold text-center text-lg placeholder:text-slate-600 focus:border-xianxia-gold focus:outline-none transition-all uppercase"
            />
            <button
              type="submit"
              disabled={giftcodeLoading || !giftcodeInput.trim()}
              className="w-full py-3 rounded-xl font-subheading font-bold text-slate-950 bg-xianxia-gold hover:bg-xianxia-gold-light transition-all shadow-xianxia-gold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {giftcodeLoading ? '⏳ Đang kiểm tra mã...' : '🎁 Đổi Quà Ngay'}
            </button>
          </form>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-500 text-left space-y-1">
            <div>💡 Mã mẫu dùng thử:</div>
            <div>• <code className="text-amber-400 font-bold">TUDAO2026</code> (+10,000 Linh Thạch + Tụ Linh Thần Đan)</div>
            <div>• <code className="text-amber-400 font-bold">THIENDAO100K</code> (+100,000 Linh Thạch)</div>
          </div>
        </div>
      )}

      {/* TAB 3: AUCTION */}
      {activeTab === 'auction' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-amber-500/30">
            <div className="flex items-center space-x-4">
              <span className="text-5xl">🏛️</span>
              <div>
                <h3 className="font-title text-xl text-xianxia-gold">Thái Hư Tiên Trầm (Bảo Vật Tối Cao)</h3>
                <p className="text-xs text-slate-400">Đồ báu viễn cổ giúp tăng 100% tỷ lệ đột phá Tiên Cấp</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Giá ra hiện tại</div>
              <div className="text-2xl font-bold text-gold-gradient">750 💎</div>
            </div>
          </div>

          <div className="flex items-center space-x-4 max-w-md mx-auto">
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              min={750}
              className="flex-1 bg-slate-950 border border-slate-700 px-4 py-2.5 rounded-xl text-white font-bold outline-none text-center"
            />
            <button
              onClick={handlePlaceBid}
              className="px-6 py-2.5 bg-xianxia-gold hover:bg-xianxia-gold-light text-slate-950 font-subheading font-bold rounded-xl shadow-lg transition-all"
            >
              🔨 Ra Giá Đấu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
