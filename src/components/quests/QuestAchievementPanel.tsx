import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { soundManager } from '../../services/SoundManager';

export const QuestAchievementPanel: React.FC = () => {
  const { quests, achievements, claimQuestReward } = useGameStore();
  const [tab, setTab] = useState<'quests' | 'achievements'>('quests');

  const handleClaim = (id: string) => {
    soundManager.playClick();
    claimQuestReward(id);
    soundManager.playBreakthroughSound(true);
  };

  return (
    <div className="w-full bg-slate-950/80 border border-xianxia-gold/30 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="font-title text-2xl sm:text-3xl text-gold-gradient">
            NHIỆM VỤ & THÀNH TỰU
          </h2>
          <p className="font-subheading text-slate-300 text-xs sm:text-sm">
            Hoàn thành thử thách để lãnh nhận Linh Thạch, Tu Vi EXP và danh hiệu cao quý
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              soundManager.playClick();
              setTab('quests');
            }}
            className={`px-4 py-2 rounded-lg font-subheading font-bold text-xs transition-all ${
              tab === 'quests'
                ? 'bg-xianxia-gold text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📜 Nhiệm Vụ ({quests.length})
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setTab('achievements');
            }}
            className={`px-4 py-2 rounded-lg font-subheading font-bold text-xs transition-all ${
              tab === 'achievements'
                ? 'bg-xianxia-gold text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🏆 Thành Tựu ({achievements.length})
          </button>
        </div>
      </div>

      {tab === 'quests' ? (
        <div className="space-y-4">
          {quests.map((q) => (
            <div
              key={q.id}
              className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-xianxia-gold transition-all"
            >
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center space-x-2 justify-center sm:justify-start">
                  <span className="px-2 py-0.5 bg-amber-500/20 text-xianxia-gold text-[10px] font-bold rounded uppercase">
                    {q.type}
                  </span>
                  <h4 className="font-bold text-sm text-slate-100">{q.title}</h4>
                </div>
                <p className="text-xs text-slate-300">{q.description}</p>
                <div className="text-[11px] text-amber-400 font-bold">
                  Phần Thưởng: +{q.rewardExp} EXP • {q.rewardStones} 💎 Linh Thạch
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-xs font-bold text-slate-400">
                  {q.current} / {q.target}
                </div>
                <button
                  disabled={!q.completed || q.claimed}
                  onClick={() => handleClaim(q.id)}
                  className={`px-5 py-2 rounded-lg font-subheading font-bold text-xs transition-all ${
                    q.claimed
                      ? 'bg-slate-800 text-slate-500 cursor-default'
                      : q.completed
                      ? 'bg-xianxia-gold hover:bg-xianxia-gold-light text-slate-950 shadow-xianxia-gold'
                      : 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {q.claimed ? 'Đã Nhận' : q.completed ? 'Nhận Thưởng' : 'Chưa Hoàn Thành'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`p-4 rounded-xl border flex items-center space-x-4 transition-all ${
                a.unlocked
                  ? 'bg-slate-900 border-xianxia-gold shadow-xianxia-gold'
                  : 'bg-slate-900/40 border-slate-800 opacity-60'
              }`}
            >
              <span className="text-4xl p-3 bg-slate-950 rounded-xl border border-slate-800">
                {a.icon}
              </span>
              <div>
                <h4 className="font-bold text-sm text-slate-100">{a.title}</h4>
                <p className="text-xs text-slate-300 mt-0.5">{a.description}</p>
                <div className="text-xs font-bold text-xianxia-gold mt-1">
                  Thưởng: {a.rewardStones} 💎 Linh Thạch
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
