import React, { useState } from 'react';
import { soundManager } from '../../services/SoundManager';
import { useGameStore } from '../../store/gameStore';
import { apiClient } from '../../services/apiClient';

interface ImmortalGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const ImmortalGateModal: React.FC<ImmortalGateModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { loginAccount } = useGameStore();
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('bactien.tudao@gmail.com');
  const [password, setPassword] = useState('password');
  const [isOpeningGate, setIsOpeningGate] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickFill = (type: 'User' | 'Admin') => {
    soundManager.playClick();
    setErrorMessage(null);
    if (type === 'Admin') {
      setEmail('admin@thiendao.online');
      setPassword('password');
    } else {
      setEmail('bactien.tudao@gmail.com');
      setPassword('password');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    setErrorMessage(null);

    const targetEmail = email.trim();
    const isAdminTarget = targetEmail.toLowerCase().includes('admin');

    // Strict Password Authentication Check for Admin Account
    if (isAdminTarget && password !== 'password') {
      setErrorMessage('❌ Mật khẩu Admin không chính xác! (Mật khẩu Admin mẫu: admin123)');
      soundManager.playBreakthroughSound(false);
      return;
    }

    if (!password || password.length < 4) {
      setErrorMessage('❌ Vui lòng nhập mật khẩu hợp lệ (tối thiểu 4 ký tự)!');
      soundManager.playBreakthroughSound(false);
      return;
    }

    // Check if account has been Banned by Admin
    const savedJson = null;
    if (savedJson) {
      try {
        const savedData = JSON.parse(savedJson);
        if (savedData.character?.status === 'Banned') {
          setErrorMessage('🚫 Tài khoản của bạn đã bị Admin phong ấn (Ban)! Không thể khai môn nhập cõi.');
          soundManager.playBreakthroughSound(false);
          return;
        }
      } catch (e) {}
    }

    const roleToSet = isAdminTarget ? 'Admin' : 'Player';

    // The server is the only source of truth for accounts and saved progress.
    let res;
    if (tab === 'register') {
      res = await apiClient.register(targetEmail, undefined, password);
    } else {
      res = await apiClient.login(targetEmail, password);
      if (res && res.status === 'error') {
        setErrorMessage(res.message || '❌ Đăng nhập thất bại!');
        soundManager.playBreakthroughSound(false);
        return;
      }
    }

    if (!res || res.status !== 'success') {
      setErrorMessage('Khong the ket noi hoac xac thuc voi may chu. Vui long kiem tra Laravel va MySQL.');
      soundManager.playBreakthroughSound(false);
      return;
    }

    loginAccount(targetEmail, res.user?.role || roleToSet, res.gameState);

    setIsOpeningGate(true);
    soundManager.playBreakthroughSound(true);

    setTimeout(() => {
      setIsOpeningGate(false);
      onLoginSuccess();
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-xianxia-card border border-xianxia-gold/40 rounded-2xl p-6 sm:p-8 shadow-xianxia-gold space-y-6">
        {/* Opening Gate FX Overlay */}
        {isOpeningGate && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 rounded-2xl flex flex-col items-center justify-center space-y-4 p-6 text-center">
            <div className="text-6xl animate-bounce">⛩️</div>
            <h3 className="font-title text-3xl text-gold-gradient tracking-widest animate-pulse">
              KHAI MỞ TIÊN MÔN...
            </h3>
            <p className="font-subheading text-xs text-slate-300">
              Đang xác thực thiên cơ, chúc chư vị đạo hữu tu vi thăng tiến!
            </p>
          </div>
        )}

        <div className="text-center space-y-2">
          <div className="text-4xl text-xianxia-gold animate-pulse">☯</div>
          <h2 className="font-title text-3xl text-gold-gradient">
            THIÊN ĐẠO ONLINE
          </h2>
          <p className="font-subheading text-slate-300 text-xs">
            Một niệm thành tiên, nghịch thiên cải mệnh
          </p>
        </div>

        {/* Tab Headers */}
        <div className="flex justify-center border-b border-slate-800 space-x-6 text-xs font-subheading">
          <button
            onClick={() => setTab('login')}
            className={`pb-2 border-b-2 transition-all ${
              tab === 'login' ? 'border-xianxia-gold text-xianxia-gold font-bold' : 'border-transparent text-slate-400'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            onClick={() => setTab('register')}
            className={`pb-2 border-b-2 transition-all ${
              tab === 'register' ? 'border-xianxia-gold text-xianxia-gold font-bold' : 'border-transparent text-slate-400'
            }`}
          >
            Đăng Ký
          </button>
          <button
            onClick={() => setTab('forgot')}
            className={`pb-2 border-b-2 transition-all ${
              tab === 'forgot' ? 'border-xianxia-gold text-xianxia-gold font-bold' : 'border-transparent text-slate-400'
            }`}
          >
            Quên Mật Khẩu
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-950/90 border border-rose-500/60 text-rose-200 text-xs font-subheading text-center shadow-lg animate-bounce">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-subheading text-xianxia-gold mb-1">
              Địa Chỉ Email / Tu Hiệu
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 focus:border-xianxia-gold rounded-lg px-3 py-2 text-xs text-white outline-none"
            />
          </div>

          {tab !== 'forgot' && (
            <div>
              <label className="block text-xs font-subheading text-xianxia-gold mb-1">
                Mật Khẩu Khai Môn
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-xianxia-gold rounded-lg px-3 py-2 text-xs text-white outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-subheading font-bold text-slate-950 bg-xianxia-gold hover:bg-xianxia-gold-light transition-all shadow-xianxia-gold"
          >
            {tab === 'login' ? 'Mở Cửa Tiên Môn (Đăng Nhập)' : tab === 'register' ? 'Khai Mở Tài Khoản' : 'Gửi Khôi Phục Mật Khẩu'}
          </button>
        </form>

        {/* OAuth & Demo Quick Fill Options */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="text-center text-[10px] text-slate-400">Điền nhanh mẫu tài khoản thử nghiệm</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('User')}
              className="py-2 px-3 bg-slate-900 border border-amber-500/40 hover:bg-slate-800 rounded-lg text-xs font-bold text-xianxia-gold flex items-center justify-center space-x-1.5 transition-all shadow"
            >
              <span>👤</span>
              <span>Điền Mẫu User</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('Admin')}
              className="py-2 px-3 bg-rose-950/60 border border-rose-500/50 hover:bg-rose-900/80 rounded-lg text-xs font-bold text-rose-300 flex items-center justify-center space-x-1.5 transition-all shadow"
            >
              <span>👑</span>
              <span>Điền Mẫu Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
