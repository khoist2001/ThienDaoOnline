import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/apiClient';

const DEFAULT_ANNOUNCEMENT = 'Chao mung cac dao huu gia nhap coi Thien Dao Online!';

export const MarqueeAnnouncement: React.FC = () => {
  const [announcement, setAnnouncement] = useState(DEFAULT_ANNOUNCEMENT);

  useEffect(() => {
    const loadAnnouncement = async () => {
      const response = await apiClient.getAnnouncement();
      if (response?.content) setAnnouncement(response.content);
    };

    void loadAnnouncement();
    const timer = window.setInterval(loadAnnouncement, 15000);
    const handleBroadcastUpdate = (event: Event) => {
      const message = (event as CustomEvent<string>).detail;
      if (message?.trim()) setAnnouncement(message.trim());
    };
    window.addEventListener('thien_dao_broadcast_updated', handleBroadcastUpdate);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('thien_dao_broadcast_updated', handleBroadcastUpdate);
    };
  }, []);

  return (
    <div className="w-full bg-slate-950/95 border-y border-amber-500/50 py-2 px-4 overflow-hidden relative shadow-2xl z-40">
      <div className="flex items-center space-x-3">
        <div className="px-2.5 py-0.5 bg-rose-950/80 border border-rose-500/70 rounded-md text-[11px] font-subheading font-bold text-rose-300 shrink-0 z-10">
          ADMIN THONG BAO
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
