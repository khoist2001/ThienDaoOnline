import React, { useEffect, useState } from 'react';
import { DungeonBoss, Character } from '../../types/game';
import { useGameStore } from '../../store/gameStore';
import { soundManager } from '../../services/SoundManager';

interface CombatReplayModalProps {
  boss: DungeonBoss;
  player: Character;
  onClose: () => void;
}

interface LogEntry {
  turn: number;
  attacker: string;
  damage: number;
  message: string;
  isPlayer: boolean;
}

export const CombatReplayModal: React.FC<CombatReplayModalProps> = ({
  boss,
  player,
  onClose,
}) => {
  const { addExp } = useGameStore();
  const [playerHp, setPlayerHp] = useState(player.hp);
  const [bossHp, setBossHp] = useState(boss.hp);
  const [turnLogs, setTurnLogs] = useState<LogEntry[]>([]);
  const [isBattleFinished, setIsBattleFinished] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  useEffect(() => {
    let currentTurn = 1;
    let curPlayerHp = player.hp;
    let curBossHp = boss.hp;
    const logs: LogEntry[] = [];

    const interval = setInterval(() => {
      if (curPlayerHp <= 0 || curBossHp <= 0 || currentTurn > 10) {
        clearInterval(interval);
        const victory = curBossHp <= 0 || curPlayerHp > curBossHp;
        setIsVictory(victory);
        setIsBattleFinished(true);
        if (victory) {
          addExp(boss.rewards.exp);
          // Award spirit stones on victory
          useGameStore.setState((state) => ({
            character: {
              ...state.character,
              spiritStones: state.character.spiritStones + boss.rewards.spiritStones,
            },
          }));
          soundManager.playBreakthroughSound(true);
        } else {
          soundManager.playBreakthroughSound(false);
        }
        return;
      }

      if (currentTurn % 2 !== 0) {
        // Player attacks Boss
        const damage = Math.floor(player.combatPower * (0.8 + Math.random() * 0.4));
        curBossHp = Math.max(0, curBossHp - damage);
        setBossHp(curBossHp);
        logs.push({
          turn: currentTurn,
          attacker: player.name,
          damage,
          message: `${player.name} thi triển [Nhất Kiếm Trảm Phá] gây ${damage} sát thương lên ${boss.name}!`,
          isPlayer: true,
        });
      } else {
        // Boss attacks Player
        const damage = Math.floor(boss.atk * (0.8 + Math.random() * 0.4));
        curPlayerHp = Math.max(0, curPlayerHp - damage);
        setPlayerHp(curPlayerHp);
        logs.push({
          turn: currentTurn,
          attacker: boss.name,
          damage,
          message: `${boss.name} bộc phát ma khí quật đuôi gây ${damage} sát thương!`,
          isPlayer: false,
        });
      }

      setTurnLogs([...logs]);
      currentTurn++;
    }, 700);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-xianxia-card border border-xianxia-gold/40 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <h2 className="font-title text-3xl text-gold-gradient">
            TRANH ĐẤU BÍ CẢNH
          </h2>
          <p className="font-subheading text-slate-300 text-xs">
            Trận chiến diễn ra theo thời gian thực giữa Tu Sĩ và Thượng Cổ Yêu Thần
          </p>
        </div>

        {/* Combatants Header */}
        <div className="flex items-center justify-between bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          {/* Player Side */}
          <div className="flex items-center space-x-3">
            <img src={player.avatar} className="w-12 h-12 rounded-full border border-amber-400" />
            <div>
              <div className="font-bold text-sm text-xianxia-gold">{player.name}</div>
              <div className="text-xs text-rose-400 font-bold">HP: {playerHp} / {player.maxHp}</div>
            </div>
          </div>

          <div className="text-2xl font-title text-rose-500 animate-pulse">VS</div>

          {/* Boss Side */}
          <div className="flex items-center space-x-3 text-right">
            <div>
              <div className="font-bold text-sm text-amber-300">{boss.name}</div>
              <div className="text-xs text-rose-400 font-bold">HP: {bossHp} / {boss.maxHp}</div>
            </div>
            <div className="text-4xl p-1 bg-slate-950 rounded-full border border-rose-500/30">
              {boss.avatar}
            </div>
          </div>
        </div>

        {/* Replay Log Console */}
        <div className="h-48 overflow-y-auto bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
          {turnLogs.map((log, idx) => (
            <div
              key={idx}
              className={`p-2 rounded border ${
                log.isPlayer
                  ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                  : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
              }`}
            >
              [Lượt {log.turn}] {log.message}
            </div>
          ))}
        </div>

        {/* Result Overlay */}
        {isBattleFinished && (
          <div className="p-4 bg-slate-900 border border-xianxia-gold text-center rounded-xl space-y-3">
            <h3 className="font-title text-3xl">
              {isVictory ? (
                <span className="text-gold-gradient">ĐẠI THẮNG BÍ CẢNH!</span>
              ) : (
                <span className="text-cinnabar-gradient">THẤT BẠI!</span>
              )}
            </h3>
            <p className="text-xs text-slate-300">
              {isVictory
                ? `Đã diệt trừ Yêu Thần! Thu hoạch +${boss.rewards.exp} EXP và ${boss.rewards.spiritStones} Linh Thạch!`
                : 'Ma khí quá lớn, tu sĩ đành thu liễm thần thức lui về phục hồi.'}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-subheading font-bold text-slate-950 bg-xianxia-gold hover:bg-xianxia-gold-light"
            >
              Thu Nhận Phần Thưởng
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
