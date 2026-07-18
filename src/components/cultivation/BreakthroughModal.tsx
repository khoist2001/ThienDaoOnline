import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { soundManager } from '../../services/SoundManager';

export const BreakthroughModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { character, inventory, attemptBreakthrough } = useGameStore();
  const [usePill, setUsePill] = useState(false);

  if (!isOpen) return null;

  const pillCount = inventory.find((i) => i.name === 'Đột Phá Đan')?.quantity || 0;
  const baseSuccessChance = 60;
  const totalSuccessChance = usePill ? baseSuccessChance + 25 : baseSuccessChance;
  const canBreakthrough = character.exp >= character.maxExp;

  const handleBreakthrough = () => {
    soundManager.playClick();
    attemptBreakthrough(usePill);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-xianxia-card border border-xianxia-gold/40 rounded-2xl p-6 sm:p-8 shadow-xianxia-gold space-y-6">
        <div className="text-center space-y-2">
          <div className="text-5xl animate-bounce">⚡</div>
          <h2 className="font-title text-3xl text-gold-gradient">
            ĐỘ KIẾP ĐỘT PHÁ
          </h2>
          <p className="font-subheading text-slate-300 text-sm">
            Tập trung toàn bộ linh lực trong cơ thể để xung kích bình chướng cảnh giới
          </p>
        </div>

        {/* Status Check */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Cảnh Giới Hiện Tại:</span>
            <span className="text-xianxia-gold font-bold">{character.realm}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Điều Kiện Tu Vi:</span>
            <span className={canBreakthrough ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {character.exp} / {character.maxExp} {canBreakthrough ? '(Đạt)' : '(Chưa Đủ)'}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm border-t border-slate-800 pt-2">
            <span className="text-slate-400">Tỷ Lệ Thành Công:</span>
            <span className="text-2xl font-extrabold text-gold-gradient">
              {totalSuccessChance}%
            </span>
          </div>
        </div>

        {/* Pill Selection */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-amber-500/20 space-y-2">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              disabled={pillCount === 0}
              checked={usePill}
              onChange={(e) => setUsePill(e.target.checked)}
              className="w-5 h-5 accent-xianxia-gold cursor-pointer"
            />
            <div className="flex-1">
              <div className="text-sm font-subheading text-xianxia-gold font-bold flex items-center justify-between">
                <span>💊 Dùng Đột Phá Đan (+25% Tỷ Lệ)</span>
                <span className="text-xs text-slate-400">Sở hữu: {pillCount}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Viên đan thần kỳ bảo vệ kinh mạch và nâng cao xác suất vượt qua thiên kiếp.
              </p>
            </div>
          </label>
        </div>

        {/* Warning */}
        <div className="p-3 bg-rose-950/40 border border-rose-600/30 rounded-lg text-xs text-rose-300">
          ⚠️ <strong>Cảnh báo:</strong> Nếu độ kiếp thất bại, thiên lôi sẽ đánh trúng tâm mạch làm thất thoát 30% EXP hiện tại!
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg font-subheading text-slate-400 hover:text-slate-200 transition-colors"
          >
            Hủy Bỏ
          </button>
          <button
            disabled={!canBreakthrough}
            onClick={handleBreakthrough}
            className="px-7 py-2.5 rounded-lg font-subheading font-bold text-slate-950 bg-xianxia-gold hover:bg-xianxia-gold-light transition-all shadow-xianxia-gold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Nghịch Thiên Độ Kiếp
          </button>
        </div>
      </div>
    </div>
  );
};
