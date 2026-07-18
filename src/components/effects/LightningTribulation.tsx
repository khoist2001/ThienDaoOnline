import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface LightningTribulationProps {
  active: boolean;
  success: boolean;
  onComplete: () => void;
  realmName: string;
}

export const LightningTribulation: React.FC<LightningTribulationProps> = ({
  active,
  success,
  onComplete,
  realmName,
}) => {
  const [phase, setPhase] = useState<'cloud' | 'strike' | 'result' | null>(null);

  useEffect(() => {
    if (!active) {
      setPhase(null);
      return;
    }

    // Phase 1: Gathering Dark Clouds
    setPhase('cloud');

    const strikeTimer = setTimeout(() => {
      // Phase 2: Lightning Strike
      setPhase('strike');
    }, 1200);

    const resultTimer = setTimeout(() => {
      // Phase 3: Result
      setPhase('result');
      if (success) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f3c669', '#2dd4bf', '#ffffff', '#ffd700'],
        });
      }
    }, 2400);

    const closeTimer = setTimeout(() => {
      onComplete();
      setPhase(null);
    }, 4500);

    return () => {
      clearTimeout(strikeTimer);
      clearTimeout(resultTimer);
      clearTimeout(closeTimer);
    };
  }, [active, success, onComplete]);

  if (!active || !phase) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md overflow-hidden">
      {/* Dynamic Background Flash */}
      <div
        className={`absolute inset-0 transition-opacity duration-100 ${
          phase === 'strike' ? 'bg-cyan-100/90 animate-pulse' : 'bg-transparent'
        }`}
      />

      {/* Cloud Gathering Animation */}
      {phase === 'cloud' && (
        <div className="flex flex-col items-center animate-bounce space-y-4">
          <div className="text-6xl text-amber-300 animate-spin-slow">⚡</div>
          <h2 className="font-title text-3xl sm:text-4xl text-xianxia-gold tracking-widest text-center">
            THIÊN KIẾP GIÁNG LÂM!
          </h2>
          <p className="text-slate-300 font-subheading text-lg">
            Mây đen ngưng tụ, sấm sét cuồng phong chuẩn bị đánh xuống {realmName}...
          </p>
        </div>
      )}

      {/* Lightning Flash SVG Render */}
      {phase === 'strike' && (
        <div className="relative w-full h-full flex items-center justify-center">
          <svg className="absolute w-full h-full text-cyan-300 drop-shadow-[0_0_35px_rgba(45,212,191,1)]" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d="M50 0 L40 35 L55 35 L35 70 L60 50 L45 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
          </svg>
          <div className="z-10 font-title text-4xl sm:text-6xl text-white drop-shadow-[0_0_30px_rgba(255,255,255,1)] animate-ping">
            💥 OÀNH 💥
          </div>
        </div>
      )}

      {/* Result Card */}
      {phase === 'result' && (
        <div
          className={`relative z-10 max-w-md w-full mx-4 p-8 rounded-xl border text-center space-y-6 shadow-2xl ${
            success
              ? 'bg-slate-900/90 border-xianxia-gold shadow-xianxia-gold'
              : 'bg-slate-950/90 border-red-600 shadow-xianxia-cinnabar'
          }`}
        >
          <div className="text-6xl">
            {success ? '🌟' : '⚡'}
          </div>

          <h3 className="font-title text-4xl tracking-widest">
            {success ? (
              <span className="text-gold-gradient">ĐỘ KIẾP THÀNH CÔNG!</span>
            ) : (
              <span className="text-cinnabar-gradient">ĐỘ KIẾP THẤT BẠI!</span>
            )}
          </h3>

          <p className="text-slate-200 font-body text-base leading-relaxed">
            {success
              ? `Chúc mừng Đạo Hữu đã tẩy tủy kinh mạch, đột phá đại thành công lên cảnh giới ${realmName}!`
              : `Thiên kiếp quá dữ dội, Đạo Hữu bị thiên lôi đánh trúng làm tổn hại tâm mạch, tu vi bị giảm sút!`}
          </p>

          <button
            onClick={onComplete}
            className="px-6 py-2.5 rounded-lg font-subheading font-bold text-black bg-xianxia-gold hover:bg-xianxia-gold-light transition-all shadow-lg"
          >
            Thu Nhận Thần Thức
          </button>
        </div>
      )}
    </div>
  );
};
