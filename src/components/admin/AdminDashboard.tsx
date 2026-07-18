import React, { useState } from 'react';
import { soundManager } from '../../services/SoundManager';
import { RealmTier, SpiritualRootType } from '../../types/game';
import { useGameStore, REALM_ORDER } from '../../store/gameStore';
import { apiClient } from '../../services/apiClient';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  realm: RealmTier;
  spiritualRoot: SpiritualRootType;
  sect: string;
  combatPower: number;
  spiritStones: number;
  vipLevel: number;
  role: 'Player' | 'Moderator' | 'Admin';
  status: 'Active' | 'Banned';
  createdAt: string;
}

const INITIAL_USERS: UserRecord[] = [
  {
    id: 'u-101',
    name: 'Bắc Phong',
    email: 'bactien.tudao@gmail.com',
    realm: 'Luyện Khí',
    spiritualRoot: 'Thiên Linh Căn',
    sect: 'Thanh Vân Tông',
    combatPower: 1250,
    spiritStones: 500,
    vipLevel: 1,
    role: 'Player',
    status: 'Active',
    createdAt: '2026-07-01',
  },
  {
    id: 'u-102',
    name: 'Độc Cô Cầu Bại',
    email: 'docco.caubai@gmail.com',
    realm: 'Kim Tiên',
    spiritualRoot: 'Biến Dị Linh Căn',
    sect: 'Vạn Kiếm Sơn',
    combatPower: 98500,
    spiritStones: 25000,
    vipLevel: 8,
    role: 'Moderator',
    status: 'Active',
    createdAt: '2026-06-15',
  },
  {
    id: 'u-103',
    name: 'Cuồng Kiếm Ma Tôn',
    email: 'cuongkiem@gmail.com',
    realm: 'Hóa Thần',
    spiritualRoot: 'Hỏa',
    sect: 'Thiên Ma Giáo',
    combatPower: 54100,
    spiritStones: 12000,
    vipLevel: 5,
    role: 'Player',
    status: 'Active',
    createdAt: '2026-06-20',
  },
  {
    id: 'u-104',
    name: 'Tuyết Sơn Tiên Tử',
    email: 'tuyetson@gmail.com',
    realm: 'Chân Tiên',
    spiritualRoot: 'Thiên Linh Căn',
    sect: 'Thanh Vân Tông',
    combatPower: 76200,
    spiritStones: 18000,
    vipLevel: 7,
    role: 'Player',
    status: 'Active',
    createdAt: '2026-06-18',
  },
  {
    id: 'u-105',
    name: 'Quản Trị Viên Huyết Lệnh',
    email: 'admin@thiendao.online',
    realm: 'Tiên Đế',
    spiritualRoot: 'Thiên Linh Căn',
    sect: 'Thái Hư Cung',
    combatPower: 999999,
    spiritStones: 999999,
    vipLevel: 10,
    role: 'Admin',
    status: 'Active',
    createdAt: '2026-01-01',
  },
];

export const AdminDashboard: React.FC = () => {
  const { character } = useGameStore();
  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'broadcast' | 'analytics'>('users');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Load live users directly from MySQL Database & Local Storage on mount
  React.useEffect(() => {
    const loadDbUsers = async () => {
      const localAdminUsersJson = localStorage.getItem('thien_dao_admin_users');
      let localAdminMap: Record<string, UserRecord> = {};
      if (localAdminUsersJson) {
        try {
          const parsed = JSON.parse(localAdminUsersJson);
          if (Array.isArray(parsed)) {
            parsed.forEach((u: UserRecord) => {
              localAdminMap[u.email.toLowerCase()] = u;
            });
          }
        } catch (e) {}
      }

      const res = await apiClient.getUsers();
      if (res && res.users && Array.isArray(res.users) && res.users.length > 0) {
        const mergedUsers = res.users.map((dbUser: UserRecord) => {
          const emailKey = dbUser.email.toLowerCase();
          const accStorageJson = localStorage.getItem(`thien_dao_account_${emailKey}`);
          let accStatus = dbUser.status;
          if (accStorageJson) {
            try {
              const accData = JSON.parse(accStorageJson);
              if (accData.character?.status) {
                accStatus = accData.character.status;
              }
            } catch (e) {}
          }
          const localRecord = localAdminMap[emailKey];
          return {
            ...dbUser,
            status: localRecord?.status || accStatus || 'Active',
            realm: localRecord?.realm || dbUser.realm,
            spiritStones: localRecord?.spiritStones ?? dbUser.spiritStones,
            vipLevel: localRecord?.vipLevel ?? dbUser.vipLevel,
            combatPower: localRecord?.combatPower ?? dbUser.combatPower,
          };
        });
        setUsers(mergedUsers);
        localStorage.setItem('thien_dao_admin_users', JSON.stringify(mergedUsers));
      } else if (Object.keys(localAdminMap).length > 0) {
        setUsers(Object.values(localAdminMap));
      }
    };
    loadDbUsers();
  }, []);

  // Modal States
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New User Form State
  const [newUser, setNewUser] = useState<Partial<UserRecord>>({
    name: '',
    email: '',
    realm: 'Luyện Khí',
    spiritualRoot: 'Kim',
    sect: 'Thanh Vân Tông',
    combatPower: 1000,
    spiritStones: 500,
    vipLevel: 1,
    role: 'Player',
    status: 'Active',
  });

  // Broadcast state
  const [announceText, setAnnounceText] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.sect.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const triggerSuccessMsg = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const syncUserAccountStorage = (userRecord: UserRecord) => {
    const cleanEmail = userRecord.email.toLowerCase();
    const storageKey = `thien_dao_account_${cleanEmail}`;

    let existingData: any = {};
    const savedJson = localStorage.getItem(storageKey);
    if (savedJson) {
      try {
        existingData = JSON.parse(savedJson);
      } catch (e) {}
    }

    const char = existingData.character || {
      id: userRecord.id,
      name: userRecord.name,
      title: 'Vô Danh Tu Sĩ',
      realm: userRecord.realm,
      realmLevel: 1,
      spiritualRoot: userRecord.spiritualRoot,
      spiritualRootBonus: 1.5,
      sect: userRecord.sect,
      combatPower: userRecord.combatPower,
      spiritStones: userRecord.spiritStones,
      vipLevel: userRecord.vipLevel,
      role: userRecord.role,
      exp: 0,
      maxExp: 1000,
      hp: 1000,
      maxHp: 1000,
      mana: 500,
      maxMana: 500,
      spiritualPower: 500,
      maxSpiritualPower: 500,
      lifespan: 100,
      maxLifespan: 1000,
      reputation: 100,
    };

    // Update character properties with Admin's new values
    char.name = userRecord.name;
    char.realm = userRecord.realm;
    char.combatPower = userRecord.combatPower;
    char.spiritStones = userRecord.spiritStones;
    char.vipLevel = userRecord.vipLevel;
    char.sect = userRecord.sect;
    char.role = userRecord.role;
    char.status = userRecord.status;

    const payload = {
      ...existingData,
      character: char,
    };

    localStorage.setItem(storageKey, JSON.stringify(payload));

    // Update global admin users list persistence
    setUsers((currentUsers) => {
      const nextUsers = currentUsers.map((u) => (u.email.toLowerCase() === cleanEmail ? { ...u, ...userRecord } : u));
      localStorage.setItem('thien_dao_admin_users', JSON.stringify(nextUsers));
      return nextUsers;
    });

    // If currently logged into this account, update live store state instantly
    if (cleanEmail === useGameStore.getState().currentAccountEmail) {
      useGameStore.setState((s) => ({
        character: {
          ...s.character,
          name: userRecord.name,
          realm: userRecord.realm,
          combatPower: userRecord.combatPower,
          spiritStones: userRecord.spiritStones,
          vipLevel: userRecord.vipLevel,
          sect: userRecord.sect,
          role: userRecord.role,
          status: userRecord.status,
        },
      }));
    }
  };

  // 1. QUICK ACTION: Grant Spirit Stones (+10,000 Linh Thạch)
  const handleAddStones = async (user: UserRecord, amount: number = 10000) => {
    soundManager.playClick();
    soundManager.playBreakthroughSound(true);

    const updatedUser = {
      ...user,
      spiritStones: user.spiritStones + amount,
    };

    setUsers(users.map((u) => (u.id === user.id ? updatedUser : u)));
    syncUserAccountStorage(updatedUser);
    await apiClient.updateUser(user.id, updatedUser);

    triggerSuccessMsg(`🎉 Đã thưởng thành công +${amount.toLocaleString('vi-VN')} Linh Thạch cho tu sĩ [${user.name}]!`);
  };

  // 2. QUICK ACTION: Upgrade Realm (Thăng Cảnh Giới)
  const handleUpgradeRealm = async (user: UserRecord) => {
    soundManager.playClick();
    soundManager.playBreakthroughSound(true);

    const currentIdx = REALM_ORDER.indexOf(user.realm);
    const nextRealm = currentIdx < REALM_ORDER.length - 1 ? REALM_ORDER[currentIdx + 1] : user.realm;
    const updatedUser = {
      ...user,
      realm: nextRealm,
      combatPower: Math.floor(user.combatPower * 1.5),
    };

    setUsers(users.map((u) => (u.id === user.id ? updatedUser : u)));
    syncUserAccountStorage(updatedUser);
    await apiClient.updateUser(user.id, updatedUser);

    triggerSuccessMsg(`⚡ Admin đã ban thưởng thăng cấp Cảnh Giới [${nextRealm}] cho tu sĩ [${user.name}]!`);
  };

  // 3. CREATE USER (C)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    if (!newUser.name || !newUser.email) return;

    const createdRecord: UserRecord = {
      id: `u-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      realm: (newUser.realm as RealmTier) || 'Luyện Khí',
      spiritualRoot: (newUser.spiritualRoot as SpiritualRootType) || 'Kim',
      sect: newUser.sect || 'Thanh Vân Tông',
      combatPower: Number(newUser.combatPower) || 1000,
      spiritStones: Number(newUser.spiritStones) || 500,
      vipLevel: Number(newUser.vipLevel) || 1,
      role: newUser.role || 'Player',
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setUsers([createdRecord, ...users]);
    await apiClient.createUser(createdRecord);
    setIsCreateModalOpen(false);
    triggerSuccessMsg(`➕ Đã tạo thành công tài khoản tu sĩ mới [${createdRecord.name}]!`);
    setNewUser({
      name: '',
      email: '',
      realm: 'Luyện Khí',
      spiritualRoot: 'Kim',
      sect: 'Thanh Vân Tông',
      combatPower: 1000,
      spiritStones: 500,
      vipLevel: 1,
      role: 'Player',
      status: 'Active',
    });
  };

  // 4. UPDATE USER (U)
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    if (!editingUser) return;

    setUsers(users.map((u) => (u.id === editingUser.id ? editingUser : u)));
    syncUserAccountStorage(editingUser);
    await apiClient.updateUser(editingUser.id, editingUser);
    triggerSuccessMsg(`✏️ Đã cập nhật thành công hồ sơ tu sĩ [${editingUser.name}]!`);
    setEditingUser(null);
  };

  // 5. DELETE USER (D)
  const handleDeleteUser = async (id: string, name: string) => {
    soundManager.playClick();
    if (confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản tu sĩ [${name}] khỏi cõi Thiên Đạo và MySQL Database?`)) {
      setUsers(users.filter((u) => u.id !== id));
      await apiClient.deleteUser(id);
      triggerSuccessMsg(`🗑️ Đã xóa hoàn toàn tài khoản [${name}]!`);
    }
  };

  // 6. BAN / UNBAN USER
  const handleToggleBan = async (user: UserRecord) => {
    soundManager.playClick();
    const newStatus: 'Active' | 'Banned' = user.status === 'Active' ? 'Banned' : 'Active';
    const updatedUser: UserRecord = { ...user, status: newStatus };

    setUsers(users.map((u) => (u.id === user.id ? updatedUser : u)));
    syncUserAccountStorage(updatedUser);
    await apiClient.updateUser(user.id, updatedUser);

    triggerSuccessMsg(
      newStatus === 'Banned'
        ? `🔒 Đã phong ấn (Ban) tài khoản tu sĩ [${user.name}]!`
        : `🔓 Đã giải phong ấn (Unban) tài khoản [${user.name}]!`
    );
  };

  // 7. BROADCAST ANNOUNCEMENT
  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    if (!announceText.trim()) return;
    const msg = announceText.trim();
    setBroadcastSent(true);
    localStorage.setItem('thien_dao_server_broadcast', msg);
    window.dispatchEvent(new CustomEvent('thien_dao_broadcast_updated', { detail: msg }));
    await apiClient.broadcastAnnouncement(msg);
    setTimeout(() => {
      setBroadcastSent(false);
      setAnnounceText('');
    }, 3000);
  };

  return (
    <div className="w-full bg-slate-950/90 border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="font-title text-2xl sm:text-3xl text-rose-400">
              ADMIN QUẢN TRỊ THIÊN ĐẠO
            </h2>
            <span className="px-3 py-0.5 bg-rose-950 border border-rose-500 text-rose-300 font-extrabold text-xs rounded-full animate-pulse">
              Role: Administrator
            </span>
          </div>
          <p className="font-subheading text-slate-300 text-xs sm:text-sm mt-0.5">
            Quyền lực tối cao: Thưởng Linh Thạch, Thăng Cảnh Giới, Chỉnh Sửa, Phong Ấn (Ban) & Xóa User
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('users');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-subheading transition-all ${
              activeTab === 'users'
                ? 'bg-rose-600 text-white shadow-lg'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            👥 Quản Lý User ({users.length})
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('broadcast');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-subheading transition-all ${
              activeTab === 'broadcast'
                ? 'bg-rose-600 text-white shadow-lg'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            📢 Thông Báo
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('analytics');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-subheading transition-all ${
              activeTab === 'analytics'
                ? 'bg-rose-600 text-white shadow-lg'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            📊 Thống Kê Server
          </button>
        </div>
      </div>

      {/* Global Success Notification Alert */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs font-subheading font-bold text-center rounded-xl shadow-lg animate-bounce">
          {actionSuccessMsg}
        </div>
      )}

      {/* TAB 1: USER CRUD & QUICK MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Controls Bar: Search & Add User */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 Tìm theo tên, email, môn phái..."
                className="w-full bg-slate-950 border border-slate-700 px-4 py-2 rounded-lg text-xs text-white outline-none focus:border-rose-500"
              />
            </div>

            <button
              onClick={() => {
                soundManager.playClick();
                setIsCreateModalOpen(true);
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 font-subheading font-bold text-white text-xs rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              <span>➕</span>
              <span>Tạo Mới Tài Khoản Tu Sĩ</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto bg-slate-900/90 rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-xianxia-gold font-subheading uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Tu Sĩ / Email</th>
                  <th className="p-3">Cảnh Giới</th>
                  <th className="p-3">VIP</th>
                  <th className="p-3">Linh Thạch</th>
                  <th className="p-3">Lực Chiến</th>
                  <th className="p-3">Quyền</th>
                  <th className="p-3">Trạng Thái</th>
                  <th className="p-3 text-right">Thao Tác Admin (Thưởng / Đổi / Xóa)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-100">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="p-3 font-semibold text-amber-300">{u.realm}</td>
                    <td className="p-3 font-bold text-xianxia-gold">VIP {u.vipLevel}</td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">💎 {u.spiritStones.toLocaleString('vi-VN')}</td>
                    <td className="p-3 font-mono text-xianxia-gold">⚡ {u.combatPower.toLocaleString('vi-VN')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'Admin' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' : u.role === 'Moderator' ? 'bg-purple-950 text-purple-300' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.status === 'Active' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-red-950 text-red-400 border border-red-500/30'
                      }`}>
                        {u.status === 'Active' ? 'Hoạt Động' : 'Phong Ấn (Ban)'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1.5">
                      {/* Admin Quick Action 1: Grant Spirit Stones */}
                      <button
                        onClick={() => handleAddStones(u, 10000)}
                        className="px-2 py-1 bg-emerald-900/40 hover:bg-emerald-800 text-emerald-300 rounded text-[11px] font-bold border border-emerald-500/30"
                        title="Ban thưởng +10,000 Linh Thạch"
                      >
                        💎 +10k
                      </button>

                      {/* Admin Quick Action 2: Upgrade Realm */}
                      <button
                        onClick={() => handleUpgradeRealm(u)}
                        className="px-2 py-1 bg-amber-900/40 hover:bg-amber-800 text-amber-300 rounded text-[11px] font-bold border border-amber-500/30"
                        title="Admin Thăng Cảnh Giới"
                      >
                        ⚡ Thăng Cấp
                      </button>

                      {/* Edit Modal Button */}
                      <button
                        onClick={() => {
                          soundManager.playClick();
                          setEditingUser(u);
                        }}
                        className="px-2 py-1 bg-blue-900/40 hover:bg-blue-800 text-blue-300 rounded text-[11px] font-bold border border-blue-500/30"
                        title="Chỉnh Sửa Chi Tiết Hồ Sơ"
                      >
                        ✏️ Sửa
                      </button>

                      {/* Ban / Unban Toggle */}
                      <button
                        onClick={() => handleToggleBan(u)}
                        className={`px-2 py-1 rounded text-[11px] font-bold border ${
                          u.status === 'Active'
                            ? 'bg-purple-900/40 hover:bg-purple-800 text-purple-300 border-purple-500/30'
                            : 'bg-emerald-900/40 hover:bg-emerald-800 text-emerald-300 border-emerald-500/30'
                        }`}
                        title="Khóa/Mở Khóa Tu Sĩ"
                      >
                        {u.status === 'Active' ? '🔒 Khóa' : '🔓 Mở'}
                      </button>

                      {/* Delete Account */}
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="px-2 py-1 bg-rose-900/40 hover:bg-rose-800 text-rose-400 rounded text-[11px] font-bold border border-rose-500/30"
                        title="Xóa Vĩnh Viễn Tài Khoản"
                      >
                        🗑️ Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BROADCAST */}
      {activeTab === 'broadcast' && (
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="font-title text-lg text-slate-100">📢 Phát Thông Báo Toàn Server</h3>
          <form onSubmit={handleBroadcast} className="flex gap-3">
            <input
              type="text"
              value={announceText}
              onChange={(e) => setAnnounceText(e.target.value)}
              placeholder="Nhập thông báo thiên hạ..."
              className="flex-1 bg-slate-950 border border-slate-700 px-4 py-2 rounded-lg text-white text-xs outline-none focus:border-rose-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-rose-600 hover:bg-rose-500 font-subheading font-bold text-white text-xs rounded-lg transition-all"
            >
              Phát Thông Báo
            </button>
          </form>

          {broadcastSent && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs font-subheading text-center rounded-lg animate-pulse">
              ✅ Thông báo đã phát thành công trên toàn hệ thống Thiên Đạo!
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SERVER ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
            <div className="text-xs text-slate-400">Tổng Tu Sĩ Trực Tuyến</div>
            <div className="text-2xl font-bold text-xianxia-gold mt-1">12,840</div>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
            <div className="text-xs text-slate-400">Độ Kiếp Thành Công (24h)</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">1,450</div>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
            <div className="text-xs text-slate-400">Giao Dịch Linh Thạch</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">8.5M 💎</div>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
            <div className="text-xs text-slate-400">Tỷ Lệ Server Load</div>
            <div className="text-2xl font-bold text-purple-400 mt-1">18%</div>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE USER (C) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-xianxia-card border border-rose-500/40 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <h3 className="font-title text-2xl text-rose-400">➕ TẠO TÀI KHOẢN TU SĨ MỚI</h3>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Tên Tu Sĩ:</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Email:</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Cảnh Giới Khởi Đầu:</label>
                  <select
                    value={newUser.realm}
                    onChange={(e) => setNewUser({ ...newUser, realm: e.target.value as RealmTier })}
                    className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded text-white outline-none"
                  >
                    {REALM_ORDER.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Môn Phái:</label>
                  <input
                    type="text"
                    value={newUser.sect}
                    onChange={(e) => setNewUser({ ...newUser, sect: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Lực Chiến (Combat Power):</label>
                  <input
                    type="number"
                    value={newUser.combatPower}
                    onChange={(e) => setNewUser({ ...newUser, combatPower: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Ban Thưởng Linh Thạch:</label>
                  <input
                    type="number"
                    value={newUser.spiritStones}
                    onChange={(e) => setNewUser({ ...newUser, spiritStones: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 text-white rounded font-bold shadow-lg"
                >
                  Tạo Mới Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT USER (U) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-xianxia-card border border-amber-500/40 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <h3 className="font-title text-2xl text-amber-400">✏️ CHỈNH SỬA TOÀN DIỆN THÔNG TIN TU SĨ</h3>
            <form onSubmit={handleUpdateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Tên Tu Sĩ:</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Cảnh Giới:</label>
                  <select
                    value={editingUser.realm}
                    onChange={(e) => setEditingUser({ ...editingUser, realm: e.target.value as RealmTier })}
                    className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded text-white outline-none"
                  >
                    {REALM_ORDER.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Cấp Độ VIP:</label>
                  <input
                    type="number"
                    value={editingUser.vipLevel}
                    onChange={(e) => setEditingUser({ ...editingUser, vipLevel: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Lực Chiến (Combat Power):</label>
                  <input
                    type="number"
                    value={editingUser.combatPower}
                    onChange={(e) => setEditingUser({ ...editingUser, combatPower: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Số Dư Linh Thạch:</label>
                  <input
                    type="number"
                    value={editingUser.spiritStones}
                    onChange={(e) => setEditingUser({ ...editingUser, spiritStones: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Môn Phái:</label>
                  <input
                    type="text"
                    value={editingUser.sect}
                    onChange={(e) => setEditingUser({ ...editingUser, sect: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Phân Quyền Server:</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded text-white outline-none"
                  >
                    <option value="Player">Player</option>
                    <option value="Moderator">Moderator</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-600 text-slate-950 rounded font-bold shadow-lg"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
