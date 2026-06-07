import React, { useState, useEffect } from 'react';
import {
  getStats,
  getLevelFromXP,
  getXPForNextLevel,
  getCurrentLevelXP,
  ACHIEVEMENTS,
  type UserStats,
  type GamificationEvent,
} from '../utils/gamification';
import { Star, Fire, Medal, X, Plant, PencilLine, Trophy, Crown, GlobeHemisphereWest, Globe, Lightning, Diamond, Lock, Sparkle } from '@phosphor-icons/react';

const ICON_MAP: Record<string, React.ReactNode> = {
  'plant': <Plant size={18} weight="duotone" className="text-green-400" />,
  'pencil-line': <PencilLine size={18} weight="duotone" className="text-blue-400" />,
  'trophy': <Trophy size={18} weight="duotone" className="text-yellow-400" />,
  'crown': <Crown size={18} weight="duotone" className="text-yellow-300" />,
  'globe-hemisphere-west': <GlobeHemisphereWest size={18} weight="duotone" className="text-cyan-400" />,
  'globe': <Globe size={18} weight="duotone" className="text-cyan-300" />,
  'fire': <Fire size={18} weight="duotone" className="text-red-400" />,
  'lightning': <Lightning size={18} weight="duotone" className="text-yellow-400" />,
  'diamond': <Diamond size={18} weight="duotone" className="text-purple-400" />,
};

const GamificationBar: React.FC = () => {
  const [stats, setStats] = useState<UserStats>({
    xp: 0, level: 1, streak: 0, lastActiveDate: '',
    totalTranslations: 0, languagesUsed: [], achievements: [],
  });
  const [showAchievements, setShowAchievements] = useState(false);
  const [toast, setToast] = useState<{ message: string; icon: string } | null>(null);

  useEffect(() => {
    setStats(getStats());
  }, []);

  useEffect(() => {
    const handleGamificationUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<GamificationEvent>;
      const { xpGained, newAchievements, levelUp } = customEvent.detail;

      setStats(getStats());

      if (newAchievements.length > 0) {
        const achievement = newAchievements[0];
        setToast({ message: `${achievement.name}!`, icon: achievement.icon });
        setTimeout(() => setToast(null), 3000);
      } else if (levelUp) {
        setToast({ message: `Level Up!`, icon: 'star' });
        setTimeout(() => setToast(null), 3000);
      } else if (xpGained > 0) {
        setToast({ message: `+${xpGained} XP`, icon: 'sparkle' });
        setTimeout(() => setToast(null), 2000);
      }
    };

    window.addEventListener('gamification-update', handleGamificationUpdate);
    return () => window.removeEventListener('gamification-update', handleGamificationUpdate);
  }, []);

  const level = stats.level;
  const currentXP = getCurrentLevelXP(stats.xp);
  const nextLevelXP = getXPForNextLevel(level);
  const progressPercent = Math.min((currentXP / nextLevelXP) * 100, 100);

  const unlockedAchievements = ACHIEVEMENTS.filter((a) =>
    stats.achievements.includes(a.id)
  );
  const lockedAchievements = ACHIEVEMENTS.filter(
    (a) => !stats.achievements.includes(a.id)
  );

  return (
    <>
      {/* Stats Bar */}
      <div className="bg-gray-800 rounded-lg p-3 mb-4 border border-gray-700">
        <div className="flex items-center justify-between gap-3">
          {/* Level & XP */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Star size={18} weight="duotone" className="text-orange-400" />
              <span className="text-sm font-bold text-orange-400">Lv.{level}</span>
            </div>

            {/* XP Bar */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] text-gray-500">
                  {currentXP}/{nextLevelXP} XP
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-orange-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-1">
            <Fire size={18} weight={stats.streak > 0 ? 'fill' : 'regular'} className={stats.streak > 0 ? 'text-red-400' : 'text-gray-600'} />
            <span className="text-sm font-medium text-gray-300">{stats.streak}</span>
          </div>

          {/* Achievements */}
          <button
            onClick={() => setShowAchievements(!showAchievements)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors text-xs text-gray-300"
            title="Pencapaian"
          >
            <Medal size={14} weight="duotone" className="text-yellow-400" />
            <span>{unlockedAchievements.length}/{ACHIEVEMENTS.length}</span>
          </button>
        </div>
      </div>

      {/* Achievements Panel */}
      {showAchievements && (
        <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
              <Medal size={16} weight="duotone" className="text-yellow-400" />
              Pencapaian
            </h3>
            <button
              onClick={() => setShowAchievements(false)}
              className="text-gray-500 hover:text-gray-300 p-0.5"
            >
              <X size={14} />
            </button>
          </div>

          {/* Summary */}
          <div className="flex gap-4 mb-3 text-xs text-gray-500 border-b border-gray-700 pb-2.5">
            <span>{stats.totalTranslations} terjemahan</span>
            <span>{stats.languagesUsed.length} bahasa</span>
            <span>{stats.xp} total XP</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {unlockedAchievements.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-700/70 border border-gray-600/50"
              >
                {ICON_MAP[a.icon] || <Star size={18} weight="duotone" className="text-orange-400" />}
                <div>
                  <p className="text-xs font-medium text-gray-200">{a.name}</p>
                  <p className="text-[10px] text-gray-400">{a.description}</p>
                </div>
              </div>
            ))}
            {lockedAchievements.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-700/30 border border-gray-700/50 opacity-50"
              >
                <Lock size={18} weight="regular" className="text-gray-500" />
                <div>
                  <p className="text-xs font-medium text-gray-400">{a.name}</p>
                  <p className="text-[10px] text-gray-500">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className="bg-gray-800 border border-orange-400/40 rounded-lg px-4 py-2 shadow-xl flex items-center gap-2">
            {ICON_MAP[toast.icon] || <Sparkle size={18} weight="duotone" className="text-yellow-400" />}
            <span className="text-sm font-medium text-gray-200">{toast.message}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default GamificationBar;
