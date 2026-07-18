import React, { useState } from 'react';
import { useGameStore } from './store/gameStore';
import { CanvasBackground } from './components/effects/CanvasBackground';
import { CursorEffect } from './components/effects/CursorEffect';
import { LightningTribulation } from './components/effects/LightningTribulation';
import { LandingHero } from './components/landing/LandingHero';
import { ImmortalGateModal } from './components/auth/ImmortalGateModal';
import { LeaderboardPreview } from './components/landing/LeaderboardPreview';
import { CharacterDashboard } from './components/character/CharacterDashboard';
import { CharacterCreationModal } from './components/character/CharacterCreationModal';
import { MeditationPanel } from './components/cultivation/MeditationPanel';
import { BreakthroughModal } from './components/cultivation/BreakthroughModal';
import { InventoryGrid } from './components/inventory/InventoryGrid';
import { ForgingPanel } from './components/crafting/ForgingPanel';
import { AlchemyPanel } from './components/crafting/AlchemyPanel';
import { SecretRealmPanel } from './components/dungeon/SecretRealmPanel';
import { SpiritPetPanel } from './components/pets/SpiritPetPanel';
import { PvPArenaPanel } from './components/pvp/PvPArenaPanel';
import { GuildPanel } from './components/guild/GuildPanel';
import { MarketAuctionPanel } from './components/market/MarketAuctionPanel';
import { QuestAchievementPanel } from './components/quests/QuestAchievementPanel';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { MarqueeAnnouncement } from './components/effects/MarqueeAnnouncement';
import { soundManager } from './services/SoundManager';

type GameTab =
  | 'meditation'
  | 'inventory'
  | 'alchemy'
  | 'forging'
  | 'realm'
  | 'pets'
  | 'pvp'
  | 'guild'
  | 'market'
  | 'quests'
  | 'admin';

export function App() {
  const {
    character,
    isDemonMode,
    activeTribulation,
    tribulationSuccess,
    closeTribulationModal,
    logoutAccount,
  } = useGameStore();

  const [hasStarted, setHasStarted] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isCreationOpen, setIsCreationOpen] = useState(false);
  const [isBreakthroughOpen, setIsBreakthroughOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<GameTab>('meditation');

  return (
    <div className={`min-h-screen relative font-body ${isDemonMode ? 'mode-demon' : ''}`}>
      {/* Top Marquee Announcement Ticker */}
      <MarqueeAnnouncement />

      {/* Dynamic Canvas Background & Xianxia Cursor */}
      <CanvasBackground isDemonMode={isDemonMode} />
      <CursorEffect />

      {/* Heavenly Tribulation Lightning Strike Screen Overlay */}
      <LightningTribulation
        active={activeTribulation}
        success={tribulationSuccess}
        realmName={character.realm}
        onComplete={closeTribulationModal}
      />

      {/* Landing Hero View */}
      {!hasStarted ? (
        <LandingHero
          onStartCultivating={() => {
            setHasStarted(true);
            setIsCreationOpen(true);
          }}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        />
      ) : (
        /* Main In-Game Play Area */
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Header Bar */}
          <header className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-slate-950/80 border border-xianxia-gold/30 p-4 rounded-2xl backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between w-full lg:w-auto space-x-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl animate-pulse">☯</span>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="font-title text-2xl text-gold-gradient tracking-wider">
                      THIÊN ĐẠO ONLINE
                    </h1>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase font-subheading ${
                      character.role === 'Admin'
                        ? 'bg-rose-950 border border-rose-500 text-rose-300 animate-pulse'
                        : 'bg-amber-950/80 border border-amber-500/40 text-xianxia-gold'
                    }`}>
                      {character.role === 'Admin' ? '👑 Admin' : '👤 User'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-subheading mt-0.5">
                    {character.name} • {character.realm}
                  </p>
                </div>
              </div>

              {/* Premium Xianxia Logout Button */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  logoutAccount();
                  setHasStarted(false);
                }}
                className="group relative px-4 py-2 rounded-xl bg-gradient-to-r from-rose-950 via-red-900 to-rose-950 border border-rose-500/50 hover:border-rose-400 text-rose-200 text-xs font-subheading font-bold shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_20px_rgba(239,68,68,0.6)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center space-x-2"
                title="Đăng Xuất Khỏi Cõi Tiên Giới"
              >
                <span className="text-sm transition-transform duration-300 group-hover:rotate-12">🚪</span>
                <span className="tracking-wider">Rời Tiên Giới (Đăng Xuất)</span>
              </button>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex flex-wrap gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-xs font-subheading">
              {([
                { key: 'meditation', label: '🧘 Bế Quan' },
                { key: 'inventory', label: '🎒 Túi Đồ' },
                { key: 'alchemy', label: '🧪 Luyện Đan' },
                { key: 'forging', label: '🔥 Luyện Khí' },
                { key: 'realm', label: '🐉 Bí Cảnh' },
                { key: 'pets', label: '🦊 Linh Thú' },
                { key: 'pvp', label: '⚔️ Tỷ Võ' },
                { key: 'guild', label: '⛩️ Bang Hội' },
                { key: 'market', label: '🛒 Chợ / Đấu Giá' },
                { key: 'quests', label: '📜 Nhiệm Vụ' },
                ...(character.role === 'Admin' ? [{ key: 'admin', label: '⚙️ Admin' }] : []),
              ] as const).map((t) => (
                <button
                  key={t.key}
                  onClick={() => {
                    soundManager.playClick();
                    setActiveTab(t.key as GameTab);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === t.key
                      ? 'bg-xianxia-gold text-slate-950 font-bold shadow-xianxia-gold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </header>

          {/* Character Main Stats Dashboard */}
          <CharacterDashboard
            onOpenBreakthrough={() => setIsBreakthroughOpen(true)}
          />

          {/* Active Tab View */}
          <main className="w-full">
            {activeTab === 'meditation' && <MeditationPanel />}
            {activeTab === 'inventory' && <InventoryGrid />}
            {activeTab === 'alchemy' && <AlchemyPanel />}
            {activeTab === 'forging' && <ForgingPanel />}
            {activeTab === 'realm' && <SecretRealmPanel />}
            {activeTab === 'pets' && <SpiritPetPanel />}
            {activeTab === 'pvp' && <PvPArenaPanel />}
            {activeTab === 'guild' && <GuildPanel />}
            {activeTab === 'market' && <MarketAuctionPanel />}
            {activeTab === 'quests' && <QuestAchievementPanel />}
            {activeTab === 'admin' && character.role === 'Admin' && <AdminDashboard />}
          </main>
        </div>
      )}

      {/* Modals */}
      <ImmortalGateModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={() => setHasStarted(true)}
      />

      <LeaderboardPreview
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />

      <CharacterCreationModal
        isOpen={isCreationOpen}
        onClose={() => setIsCreationOpen(false)}
      />

      <BreakthroughModal
        isOpen={isBreakthroughOpen}
        onClose={() => setIsBreakthroughOpen(false)}
      />
    </div>
  );
}
