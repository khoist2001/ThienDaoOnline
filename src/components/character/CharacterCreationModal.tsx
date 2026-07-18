import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { SpiritualRootType } from '../../types/game';
import { soundManager } from '../../services/SoundManager';

const SPIRITUAL_ROOTS: { type: SpiritualRootType; desc: string; speed: string; color: string }[] = [
  { type: 'Kim', desc: 'Sát thương kim thuộc tính bén ngót', speed: '+10% EXP', color: 'text-amber-300 border-amber-500' },
  { type: 'Mộc', desc: 'Sinh khí dồi dào, phục hồi nhanh', speed: '+10% EXP', color: 'text-emerald-400 border-emerald-500' },
  { type: 'Thủy', desc: 'Nhu hòa uốn lượn, phòng thủ linh hoạt', speed: '+10% EXP', color: 'text-cyan-400 border-cyan-500' },
  { type: 'Hỏa', desc: 'Cuồng bạo bộc phát, tấn công cực hạn', speed: '+15% EXP', color: 'text-rose-500 border-rose-600' },
  { type: 'Thổ', desc: 'Vững chãi như núi, dẻo dai kiên cường', speed: '+10% EXP', color: 'text-yellow-600 border-yellow-700' },
  { type: 'Song Linh Căn', desc: 'Cân bằng hai hệ linh khí', speed: '+30% EXP', color: 'text-purple-400 border-purple-500' },
  { type: 'Biến Dị Linh Căn', desc: 'Lôi / Băng / Phong thuộc tính biến dị hiếm có', speed: '+60% EXP', color: 'text-indigo-400 border-indigo-500' },
  { type: 'Thiên Linh Căn', desc: 'Vạn năm có một, thiên tài tuyệt thế', speed: '+100% EXP', color: 'text-xianxia-gold border-xianxia-gold animate-pulse' },
];

const SECTS = [
  { name: 'Thanh Vân Tông', desc: 'Chính đạo danh môn, công pháp đạo gia thuần khiết' },
  { name: 'Vạn Kiếm Sơn', desc: 'Kiếm tu vô song, nhất kiếm phá vạn pháp' },
  { name: 'Thái Hư Cung', desc: 'Ảo diệu vô cùng, tinh thông trận pháp phù lục' },
  { name: 'Thiên Ma Giáo', desc: 'Bá đạo tàn nhẫn, tốc độ tu luyện cực nhanh' },
  { name: 'Thiên Kiếm Môn', desc: 'Vấn kiếm thiên hạ, sát phạt quyết đoán' },
];

export const CharacterCreationModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { createCharacter } = useGameStore();
  const [name, setName] = useState('Bắc Phong');
  const [selectedRoot, setSelectedRoot] = useState<SpiritualRootType>('Thiên Linh Căn');
  const [selectedSect, setSelectedSect] = useState('Thanh Vân Tông');

  if (!isOpen) return null;

  const handleRollRoot = () => {
    soundManager.playClick();
    const idx = Math.floor(Math.random() * SPIRITUAL_ROOTS.length);
    setSelectedRoot(SPIRITUAL_ROOTS[idx].type);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    createCharacter(name, selectedRoot, selectedSect);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-xianxia-card border border-xianxia-gold/40 rounded-xl p-6 sm:p-8 shadow-xianxia-gold space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-title text-3xl sm:text-4xl text-gold-gradient">
            TẠO NHÂN VẬT TU TIÊN
          </h2>
          <p className="font-subheading text-slate-300 text-sm">
            Khai mở tủy kinh, lựa chọn linh căn và bái nhập tông môn bước vào đại đạo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cultivator Name */}
          <div>
            <label className="block text-sm font-subheading text-xianxia-gold mb-2">
              Danh Xưng Đạo Hữu
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 focus:border-xianxia-gold rounded-lg px-4 py-2.5 text-slate-100 outline-none transition-colors"
              placeholder="Nhập tên đạo hiệu..."
            />
          </div>

          {/* Spiritual Root Selector & Roll */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-subheading text-xianxia-gold">
                Linh Căn (Tự Động Trắc Nghiệm)
              </label>
              <button
                type="button"
                onClick={handleRollRoot}
                className="text-xs px-3 py-1 bg-xianxia-gold/20 text-xianxia-gold border border-xianxia-gold/40 rounded hover:bg-xianxia-gold/40 transition-colors"
              >
                🎲 Khai Mở Linh Căn
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SPIRITUAL_ROOTS.map((r) => (
                <button
                  type="button"
                  key={r.type}
                  onClick={() => setSelectedRoot(r.type)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedRoot === r.type
                      ? 'bg-xianxia-gold/20 border-xianxia-gold shadow-xianxia-gold'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className={`font-bold text-sm ${r.color}`}>{r.type}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{r.speed}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sect Selector */}
          <div>
            <label className="block text-sm font-subheading text-xianxia-gold mb-2">
              Bái Nhập Tông Môn
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SECTS.map((s) => (
                <button
                  type="button"
                  key={s.name}
                  onClick={() => setSelectedSect(s.name)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedSect === s.name
                      ? 'bg-xianxia-jade/20 border-xianxia-jade shadow-xianxia-jade'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="font-bold text-sm text-xianxia-jade-light">{s.name}</div>
                  <div className="text-xs text-slate-400 mt-1">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-slate-800">
            <button
              type="submit"
              className="px-8 py-3 rounded-lg font-subheading font-bold text-slate-950 bg-xianxia-gold hover:bg-xianxia-gold-light transition-all shadow-xianxia-gold"
            >
              Bắt Đầu Nghịch Thiên Cải Mệnh
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
