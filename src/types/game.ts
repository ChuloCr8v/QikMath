export type Difficulty = 'EASY' | 'NORMAL' | 'HARD';
export type GameState = 'MENU' | 'PLAYING' | 'RESULTS' | 'LEADERBOARD';

export interface LevelConfig {
  goal: number;
  title: string;
}

export const LEVEL_CONFIGS: Record<Difficulty, LevelConfig[]> = {
  EASY: [
    { goal: 4, title: 'Sunny Meadow 🌻' },
    { goal: 6, title: 'Happy Butterfly 🦋' },
    { goal: 8, title: 'Magic Rainbow 🌈' },
    { goal: 10, title: 'Candy Castle 🍭' },
    { goal: 12, title: 'Starry Sky ✨' }
  ],
  NORMAL: [
    { goal: 4, title: 'Cheerful Forest 🌲' },
    { goal: 6, title: 'Dolphin Splash 🐬' },
    { goal: 8, title: 'Bubble Paradise 🫧' },
    { goal: 10, title: 'Treasure Explorer 🏴‍☠️' },
    { goal: 12, title: 'Rocket Flight 🚀' }
  ],
  HARD: [
    { goal: 4, title: 'Clever Kitten 🐱' },
    { goal: 6, title: 'Magical Mage 🧙‍♂️' },
    { goal: 8, title: 'Super Kid Hero 🦸‍♀️' },
    { goal: 10, title: 'Galaxy Genius 🪐' },
    { goal: 12, title: 'Ultimate Champion 🏆' }
  ]
};

export const getLevelTitle = (difficulty: Difficulty, level: number): string => {
  const configs = LEVEL_CONFIGS[difficulty];
  const index = Math.min(level - 1, configs.length - 1);
  const baseTitle = configs[index]?.title || 'Adventure Grid';
  if (level > configs.length) {
    return `${baseTitle} [BONUS STAGE ${level - configs.length + 1}]`;
  }
  return baseTitle;
};

export const getLevelGoal = (difficulty: Difficulty, level: number): number => {
  const configs = LEVEL_CONFIGS[difficulty];
  const index = Math.min(level - 1, configs.length - 1);
  const baseGoal = configs[index]?.goal || 12;
  if (level > configs.length) {
    return baseGoal + (level - configs.length) * 2;
  }
  return baseGoal;
};

export interface Problem {
  num1: number;
  num2: number;
  operator: '+' | '-' | '×' | '÷';
  answer: number;
  options: number[];
}

export interface ScoreEntry {
  id: string;
  name: string;
  score: number;
  difficulty: Difficulty;
  accuracy: number;
  timestamp: number;
  avatarSeed: string;
  userId?: string;
  levelReached?: number;
}

export const GAME_DURATION = 30;
export const HARD_GAME_DURATION = 90;

export interface LevelGroup {
  name: string;
  minLevel: number;
  maxLevel: number;
  badge: string;
  textColor: string;
  borderColor: string;
  bgColor: string;
}

export const LEVEL_GROUPS: LevelGroup[] = [
  { minLevel: 1, maxLevel: 2, name: "MATH SPROUT 🌱", badge: "SPROUT", textColor: "text-emerald-500", borderColor: "border-emerald-200", bgColor: "bg-emerald-50" },
  { minLevel: 3, maxLevel: 4, name: "NUMBERS EXPLORER ✨", badge: "EXPLORER", textColor: "text-sky-500", borderColor: "border-sky-200", bgColor: "bg-sky-50" },
  { minLevel: 5, maxLevel: 6, name: "MATH MAGICIAN 🧙", badge: "MAGICIAN", textColor: "text-pink-500", borderColor: "border-pink-200", bgColor: "bg-pink-50" },
  { minLevel: 7, maxLevel: 999, name: "COSMIC WIZARD 👑", badge: "WIZARD", textColor: "text-amber-500", borderColor: "border-amber-200", bgColor: "bg-amber-50" }
];

export const getLevelGroup = (level: number): LevelGroup => {
  const lvl = level || 1;
  return LEVEL_GROUPS.find(g => lvl >= g.minLevel && lvl <= g.maxLevel) || LEVEL_GROUPS[0];
};

export const getAvatarUrl = (seed: string) => `https://api.dicebear.com/7.x/lorelei/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1f4ff,ffd5dc,ffdfad`;

