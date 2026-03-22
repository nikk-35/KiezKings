'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '@/lib/GameContext';
import { LOCATIONS } from '@/lib/gameData';

export default function ChatTab() {
  const { state, dispatch } = useGame();
  const [input, setInput] = useState('');
  const [chatRoom, setChatRoom] = useState('all');
  const messagesEnd = useRef<HTMLDivElement>(null);

  const filteredMessages = chatRoom === 'all'
    ? state.chatMessages
    : state.chatMessages.filter(m => m.location === chatRoom);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages.length]);

  function handleSend() {
    if (!input.trim()) return;
    dispatch({ type: 'SEND_CHAT', text: input.trim() });
    setInput('');
  }

  function formatTime(ts: number) {
    return new Date(ts).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Room Selector */}
      <div className="flex gap-1.5 p-2 overflow-x-auto" style={{ background: '#2D2D2D' }}>
        <button
          onClick={() => setChatRoom('all')}
          className={`flex-shrink-0 px-3 py-1 rounded-full text-xs transition-all
            ${chatRoom === 'all' ? 'bg-orange-500/30 text-orange-400' : 'bg-gray-800 text-gray-500'}`}
        >
          🌍 Alle
        </button>
        {LOCATIONS.map(loc => (
          <button
            key={loc.id}
            onClick={() => setChatRoom(loc.id)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs transition-all
              ${chatRoom === loc.id ? 'bg-orange-500/30 text-orange-400' : 'bg-gray-800 text-gray-500'}`}
          >
            {loc.icon} {loc.name}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredMessages.length === 0 && (
          <div className="text-center text-gray-600 py-8">
            <span className="text-3xl">💬</span>
            <p className="text-sm mt-2">Noch keine Nachrichten</p>
            <p className="text-xs">Sei der Erste!</p>
          </div>
        )}
        {filteredMessages.map(msg => {
          const isMe = msg.sender === state.playerName;
          const loc = LOCATIONS.find(l => l.id === msg.location);

          return (
            <div key={msg.id} className={`flex gap-2 animate-fadeIn ${isMe ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: isMe ? '#FF6B3533' : '#3A3A3A' }}>
                {msg.senderIcon || '🧑'}
              </div>
              <div className={`max-w-[75%] ${isMe ? 'text-right' : ''}`}>
                <div className="flex items-center gap-2 mb-0.5">
                  {!isMe && (
                    <span className="text-xs font-bold" style={{ color: msg.isSystem ? '#00D4FF' : '#FF6B35' }}>
                      {msg.sender}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-600">{formatTime(msg.timestamp)}</span>
                  {loc && <span className="text-[10px] text-gray-700">{loc.icon}</span>}
                </div>
                <div className={`inline-block px-3 py-2 rounded-2xl text-sm
                  ${isMe
                    ? 'rounded-tr-sm bg-orange-500/20 text-orange-100'
                    : 'rounded-tl-sm text-gray-200'}`}
                  style={{ background: isMe ? undefined : '#2D2D2D' }}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <div className="p-2 flex gap-2" style={{ background: '#2D2D2D' }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Nachricht schreiben..."
          className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none"
          style={{ background: '#1A1A1A', color: '#F0F0F0' }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg touch-active transition-all
            ${input.trim() ? 'bg-orange-500' : 'bg-gray-700'}`}
        >
          📤
        </button>
      </div>
    </div>
  );
}
