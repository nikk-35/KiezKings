export interface PlayerStats {
  hunger: number;
  thirst: number;
  health: number;
  energy: number;
  respect: number;
}

export interface InventoryItem {
  id: string;
  quantity: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  senderIcon: string;
  text: string;
  timestamp: number;
  location: string;
  isSystem?: boolean;
}

export interface CombatLog {
  attacker: string;
  defender: string;
  damage: number;
  result: 'hit' | 'miss' | 'critical';
  timestamp: number;
}

export interface GameState {
  playerName: string;
  stats: PlayerStats;
  money: number;
  xp: number;
  currentLocation: string;
  currentHousing: string;
  currentJob: string;
  currentWeapon: string;
  currentClothing: string;
  inventory: InventoryItem[];
  gangId: string | null;
  gangName: string | null;
  isGangLeader: boolean;
  chatMessages: ChatMessage[];
  actionCooldowns: Record<string, number>;
  activeAction: { id: string; endsAt: number } | null;
  combatLog: CombatLog[];
  totalEarned: number;
  totalFights: number;
  fightsWon: number;
  createdAt: number;
  lastTick: number;
}

export function createInitialState(name: string): GameState {
  return {
    playerName: name,
    stats: {
      hunger: 50,
      thirst: 50,
      health: 80,
      energy: 70,
      respect: 0,
    },
    money: 2.5,
    xp: 0,
    currentLocation: 'bahnhof',
    currentHousing: 'parkbank',
    currentJob: 'arbeitslos',
    currentWeapon: 'faust',
    currentClothing: '',
    inventory: [],
    gangId: null,
    gangName: null,
    isGangLeader: false,
    chatMessages: [],
    actionCooldowns: {},
    activeAction: null,
    combatLog: [],
    totalEarned: 0,
    totalFights: 0,
    fightsWon: 0,
    createdAt: Date.now(),
    lastTick: Date.now(),
  };
}
