'use client';

import React, { useState } from 'react';
import { useGame } from '@/lib/GameContext';
import { getLevelFromXP, LOCATIONS } from '@/lib/gameData';

const ENEMIES = [
  { name: 'Betrunkener', icon: '🍺', power: 5, level: 1 },
  { name: 'Taschendieb', icon: '🤏', power: 10, level: 2 },
  { name: 'Punk', icon: '🤘', power: 15, level: 3 },
  { name: 'Dealer', icon: '💊', power: 22, level: 5 },
  { name: 'Schläger', icon: '👊', power: 30, level: 7 },
  { name: 'Gang-Member', icon: '🔪', power: 40, level: 10 },
  { name: 'Enforcer', icon: '⚔️', power: 55, level: 14 },
  { name: 'Underboss', icon: '🦈', power: 70, level: 18 },
  { name: 'Kiez-Legende', icon: '👑', power: 90, level: 22 },
];

export default function GangTab() {
  const { state, dispatch, gangs } = useGame();
  const [view, setView] = useState<'fight' | 'gang' | 'territory'>('fight');
  const [fightResult, setFightResult] = useState<string | null>(null);
  const [fightAnim, setFightAnim] = useState(false);

  const level = getLevelFromXP(state.xp);
  const availableEnemies = ENEMIES.filter(e => level >= e.level);

  function handleFight(enemy: typeof ENEMIES[0]) {
    if (state.stats.energy < 15) {
      setFightResult('❌ Nicht genug Energie zum Kämpfen!');
      setTimeout(() => setFightResult(null), 2000);
      return;
    }

    setFightAnim(true);
    setTimeout(() => {
      dispatch({ type: 'FIGHT', enemyName: enemy.name, enemyPower: enemy.power });
      setFightAnim(false);

      const lastLog = state.combatLog[state.combatLog.length - 1];
      // We check the updated state after dispatch in next render
    }, 600);
  }

  // Show latest fight result
  React.useEffect(() => {
    if (state.combatLog.length > 0) {
      const last = state.combatLog[state.combatLog.length - 1];
      const won = last.result === 'critical' || (last.result === 'hit' && last.damage > 0);
      if (last.result === 'miss') {
        setFightResult(`😤 ${last.defender} ist ausgewichen!`);
      } else if (last.result === 'critical') {
        setFightResult(`💥 KRITISCHER TREFFER! ${last.damage} Schaden an ${last.defender}!`);
      } else {
        setFightResult(won
          ? `⚔️ Du hast ${last.defender} besiegt! +${last.damage} Schaden`
          : `💔 ${last.defender} hat dich erwischt! -${last.damage} HP`
        );
      }
      setTimeout(() => setFightResult(null), 3000);
    }
  }, [state.combatLog.length]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Sub-tabs */}
      <div className="flex border-b border-gray-800">
        {[
          { id: 'fight', label: '⚔️ Kampf', },
          { id: 'gang', label: '🤝 Gangs', },
          { id: 'territory', label: '🗺️ Gebiete', },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id as typeof view)}
            className={`flex-1 py-3 text-xs font-medium transition-all
              ${view === tab.id ? 'text-orange-400 border-b-2 border-orange-500' : 'text-gray-500'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* ===== FIGHT VIEW ===== */}
        {view === 'fight' && (
          <>
            <div className="text-center mb-3">
              <h3 className="text-lg font-bold text-red-400">⚔️ Straßenkampf</h3>
              <p className="text-xs text-gray-500">Wähle deinen Gegner</p>
              <div className="flex justify-center gap-4 mt-2 text-xs text-gray-400">
                <span>🏆 {state.fightsWon}/{state.totalFights} Siege</span>
                <span>⚡ {Math.round(state.stats.energy)} Energie</span>
              </div>
            </div>

            {fightResult && (
              <div className={`p-3 rounded-lg text-center text-sm font-medium animate-fadeIn ${fightAnim ? 'animate-shake' : ''}`}
                style={{
                  background: fightResult.includes('besiegt') || fightResult.includes('KRITISCH')
                    ? '#44FF4422' : fightResult.includes('ausgewichen') ? '#FFD70022' : '#FF444422'
                }}>
                {fightResult}
              </div>
            )}

            {availableEnemies.map(enemy => (
              <button
                key={enemy.name}
                onClick={() => handleFight(enemy)}
                disabled={state.stats.energy < 15}
                className={`w-full p-3 rounded-xl text-left transition-all touch-active
                  ${state.stats.energy >= 15 ? 'active:scale-[0.98]' : 'opacity-50'}`}
                style={{ background: '#2D2D2D' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{enemy.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{enemy.name}</div>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs text-red-400">💪 Stärke: {enemy.power}</span>
                      <span className="text-xs text-gray-500">⚡ -15 Energie</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">Lv.{enemy.level}+</div>
                </div>
              </button>
            ))}

            {availableEnemies.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <span className="text-4xl">😴</span>
                <p className="mt-2 text-sm">Noch keine Gegner verfügbar</p>
                <p className="text-xs">Steig im Level auf!</p>
              </div>
            )}
          </>
        )}

        {/* ===== GANG VIEW ===== */}
        {view === 'gang' && (
          <>
            {state.gangId ? (
              <div className="space-y-3">
                <div className="p-4 rounded-xl text-center" style={{ background: '#2D2D2D' }}>
                  <div className="text-3xl mb-2">
                    {gangs.find(g => g.id === state.gangId)?.icon}
                  </div>
                  <h3 className="text-lg font-bold text-orange-400">{state.gangName}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {state.isGangLeader ? '👑 Boss' : '⭐ Mitglied'}
                  </p>
                  <div className="mt-3 text-xs text-gray-400">
                    Power: {gangs.find(g => g.id === state.gangId)?.power || 0}
                  </div>
                </div>
                <button
                  onClick={() => dispatch({ type: 'LEAVE_GANG' })}
                  className="w-full p-3 rounded-xl text-center text-sm text-red-400 touch-active"
                  style={{ background: '#FF444422' }}
                >
                  🚪 Gang verlassen
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-3">
                  <h3 className="text-lg font-bold">🤝 Gangs beitreten</h3>
                  <p className="text-xs text-gray-500">Respekt benötigt: 30 (aktuell: {Math.round(state.stats.respect)})</p>
                </div>
                {gangs.map(gang => (
                  <button
                    key={gang.id}
                    onClick={() => dispatch({ type: 'JOIN_GANG', gangId: gang.id })}
                    disabled={state.stats.respect < 30}
                    className={`w-full p-3 rounded-xl text-left transition-all touch-active
                      ${state.stats.respect >= 30 ? 'active:scale-[0.98]' : 'opacity-50'}`}
                    style={{ background: '#2D2D2D' }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{gang.icon}</span>
                      <div className="flex-1">
                        <span className="text-sm font-bold" style={{ color: gang.color }}>{gang.name}</span>
                        <div className="text-xs text-gray-500">
                          📍 {LOCATIONS.find(l => l.id === gang.territory)?.name} | 💪 Power: {gang.power}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </>
            )}
          </>
        )}

        {/* ===== TERRITORY VIEW ===== */}
        {view === 'territory' && (
          <>
            <div className="text-center mb-3">
              <h3 className="text-lg font-bold">🗺️ Gebiets-Kontrolle</h3>
              <p className="text-xs text-gray-500">Wer kontrolliert die Straßen?</p>
            </div>
            {LOCATIONS.map(loc => {
              const controllingGang = gangs.find(g => g.territory === loc.id);
              return (
                <div key={loc.id} className="p-3 rounded-xl" style={{ background: '#2D2D2D' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{loc.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-bold">{loc.name}</div>
                      {controllingGang ? (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs">{controllingGang.icon}</span>
                          <span className="text-xs" style={{ color: controllingGang.color }}>
                            {controllingGang.name}
                          </span>
                          <div className="flex-1 h-1.5 rounded-full ml-2" style={{ background: '#1A1A1A' }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${controllingGang.power}%`,
                                background: controllingGang.color,
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-600">Unkontrolliert</span>
                      )}
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-[8px] ${i < loc.dangerLevel ? 'text-red-500' : 'text-gray-700'}`}>●</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
