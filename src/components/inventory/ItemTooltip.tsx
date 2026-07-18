import React from 'react';
import { Item } from '../../types/game';

interface ItemTooltipProps {
  item: Item;
  onEquip?: () => void;
  onUse?: () => void;
  onSell?: () => void;
}

export const ItemTooltip: React.FC<ItemTooltipProps> = ({
  item,
  onEquip,
  onUse,
  onSell,
}) => {
  const rarityColors: Record<string, string> = {
    Phàm: 'text-slate-400 border-slate-600',
    Linh: 'text-blue-400 border-blue-600',
    Huyền: 'text-purple-400 border-purple-600',
    Địa: 'text-yellow-400 border-yellow-600',
    Thiên: 'text-orange-400 border-orange-600',
    Tiên: 'text-emerald-400 border-emerald-600',
    Thần: 'text-rose-500 border-rose-600 animate-pulse',
  };

  return (
    <div className="w-64 bg-slate-950 border border-xianxia-gold/40 rounded-xl p-4 shadow-2xl space-y-3 z-50">
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
        <div className="text-3xl p-2 bg-slate-900 rounded-lg border border-slate-800">
          {item.icon}
        </div>
        <div>
          <h4 className={`font-bold text-sm ${rarityColors[item.rarity] || 'text-white'}`}>
            {item.name}
          </h4>
          <div className="text-xs text-slate-400 font-subheading">
            Phẩm Cấp: <span className="font-bold">{item.rarity}</span> • {item.type}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-300 italic leading-relaxed">
        "{item.description}"
      </p>

      {item.stats && (
        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-xs space-y-1">
          {item.stats.atk && <div className="text-amber-400">⚔️ Sát Thương: +{item.stats.atk}</div>}
          {item.stats.def && <div className="text-cyan-400">🛡️ Phòng Thủ: +{item.stats.def}</div>}
          {item.stats.expBoost && <div className="text-emerald-400">✨ Tu Vi: +{item.stats.expBoost}</div>}
          {item.stats.successRateBoost && (
            <div className="text-purple-400">⚡ Tỷ Lệ Độ Kiếp: +{item.stats.successRateBoost * 100}%</div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
        <span>Giá trị: <strong className="text-xianxia-gold">{item.value} 💎</strong></span>
        {item.quantity && <span>Số lượng: <strong className="text-slate-200">{item.quantity}</strong></span>}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2 pt-2 border-t border-slate-800">
        {item.type === 'Equipment' && onEquip && (
          <button
            onClick={onEquip}
            className="flex-1 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded text-xs transition-colors"
          >
            Trang Bị
          </button>
        )}
        {item.type === 'Pill' && onUse && (
          <button
            onClick={onUse}
            className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded text-xs transition-colors"
          >
            Sử Dụng
          </button>
        )}
        {onSell && (
          <button
            onClick={onSell}
            className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
          >
            Bán
          </button>
        )}
      </div>
    </div>
  );
};
