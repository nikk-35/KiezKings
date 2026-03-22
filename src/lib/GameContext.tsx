'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { GameState, createInitialState, ChatMessage, CombatLog } from './gameState';
import {
  STATS, LOCATIONS, HOUSING, JOBS, SHOP_ITEMS,
  getLevelFromXP, DEFAULT_GANGS, Gang
} from './gameData';

// NPC chat messages
const NPC_MESSAGES = [
  { sender: 'Kiosk-Mehmet', icon: '🧔', texts: ['Ey Bruder, willst du Kippen?', 'Heute Sonderangebot auf Bier!', 'Pass auf dich auf da draußen.'] },
  { sender: 'Alte Helga', icon: '👵', texts: ['Früher war alles besser...', 'Hast du mal ne Mark?', 'Die Jugend von heute...'] },
  { sender: 'Dealer-Cem', icon: '😎', texts: ['Psst, brauchst du was?', 'Bestes Zeug in der Stadt, Wallah.', 'Die Bullen sind unterwegs, pass auf!'] },
  { sender: 'Punk-Lisa', icon: '🤘', texts: ['Scheiß System!', 'Komm mit zum Konzert heute Nacht!', 'Haste mal Feuer?'] },
  { sender: 'Polizist Müller', icon: '👮', texts: ['Weitergehen, hier gibt\'s nichts zu sehen!', 'Ausweis bitte!', 'Räumen Sie den Platz!'] },
  { sender: 'Späti-Achmed', icon: '🏪', texts: ['Bruder, Bier für 1€ heute!', 'Mein Laden, meine Regeln!', 'Du schuldest mir noch Geld!'] },
];

type Action =
  | { type: 'TICK' }
  | { type: 'SET_LOCATION'; location: string }
  | { type: 'START_ACTION'; actionId: string; duration: number }
  | { type: 'COMPLETE_ACTION'; actionId: string; locationId: string }
  | { type: 'BUY_ITEM'; itemId: string }
  | { type: 'USE_ITEM'; itemId: string }
  | { type: 'CHANGE_HOUSING'; housingId: string }
  | { type: 'CHANGE_JOB'; jobId: string }
  | { type: 'WORK'; hours: number }
  | { type: 'EQUIP_WEAPON'; weaponId: string }
  | { type: 'EQUIP_CLOTHING'; clothingId: string }
  | { type: 'JOIN_GANG'; gangId: string }
  | { type: 'LEAVE_GANG' }
  | { type: 'FIGHT'; enemyName: string; enemyPower: number }
  | { type: 'ADD_CHAT'; message: ChatMessage }
  | { type: 'SEND_CHAT'; text: string }
  | { type: 'SLEEP' }
  | { type: 'RESET'; name: string }
  | { type: 'LOAD'; state: GameState };

function clamp(v: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'TICK': {
      const now = Date.now();
      const elapsed = (now - state.lastTick) / 60000; // minutes

      // Decay stats
      const housing = HOUSING.find(h => h.id === state.currentHousing);
      const newStats = { ...state.stats };

      for (const stat of STATS) {
        const key = stat.key as keyof typeof newStats;
        if (key === 'respect') continue;
        let decay = stat.decayRate * elapsed;
        if (housing) {
          if (key === 'energy') decay = Math.max(0, decay - (housing.energyBonus * elapsed * 0.01));
          if (key === 'health') decay = Math.max(0, decay - (housing.healthBonus * elapsed * 0.01));
        }
        newStats[key] = clamp(newStats[key] - decay);
      }

      // Health damage if hunger/thirst are 0
      if (newStats.hunger <= 0) newStats.health = clamp(newStats.health - elapsed * 0.5);
      if (newStats.thirst <= 0) newStats.health = clamp(newStats.health - elapsed * 0.5);

      // Check active action completion
      let activeAction = state.activeAction;
      if (activeAction && now >= activeAction.endsAt) {
        activeAction = null;
      }

      return { ...state, stats: newStats, lastTick: now, activeAction };
    }

    case 'SET_LOCATION':
      return { ...state, currentLocation: action.location };

    case 'START_ACTION':
      return {
        ...state,
        activeAction: { id: action.actionId, endsAt: Date.now() + action.duration * 1000 },
      };

    case 'COMPLETE_ACTION': {
      const loc = LOCATIONS.find(l => l.id === action.locationId);
      const act = loc?.actions.find(a => a.id === action.actionId);
      if (!act) return state;

      const newStats = { ...state.stats };
      let moneyGain = 0;
      let xpGain = act.xpReward || 0;

      // Apply effects
      for (const [key, val] of Object.entries(act.effects)) {
        if (key in newStats) {
          (newStats as unknown as Record<string, number>)[key] = clamp(
            (newStats as unknown as Record<string, number>)[key] + (val || 0)
          );
        }
      }

      // Money reward
      if (act.moneyReward) {
        const [min, max] = act.moneyReward;
        moneyGain = Math.round((Math.random() * (max - min) + min) * 100) / 100;
      }

      // Respect
      if (act.respectReward) {
        newStats.respect = clamp(newStats.respect + act.respectReward);
      }

      // Item drops
      const newInventory = [...state.inventory];
      if (act.itemDrop) {
        for (const drop of act.itemDrop) {
          if (Math.random() < drop.chance) {
            const existing = newInventory.find(i => i.id === drop.id);
            if (existing) existing.quantity++;
            else newInventory.push({ id: drop.id, quantity: 1 });
          }
        }
      }

      // Cooldown
      const newCooldowns = { ...state.actionCooldowns };
      if (act.cooldown) {
        newCooldowns[act.id] = Date.now() + act.cooldown * 1000;
      }

      return {
        ...state,
        stats: newStats,
        money: Math.round((state.money + moneyGain) * 100) / 100,
        xp: state.xp + xpGain,
        totalEarned: Math.round((state.totalEarned + moneyGain) * 100) / 100,
        inventory: newInventory,
        actionCooldowns: newCooldowns,
        activeAction: null,
      };
    }

    case 'BUY_ITEM': {
      const item = SHOP_ITEMS.find(i => i.id === action.itemId);
      if (!item || state.money < item.price) return state;

      const newInventory = [...state.inventory];
      const existing = newInventory.find(i => i.id === item.id);
      if (existing) existing.quantity++;
      else newInventory.push({ id: item.id, quantity: 1 });

      return {
        ...state,
        money: Math.round((state.money - item.price) * 100) / 100,
        inventory: newInventory,
      };
    }

    case 'USE_ITEM': {
      const item = SHOP_ITEMS.find(i => i.id === action.itemId);
      const inv = state.inventory.find(i => i.id === action.itemId);
      if (!item || !inv || inv.quantity <= 0) return state;

      const newStats = { ...state.stats };
      for (const [key, val] of Object.entries(item.effects)) {
        if (key in newStats) {
          (newStats as unknown as Record<string, number>)[key] = clamp(
            (newStats as unknown as Record<string, number>)[key] + (val || 0)
          );
        }
      }

      const newInventory = state.inventory
        .map(i => i.id === action.itemId ? { ...i, quantity: i.quantity - 1 } : i)
        .filter(i => i.quantity > 0);

      return { ...state, stats: newStats, inventory: newInventory };
    }

    case 'CHANGE_HOUSING': {
      const housing = HOUSING.find(h => h.id === action.housingId);
      if (!housing || state.money < housing.cost) return state;
      if (getLevelFromXP(state.xp) < housing.unlockLevel) return state;

      return {
        ...state,
        currentHousing: housing.id,
        money: Math.round((state.money - housing.cost) * 100) / 100,
      };
    }

    case 'CHANGE_JOB': {
      const job = JOBS.find(j => j.id === action.jobId);
      if (!job) return state;
      if (state.stats.respect < job.respectRequired) return state;
      if (getLevelFromXP(state.xp) < job.levelRequired) return state;
      return { ...state, currentJob: job.id };
    }

    case 'WORK': {
      const job = JOBS.find(j => j.id === state.currentJob);
      if (!job || job.id === 'arbeitslos') return state;

      const energyCost = job.energyCost * action.hours;
      if (state.stats.energy < energyCost) return state;

      const earned = job.payPerHour * action.hours;
      const newStats = { ...state.stats };
      newStats.energy = clamp(newStats.energy - energyCost);
      newStats.respect = clamp(newStats.respect + job.respectGain);

      return {
        ...state,
        stats: newStats,
        money: Math.round((state.money + earned) * 100) / 100,
        totalEarned: Math.round((state.totalEarned + earned) * 100) / 100,
        xp: state.xp + Math.floor(earned / 2),
      };
    }

    case 'EQUIP_WEAPON': {
      const hasItem = state.inventory.some(i => i.id === action.weaponId) || action.weaponId === 'faust';
      if (!hasItem && action.weaponId !== 'faust') return state;
      return { ...state, currentWeapon: action.weaponId };
    }

    case 'EQUIP_CLOTHING': {
      const hasItem = state.inventory.some(i => i.id === action.clothingId);
      if (!hasItem) return state;
      return { ...state, currentClothing: action.clothingId };
    }

    case 'JOIN_GANG': {
      if (state.stats.respect < 30) return state;
      const gang = DEFAULT_GANGS.find(g => g.id === action.gangId);
      if (!gang) return state;
      return { ...state, gangId: gang.id, gangName: gang.name, isGangLeader: false };
    }

    case 'LEAVE_GANG':
      return { ...state, gangId: null, gangName: null, isGangLeader: false };

    case 'FIGHT': {
      const weapon = SHOP_ITEMS.find(i => i.id === state.currentWeapon);
      const clothing = SHOP_ITEMS.find(i => i.id === state.currentClothing);
      const playerAttack = 5 + (weapon?.attackBonus || 0) + getLevelFromXP(state.xp) * 2;
      const playerDefense = 2 + (clothing?.defenseBonus || 0) + getLevelFromXP(state.xp);

      const roll = Math.random();
      let damage: number;
      let result: 'hit' | 'miss' | 'critical';
      let won: boolean;

      if (roll < 0.1) {
        result = 'miss';
        damage = 0;
        won = false;
      } else if (roll > 0.9) {
        result = 'critical';
        damage = Math.floor(playerAttack * 1.5);
        won = true;
      } else {
        result = 'hit';
        const effectiveness = playerAttack / (playerAttack + action.enemyPower);
        won = Math.random() < effectiveness;
        damage = won
          ? Math.floor(Math.random() * playerAttack * 0.5 + playerAttack * 0.5)
          : Math.floor(Math.random() * action.enemyPower * 0.3 + 5);
      }

      const newStats = { ...state.stats };
      newStats.energy = clamp(newStats.energy - 15);

      let moneyChange = 0;
      let xpGain = 0;

      if (won) {
        moneyChange = Math.floor(Math.random() * 20 + 5);
        xpGain = Math.floor(action.enemyPower / 2) + 10;
        newStats.respect = clamp(newStats.respect + 3);
      } else {
        const dmgTaken = Math.max(1, damage - playerDefense);
        newStats.health = clamp(newStats.health - dmgTaken);
        newStats.respect = clamp(newStats.respect - 1);
      }

      const log: CombatLog[] = [...state.combatLog, {
        attacker: state.playerName,
        defender: action.enemyName,
        damage,
        result,
        timestamp: Date.now(),
      }].slice(-20);

      return {
        ...state,
        stats: newStats,
        money: Math.round((state.money + moneyChange) * 100) / 100,
        xp: state.xp + xpGain,
        combatLog: log,
        totalFights: state.totalFights + 1,
        fightsWon: state.fightsWon + (won ? 1 : 0),
      };
    }

    case 'ADD_CHAT':
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.message].slice(-100),
      };

    case 'SEND_CHAT': {
      const msg: ChatMessage = {
        id: Date.now().toString(),
        sender: state.playerName,
        senderIcon: '🧑',
        text: action.text,
        timestamp: Date.now(),
        location: state.currentLocation,
      };
      return {
        ...state,
        chatMessages: [...state.chatMessages, msg].slice(-100),
      };
    }

    case 'SLEEP': {
      const housing = HOUSING.find(h => h.id === state.currentHousing);
      const bonus = housing ? housing.energyBonus : 5;
      const newStats = { ...state.stats };
      newStats.energy = clamp(newStats.energy + bonus);
      newStats.health = clamp(newStats.health + (housing?.healthBonus || 0) * 0.5);
      return { ...state, stats: newStats };
    }

    case 'RESET':
      return createInitialState(action.name);

    case 'LOAD':
      return action.state;

    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  gangs: Gang[];
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, null as unknown as GameState, () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kiezkings_save');
      if (saved) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
      }
    }
    return createInitialState('Spieler');
  });

  const gangs = DEFAULT_GANGS;

  // Save to localStorage
  useEffect(() => {
    if (state?.playerName) {
      localStorage.setItem('kiezkings_save', JSON.stringify(state));
    }
  }, [state]);

  // Game tick
  useEffect(() => {
    const interval = setInterval(() => dispatch({ type: 'TICK' }), 2000);
    return () => clearInterval(interval);
  }, []);

  // NPC chat messages
  const lastNpcMsg = useRef(0);
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastNpcMsg.current < 15000) return;
      lastNpcMsg.current = now;

      const npc = NPC_MESSAGES[Math.floor(Math.random() * NPC_MESSAGES.length)];
      const text = npc.texts[Math.floor(Math.random() * npc.texts.length)];

      dispatch({
        type: 'ADD_CHAT',
        message: {
          id: now.toString(),
          sender: npc.sender,
          senderIcon: npc.icon,
          text,
          timestamp: now,
          location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)].id,
        },
      });
    }, 8000 + Math.random() * 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch, gangs }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
