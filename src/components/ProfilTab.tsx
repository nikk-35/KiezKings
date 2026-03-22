'use client';

import React, { useState } from 'react';
import { useGame } from '@/lib/GameContext';
import {
  STATS, HOUSING, JOBS, SHOP_ITEMS,
  getLevelFromXP, getXPProgress, getXPForLevel,
} from '@/lib/gameData';
import StatBar from './StatBar';

export default function ProfilTab() {
  const { state, dispatch } = useGame();
  const [view, setView] = useState<'stats' | 'housing' | 'job' | 'inventory'>('stats');

  const level = getLevelFromXP(state.xp);
  const xpProgress = getXPProgress(state.xp);
  const nextLevelXP = getXPForLevel(level + 1);
  const currentJob = JOBS.find(j => j.id === state.currentJob)!;
  const currentHousing = HOUSING.find(h => h.id === state.currentHousing)!;
  const currentWeapon = SHOP_ITEMS.find(i => i.id === state.currentWeapon);
  const currentClothing = SHOP_ITEMS.find(i => i.id === state.currentClothing);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Profile Header */}
      <div className="p-4 text-center" style={{ background: '#2D2D2D' }}>
        <div className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-3xl"
          style={{ background: 'linear-gradient(135deg, #FF6B35, #FF4444)' }}>
          🧑
        </div>
        <h2 className="text-lg font-bold">{state.playerName}</h2>
        <div className="flex justify-center gap-3 text-xs text-gray-400 mt-1">
          <span>⭐ Level {level}</span>
          <span>💰 {state.money.toFixed(2)}€</span>
          <span>{currentJob.icon} {currentJob.name}</span>
        </div>
        {/* XP Bar */}
        <div className="mt-2 mx-8">
          <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
            <span>XP</span>
            <span>{state.xp}/{nextLevelXP}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1A1A1A' }}>
            <div className="h-full rounded-full bar-fill"
              style={{ width: `${xpProgress * 100}%`, background: 'linear-gradient(90deg, #00D4FF, #0088FF)' }}
            />
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-gray-800">
        {[
          { id: 'stats', label: '📊 Stats' },
          { id: 'housing', label: '🏠 Wohnung' },
          { id: 'job', label: '💼 Job' },
          { id: 'inventory', label: '🎒 Inventar' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id as typeof view)}
            className={`flex-1 py-2.5 text-xs font-medium transition-all
              ${view === tab.id ? 'text-orange-400 border-b-2 border-orange-500' : 'text-gray-500'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* ===== STATS ===== */}
        {view === 'stats' && (
          <>
            <div className="space-y-1">
              {STATS.map(stat => (
                <StatBar
                  key={stat.key}
                  icon={stat.icon}
                  label={stat.label}
                  value={(state.stats as unknown as Record<string, number>)[stat.key]}
                  color={stat.color}
                />
              ))}
            </div>

            <div className="p-3 rounded-xl space-y-2" style={{ background: '#2D2D2D' }}>
              <h4 className="text-xs font-bold text-gray-400">AUSRÜSTUNG</h4>
              <div className="flex justify-between text-sm">
                <span>🏠 Wohnung:</span>
                <span className="text-orange-400">{currentHousing.icon} {currentHousing.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>💼 Job:</span>
                <span className="text-orange-400">{currentJob.icon} {currentJob.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>⚔️ Waffe:</span>
                <span className="text-orange-400">{currentWeapon?.icon || '✊'} {currentWeapon?.name || 'Fäuste'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>🧥 Kleidung:</span>
                <span className="text-orange-400">{currentClothing?.icon || '👕'} {currentClothing?.name || 'Lumpen'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl space-y-2" style={{ background: '#2D2D2D' }}>
              <h4 className="text-xs font-bold text-gray-400">STATISTIKEN</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>💰 Gesamt verdient: {state.totalEarned.toFixed(2)}€</div>
                <div>⚔️ Kämpfe: {state.totalFights}</div>
                <div>🏆 Siege: {state.fightsWon}</div>
                <div>📅 Seit: {new Date(state.createdAt).toLocaleDateString('de-DE')}</div>
              </div>
            </div>

            {/* Sleep Button */}
            <button
              onClick={() => dispatch({ type: 'SLEEP' })}
              className="w-full p-3 rounded-xl text-center text-sm font-medium touch-active"
              style={{ background: '#2D2D4D' }}
            >
              😴 Schlafen (+{currentHousing.energyBonus} Energie)
            </button>

            {/* Work Button */}
            {currentJob.id !== 'arbeitslos' && (
              <button
                onClick={() => dispatch({ type: 'WORK', hours: 1 })}
                disabled={state.stats.energy < currentJob.energyCost}
                className={`w-full p-3 rounded-xl text-center text-sm font-medium touch-active
                  ${state.stats.energy >= currentJob.energyCost ? '' : 'opacity-50'}`}
                style={{ background: '#2D4D2D' }}
              >
                {currentJob.icon} 1h Arbeiten ({currentJob.payPerHour}€, -{currentJob.energyCost} ⚡)
              </button>
            )}
          </>
        )}

        {/* ===== HOUSING ===== */}
        {view === 'housing' && (
          <>
            <div className="text-center mb-2">
              <span className="text-xs text-gray-500">Aktuell: {currentHousing.icon} {currentHousing.name}</span>
            </div>
            {HOUSING.map(house => {
              const isOwned = state.currentHousing === house.id;
              const canAfford = state.money >= house.cost;
              const hasLevel = level >= house.unlockLevel;
              const canBuy = !isOwned && canAfford && hasLevel;

              return (
                <button
                  key={house.id}
                  onClick={() => canBuy && dispatch({ type: 'CHANGE_HOUSING', housingId: house.id })}
                  disabled={!canBuy && !isOwned}
                  className={`w-full p-3 rounded-xl text-left transition-all touch-active
                    ${isOwned ? 'ring-2 ring-orange-500' : ''}
                    ${!canBuy && !isOwned ? 'opacity-40' : ''}`}
                  style={{ background: '#2D2D2D' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{house.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-bold">{house.name}</div>
                      <div className="text-xs text-gray-500">{house.description}</div>
                      <div className="flex gap-2 mt-1 text-xs">
                        <span className="text-yellow-400">⚡+{house.energyBonus}</span>
                        <span className="text-red-400">❤️+{house.healthBonus}</span>
                        <span className="text-orange-400">👊+{house.respectBonus}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {isOwned ? (
                        <span className="text-xs text-green-400">✅ Hier</span>
                      ) : (
                        <>
                          <div className={`text-sm font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                            {house.cost > 0 ? `${house.cost}€` : 'Gratis'}
                          </div>
                          {!hasLevel && <div className="text-[10px] text-gray-600">🔒 Lv.{house.unlockLevel}</div>}
                          {house.monthlyCost > 0 && <div className="text-[10px] text-gray-600">{house.monthlyCost}€/Mo</div>}
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </>
        )}

        {/* ===== JOB ===== */}
        {view === 'job' && (
          <>
            <div className="text-center mb-2">
              <span className="text-xs text-gray-500">Aktuell: {currentJob.icon} {currentJob.name}</span>
            </div>
            {JOBS.map(job => {
              const isActive = state.currentJob === job.id;
              const hasRespect = state.stats.respect >= job.respectRequired;
              const hasLevel = level >= job.levelRequired;
              const canApply = !isActive && hasRespect && hasLevel;

              return (
                <button
                  key={job.id}
                  onClick={() => canApply && dispatch({ type: 'CHANGE_JOB', jobId: job.id })}
                  disabled={!canApply && !isActive}
                  className={`w-full p-3 rounded-xl text-left transition-all touch-active
                    ${isActive ? 'ring-2 ring-orange-500' : ''}
                    ${!canApply && !isActive ? 'opacity-40' : ''}`}
                  style={{ background: '#2D2D2D' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{job.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-bold">{job.name}</div>
                      <div className="text-xs text-gray-500">{job.description}</div>
                      <div className="flex gap-2 mt-1 text-xs">
                        <span className="text-green-400">💰 {job.payPerHour}€/h</span>
                        <span className="text-yellow-400">⚡ -{job.energyCost}/h</span>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      {isActive ? (
                        <span className="text-green-400">✅ Aktiv</span>
                      ) : (
                        <>
                          {!hasRespect && <div className="text-red-400">👊 {job.respectRequired}</div>}
                          {!hasLevel && <div className="text-gray-600">🔒 Lv.{job.levelRequired}</div>}
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </>
        )}

        {/* ===== INVENTORY ===== */}
        {view === 'inventory' && (
          <>
            {state.inventory.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <span className="text-4xl">🎒</span>
                <p className="mt-2 text-sm">Inventar ist leer</p>
                <p className="text-xs">Kauf was im Shop!</p>
              </div>
            ) : (
              state.inventory.map(inv => {
                const item = SHOP_ITEMS.find(i => i.id === inv.id);
                if (!item) return null;
                const isWeapon = item.category === 'weapon';
                const isClothing = item.category === 'clothing';
                const isEquipped = state.currentWeapon === item.id || state.currentClothing === item.id;
                const isConsumable = item.category === 'food' || item.category === 'drink' || item.id === 'medkit';

                return (
                  <div key={inv.id} className="p-3 rounded-xl flex items-center gap-3" style={{ background: '#2D2D2D' }}>
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-bold">{item.name} <span className="text-xs text-gray-500">x{inv.quantity}</span></div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                    {isConsumable && (
                      <button
                        onClick={() => dispatch({ type: 'USE_ITEM', itemId: item.id })}
                        className="px-3 py-1 rounded-lg text-xs font-medium touch-active"
                        style={{ background: '#44FF4433', color: '#44FF44' }}
                      >
                        Benutzen
                      </button>
                    )}
                    {isWeapon && (
                      <button
                        onClick={() => dispatch({ type: 'EQUIP_WEAPON', weaponId: item.id })}
                        className={`px-3 py-1 rounded-lg text-xs font-medium touch-active
                          ${isEquipped ? 'bg-orange-500/30 text-orange-400' : 'bg-gray-700 text-gray-300'}`}
                      >
                        {isEquipped ? '✅ Aktiv' : 'Ausrüsten'}
                      </button>
                    )}
                    {isClothing && (
                      <button
                        onClick={() => dispatch({ type: 'EQUIP_CLOTHING', clothingId: item.id })}
                        className={`px-3 py-1 rounded-lg text-xs font-medium touch-active
                          ${isEquipped ? 'bg-orange-500/30 text-orange-400' : 'bg-gray-700 text-gray-300'}`}
                      >
                        {isEquipped ? '✅ Aktiv' : 'Anziehen'}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
}
