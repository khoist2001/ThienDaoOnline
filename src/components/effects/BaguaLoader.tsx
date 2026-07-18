import React from 'react';

export const BaguaLoader: React.FC<{ text?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  text = 'Đang cảm ngộ Thiên Đạo...',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12 text-xs',
    md: 'w-24 h-24 text-sm',
    lg: 'w-36 h-36 text-base',
  }[size];

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <div className={`relative ${sizeClasses} flex items-center justify-center`}>
        {/* Outer Rotating Bagua Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-xianxia-gold animate-spin-slow shadow-xianxia-gold opacity-80" />
        
        {/* Inner Counter-Rotating Ring */}
        <div className="absolute inset-2 rounded-full border border-xianxia-jade animate-[spin_8s_linear_infinite_reverse] opacity-60" />

        {/* Yin Yang Symbol in Center */}
        <div className="text-3xl sm:text-5xl animate-pulse text-xianxia-gold drop-shadow-[0_0_12px_rgba(243,198,105,0.8)]">
          ☯
        </div>
      </div>
      {text && (
        <p className="font-subheading text-xianxia-gold-light tracking-widest animate-pulse text-center">
          {text}
        </p>
      )}
    </div>
  );
};
