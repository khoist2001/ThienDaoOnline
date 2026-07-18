import React, { useState, useEffect } from 'react';

export const MarqueeAnnouncement: React.FC = () => {
  const [announcement, setAnnouncement] = useState(() => {
    const savedNotice = localStorage.getItem('thien_dao_server_broadcast');
    return savedNotice
      ? savedNotice
      : '📜 Chào mừng các vị đạo hữu gia nhập cõi Thiên Đạo Online! Hãy tích cực bế quan tu luyện, khiêu chiến bí cảnh và bứt phá giới hạn Cảnh Giới!';
  });

  useEffect(() => {
    const handleBroadcastUpdate = (e: any) => {
      const msg = e.detail || localStorage.getItem('thien_dao_server_broadcast');
      if (msg && msg.trim()) {
        setAnnouncement(msg.trim());
      }
    };

    window.addEventListener('thien_dao_broadcast_updated', handleBroadcastUpdate);
    window.addEventListener('storage', handleBroadcastUpdate);

    return () => {
      window.removeEventListener('thien_dao_broadcast_updated', handleBroadcastUpdate);
      window.removeEventListener('storage', handleBroadcastUpdate);
    };
  }, []);

  return (
    <div className="w-full bg-slate-950/95 border-y border-amber-500/50 py-2 px-4 overflow-hidden relative shadow-2xl z-40">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 px-2.5 py-0.5 bg-rose-950/80 border border-rose-500/70 rounded-md text-[11px] font-subheading font-bold text-rose-300 shrink-0 z-10 shadow-lg animate-pulse">
          <span>📢</span>
          <span>ADMIN THÔNG BÁO</span>
        </div>

        <div className="overflow-hidden w-full relative">
          <div className="animate-marquee font-subheading text-xs text-amber-200 tracking-wider font-bold">
            {announcement}
          </div>
        </div>
      </div>
    </div>
  );
};
