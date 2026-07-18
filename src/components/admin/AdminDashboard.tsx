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
  const [activeTab, setActiveTab] = useState<'users' | 'broadcast' | 'analytics' | 'shop' | 'giftcodes'>('users');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Shop & Giftcode states
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [giftcodes, setGiftcodes] = useState<any[]>([]);

  // New Shop Item Form
  const [newShopItem, setNewShopItem] = useState({
    name: '',
    type: 'Equipment',
    rarity: 'Linh',
    description: '',
    icon: '⚔️',
    price: 500,
    atk: 100,
    hp: 200,
    def: 50,
  });

  // New Giftcode Form
  const [newGiftcode, setNewGiftcode] = useState({
    code: '',
    spiritStones: 10000,
    itemName: '',
    itemType: 'Pill',
    itemRarity: 'Thiên',
    itemIcon: '💊',
    itemDescription: 'Quà tặng từ Giftcode',
    exp: 5000,
    maxUses: 100,
  });

  const loadShopItems = async () => {
    const res = await apiClient.getShopItems();
    if (res?.status === 'success') setShopItems(res.items || []);
  };

  const loadGiftcodes = async () => {
    const res = await apiClient.adminGetGiftcodes();
    if (res?.status === 'success') setGiftcodes(res.giftcodes || []);
  };

  // Load live users directly from MySQL Database
  React.useEffect(() => {
    const loadDbUsers = async () => {
      const res = await apiClient.getUsers();
      if (res && res.users && Array.isArray(res.users) && res.users.length > 0) {
        setUsers(res.users);
      }
    };
    loadDbUsers();
    loadShopItems();
    loadGiftcodes();
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

  // Broadcast Announcement State
  const [announceText, setAnnounceText] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  const triggerSuccessMsg = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  // Create Shop Item
  const handleCreateShopItem = async (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    if (!newShopItem.name.trim()) return;
    const stats: any = {};
    if (newShopItem.atk > 0) stats.atk = newShopItem.atk;
    if (newShopItem.hp > 0) stats.hp = newShopItem.hp;
    if (newShopItem.def > 0) stats.def = newShopItem.def;

    const res = await apiClient.adminCreateShopItem({
      ...newShopItem,
      stats,
    });
    if (res?.status === 'success') {
      triggerSuccessMsg(`📦 Đã tạo vật phẩm Shop mới [${newShopItem.name}]!`);
      setNewShopItem({ name: '', type: 'Equipment', rarity: 'Linh', description: '', icon: '⚔️', price: 500, atk: 100, hp: 200, def: 50 });
      loadShopItems();
    }
  };

  // Delete Shop Item
  const handleDeleteShopItem = async (id: number, name: string) => {
    soundManager.playClick();
    if (confirm(`Xóa vật phẩm [${name}] khỏi Shop hệ thống?`)) {
      await apiClient.adminDeleteShopItem(id);
      triggerSuccessMsg(`🗑️ Đã xóa [${name}] khỏi Shop!`);
      loadShopItems();
    }
  };

  // Create Giftcode
  const handleCreateGiftcode = async (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    if (!newGiftcode.code.trim()) return;

    const itemStats = newGiftcode.exp > 0 ? { exp: newGiftcode.exp } : null;

    const res = await apiClient.adminCreateGiftcode({
      ...newGiftcode,
      itemStats,
    });
    if (res?.status === 'success') {
      triggerSuccessMsg(`🎁 Đã tạo mã Giftcode mới [${newGiftcode.code.toUpperCase()}]!`);
      setNewGiftcode({ code: '', spiritStones: 10000, itemName: '', itemType: 'Pill', itemRarity: 'Thiên', itemIcon: '💊', itemDescription: 'Quà tặng từ Giftcode', exp: 5000, maxUses: 100 });
      loadGiftcodes();
    } else {
      triggerSuccessMsg(`❌ ${res?.message || 'Không thể tạo mã Giftcode.'}`);
    }
  };

  // Delete Giftcode
  const handleDeleteGiftcode = async (id: number, code: string) => {
    soundManager.playClick();
    if (confirm(`Xóa mã Giftcode [${code}]?`)) {
      await apiClient.adminDeleteGiftcode(id);
      triggerSuccessMsg(`🗑️ Đã xóa Giftcode [${code}]!`);
      loadGiftcodes();
    }
  };

  const handleAddStones = async (user: UserRecord, amount: number = 10000) => {
    soundManager.playClick();
    soundManager.playBreakthroughSound(true);
    const updatedUser = { ...user, spiritStones: user.spiritStones + amount };
    setUsers(users.map((u) => (u.id === user.id ? updatedUser : u)));
    await apiClient.updateUser(user.id, updatedUser);
    triggerSuccessMsg(`💰 Đã cấp +${amount.toLocaleString()} Linh Thạch cho tu sĩ [${user.name}]!`);
  };

  const handleAdvanceRealm = async (user: UserRecord) => {
    soundManager.playClick();
    const currentRealmIndex = REALM_ORDER.indexOf(user.realm as any);
    const nextRealmIndex = currentRealmIndex < REALM_ORDER.length - 1 ? currentRealmIndex + 1 : currentRealmIndex;
    const nextRealm = REALM_ORDER[nextRealmIndex];
    const newCombatPower = user.combatPower + 10000;
    const updatedUser = { ...user, realm: nextRealm as any, combatPower: newCombatPower };

    setUsers(users.map((u) => (u.id === user.id ? updatedUser : u)));
    await apiClient.updateUser(user.id, updatedUser);
    triggerSuccessMsg(`⚡ Đã ban phước thăng cảnh giới [${nextRealm}] cho tu sĩ [${user.name}]!`);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    if (!newUser.name || !newUser.email) return;
    const createdRecord: UserRecord = {
      id: `u-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      realm: newUser.realm || 'Luyện Khí',
      spiritualRoot: newUser.spiritualRoot || 'Kim',
      sect: newUser.sect || 'Thanh Vân Tông',
      combatPower: newUser.combatPower || 1000,
      spiritStones: newUser.spiritStones || 500,
      vipLevel: newUser.vipLevel || 1,
      role: newUser.role || 'Player',
      status: newUser.status || 'Active',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setUsers([createdRecord, ...users]);
    await apiClient.createUser(createdRecord);
    setIsCreateModalOpen(false);
    triggerSuccessMsg(`➕ Đã tạo thành công tài khoản tu sĩ mới [${createdRecord.name}]!`);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    if (!editingUser) return;
    setUsers(users.map((u) => (u.id === editingUser.id ? editingUser : u)));
    await apiClient.updateUser(editingUser.id, editingUser);
    triggerSuccessMsg(`✏️ Đã cập nhật thành công hồ sơ tu sĩ [${editingUser.name}]!`);
    setEditingUser(null);
  };

  const handleDeleteUser = async (id: string, name: string) => {
    soundManager.playClick();
    if (confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản tu sĩ [${name}]?`)) {
      setUsers(users.filter((u) => u.id !== id));
      await apiClient.deleteUser(id);
      triggerSuccessMsg(`🗑️ Đã xóa hoàn toàn tài khoản [${name}]!`);
    }
  };

  const handleToggleBan = async (user: UserRecord) => {
    soundManager.playClick();
    const newStatus: 'Active' | 'Banned' = user.status === 'Active' ? 'Banned' : 'Active';
    const updatedUser: UserRecord = { ...user, status: newStatus };
    setUsers(users.map((u) => (u.id === user.id ? updatedUser : u)));
    await apiClient.updateUser(user.id, updatedUser);
    triggerSuccessMsg(
      newStatus === 'Banned'
        ? `🔒 Đã phong ấn (Ban) tài khoản tu sĩ [${user.name}]!`
        : `🔓 Đã giải phong ấn (Unban) tài khoản [${user.name}]!`
    );
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    if (!announceText.trim()) return;
    const msg = announceText.trim();
    setBroadcastSent(true);
    window.dispatchEvent(new CustomEvent('thien_dao_broadcast_updated', { detail: msg }));
    await apiClient.broadcastAnnouncement(msg);
    setTimeout(() => {
      setBroadcastSent(false);
      setAnnounceText('');
    }, 3000);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.realm.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full bg-slate-950/90 border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="font-title text-2xl sm:text-3xl text-rose-400">
              ADMIN QUẢN TRỊ THIÊN ĐẠO
            </h2>
            <span className="px-3 py-0.5 bg-rose-950 border border-rose-500 text-rose-300 font-extrabold text-xs rounded-full animate-pulse">
              Administrator
            </span>
          </div>
          <p className="font-subheading text-slate-300 text-xs sm:text-sm mt-0.5">
            Tạo vật phẩm Shop, phát Giftcode, Thưởng Linh Thạch & Quản lý User
          </p>
        </div>

        {/* Tab Nav */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'users', label: `👥 Users (${users.length})` },
            { id: 'shop', label: `📦 Shop Vật Phẩm (${shopItems.length})` },
            { id: 'giftcodes', label: `🎁 Mã Giftcode (${giftcodes.length})` },
            { id: 'broadcast', label: '📢 Thông Báo' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { soundManager.playClick(); setActiveTab(tab.id as any); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold font-subheading transition-all ${
                activeTab === tab.id
                  ? 'bg-rose-600 text-white shadow-lg'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs font-subheading font-bold text-center rounded-xl shadow-lg animate-bounce">
          {actionSuccessMsg}
        </div>
      )}

      {/* TAB 1: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <div className="w-full sm:w-72 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 Tìm theo tên, email, cảnh giới..."
                className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-lg text-xs text-white placeholder-slate-500 focus:border-rose-500 outline-none"
              />
            </div>
            <button
              onClick={() => { soundManager.playClick(); setIsCreateModalOpen(true); }}
              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 text-xs font-subheading font-extrabold rounded-lg shadow-lg"
            >
              ➕ Tạo Tu Sĩ Mới
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-900 text-slate-400 font-subheading uppercase">
                <tr>
                  <th className="p-3">Tu Sĩ / Email</th>
                  <th className="p-3">Cảnh Giới</th>
                  <th className="p-3">Lực Chiến</th>
                  <th className="p-3">Linh Thạch</th>
                  <th className="p-3">Phân Quyền</th>
                  <th className="p-3 text-center">Thao Tác Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-subheading text-slate-200">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/30 text-[10px] font-bold">{u.realm}</span></td>
                    <td className="p-3 font-mono font-bold text-sky-300">{u.combatPower.toLocaleString()}</td>
                    <td className="p-3 font-mono font-bold text-xianxia-gold">{u.spiritStones.toLocaleString()} 💎</td>
                    <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${u.role === 'Admin' ? 'bg-rose-950 text-rose-300 border border-rose-500/50' : 'bg-slate-800 text-slate-300'}`}>{u.role}</span></td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button onClick={() => handleAddStones(u, 10000)} className="px-2 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/40 rounded text-[11px] font-bold" title="Cấp 10,000 Linh Thạch">💎 +10K</button>
                        <button onClick={() => handleAdvanceRealm(u)} className="px-2 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/40 rounded text-[11px] font-bold" title="Ban Thăng Cảnh Giới">⚡ Thăng</button>
                        <button onClick={() => setEditingUser(u)} className="px-2 py-1 bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/40 rounded text-[11px] font-bold">✏️ Sửa</button>
                        <button onClick={() => handleToggleBan(u)} className={`px-2 py-1 text-[11px] font-bold rounded ${u.status === 'Active' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>{u.status === 'Active' ? '🔒 Ban' : '🔓 Unban'}</button>
                        <button onClick={() => handleDeleteUser(u.id, u.name)} className="px-2 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600/40 rounded text-[11px] font-bold">🗑️ Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SYSTEM SHOP ITEM CREATION */}
      {activeTab === 'shop' && (
        <div className="space-y-6">
          {/* Create Form */}
          <form onSubmit={handleCreateShopItem} className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
            <h3 className="font-title text-xl text-xianxia-gold">➕ Tạo Vật Phẩm Đưa Lên Shop Hệ Thống</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-subheading">
              <div>
                <label className="block text-slate-400 mb-1">Tên Vật Phẩm *</label>
                <input
                  type="text"
                  value={newShopItem.name}
                  onChange={(e) => setNewShopItem({ ...newShopItem, name: e.target.value })}
                  placeholder="Ví dụ: Long Thần Kiếm..."
                  required
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white outline-none focus:border-xianxia-gold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Phân Loại</label>
                <select
                  value={newShopItem.type}
                  onChange={(e) => setNewShopItem({ ...newShopItem, type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white outline-none focus:border-xianxia-gold"
                >
                  <option value="Equipment">Trang Bị (Equipment)</option>
                  <option value="Pill">Đan Dược (Pill)</option>
                  <option value="Material">Nguyên Liệu (Material)</option>
                  <option value="Artifact">Pháp Bảo (Artifact)</option>
                  <option value="Pet">Linh Thú (Pet)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Phẩm Chất</label>
                <select
                  value={newShopItem.rarity}
                  onChange={(e) => setNewShopItem({ ...newShopItem, rarity: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white outline-none focus:border-xianxia-gold"
                >
                  {['Phàm', 'Linh', 'Huyền', 'Địa', 'Thiên', 'Tiên', 'Thần'].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Giá Linh Thạch (💎) *</label>
                <input
                  type="number"
                  value={newShopItem.price}
                  onChange={(e) => setNewShopItem({ ...newShopItem, price: Number(e.target.value) })}
                  required
                  min={1}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white outline-none focus:border-xianxia-gold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Biểu Tượng (Icon Emoji)</label>
                <input
                  type="text"
                  value={newShopItem.icon}
                  onChange={(e) => setNewShopItem({ ...newShopItem, icon: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white text-center outline-none focus:border-xianxia-gold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Chỉ Số Tấn Công (ATK)</label>
                <input
                  type="number"
                  value={newShopItem.atk}
                  onChange={(e) => setNewShopItem({ ...newShopItem, atk: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white outline-none focus:border-xianxia-gold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Chỉ Số Khí Huyết (HP)</label>
                <input
                  type="number"
                  value={newShopItem.hp}
                  onChange={(e) => setNewShopItem({ ...newShopItem, hp: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white outline-none focus:border-xianxia-gold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Chỉ Số Phòng Thủ (DEF)</label>
                <input
                  type="number"
                  value={newShopItem.def}
                  onChange={(e) => setNewShopItem({ ...newShopItem, def: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white outline-none focus:border-xianxia-gold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Mô Tả Vật Phẩm</label>
                <input
                  type="text"
                  value={newShopItem.description}
                  onChange={(e) => setNewShopItem({ ...newShopItem, description: e.target.value })}
                  placeholder="Mô tả thần khí..."
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white outline-none focus:border-xianxia-gold"
                />
              </div>
            </div>
            <button type="submit" className="px-6 py-2.5 bg-xianxia-gold text-slate-950 font-subheading font-bold rounded-xl shadow-lg hover:bg-amber-400 transition-all">
              🛒 Đưa Vật Phẩm Lên Shop Hệ Thống
            </button>
          </form>

          {/* Shop Item List */}
          <div className="space-y-3">
            <h3 className="font-title text-xl text-xianxia-gold">📦 Danh Sách Vật Phẩm Shop Hệ Thống ({shopItems.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {shopItems.map((item) => (
                <div key={item.id} className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-3 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{item.icon}</span>
                      <div>
                        <div className="font-bold text-sm text-slate-100">{item.name}</div>
                        <div className="text-[10px] text-amber-400">{item.rarity} • {item.type}</div>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteShopItem(item.id, item.name)} className="text-rose-400 hover:text-rose-300 text-xs font-bold p-1">
                      🗑️
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 italic line-clamp-2">{item.description || 'Không có mô tả.'}</p>
                  <div className="flex justify-between items-center bg-slate-950 p-2 rounded-xl text-xs font-bold">
                    <span className="text-slate-400">Giá bán:</span>
                    <span className="text-gold-gradient text-sm">{item.price.toLocaleString()} 💎</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GIFTCODE MANAGEMENT */}
      {activeTab === 'giftcodes' && (
        <div className="space-y-6">
          {/* Create Giftcode Form */}
          <form onSubmit={handleCreateGiftcode} className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
            <h3 className="font-title text-xl text-amber-400">🎁 Tạo Mã GIFTCODE Mới</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-subheading">
              <div>
                <label className="block text-slate-400 mb-1">Mã Giftcode (CODE) *</label>
                <input
                  type="text"
                  value={newGiftcode.code}
                  onChange={(e) => setNewGiftcode({ ...newGiftcode, code: e.target.value.toUpperCase() })}
                  placeholder="Ví dụ: TUDAO2026..."
                  required
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white font-mono font-bold outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Thưởng Linh Thạch (💎)</label>
                <input
                  type="number"
                  value={newGiftcode.spiritStones}
                  onChange={(e) => setNewGiftcode({ ...newGiftcode, spiritStones: Number(e.target.value) })}
                  min={0}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Số Lượt Dùng Tối Đa</label>
                <input
                  type="number"
                  value={newGiftcode.maxUses}
                  onChange={(e) => setNewGiftcode({ ...newGiftcode, maxUses: Number(e.target.value) })}
                  min={1}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Tên Vật Phẩm Thưởng (Tùy chọn)</label>
                <input
                  type="text"
                  value={newGiftcode.itemName}
                  onChange={(e) => setNewGiftcode({ ...newGiftcode, itemName: e.target.value })}
                  placeholder="Ví dụ: Tụ Linh Thần Đan..."
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Icon Vật Phẩm Thưởng</label>
                <input
                  type="text"
                  value={newGiftcode.itemIcon}
                  onChange={(e) => setNewGiftcode({ ...newGiftcode, itemIcon: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white text-center outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">EXP Thưởng (Nếu là đan)</label>
                <input
                  type="number"
                  value={newGiftcode.exp}
                  onChange={(e) => setNewGiftcode({ ...newGiftcode, exp: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white outline-none focus:border-amber-400"
                />
              </div>
            </div>
            <button type="submit" className="px-6 py-2.5 bg-amber-500 text-slate-950 font-subheading font-bold rounded-xl shadow-lg hover:bg-amber-400 transition-all">
              🎁 Phát Mã Giftcode Mới
            </button>
          </form>

          {/* Giftcode List */}
          <div className="space-y-3">
            <h3 className="font-title text-xl text-amber-400">📜 Danh Sách Mã GIFTCODE ({giftcodes.length})</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-900 text-slate-400 font-subheading uppercase">
                  <tr>
                    <th className="p-3">Mã Code</th>
                    <th className="p-3">Linh Thạch Thưởng</th>
                    <th className="p-3">Vật Phẩm Đính Kèm</th>
                    <th className="p-3">Lượt Đã Dùng</th>
                    <th className="p-3 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-subheading text-slate-200">
                  {giftcodes.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-amber-300 text-sm">{g.code}</td>
                      <td className="p-3 font-mono text-xianxia-gold font-bold">+{g.spiritStones.toLocaleString()} 💎</td>
                      <td className="p-3">{g.itemName ? `${g.itemIcon || '🎁'} ${g.itemName}` : <span className="text-slate-600">Không có</span>}</td>
                      <td className="p-3 font-mono">{g.usedCount} / {g.maxUses}</td>
                      <td className="p-3 text-center">
                        <button onClick={() => handleDeleteGiftcode(g.id, g.code)} className="px-2 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600/40 rounded text-[11px] font-bold">
                          🗑️ Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BROADCAST ANNOUNCEMENT */}
      {activeTab === 'broadcast' && (
        <form onSubmit={handleBroadcast} className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-title text-xl text-rose-400">📢 Phát Thông Báo Server</h3>
          <textarea
            value={announceText}
            onChange={(e) => setAnnounceText(e.target.value)}
            placeholder="Nhập thông báo gửi tới tất cả người chơi..."
            rows={4}
            className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-rose-500"
          />
          <button type="submit" className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-subheading font-bold text-xs rounded-xl shadow-lg">
            📢 Gửi Thông Báo Toàn Tiên Giới
          </button>
          {broadcastSent && <div className="text-xs text-emerald-400 font-bold">✅ Thông báo đã được phát thành công!</div>}
        </form>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full space-y-4 text-xs font-subheading">
            <h3 className="font-title text-xl text-amber-400">✏️ Chỉnh Sửa Tu Sĩ: {editingUser.name}</h3>
            <form onSubmit={handleUpdateUser} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">Tên Nhân Vật:</label>
                <input type="text" value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Lực Chiến:</label>
                  <input type="number" value={editingUser.combatPower} onChange={(e) => setEditingUser({ ...editingUser, combatPower: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white outline-none" />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Linh Thạch:</label>
                  <input type="number" value={editingUser.spiritStones} onChange={(e) => setEditingUser({ ...editingUser, spiritStones: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white outline-none" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-3">
                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded font-bold">Hủy Bỏ</button>
                <button type="submit" className="px-6 py-2 bg-amber-500 text-slate-950 rounded font-bold shadow-lg">Lưu Thay Đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full space-y-4 text-xs font-subheading">
            <h3 className="font-title text-xl text-emerald-400">➕ Tạo Tu Sĩ Mới</h3>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">Tên Nhân Vật *:</label>
                <input type="text" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} required className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white outline-none" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Email *:</label>
                <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white outline-none" />
              </div>
              <div className="flex justify-end space-x-3 pt-3">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded font-bold">Hủy Bỏ</button>
                <button type="submit" className="px-6 py-2 bg-emerald-500 text-slate-950 rounded font-bold shadow-lg">Tạo Tài Khoản</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
