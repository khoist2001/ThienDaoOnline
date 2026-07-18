import React, { useEffect, useState } from 'react';

export const CursorEffect: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);

  useEffect(() => {
    let idCounter = 0;

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      idCounter++;
      setTrail((prev) => [
        ...prev.slice(-12),
        { x: e.clientX, y: e.clientY, id: idCounter },
      ]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Main glowing particle cursor */}
      <div
        className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-xianxia-gold/60 blur-[3px] shadow-[0_0_15px_rgba(243,198,105,0.9)]"
        style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      />
      {/* Particle trail */}
      {trail.map((t, idx) => (
        <div
          key={t.id}
          className="absolute w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-xianxia-jade/70 blur-[1px]"
          style={{
            left: `${t.x}px`,
            top: `${t.y}px`,
            opacity: idx / trail.length,
            transform: `scale(${idx / trail.length})`,
          }}
        />
      ))}
    </div>
  );
};
