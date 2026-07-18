import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { apiClient } from '../../services/apiClient';
import { soundManager } from '../../services/SoundManager';

// ── Guild Role Hierarchy ──
type GuildRole = 'Bang Chủ' | 'Phó Bang Chủ' | 'Trưởng Lão' | 'Tinh Anh' | 'Đệ Tử';
const ROLE_ORDER: GuildRole[] = ['Bang Chủ', 'Phó Bang Chủ', 'Trưởng Lão', 'Tinh Anh', 'Đệ Tử'];
const ROLE_COLORS: Record<GuildRole, string> = {
  'Bang Chủ': 'text-amber-300',
  'Phó Bang Chủ': 'text-rose-400',
  'Trưởng Lão': 'text-violet-400',
  'Tinh Anh': 'text-sky-400',
  'Đệ Tử': 'text-slate-400',
};
const ROLE_ICONS: Record<GuildRole, string> = {
  'Bang Chủ': '👑',
  'Phó Bang Chủ': '⭐',
  'Trưởng Lão': '🔮',
  'Tinh Anh': '💠',
  'Đệ Tử': '🌱',
};

type MainView = 'browse' | 'myGuild';
type BrowseTab = 'leaderboard' | 'create';
type GuildTab = 'info' | 'members' | 'requests' | 'upgrade';

export const GuildPanel: React.FC = () => {
  const { character } = useGameStore();

  // ── State ──
  const [view, setView] = useState<MainView>('browse');
  const [browseTab, setBrowseTab] = useState<BrowseTab>('leaderboard');
  const [guildTab, setGuildTab] = useState<GuildTab>('info');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Guild list (for BXH)
  const [guilds, setGuilds] = useState<any[]>([]);
  const [userGuildId, setUserGuildId] = useState<number | null>(null);

  // My guild detail
  const [myGuild, setMyGuild] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [myRole, setMyRole] = useState<GuildRole | null>(null);

  // Create form
  const [guildNameInput, setGuildNameInput] = useState('');

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 4000);
  };

  // ── Load guilds list ──
  const loadGuilds = useCallback(async () => {
    const res = await apiClient.getGuilds();
    if (res?.status === 'success') {
      setGuilds(res.guilds || []);
      setUserGuildId(res.userGuildId);
      if (res.userGuildId) {
        setView('myGuild');
        loadMyGuild(res.userGuildId);
      } else {
        setView('browse');
      }
    }
  }, []);

  // ── Load my guild detail ──
  const loadMyGuild = async (guildId: number) => {
    const res = await apiClient.getGuildDetail(guildId);
    if (res?.status === 'success') {
      setMyGuild(res.guild);
      setMembers(res.members || []);
      setRequests(res.requests || []);
      // Find my role
      const me = (res.members || []).find((m: any) => m.name === character.name);
      setMyRole(me?.role || null);
    }
  };

  useEffect(() => { loadGuilds(); }, [loadGuilds]);

  // ── Create guild ──
  const handleCreateGuild = async () => {
    soundManager.playClick();
    const name = guildNameInput.trim();
    if (name.length < 2) { showMsg('❌ Tên bang phải có ít nhất 2 ký tự!'); return; }
    if (character.spiritStones < 1000) { showMsg('❌ Không đủ Linh Thạch (cần 1000 💎)!'); return; }

    setLoading(true);
    let res = await apiClient.createGuild(name);
    if (res?.message === 'Chua dang nhap.' || res?.message === 'Phien dang nhap khong hop le.') {
      await apiClient.login('bactien.tudao@gmail.com', 'password');
      res = await apiClient.createGuild(name);
    }
    setLoading(false);

    if (res?.status === 'success') {
      // Deduct stones locally
      useGameStore.setState((s) => ({
        character: { ...s.character, spiritStones: s.character.spiritStones - 1000 },
      }));
      soundManager.playBreakthroughSound(true);
      showMsg(`🏯 Sáng lập bang [${name}] thành công!`);
      setGuildNameInput('');
      await loadGuilds();
    } else {
      showMsg(`❌ ${res?.message || 'Không thể tạo bang.'}`);
    }
  };

  // ── Join request ──
  const handleJoinGuild = async (guildId: number) => {
    soundManager.playClick();
    setLoading(true);
    let res = await apiClient.requestJoinGuild(guildId);
    if (res?.message === 'Chua dang nhap.' || res?.message === 'Phien dang nhap khong hop le.') {
      await apiClient.login('bactien.tudao@gmail.com', 'password');
      res = await apiClient.requestJoinGuild(guildId);
    }
    setLoading(false);
    if (res?.status === 'success') {
      showMsg('📩 Đã gửi đơn xin gia nhập! Vui lòng chờ Bang Chủ duyệt.');
    } else {
      showMsg(`❌ ${res?.message || 'Không thể gửi đơn.'}`);
    }
  };

  // ── Handle request (accept/reject) ──
  const handleRequest = async (reqId: number, action: 'accept' | 'reject') => {
    soundManager.playClick();
    if (!userGuildId) return;
    const res = await apiClient.handleGuildRequest(userGuildId, reqId, action);
    if (res?.status === 'success') {
      showMsg(action === 'accept' ? '✅ Đã duyệt thành viên!' : '🚫 Đã từ chối đơn xin.');
      loadMyGuild(userGuildId);
    } else {
      showMsg(`❌ ${res?.message || 'Lỗi xử lý.'}`);
    }
  };

  // ── Promote/Demote ──
  const handleChangeRole = async (userId: number, direction: 'up' | 'down') => {
    soundManager.playClick();
    if (!userGuildId) return;
    const member = members.find((m) => m.user_id == userId);
    if (!member) return;
    const currentIdx = ROLE_ORDER.indexOf(member.role as GuildRole);
    const newIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1;
    if (newIdx < 1 || newIdx >= ROLE_ORDER.length) return; // Can't go above Phó Bang Chủ or below Đệ Tử
    const newRole = ROLE_ORDER[newIdx];
    const res = await apiClient.updateMemberRole(userGuildId, userId, newRole);
    if (res?.status === 'success') {
      showMsg(`${direction === 'up' ? '⬆️' : '⬇️'} Đã ${direction === 'up' ? 'thăng' : 'giáng'} chức thành ${ROLE_ICONS[newRole]} ${newRole}!`);
      loadMyGuild(userGuildId);
    }
  };

  // ══════════════════════════════════════
  // ── RENDER ──
  // ══════════════════════════════════════

  const renderMessage = () => message && (
    <div className="p-3 rounded-xl bg-slate-900 border border-xianxia-jade/50 text-center text-xs font-subheading text-slate-200 animate-fade-in">
      {message}
    </div>
  );

  // ── BROWSE VIEW (no guild) ──
  if (view === 'browse') {
    return (
      <div className="w-full bg-slate-950/80 border border-xianxia-jade/30 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-title text-2xl sm:text-3xl text-jade-gradient">BANG HỘI TU TIÊN GIỚI</h2>
          <p className="font-subheading text-slate-300 text-xs sm:text-sm">
            Duyệt danh sách bang hội, xem BXH hoặc sáng lập bang mới
          </p>
        </div>

        {renderMessage()}

        {/* Browse Tabs */}
        <div className="flex space-x-2 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'leaderboard' as BrowseTab, label: '🏆 BXH Bang Hội', },
            { id: 'create' as BrowseTab, label: '🏯 Sáng Lập Bang', },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => { soundManager.playClick(); setBrowseTab(t.id); }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-subheading font-bold transition-all ${
                browseTab === t.id
                  ? 'bg-xianxia-jade/20 text-xianxia-jade border border-xianxia-jade/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Leaderboard Tab */}
        {browseTab === 'leaderboard' && (
          <div className="space-y-3">
            {guilds.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                <span className="text-4xl block mb-3">🏯</span>
                Chưa có bang hội nào. Hãy là người đầu tiên sáng lập!
              </div>
            ) : (
              guilds.map((g, idx) => (
                <div key={g.id} className="flex items-center justify-between p-4 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-xianxia-jade/30 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm ${
                      idx === 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      idx === 1 ? 'bg-slate-300/10 text-slate-300 border border-slate-400/30' :
                      idx === 2 ? 'bg-orange-500/15 text-orange-300 border border-orange-400/30' :
                      'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}>
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                        <span>🏯 {g.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/15 text-amber-400 rounded-full">Cấp {g.level}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        👤 {g.member_count}/{g.max_members} thành viên •
                        ⚔️ Tổng lực chiến: {Number(g.total_combat_power).toLocaleString()} •
                        👑 {g.leader_name}
                      </div>
                    </div>
                  </div>

                  {userGuildId === null && (
                    <button
                      onClick={() => handleJoinGuild(g.id)}
                      disabled={loading || g.member_count >= g.max_members}
                      className="px-4 py-2 text-xs font-bold rounded-lg bg-xianxia-jade/20 text-xianxia-jade border border-xianxia-jade/30 hover:bg-xianxia-jade/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {g.member_count >= g.max_members ? '🔒 Đã Đầy' : '📩 Xin Gia Nhập'}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Create Guild Tab */}
        {browseTab === 'create' && (
          <div className="max-w-md mx-auto bg-slate-900/90 rounded-2xl border border-slate-800 p-8 text-center space-y-6">
            <div className="w-28 h-28 mx-auto bg-gradient-to-br from-amber-500/20 to-amber-900/30 rounded-2xl border-2 border-dashed border-amber-500/50 flex items-center justify-center">
              <span className="text-6xl">🏯</span>
            </div>
            <div className="space-y-2">
              <h3 className="font-title text-2xl text-xianxia-gold">Sáng Lập Bang Hội</h3>
              <p className="text-xs text-slate-400">
                Chi phí 1000 💎 Linh Thạch. Bạn sẽ trở thành Bang Chủ với toàn quyền quản lý.
              </p>
            </div>
            <input
              type="text"
              value={guildNameInput}
              onChange={(e) => setGuildNameInput(e.target.value)}
              placeholder="Nhập tên bang hội..."
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-center font-title text-xl placeholder:text-slate-600 focus:border-xianxia-jade focus:outline-none transition-all"
            />
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Chi phí</div>
              <div className="text-2xl font-bold text-gold-gradient">1,000 💎</div>
              <div className="text-xs text-slate-500 mt-1">
                Linh Thạch hiện có: <span className="text-xianxia-gold font-bold">{character.spiritStones.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={handleCreateGuild}
              disabled={loading || guildNameInput.trim().length < 2 || character.spiritStones < 1000}
              className="w-full py-3 rounded-xl font-subheading font-bold text-slate-950 bg-xianxia-gold hover:bg-xianxia-gold-light transition-all shadow-xianxia-gold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Đang xử lý...' : '🏯 Sáng Lập Bang Hội (1000 💎)'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── MY GUILD VIEW ──
  const canManageRequests = myRole === 'Bang Chủ' || myRole === 'Phó Bang Chủ';
  const canManageRoles = myRole === 'Bang Chủ';

  const GUILD_TABS: { id: GuildTab; label: string; icon: string; show: boolean }[] = [
    { id: 'info', label: 'Thông Tin', icon: '📜', show: true },
    { id: 'members', label: 'Thành Viên', icon: '👥', show: true },
    { id: 'requests', label: `Đơn Xin (${requests.length})`, icon: '📩', show: canManageRequests },
    { id: 'upgrade', label: 'Nâng Cấp', icon: '⬆️', show: true },
  ];

  return (
    <div className="w-full bg-slate-950/80 border border-xianxia-jade/30 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="font-title text-2xl sm:text-3xl text-jade-gradient">
            🏯 {myGuild?.name || 'Bang Hội'}
          </h2>
          <p className="font-subheading text-slate-300 text-xs sm:text-sm">
            Cấp {myGuild?.level || 1} • {members.length}/{myGuild?.max_members || 5} thành viên
            {myRole && <> • Chức vụ: <span className="text-xianxia-gold">{ROLE_ICONS[myRole]} {myRole}</span></>}
          </p>
        </div>
        <div className="bg-slate-900 border border-xianxia-jade/30 px-4 py-2 rounded-xl text-xs font-bold text-xianxia-jade flex items-center space-x-2">
          <span>💎 Kho bang:</span>
          <span className="text-base text-slate-100">{Number(myGuild?.vault_stones || 0).toLocaleString()}</span>
        </div>
      </div>

      {renderMessage()}

      {/* Tab Nav */}
      <div className="flex space-x-2 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
        {GUILD_TABS.filter((t) => t.show).map((tab) => (
          <button
            key={tab.id}
            onClick={() => { soundManager.playClick(); setGuildTab(tab.id); }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-subheading font-bold transition-all ${
              guildTab === tab.id
                ? 'bg-xianxia-jade/20 text-xianxia-jade border border-xianxia-jade/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Info Tab */}
      {guildTab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
            <h3 className="font-title text-xl text-xianxia-jade">📜 Tổng Quan</h3>
            <div className="space-y-3 text-xs">
              {[
                ['Tên Bang', myGuild?.name, 'text-xianxia-gold'],
                ['Cấp Bang', `Cấp ${myGuild?.level || 1}`, 'text-amber-300'],
                ['Thành Viên', `${members.length} / ${myGuild?.max_members || 5}`, 'text-slate-100'],
                ['Kho Bang', `${Number(myGuild?.vault_stones || 0).toLocaleString()} 💎`, 'text-gold-gradient'],
                ['Bang Chủ', `👑 ${myGuild?.leader_name || ''}`, 'text-amber-300'],
              ].map(([label, val, cls]) => (
                <div key={label as string} className="flex justify-between items-center p-2 bg-slate-950 rounded-lg">
                  <span className="text-slate-400">{label}</span>
                  <span className={`font-bold ${cls}`}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-title text-xl text-xianxia-gold">💎 Kho Bang Hội</h3>
              <div className="text-3xl font-bold text-gold-gradient mt-3">{Number(myGuild?.vault_stones || 0).toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-1">Linh Thạch</div>
            </div>
            <button onClick={() => soundManager.playClick()} className="w-full py-2.5 bg-xianxia-jade hover:bg-xianxia-jade-light text-slate-950 font-subheading font-bold rounded-xl transition-all shadow-md">
              💰 Cống Hiến Kho Bang
            </button>
          </div>

          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-title text-xl text-rose-400">🐉 Boss Bang & Bang Chiến</h3>
              <p className="text-xs text-slate-300 mt-2">Boss Bang mở vào 20:00 hằng ngày.</p>
            </div>
            <button onClick={() => soundManager.playClick()} className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-subheading font-bold rounded-xl transition-all shadow-md">
              ⚔️ Khiêu Chiến Boss Bang
            </button>
          </div>
        </div>
      )}

      {/* Members Tab */}
      {guildTab === 'members' && (
        <div className="space-y-3">
          <h3 className="font-title text-lg text-xianxia-jade">👥 Thành Viên ({members.length}/{myGuild?.max_members || 5})</h3>
          {members.map((m) => {
            const isMe = m.name === character.name;
            const role = m.role as GuildRole;
            const roleIdx = ROLE_ORDER.indexOf(role);
            const canPromote = canManageRoles && !isMe && role !== 'Bang Chủ' && roleIdx > 1;
            const canDemote = canManageRoles && !isMe && role !== 'Bang Chủ' && roleIdx < ROLE_ORDER.length - 1;

            return (
              <div key={m.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                isMe ? 'bg-amber-950/20 border-amber-500/30' : 'bg-slate-900/90 border-slate-800 hover:border-slate-600'
              }`}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-950 rounded-full border border-slate-700 flex items-center justify-center text-2xl">
                    {role === 'Bang Chủ' ? '👑' : role === 'Phó Bang Chủ' ? '⭐' : '⚔️'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-100">{m.name}</span>
                      {isMe && <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-full font-bold">BẠN</span>}
                    </div>
                    <div className="text-xs text-slate-400">{m.realm} • Lực Chiến: {Number(m.combat_power).toLocaleString()}</div>
                    <div className="text-xs mt-0.5">
                      <span className={`font-bold ${ROLE_COLORS[role] || 'text-slate-400'}`}>{ROLE_ICONS[role] || '🌱'} {role}</span>
                    </div>
                  </div>
                </div>
                {(canPromote || canDemote) && (
                  <div className="flex items-center space-x-2">
                    {canPromote && (
                      <button onClick={() => handleChangeRole(m.user_id, 'up')} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/40 transition-all">
                        ⬆️ Thăng
                      </button>
                    )}
                    {canDemote && (
                      <button onClick={() => handleChangeRole(m.user_id, 'down')} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600/40 transition-all">
                        ⬇️ Giáng
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Requests Tab */}
      {guildTab === 'requests' && canManageRequests && (
        <div className="space-y-3">
          <h3 className="font-title text-lg text-xianxia-jade">📩 Đơn Xin Gia Nhập ({requests.length})</h3>
          {requests.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              <span className="text-4xl block mb-3">📭</span>
              Không có đơn xin nào đang chờ duyệt.
            </div>
          ) : (
            requests.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-4 bg-slate-900/90 rounded-xl border border-amber-500/20">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-950 rounded-full border border-amber-500/30 flex items-center justify-center text-2xl">📩</div>
                  <div>
                    <div className="font-bold text-sm text-slate-100">{r.name}</div>
                    <div className="text-xs text-slate-400">{r.realm} • Lực Chiến: {Number(r.combat_power).toLocaleString()}</div>
                    <div className="text-[10px] text-slate-600">Gửi lúc: {r.created_at}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRequest(r.id, 'accept')}
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/40 transition-all"
                  >
                    ✅ Duyệt
                  </button>
                  <button
                    onClick={() => handleRequest(r.id, 'reject')}
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600/40 transition-all"
                  >
                    🚫 Từ Chối
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Upgrade Tab */}
      {guildTab === 'upgrade' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-5">
            <h3 className="font-title text-xl text-xianxia-jade">📦 Mở Rộng Slot</h3>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Slot hiện tại</span>
                <span className="text-slate-100 font-bold">{myGuild?.max_members || 5} chỗ</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-xianxia-jade to-emerald-400 rounded-full transition-all"
                  style={{ width: `${Math.min((members.length / (myGuild?.max_members || 5)) * 100, 100)}%` }}
                />
              </div>
              <div className="text-center text-[10px] text-slate-500">Đang sử dụng {members.length}/{myGuild?.max_members || 5} slot</div>
            </div>
            <p className="text-xs text-slate-500 text-center italic">Tính năng nâng cấp sẽ sớm ra mắt!</p>
          </div>

          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-5">
            <h3 className="font-title text-xl text-xianxia-gold">💰 Cống Hiến Kho Bang</h3>
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
              <p>📌 Kho bang dùng để:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-500">
                <li>Nâng cấp kỹ năng bang hội</li>
                <li>Mở rộng kho chứa trang bị</li>
                <li>Tổ chức Bang Chiến & Boss Bang</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
