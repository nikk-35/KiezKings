'use client';

import { GameProvider } from '@/lib/GameContext';
import GameShell from '@/components/GameShell';

export default function Home() {
  return (
    <main className="h-dvh w-full max-w-md mx-auto overflow-hidden" style={{ background: '#1A1A1A' }}>
      <GameProvider>
        <GameShell />
      </GameProvider>
    </main>
  );
}
