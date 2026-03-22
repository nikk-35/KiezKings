// ========== GAME DATA ==========

export interface StatConfig {
  key: string;
  label: string;
  icon: string;
  color: string;
  decayRate: number; // per minute
}

export const STATS: StatConfig[] = [
  { key: 'hunger', label: 'Hunger', icon: '🍔', color: '#FF6B35', decayRate: 0.15 },
  { key: 'thirst', label: 'Durst', icon: '💧', color: '#00D4FF', decayRate: 0.2 },
  { key: 'health', label: 'Gesundheit', icon: '❤️', color: '#FF4444', decayRate: 0.05 },
  { key: 'energy', label: 'Energie', icon: '⚡', color: '#FFD700', decayRate: 0.1 },
  { key: 'respect', label: 'Respekt', icon: '👊', color: '#FF6B35', decayRate: 0.02 },
];

export interface Location {
  id: string;
  name: string;
  icon: string;
  description: string;
  dangerLevel: number;
  actions: LocationAction[];
  unlockLevel: number;
}

export interface LocationAction {
  id: string;
  label: string;
  icon: string;
  description: string;
  duration: number; // seconds
  effects: Partial<Record<string, number>>;
  requirements?: Partial<Record<string, number>>;
  cooldown?: number;
  moneyReward?: [number, number]; // min, max
  xpReward?: number;
  respectReward?: number;
  itemDrop?: { id: string; chance: number }[];
}

export const LOCATIONS: Location[] = [
  {
    id: 'bahnhof',
    name: 'Bahnhof',
    icon: '🚂',
    description: 'Der Hauptbahnhof. Hier trifft sich alles - Penner, Dealer, Pendler.',
    dangerLevel: 2,
    unlockLevel: 0,
    actions: [
      {
        id: 'betteln',
        label: 'Betteln',
        icon: '🙏',
        description: 'Passanten um Kleingeld anschnorren',
        duration: 10,
        effects: { energy: -5 },
        moneyReward: [0.10, 2.50],
        xpReward: 5,
        respectReward: -1,
      },
      {
        id: 'flaschensammeln',
        label: 'Flaschen sammeln',
        icon: '🍾',
        description: 'Pfandflaschen aus den Mülleimern fischen',
        duration: 15,
        effects: { energy: -8 },
        moneyReward: [0.25, 1.50],
        xpReward: 3,
      },
      {
        id: 'rumhaengen',
        label: 'Rumhängen',
        icon: '🚬',
        description: 'Am Bahnhof chillen und Leute beobachten',
        duration: 5,
        effects: { energy: 5 },
        xpReward: 1,
      },
      {
        id: 'klauen_bahnhof',
        label: 'Klauen',
        icon: '🤫',
        description: 'Einem Touristen die Tasche stehlen',
        duration: 8,
        effects: { energy: -10 },
        requirements: { respect: 15 },
        moneyReward: [5, 25],
        xpReward: 15,
        respectReward: 2,
        cooldown: 60,
      },
    ],
  },
  {
    id: 'innenstadt',
    name: 'Innenstadt',
    icon: '🏙️',
    description: 'Das Zentrum. Shops, Restaurants und reiche Leute.',
    dangerLevel: 1,
    unlockLevel: 2,
    actions: [
      {
        id: 'strassenmusik',
        label: 'Straßenmusik',
        icon: '🎸',
        description: 'Mit einer geklauten Gitarre spielen',
        duration: 20,
        effects: { energy: -12 },
        moneyReward: [1, 8],
        xpReward: 10,
        respectReward: 1,
      },
      {
        id: 'muell_durchwuehlen',
        label: 'Müll durchwühlen',
        icon: '🗑️',
        description: 'Restaurant-Mülltonnen nach Essen durchsuchen',
        duration: 10,
        effects: { hunger: 15, energy: -5 },
        xpReward: 3,
      },
      {
        id: 'zeitungen_verkaufen',
        label: 'Zeitungen verkaufen',
        icon: '📰',
        description: 'Straßenzeitungen an Passanten verkaufen',
        duration: 15,
        effects: { energy: -8 },
        moneyReward: [2, 6],
        xpReward: 8,
        respectReward: 1,
      },
    ],
  },
  {
    id: 'park',
    name: 'Park',
    icon: '🌳',
    description: 'Stadtpark. Gut zum Schlafen, aber nachts gefährlich.',
    dangerLevel: 3,
    unlockLevel: 0,
    actions: [
      {
        id: 'schlafen_park',
        label: 'Auf der Bank pennen',
        icon: '😴',
        description: 'Ein Nickerchen auf der Parkbank',
        duration: 30,
        effects: { energy: 30, health: 5 },
        xpReward: 2,
      },
      {
        id: 'brunnen_trinken',
        label: 'Aus dem Brunnen trinken',
        icon: '⛲',
        description: 'Wasser aus dem Parkbrunnen',
        duration: 3,
        effects: { thirst: 20, health: -2 },
        xpReward: 1,
      },
      {
        id: 'dealer_treffen',
        label: 'Dealer treffen',
        icon: '🌿',
        description: 'Den Parkdealer aufsuchen',
        duration: 5,
        effects: {},
        requirements: { respect: 20 },
        xpReward: 5,
        respectReward: 2,
      },
      {
        id: 'trainieren',
        label: 'Trainieren',
        icon: '💪',
        description: 'An den Outdoor-Geräten trainieren',
        duration: 15,
        effects: { energy: -15, health: 10 },
        xpReward: 8,
        respectReward: 1,
      },
    ],
  },
  {
    id: 'industrie',
    name: 'Industriegebiet',
    icon: '🏭',
    description: 'Verlassene Lagerhallen. Hier regieren die Gangs.',
    dangerLevel: 4,
    unlockLevel: 5,
    actions: [
      {
        id: 'schwarzarbeit',
        label: 'Schwarzarbeit',
        icon: '🔨',
        description: 'Schwere körperliche Arbeit ohne Vertrag',
        duration: 30,
        effects: { energy: -25, health: -5 },
        moneyReward: [10, 30],
        xpReward: 20,
      },
      {
        id: 'gang_rekrutierung',
        label: 'Gang-Rekrutierung',
        icon: '🤝',
        description: 'Bei einer Gang vorsprechen',
        duration: 10,
        effects: { energy: -5 },
        requirements: { respect: 30 },
        xpReward: 25,
        respectReward: 5,
      },
      {
        id: 'lager_durchsuchen',
        label: 'Lager durchsuchen',
        icon: '🔦',
        description: 'Verlassene Lagerhallen erkunden',
        duration: 20,
        effects: { energy: -10 },
        moneyReward: [0, 50],
        xpReward: 12,
        itemDrop: [
          { id: 'messer', chance: 0.15 },
          { id: 'alte_jacke', chance: 0.25 },
        ],
      },
    ],
  },
  {
    id: 'rotlicht',
    name: 'Rotlicht-Viertel',
    icon: '🔴',
    description: 'Die Reeperbahn des Viertels. Geld, Gefahr und Versuchung.',
    dangerLevel: 5,
    unlockLevel: 8,
    actions: [
      {
        id: 'tuersteher',
        label: 'Türsteher-Job',
        icon: '🚪',
        description: 'Vor einem Club die Tür bewachen',
        duration: 30,
        effects: { energy: -20 },
        requirements: { respect: 40 },
        moneyReward: [20, 50],
        xpReward: 25,
        respectReward: 3,
      },
      {
        id: 'dealen',
        label: 'Dealen',
        icon: '💊',
        description: 'Stoff an Clubgänger verkaufen',
        duration: 15,
        effects: { energy: -10 },
        requirements: { respect: 50 },
        moneyReward: [30, 100],
        xpReward: 30,
        respectReward: 4,
        cooldown: 120,
      },
      {
        id: 'schutzgeld',
        label: 'Schutzgeld eintreiben',
        icon: '💰',
        description: 'Lokale Geschäfte "beschützen"',
        duration: 20,
        effects: { energy: -15 },
        requirements: { respect: 60 },
        moneyReward: [50, 200],
        xpReward: 40,
        respectReward: 5,
        cooldown: 180,
      },
    ],
  },
];

export interface Housing {
  id: string;
  name: string;
  icon: string;
  description: string;
  cost: number;
  monthlyCost: number;
  energyBonus: number;
  healthBonus: number;
  respectBonus: number;
  unlockLevel: number;
}

export const HOUSING: Housing[] = [
  { id: 'parkbank', name: 'Parkbank', icon: '🪑', description: 'Frische Luft inklusive', cost: 0, monthlyCost: 0, energyBonus: 5, healthBonus: 0, respectBonus: 0, unlockLevel: 0 },
  { id: 'bruecke', name: 'Unter der Brücke', icon: '🌉', description: 'Immerhin ein Dach über dem Kopf', cost: 0, monthlyCost: 0, energyBonus: 10, healthBonus: 2, respectBonus: 1, unlockLevel: 2 },
  { id: 'bunker', name: 'Bahnhofsbunker', icon: '🏚️', description: 'Alter Bunker unter dem Bahnhof', cost: 50, monthlyCost: 0, energyBonus: 15, healthBonus: 5, respectBonus: 2, unlockLevel: 4 },
  { id: 'hostel', name: 'Hostel', icon: '🏨', description: 'Ein richtiges Bett!', cost: 200, monthlyCost: 30, energyBonus: 25, healthBonus: 10, respectBonus: 5, unlockLevel: 6 },
  { id: 'wg', name: 'WG-Zimmer', icon: '🏠', description: 'Mitbewohner nerven, aber es ist warm', cost: 500, monthlyCost: 80, energyBonus: 35, healthBonus: 15, respectBonus: 8, unlockLevel: 10 },
  { id: 'apartment', name: 'Eigene Wohnung', icon: '🏢', description: 'Endlich eigene vier Wände', cost: 2000, monthlyCost: 200, energyBonus: 50, healthBonus: 20, respectBonus: 15, unlockLevel: 15 },
  { id: 'luxury', name: 'Luxus-Penthouse', icon: '🏰', description: 'Kiezkönig-Style! Blick über die ganze Stadt', cost: 10000, monthlyCost: 500, energyBonus: 80, healthBonus: 30, respectBonus: 30, unlockLevel: 25 },
];

export interface Job {
  id: string;
  name: string;
  icon: string;
  description: string;
  payPerHour: number;
  energyCost: number;
  respectRequired: number;
  levelRequired: number;
  respectGain: number;
}

export const JOBS: Job[] = [
  { id: 'arbeitslos', name: 'Arbeitslos', icon: '😐', description: 'Kein Job, kein Geld, kein Plan', payPerHour: 0, energyCost: 0, respectRequired: 0, levelRequired: 0, respectGain: 0 },
  { id: 'aushilfe', name: 'Aushilfe', icon: '🧹', description: 'Putzen, Tragen, Schleppen', payPerHour: 5, energyCost: 15, respectRequired: 5, levelRequired: 2, respectGain: 1 },
  { id: 'sicherheit', name: 'Sicherheitsdienst', icon: '🛡️', description: 'Nachts die Hallen bewachen', payPerHour: 12, energyCost: 12, respectRequired: 15, levelRequired: 5, respectGain: 2 },
  { id: 'dealer', name: 'Dealer', icon: '💊', description: 'Das schnelle Geld auf der Straße', payPerHour: 25, energyCost: 10, respectRequired: 30, levelRequired: 8, respectGain: 3 },
  { id: 'lieutenant', name: 'Gang Lieutenant', icon: '⭐', description: 'Rechte Hand des Bosses', payPerHour: 50, energyCost: 8, respectRequired: 50, levelRequired: 15, respectGain: 5 },
  { id: 'boss', name: 'Gang Boss', icon: '👑', description: 'Du führst die Gang', payPerHour: 100, energyCost: 5, respectRequired: 75, levelRequired: 20, respectGain: 8 },
  { id: 'kiezkoenig', name: 'Kiezkönig', icon: '🏆', description: 'Die Straße gehört dir!', payPerHour: 250, energyCost: 3, respectRequired: 100, levelRequired: 30, respectGain: 15 },
];

export interface ShopItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  price: number;
  category: 'food' | 'drink' | 'weapon' | 'clothing' | 'special';
  effects: Partial<Record<string, number>>;
  attackBonus?: number;
  defenseBonus?: number;
}

export const SHOP_ITEMS: ShopItem[] = [
  // Food
  { id: 'doener', name: 'Döner', icon: '🥙', description: 'Der Klassiker für 3€', price: 3, category: 'food', effects: { hunger: 30 } },
  { id: 'currywurst', name: 'Currywurst', icon: '🌭', description: 'Mit Pommes, Alter!', price: 4, category: 'food', effects: { hunger: 35 } },
  { id: 'pizza', name: 'Pizza', icon: '🍕', description: 'Vom Eck-Italiener', price: 6, category: 'food', effects: { hunger: 45 } },
  { id: 'schnitzel', name: 'Schnitzel', icon: '🥩', description: 'Ordentliches Schnitzel mit Kartoffelsalat', price: 12, category: 'food', effects: { hunger: 60, energy: 10 } },
  // Drinks
  { id: 'wasser', name: 'Wasser', icon: '💧', description: 'Stilles Wasser', price: 1, category: 'drink', effects: { thirst: 25 } },
  { id: 'bier', name: 'Bier', icon: '🍺', description: 'Ein kühles Pils', price: 2, category: 'drink', effects: { thirst: 20, energy: -5 } },
  { id: 'kaffee', name: 'Kaffee', icon: '☕', description: 'Schwarz und stark', price: 3, category: 'drink', effects: { thirst: 15, energy: 20 } },
  { id: 'energydrink', name: 'Energy Drink', icon: '⚡', description: 'Flüüügel!', price: 2.5, category: 'drink', effects: { thirst: 10, energy: 30 } },
  // Weapons
  { id: 'faust', name: 'Fäuste', icon: '✊', description: 'Deine natürlichen Waffen', price: 0, category: 'weapon', effects: {}, attackBonus: 0 },
  { id: 'messer', name: 'Messer', icon: '🔪', description: 'Ein scharfes Küchenmesser', price: 15, category: 'weapon', effects: {}, attackBonus: 5 },
  { id: 'baseballschlaeger', name: 'Baseballschläger', icon: '🏏', description: 'Louisville Slugger', price: 40, category: 'weapon', effects: {}, attackBonus: 12 },
  { id: 'machete', name: 'Machete', icon: '⚔️', description: 'Für die harten Fälle', price: 100, category: 'weapon', effects: {}, attackBonus: 20 },
  { id: 'pistole', name: 'Pistole', icon: '🔫', description: 'Damit scherzt keiner', price: 500, category: 'weapon', effects: {}, attackBonus: 35 },
  // Clothing
  { id: 'alte_jacke', name: 'Alte Jacke', icon: '🧥', description: 'Löchrig aber warm', price: 5, category: 'clothing', effects: { health: 5 }, defenseBonus: 2 },
  { id: 'hoodie', name: 'Hoodie', icon: '👕', description: 'Kapuze auf, Gesicht weg', price: 20, category: 'clothing', effects: {}, defenseBonus: 5 },
  { id: 'lederjacke', name: 'Lederjacke', icon: '🧥', description: 'Street-Style Deluxe', price: 80, category: 'clothing', effects: {}, defenseBonus: 10 },
  { id: 'kevlar', name: 'Kevlar-Weste', icon: '🦺', description: 'Für den Ernstfall', price: 300, category: 'clothing', effects: {}, defenseBonus: 25 },
  // Special
  { id: 'handy', name: 'Prepaid-Handy', icon: '📱', description: 'Für die Geschäfte', price: 25, category: 'special', effects: {} },
  { id: 'medkit', name: 'Erste-Hilfe-Set', icon: '🩹', description: 'Pflaster und Verband', price: 15, category: 'special', effects: { health: 30 } },
];

export interface WeaponInfo {
  id: string;
  name: string;
  attack: number;
}

export const WEAPONS: WeaponInfo[] = SHOP_ITEMS
  .filter(i => i.category === 'weapon')
  .map(i => ({ id: i.id, name: i.name, attack: i.attackBonus || 0 }));

export interface Gang {
  id: string;
  name: string;
  icon: string;
  territory: string;
  power: number;
  color: string;
}

export const DEFAULT_GANGS: Gang[] = [
  { id: 'wolf_pack', name: 'Wolfsrudel', icon: '🐺', territory: 'bahnhof', power: 30, color: '#888' },
  { id: 'schwarze_rosen', name: 'Schwarze Rosen', icon: '🥀', territory: 'rotlicht', power: 50, color: '#8B0000' },
  { id: 'beton_brueder', name: 'Beton-Brüder', icon: '🏗️', territory: 'industrie', power: 45, color: '#555' },
  { id: 'park_ratten', name: 'Park Ratten', icon: '🐀', territory: 'park', power: 20, color: '#4A7023' },
  { id: 'city_kings', name: 'City Kings', icon: '👑', territory: 'innenstadt', power: 40, color: '#FFD700' },
];

export function getLevelFromXP(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

export function getXPForLevel(level: number): number {
  return (level - 1) * (level - 1) * 50;
}

export function getXPProgress(xp: number): number {
  const level = getLevelFromXP(xp);
  const currentLevelXP = getXPForLevel(level);
  const nextLevelXP = getXPForLevel(level + 1);
  return (xp - currentLevelXP) / (nextLevelXP - currentLevelXP);
}
