import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Item, ItemType } from '../../types/game';
import { ItemTooltip } from './ItemTooltip';
import { soundManager } from '../../services/SoundManager';

export const InventoryGrid: React.FC = () => {
  const { inventory, character, equipItem, usePill, sellItem } = useGameStore();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [filterType, setFilterType] = useState<ItemType | 'All'>('All');

  const totalSlots = 24;
  const filteredItems = inventory.filter(
    (item) => filterType === 'All' || item.type === filterType
  );

  const handleItemClick = (item: Item) => {
    soundManager.playClick();
    setSelectedItem(selectedItem?.id === item.id ? null : item);
  };

  const handleEquip = (item: Item) => {
    soundManager.playClick();
    equipItem(item);
    setSelectedItem(null);
  };

  const handleUsePill = (item: Item) => {
    soundManager.playClick();
    usePill(item);
    setSelectedItem(null);
  };

  const handleSell = (item: Item) => {
    soundManager.playClick();
    sellItem(item.id);
    setSelectedItem(null);
  };

  return (
    <div className="w-full bg-slate-950/80 border border-xianxia-gold/30 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="font-title text-2xl sm:text-3xl text-gold-gradient">
            KHO ĐỒ PHÁP BẢO
          </h2>
          <p className="font-subheading text-slate-300 text-xs sm:text-sm">
            Quản lý trang bị, đan dược và linh vật tích lũy ({inventory.length}/{totalSlots} Ô)
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-subheading">
          {(['All', 'Equipment', 'Pill', 'Material', 'Artifact'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === t
                  ? 'bg-xianxia-gold text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t === 'All' ? 'Tất Cả' : t === 'Equipment' ? 'Trang Bị' : t === 'Pill' ? 'Đan Dược' : t === 'Material' ? 'Nguyên Liệu' : 'Pháp Bảo'}
            </button>
          ))}
        </div>
      </div>

      {/* Equipped Items Summary Bar */}
      <div className="p-4 bg-slate-900/90 rounded-xl border border-amber-500/20 flex flex-wrap items-center justify-around gap-4">
        <div className="text-xs font-bold text-xianxia-gold uppercase tracking-wider">
          Trang Bị Đang Mặc:
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">⚔️ Vũ Khí:</span>
          <span className="text-xs font-bold text-amber-300">
            {character.equippedItems.weapon?.name || 'Trống'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">🛡️ Giáp:</span>
          <span className="text-xs font-bold text-cyan-300">
            {character.equippedItems.armor?.name || 'Trống'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">🔮 Pháp Bảo:</span>
          <span className="text-xs font-bold text-purple-300">
            {character.equippedItems.artifact?.name || 'Trống'}
          </span>
        </div>
      </div>

      {/* Grid Container */}
      <div className="relative">
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
          {Array.from({ length: totalSlots }).map((_, idx) => {
            const item = filteredItems[idx];
            return (
              <div
                key={idx}
                onClick={() => item && handleItemClick(item)}
                className={`relative aspect-square bg-slate-900/80 rounded-xl border flex flex-col items-center justify-center p-2 cursor-pointer transition-all hover:scale-105 ${
                  item
                    ? selectedItem?.id === item.id
                      ? 'border-xianxia-gold ring-2 ring-xianxia-gold/50 shadow-xianxia-gold'
                      : 'border-slate-700 hover:border-slate-500'
                    : 'border-slate-850 opacity-40 cursor-default'
                }`}
              >
                {item ? (
                  <>
                    <span className="text-2xl sm:text-3xl">{item.icon}</span>
                    <span className="text-[10px] text-slate-300 font-semibold truncate w-full text-center mt-1">
                      {item.name}
                    </span>
                    {item.quantity && item.quantity > 1 && (
                      <span className="absolute bottom-1 right-1 bg-slate-950 px-1.5 py-0.2 text-[9px] font-bold text-xianxia-gold rounded border border-slate-700">
                        x{item.quantity}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-slate-800 text-xs">Ô {idx + 1}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Floating Tooltip Modal */}
        {selectedItem && (
          <div className="absolute top-0 right-0 z-40">
            <ItemTooltip
              item={selectedItem}
              onEquip={() => handleEquip(selectedItem)}
              onUse={() => handleUsePill(selectedItem)}
              onSell={() => handleSell(selectedItem)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
