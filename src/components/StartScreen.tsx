'use client';

import React, { useState } from 'react';

interface StartScreenProps {
  onStart: (name: string) => void;
  hasSave: boolean;
  onContinue: () => void;
}

export default function StartScreen({ onStart, hasSave, onContinue }: StartScreenProps) {
  const [name, setName] = useState('');
  const [showInput, setShowInput] = useState(false);

  return (
    <div className="h-full flex flex-col items-center justify-center p-6" style={{ background: '#1A1A1A' }}>
      {/* Logo */}
      <div className="animate-float mb-8">
        <div className="text-6xl mb-4 text-center">👑</div>
        <h1 className="text-4xl font-black text-center tracking-wider"
          style={{
            background: 'linear-gradient(135deg, #FF6B35, #FF4444)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
          KIEZKINGS
        </h1>
        <p className="text-center text-gray-500 text-sm mt-1 tracking-widest">URBAN SURVIVAL RPG</p>
      </div>

      {/* Tagline */}
      <div className="text-center mb-8">
        <p className="text-gray-400 text-sm italic">&ldquo;Vom Penner zum König der Straße&rdquo;</p>
      </div>

      {/* City Silhouette */}
      <div className="w-full max-w-xs mb-8 flex justify-center items-end gap-1 opacity-20">
        {[40, 60, 35, 80, 50, 70, 45, 90, 55, 65, 40].map((h, i) => (
          <div key={i} className="bg-gray-600" style={{ width: '8%', height: `${h}px`, borderRadius: '2px 2px 0 0' }} />
        ))}
      </div>

      {showInput ? (
        <div className="w-full max-w-xs animate-fadeIn">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && name.trim() && onStart(name.trim())}
            placeholder="Dein Straßenname..."
            maxLength={20}
            autoFocus
            className="w-full px-4 py-3 rounded-xl text-center text-lg outline-none mb-3"
            style={{ background: '#2D2D2D', color: '#F0F0F0', border: '2px solid #FF6B3555' }}
          />
          <button
            onClick={() => name.trim() && onStart(name.trim())}
            disabled={!name.trim()}
            className={`w-full py-3 rounded-xl text-lg font-bold transition-all touch-active
              ${name.trim() ? 'animate-glow' : 'opacity-50'}`}
            style={{ background: name.trim() ? '#FF6B35' : '#333', color: '#fff' }}
          >
            🚀 Spiel starten
          </button>
        </div>
      ) : (
        <div className="w-full max-w-xs space-y-3">
          {hasSave && (
            <button
              onClick={onContinue}
              className="w-full py-3 rounded-xl text-lg font-bold animate-glow touch-active"
              style={{ background: '#FF6B35', color: '#fff' }}
            >
              ▶️ Weiterspielen
            </button>
          )}
          <button
            onClick={() => setShowInput(true)}
            className="w-full py-3 rounded-xl text-lg font-bold touch-active"
            style={{ background: hasSave ? '#2D2D2D' : '#FF6B35', color: '#fff' }}
          >
            🆕 Neues Spiel
          </button>
        </div>
      )}

      <p className="text-[10px] text-gray-700 mt-8">v1.0 — Ein Browsergame für die Straße 🔥</p>
    </div>
  );
}
