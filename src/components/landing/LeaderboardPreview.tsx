import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { apiClient } from '../../services/apiClient';

interface LeaderboardItem {
  id?: string;
  rank: number;
  name: string;
  realm: string;
  combatPower: number;
  sect: string;
  vipLevel?: number;
}

const DEFAULT_LEADERBOARD: LeaderboardItem[] = [
  { rank: 1, name: 'Quản Trị Viên Huyết Lệnh', realm: 'Tiên Đế', combatPower: 999999, sect: 'Thái Hư Cung' },
  { rank: 2, name: 'Độc Cô Cầu Bại', realm: 'Kim Tiên', combatPower: 98500, sect: 'Vạn Kiếm Sơn' },
  { rank: 3, name: 'Tuyết Sơn Tiên Tử', realm: 'Chân Tiên', combatPower: 76200, sect: 'Thanh Vân Tông' },
  { rank: 4, name: 'Cuồng Kiếm Ma Tôn', realm: 'Hóa Thần', combatPower: 54100, sect: 'Thiên Ma Giáo' },
  { rank: 5, name: 'Bắc Phong', realm: 'Luyện Khí', combatPower: 1250, sect: 'Thanh Vân Tông' },
];

export const LeaderboardPreview: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { character } = useGameStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>(DEFAULT_LEADERBOARD);

  useEffect(() => {
    if (!isOpen) return;

    const fetchRealLeaderboard = async () => {
      let candidateMap: Record<string, LeaderboardItem> = {};

      // 1. Load candidates from MySQL Database
      const apiRes = await apiClient.getUsers();
      if (apiRes && apiRes.users && Array.isArray(apiRes.users)) {
        apiRes.users.forEach((u: any) => {
          candidateMap[u.email.toLowerCase()] = {
            rank: 0,
            name: u.name,
            realm: u.realm || 'Luyện Khí',
            combatPower: Number(u.combatPower) || 1000,
            sect: u.sect || 'Thanh Vân Tông',
            vipLevel: Number(u.vipLevel) || 1,
          };
        });
      }

      // 2. Load candidates from Admin localStorage
      const localAdminUsersJson = localStorage.getItem('thien_dao_admin_users');
      if (localAdminUsersJson) {
        try {
          const parsed = JSON.parse(localAdminUsersJson);
          if (Array.isArray(parsed)) {
            parsed.forEach((u: any) => {
              if (u.email) {
                const emailKey = u.email.toLowerCase();
                candidateMap[emailKey] = {
                  rank: 0,
                  name: u.name || candidateMap[emailKey]?.name || 'Tu Sĩ',
                  realm: u.realm || candidateMap[emailKey]?.realm || 'Luyện Khí',
                  combatPower: Number(u.combatPower) || candidateMap[emailKey]?.combatPower || 1000,
                  sect: u.sect || candidateMap[emailKey]?.sect || 'Thanh Vân Tông',
                  vipLevel: Number(u.vipLevel) || 1,
                };
              }
            });
          }
        } catch (e) {}
      }

      // 3. Merge active player character if logged in
      if (character && character.name) {
        const activeKey = (character.name + '@active').toLowerCase();
        candidateMap[activeKey] = {
          rank: 0,
          name: character.name,
          realm: character.realm,
          combatPower: character.combatPower,
          sect: character.sect || 'Thanh Vân Tông',
          vipLevel: character.vipLevel || 1,
        };
      }

      // Convert to array and sort by combatPower descending
      let sortedList = Object.values(candidateMap).sort((a, b) => b.combatPower - a.combatPower);

      if (sortedList.length === 0) {
        sortedList = DEFAULT_LEADERBOARD;
      }

      // Assign dynamic ranks (#1, #2, #3...)
      const rankedList = sortedList.map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

      setLeaderboard(rankedList.slice(0, 10)); // Top 10 Real Cultivators
    };

    fetchRealLeaderboard();
  }, [isOpen, character]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-xianxia-card border border-xianxia-gold/40 rounded-2xl p-6 sm:p-8 shadow-xianxia-gold space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="font-title text-3xl text-gold-gradient">
              BẢNG XẾP HẠNG THIÊN ĐẠO (LỰC CHIẾN THỰC TẾ)
            </h2>
            <p className="font-subheading text-xs text-slate-400 mt-1">
              Xếp hạng thời gian thực dựa trên Lực Chiến thực tế từ MySQL Database & Tiến Trình Tu Luyện
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {leaderboard.map((item) => (
            <div
              key={`${item.rank}-${item.name}`}
              className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                item.rank === 1
                  ? 'bg-amber-950/60 border-amber-500 shadow-xianxia-gold'
                  : item.rank === 2
                  ? 'bg-slate-900 border-cyan-500/50'
                  : item.rank === 3
                  ? 'bg-slate-900 border-purple-500/50'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-center space-x-4">
                <span className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                  item.rank === 1
                    ? 'bg-xianxia-gold text-slate-950 font-extrabold shadow-lg'
                    : item.rank === 2
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : item.rank === 3
                    ? 'bg-purple-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  #{item.rank}
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-sm text-slate-100">{item.name}</h4>
                    {item.vipLevel && item.vipLevel > 0 && (
                      <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] rounded font-bold border border-amber-500/30">
                        VIP {item.vipLevel}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-amber-400 font-subheading">
                    {item.realm} • {item.sect}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-subheading">Lực Chiến Thực Tế</div>
                <div className="font-mono text-sm sm:text-base font-bold text-xianxia-gold">
                  ⚡ {item.combatPower.toLocaleString('vi-VN')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
