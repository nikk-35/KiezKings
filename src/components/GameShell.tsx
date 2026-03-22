'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/lib/GameContext';
import StartScreen from './StartScreen';
import StrasseTab from './StrasseTab';
import GangTab from './GangTab';
import ProfilTab from './ProfilTab';
import ChatTab from './ChatTab';
import ShopTab from './ShopTab';

type Tab = 'strasse' | 'gang' | 'profil' | 'chat' | 'shop';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'strasse', label: 'Straße', icon: '🏙️' },
  { id: 'gang', label: 'Gang', icon: '⚔️' },
  { id: 'profil', label: 'Profil', icon: '🧑' },
  { id: 'chat', label: 'Chat', icon: '💬' },
  { id: 'shop', label: 'Shop', icon: '🏪' },
];

export default function GameShell() {
  const { state, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState<Tab>('strasse');
  const [started, setStarted] = useState(false);
  const [hasSave, setHasSave] = useState(false);
  const [deadScreen, setDeadScreen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('kiezkings_save');
    if (saved) setHasSave(true);
  }, []);

  // Death check
  useEffect(() => {
    if (started && state.stats.health <= 0) {
      setDeadScreen(true);
    }
  }, [state.stats.health, started]);

  function handleNewGame(name: string) {
    dispatch({ type: 'RESET', name });
    setStarted(true);
  }

  function handleContinue() {
    setStarted(true);
  }

  function handleRespawn() {
    dispatch({ type: 'RESET', name: state.playerName });
    setDeadScreen(false);
  }

  if (!started) {
    return <StartScreen onStart={handleNewGame} hasSave={hasSave} onContinue={handleContinue} />;
  }

  if (deadScreen) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6" style={{ background: '#1A1A1A' }}>
        <div className="animate-shake">
          <div className="text-6xl mb-4 text-center">💀</div>
          <h1 className="text-3xl font-black text-center text-red-500 mb-2">GAME OVER</h1>
        </div>
        <p className="text-gray-500 text-sm text-center mb-8">
          Die Straße hat dich geschluckt. Dein Körper gibt auf.
        </p>
        <div className="space-y-3 w-full max-w-xs">
          <button
            onClick={handleRespawn}
            className="w-full py-3 rounded-xl text-lg font-bold touch-active"
            style={{ background: '#FF6B35', color: '#fff' }}
          >
            🔄 Nochmal versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ background: '#1A1A1A' }}>
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'strasse' && <StrasseTab />}
        {activeTab === 'gang' && <GangTab />}
        {activeTab === 'profil' && <ProfilTab />}
        {activeTab === 'chat' && <ChatTab />}
        {activeTab === 'shop' && <ShopTab />}
      </div>

      {/* Bottom Navigation */}
      <nav className="flex border-t" style={{ background: '#2D2D2D', borderColor: '#3A3A3A' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 flex flex-col items-center gap-0.5 transition-all touch-active
              ${activeTab === tab.id ? 'text-orange-400' : 'text-gray-500'}`}
          >
            <span className={`text-xl transition-transform ${activeTab === tab.id ? 'scale-110' : ''}`}>
              {tab.icon}
            </span>
            <span className={`text-[10px] font-medium ${activeTab === tab.id ? 'text-orange-400' : ''}`}>
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <div className="w-1 h-1 rounded-full bg-orange-500 -mt-0.5" />
            )}
          </button>
        ))}
      </nav>

      {/* Safe area padding for iOS */}
      <div className="h-safe-area" style={{ background: '#2D2D2D' }} />
    </div>
  );
}
