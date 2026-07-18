import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { soundManager } from '../../services/SoundManager';

export const MeditationPanel: React.FC = () => {
  const { meditate, character } = useGameStore();
  const [isMeditating, setIsMeditating] = useState(false);
  const [activeMinutes, setActiveMinutes] = useState<number>(0);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [rewardSummary, setRewardSummary] = useState<any>(null);

  // AFK Accumulator state
  const [afkExp, setAfkExp] = useState<number>(120);
  const [afkStones, setAfkStones] = useState<number>(45);

  // Passive AFK accumulator timer
  useEffect(() => {
    const timer = setInterval(() => {
      setAfkExp((prev) => prev + Math.floor(1 * (character.spiritualRootBonus || 1)));
      setAfkStones((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, [character.spiritualRootBonus]);

  // Active meditation countdown timer
  useEffect(() => {
    let interval: any = null;
    if (isMeditating && timeLeftSeconds > 0) {
      interval = setInterval(() => {
        setTimeLeftSeconds((prev) => prev - 1);
      }, 1000);
    } else if (isMeditating && timeLeftSeconds === 0) {
      // Finished meditation
      const res = meditate(activeMinutes);
      setIsMeditating(false);
      soundManager.playBreakthroughSound(true);
      setRewardSummary(res);
    }
    return () => clearInterval(interval);
  }, [isMeditating, timeLeftSeconds, activeMinutes, meditate]);

  const handleStartMeditation = (minutes: number, durationSeconds: number) => {
    soundManager.playClick();
    setRewardSummary(null);
    setActiveMinutes(minutes);
    setTotalSeconds(durationSeconds);
    setTimeLeftSeconds(durationSeconds);
    setIsMeditating(true);
  };

  const handleClaimAfk = () => {
    soundManager.playClick();
    if (afkExp <= 0 && afkStones <= 0) return;
    soundManager.playBreakthroughSound(true);

    const bonus = character.spiritualRootBonus || 1.0;
    const expToAdd = afkExp;
    const stonesToAdd = afkStones;

    useGameStore.setState((s) => ({
      character: {
        ...s.character,
        exp: Math.min(s.character.exp + expToAdd, s.character.maxExp),
        spiritStones: s.character.spiritStones + stonesToAdd,
      },
    }));

    setRewardSummary({
      expGain: expToAdd,
      stonesGain: stonesToAdd,
      extraStones: 0,
      rewardItemName: 'Thưởng Treo Máy AFK',
    });

    setAfkExp(0);
    setAfkStones(0);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const bonus = character.spiritualRootBonus || 1.0;

  return (
    <div className="w-full bg-slate-950/80 border border-xianxia-gold/30 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="font-title text-2xl sm:text-3xl text-gold-gradient">
            BẾ QUAN TU LUYỆN
          </h2>
          <p className="font-subheading text-slate-300 text-xs sm:text-sm">
            Tĩnh tâm ngộ đạo, hấp thu thiên địa linh khí gia tăng tu vi và linh thạch
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 border border-xianxia-gold/20 px-3.5 py-2 rounded-xl text-xs font-semibold text-xianxia-gold shadow-inner">
          <span>✨ Hệ số Linh Căn:</span>
          <span className="font-bold text-amber-300">x{bonus}</span>
        </div>
      </div>

      {/* Meditation Visual Canvas Effect Container */}
      <div className="relative w-full h-56 sm:h-64 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-col items-center justify-center overflow-hidden p-4">
        {/* Animated Meditation Aura Rings */}
        <div className="relative flex items-center justify-center">
          <div
            className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full border-2 border-dashed border-xianxia-gold transition-all duration-700 ${
              isMeditating ? 'animate-spin-slow scale-110 shadow-xianxia-gold border-amber-400' : 'opacity-30'
            }`}
          />
          <div
            className={`absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-xianxia-jade transition-all duration-700 ${
              isMeditating ? 'animate-ping opacity-40 border-emerald-400' : 'opacity-20'
            }`}
          />

          <div className="absolute text-5xl sm:text-6xl animate-pulse">
            🧘‍♂️
          </div>
        </div>

        {/* Live Meditation Countdown or Status */}
        {isMeditating ? (
          <div className="mt-4 text-center space-y-2 w-full max-w-xs">
            <p className="font-subheading text-xianxia-gold animate-pulse tracking-widest text-sm font-bold">
              Đang bế quan nhập định ({activeMinutes} phút)...
            </p>
            <div className="text-2xl font-mono font-extrabold text-amber-300 tracking-wider">
              ⏱️ {formatTime(timeLeftSeconds)}
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-xianxia-gold to-amber-300 rounded-full transition-all duration-1000"
                style={{ width: `${Math.max(0, Math.min(100, ((totalSeconds - timeLeftSeconds) / totalSeconds) * 100))}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="mt-4 font-subheading text-slate-400 text-xs tracking-wider text-center">
            Lựa chọn thời gian bế quan bên dưới để nhận EXP và Linh Thạch theo tỷ lệ chuẩn
          </p>
        )}
      </div>

      {/* Reward Summary Toast Modal */}
      {rewardSummary && (
        <div className="p-4 bg-slate-900/95 border border-xianxia-gold rounded-2xl text-center space-y-2 animate-bounce shadow-2xl">
          <h4 className="font-title text-lg text-xianxia-gold">🎉 BẾ QUAN HOÀN THÀNH!</h4>
          <div className="flex justify-center items-center space-x-4 text-xs font-bold font-subheading">
            <span className="text-emerald-400">✨ Tu vi: +{rewardSummary.expGain?.toLocaleString()} EXP</span>
            <span className="text-xianxia-gold">💎 Linh Thạch: +{rewardSummary.stonesGain?.toLocaleString()}</span>
          </div>
          {rewardSummary.extraStones > 0 && (
            <div className="text-[11px] text-amber-300 italic">
              💡 Tu vi đạt đỉnh phong! {rewardSummary.extraStones.toLocaleString()} EXP dư thừa đã quy đổi thành +{rewardSummary.extraStones.toLocaleString()} 💎 Linh Thạch!
            </div>
          )}
          {rewardSummary.rewardItemName && (
            <div className="text-xs text-purple-300 font-bold">
              🎁 Nhận thêm quà tặng đính kèm: {rewardSummary.rewardItemName}
            </div>
          )}
        </div>
      )}

      {/* Meditation Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Option 1: 1 Phút */}
        <button
          disabled={isMeditating}
          onClick={() => handleStartMeditation(1, 5)}
          className="p-5 rounded-2xl border border-xianxia-gold/40 bg-slate-900/90 hover:bg-slate-800 text-xianxia-gold font-subheading font-bold transition-all transform hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg text-left flex flex-col justify-between space-y-3"
        >
          <div>
            <div className="text-base font-title flex items-center space-x-2">
              <span>⏱️</span>
              <span>1 Phút (Tiểu Định)</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 font-normal">Cảm ngộ ngắn 5 giây</div>
          </div>
          <div className="pt-2 border-t border-slate-800 text-xs space-y-1">
            <div className="text-emerald-400 font-bold">✨ +{Math.floor(25 * bonus)} EXP</div>
            <div className="text-xianxia-gold font-bold">💎 +{Math.floor(6 * bonus)} Linh Thạch</div>
          </div>
        </button>

        {/* Option 2: 10 Phút */}
        <button
          disabled={isMeditating}
          onClick={() => handleStartMeditation(10, 15)}
          className="p-5 rounded-2xl border border-xianxia-jade/40 bg-slate-900/90 hover:bg-slate-800 text-xianxia-jade font-subheading font-bold transition-all transform hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg text-left flex flex-col justify-between space-y-3"
        >
          <div>
            <div className="text-base font-title flex items-center space-x-2">
              <span>⏳</span>
              <span>10 Phút (Trung Định)</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 font-normal">Cảm ngộ 15 giây (Gấp 10 lần)</div>
          </div>
          <div className="pt-2 border-t border-slate-800 text-xs space-y-1">
            <div className="text-emerald-400 font-bold">✨ +{Math.floor(250 * bonus).toLocaleString()} EXP</div>
            <div className="text-xianxia-gold font-bold">💎 +{Math.floor(60 * bonus).toLocaleString()} Linh Thạch</div>
          </div>
        </button>

        {/* Option 3: 1 Giờ (60 Phút) */}
        <button
          disabled={isMeditating}
          onClick={() => handleStartMeditation(60, 30)}
          className="p-5 rounded-2xl border border-purple-500/40 bg-slate-900/90 hover:bg-slate-800 text-purple-300 font-subheading font-bold transition-all transform hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg text-left flex flex-col justify-between space-y-3"
        >
          <div>
            <div className="text-base font-title flex items-center space-x-2">
              <span>🌌</span>
              <span>1 Giờ (Đại Định)</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 font-normal">Thâm nhập định (Tặng Thần Đan)</div>
          </div>
          <div className="pt-2 border-t border-slate-800 text-xs space-y-1">
            <div className="text-emerald-400 font-bold">✨ +{Math.floor(1500 * bonus).toLocaleString()} EXP</div>
            <div className="text-xianxia-gold font-bold">💎 +{Math.floor(360 * bonus).toLocaleString()} Linh Thạch</div>
            <div className="text-purple-400 text-[11px]">🧪 Tặng: 1x Tụ Linh Thần Đan</div>
          </div>
        </button>

        {/* Option 4: 8 Giờ (AFK Bế Quan) */}
        <button
          disabled={isMeditating}
          onClick={() => handleStartMeditation(480, 60)}
          className="p-5 rounded-2xl border border-rose-500/40 bg-slate-900/90 hover:bg-slate-800 text-rose-300 font-subheading font-bold transition-all transform hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg text-left flex flex-col justify-between space-y-3"
        >
          <div>
            <div className="text-base font-title flex items-center space-x-2">
              <span>💤</span>
              <span>8 Giờ (Đại Mộng Tu Tiên)</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 font-normal">Bế quan xuyên đêm</div>
          </div>
          <div className="pt-2 border-t border-slate-800 text-xs space-y-1">
            <div className="text-emerald-400 font-bold">✨ +{Math.floor(12000 * bonus).toLocaleString()} EXP</div>
            <div className="text-xianxia-gold font-bold">💎 +{Math.floor(2880 * bonus).toLocaleString()} Linh Thạch</div>
            <div className="text-rose-400 text-[11px]">🧪 Tặng: 3x Tụ Linh Thần Đan</div>
          </div>
        </button>
      </div>

      {/* AFK Tích Lũy Tự Động Engine Box */}
      <div className="bg-slate-900/90 rounded-2xl border border-amber-500/30 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-slate-950 rounded-xl border border-amber-500/30 flex items-center justify-center text-2xl animate-pulse">
            🔮
          </div>
          <div>
            <h4 className="font-title text-base text-xianxia-gold">Hấp Thu Linh Khí Tự Động (AFK)</h4>
            <div className="text-xs text-slate-400 mt-0.5">
              Đang tích lũy: <span className="text-emerald-400 font-bold">+{afkExp} EXP</span> • <span className="text-xianxia-gold font-bold">+{afkStones} 💎 Linh Thạch</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleClaimAfk}
          disabled={afkExp === 0 && afkStones === 0}
          className="w-full sm:w-auto px-6 py-2.5 bg-xianxia-gold hover:bg-xianxia-gold-light text-slate-950 font-subheading font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          🎁 Nhận Quà AFK Tích Lũy
        </button>
      </div>
    </div>
  );
};
