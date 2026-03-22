'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/lib/GameContext';
import { LOCATIONS, STATS, getLevelFromXP } from '@/lib/gameData';
import StatBar from './StatBar';

export default function StrasseTab() {
  const { state, dispatch } = useGame();
  const [actionProgress, setActionProgress] = useState<number | null>(null);
  const [actionResult, setActionResult] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState(state.currentLocation);

  const level = getLevelFromXP(state.xp);
  const location = LOCATIONS.find(l => l.id === selectedLocation)!;
  const availableLocations = LOCATIONS.filter(l => level >= l.unlockLevel);

  // Action progress timer
  useEffect(() => {
    if (!state.activeAction) {
      setActionProgress(null);
      return;
    }
    const interval = setInterval(() => {
      const now = Date.now();
      const total = state.activeAction!.endsAt - (state.activeAction!.endsAt - 0);
      // Calculate remaining
      const remaining = state.activeAction!.endsAt - now;
      if (remaining <= 0) {
        setActionProgress(null);
        // Complete the action
        dispatch({ type: 'COMPLETE_ACTION', actionId: state.activeAction!.id, locationId: selectedLocation });
        setActionResult('✅ Aktion abgeschlossen!');
        setTimeout(() => setActionResult(null), 2000);
      } else {
        // Find original duration from action
        const loc = LOCATIONS.find(l => l.id === selectedLocation);
        const act = loc?.actions.find(a => a.id === state.activeAction!.id);
        const totalDuration = (act?.duration || 10) * 1000;
        const elapsed = totalDuration - remaining;
        setActionProgress(Math.min(100, (elapsed / totalDuration) * 100));
      }
    }, 100);
    return () => clearInterval(interval);
  }, [state.activeAction, selectedLocation, dispatch]);

  function handleAction(actionId: string) {
    const act = location.actions.find(a => a.id === actionId);
    if (!act || state.activeAction) return;

    // Check cooldown
    const cd = state.actionCooldowns[actionId];
    if (cd && Date.now() < cd) return;

    // Check requirements
    if (act.requirements) {
      for (const [key, val] of Object.entries(act.requirements)) {
        if ((state.stats as unknown as Record<string, number>)[key] < (val || 0)) {
          setActionResult(`❌ Nicht genug ${key}!`);
          setTimeout(() => setActionResult(null), 2000);
          return;
        }
      }
    }

    // Check energy
    const energyCost = act.effects.energy;
    if (energyCost && energyCost < 0 && state.stats.energy < Math.abs(energyCost)) {
      setActionResult('❌ Nicht genug Energie!');
      setTimeout(() => setActionResult(null), 2000);
      return;
    }

    dispatch({ type: 'START_ACTION', actionId, duration: act.duration });
    dispatch({ type: 'SET_LOCATION', location: selectedLocation });
  }

  function getCooldownRemaining(actionId: string): number {
    const cd = state.actionCooldowns[actionId];
    if (!cd) return 0;
    return Math.max(0, cd - Date.now());
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Stats Header */}
      <div className="p-3 rounded-b-xl" style={{ background: '#2D2D2D' }}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-orange-400">💰 {state.money.toFixed(2)}€</span>
          <span className="text-sm text-gray-400">⭐ Level {level}</span>
          <span className="text-xs text-gray-500">📍 {location.name}</span>
        </div>
        <div className="grid grid-cols-1 gap-0">
          {STATS.map(stat => (
            <StatBar
              key={stat.key}
              icon={stat.icon}
              label={stat.label}
              value={(state.stats as unknown as Record<string, number>)[stat.key]}
              color={stat.color}
              compact
            />
          ))}
        </div>
      </div>

      {/* Location Selector */}
      <div className="flex gap-2 p-2 overflow-x-auto scrollbar-hide">
        {availableLocations.map(loc => (
          <button
            key={loc.id}
            onClick={() => setSelectedLocation(loc.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all touch-active
              ${selectedLocation === loc.id
                ? 'bg-orange-500/30 text-orange-400 border border-orange-500/50'
                : 'bg-gray-800 text-gray-400 border border-gray-700'}`}
          >
            {loc.icon} {loc.name}
          </button>
        ))}
      </div>

      {/* Location Info */}
      <div className="px-3 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{location.icon}</span>
          <div>
            <h2 className="text-sm font-bold">{location.name}</h2>
            <p className="text-xs text-gray-500">{location.description}</p>
          </div>
          <div className="ml-auto flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-xs ${i < location.dangerLevel ? 'text-red-500' : 'text-gray-700'}`}>⚠️</span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Result */}
      {actionResult && (
        <div className="mx-3 mb-2 p-2 rounded-lg text-center text-sm font-medium animate-fadeIn"
          style={{ background: actionResult.startsWith('✅') ? '#44FF4422' : '#FF444422' }}>
          {actionResult}
        </div>
      )}

      {/* Active Action Progress */}
      {state.activeAction && actionProgress !== null && (
        <div className="mx-3 mb-2 p-3 rounded-lg animate-fadeIn" style={{ background: '#2D2D2D' }}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-orange-400">⏳ Aktion läuft...</span>
            <span className="text-gray-400">{Math.round(actionProgress)}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1A1A1A' }}>
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                width: `${actionProgress}%`,
                background: 'linear-gradient(90deg, #FF6B35, #FFD700)',
              }}
            />
          </div>
        </div>
      )}

      {/* Actions List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
        {location.actions.map(act => {
          const cdRemaining = getCooldownRemaining(act.id);
          const isOnCooldown = cdRemaining > 0;
          const isActive = state.activeAction?.id === act.id;
          const meetsRequirements = !act.requirements || Object.entries(act.requirements).every(
            ([key, val]) => (state.stats as unknown as Record<string, number>)[key] >= (val || 0)
          );
          const hasEnergy = !act.effects.energy || act.effects.energy >= 0 || state.stats.energy >= Math.abs(act.effects.energy);
          const canDo = !isOnCooldown && !state.activeAction && meetsRequirements && hasEnergy;

          return (
            <button
              key={act.id}
              onClick={() => canDo && handleAction(act.id)}
              disabled={!canDo}
              className={`w-full text-left p-3 rounded-xl transition-all touch-active
                ${canDo ? 'active:scale-[0.98]' : 'opacity-50'}
                ${isActive ? 'ring-2 ring-orange-500' : ''}`}
              style={{ background: canDo ? '#2D2D2D' : '#222' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{act.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{act.label}</span>
                    <span className="text-xs text-gray-500">⏱ {act.duration}s</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{act.description}</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {act.moneyReward && (
                      <span className="text-xs text-green-400">
                        💰 {act.moneyReward[0].toFixed(2)}-{act.moneyReward[1].toFixed(2)}€
                      </span>
                    )}
                    {act.xpReward && <span className="text-xs text-blue-400">⭐ +{act.xpReward}XP</span>}
                    {act.effects.energy && act.effects.energy < 0 && (
                      <span className="text-xs text-yellow-400">⚡ {act.effects.energy}</span>
                    )}
                    {act.respectReward && act.respectReward > 0 && (
                      <span className="text-xs text-orange-400">👊 +{act.respectReward}</span>
                    )}
                  </div>
                </div>
                {isOnCooldown && (
                  <span className="text-xs text-red-400 font-mono">
                    {Math.ceil(cdRemaining / 1000)}s
                  </span>
                )}
                {!meetsRequirements && (
                  <span className="text-xs text-red-400">🔒</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
