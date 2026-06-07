export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  totalTranslations: number;
  languagesUsed: string[];
  achievements: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: (stats: UserStats) => boolean;
}

const XP_PER_TRANSLATION = 10;
const XP_PER_NEW_LANGUAGE = 25;
const XP_STREAK_BONUS = 5; // extra XP per day of streak

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_translation',
    name: 'Langkah Pertama',
    description: 'Terjemahkan sesuatu untuk pertama kali',
    icon: '🌱',
    requirement: (stats) => stats.totalTranslations >= 1,
  },
  {
    id: 'ten_translations',
    name: 'Mulai Terbiasa',
    description: '10 terjemahan selesai',
    icon: '📝',
    requirement: (stats) => stats.totalTranslations >= 10,
  },
  {
    id: 'fifty_translations',
    name: 'Penerjemah Handal',
    description: '50 terjemahan selesai',
    icon: '🏆',
    requirement: (stats) => stats.totalTranslations >= 50,
  },
  {
    id: 'hundred_translations',
    name: 'Master Bahasa',
    description: '100 terjemahan selesai',
    icon: '👑',
    requirement: (stats) => stats.totalTranslations >= 100,
  },
  {
    id: 'three_languages',
    name: 'Poliglot Pemula',
    description: 'Terjemahkan ke 3 bahasa berbeda',
    icon: '🌍',
    requirement: (stats) => stats.languagesUsed.length >= 3,
  },
  {
    id: 'ten_languages',
    name: 'Warga Dunia',
    description: 'Terjemahkan ke 10 bahasa berbeda',
    icon: '🌐',
    requirement: (stats) => stats.languagesUsed.length >= 10,
  },
  {
    id: 'streak_3',
    name: 'Konsisten',
    description: 'Streak 3 hari berturut-turut',
    icon: '🔥',
    requirement: (stats) => stats.streak >= 3,
  },
  {
    id: 'streak_7',
    name: 'Seminggu Penuh',
    description: 'Streak 7 hari berturut-turut',
    icon: '⚡',
    requirement: (stats) => stats.streak >= 7,
  },
  {
    id: 'streak_30',
    name: 'Tak Terhentikan',
    description: 'Streak 30 hari berturut-turut',
    icon: '💎',
    requirement: (stats) => stats.streak >= 30,
  },
];

export function getLevelFromXP(xp: number): number {
  // Each level requires more XP: level N needs N*50 XP
  let level = 1;
  let xpNeeded = 50;
  let totalXPNeeded = 0;

  while (totalXPNeeded + xpNeeded <= xp) {
    totalXPNeeded += xpNeeded;
    level++;
    xpNeeded = level * 50;
  }

  return level;
}

export function getXPForNextLevel(level: number): number {
  return level * 50;
}

export function getCurrentLevelXP(xp: number): number {
  let level = 1;
  let xpNeeded = 50;
  let totalXPNeeded = 0;

  while (totalXPNeeded + xpNeeded <= xp) {
    totalXPNeeded += xpNeeded;
    level++;
    xpNeeded = level * 50;
  }

  return xp - totalXPNeeded;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function isYesterday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0];
}

export function getStats(): UserStats {
  const stored = localStorage.getItem('inglify-stats');
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    xp: 0,
    level: 1,
    streak: 0,
    lastActiveDate: '',
    totalTranslations: 0,
    languagesUsed: [],
    achievements: [],
  };
}

export function saveStats(stats: UserStats): void {
  localStorage.setItem('inglify-stats', JSON.stringify(stats));
}

export interface GamificationEvent {
  xpGained: number;
  newAchievements: Achievement[];
  streakUpdated: boolean;
  levelUp: boolean;
}

export function recordTranslation(targetLanguage: string): GamificationEvent {
  const stats = getStats();
  const today = getToday();
  let xpGained = XP_PER_TRANSLATION;
  let streakUpdated = false;

  // Update streak
  if (stats.lastActiveDate !== today) {
    if (isYesterday(stats.lastActiveDate)) {
      stats.streak += 1;
      streakUpdated = true;
    } else if (stats.lastActiveDate !== today) {
      // Streak broken (unless first time)
      if (stats.lastActiveDate !== '') {
        stats.streak = 1;
      } else {
        stats.streak = 1;
      }
      streakUpdated = true;
    }
    stats.lastActiveDate = today;
  }

  // Streak bonus
  xpGained += stats.streak * XP_STREAK_BONUS;

  // New language bonus
  if (!stats.languagesUsed.includes(targetLanguage)) {
    stats.languagesUsed.push(targetLanguage);
    xpGained += XP_PER_NEW_LANGUAGE;
  }

  // Update totals
  stats.totalTranslations += 1;
  stats.xp += xpGained;

  const oldLevel = stats.level;
  stats.level = getLevelFromXP(stats.xp);
  const levelUp = stats.level > oldLevel;

  // Check new achievements
  const newAchievements: Achievement[] = [];
  for (const achievement of ACHIEVEMENTS) {
    if (!stats.achievements.includes(achievement.id) && achievement.requirement(stats)) {
      stats.achievements.push(achievement.id);
      newAchievements.push(achievement);
    }
  }

  saveStats(stats);

  return { xpGained, newAchievements, streakUpdated, levelUp };
}
