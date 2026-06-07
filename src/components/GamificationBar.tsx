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

const GamificationBar: React.FC = () => {
  const [stats, setStats] = useState<UserStats>(getStats());
  const [showAchievements, setShowAchievements] = useState(false);
  const [toast, setToast] = useState<{ message: string; icon: string } | null>(null);

  useEffect(() => {
    const handleGamificationUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<GamificationEvent>;
      const { xpGained, newAchievements, levelUp } = customEvent.detail;

      // Refresh stats
      setStats(getStats());

      // Show toast for achievements
      if (newAchievements.length > 0) {
        const achievement = newAchievements[0];
        setToast({ message: `${achievement.name} unlocked!`, icon: achievement.icon });
        setTimeout(() => setToast(null), 3000);
      } else if (levelUp) {
        setToast({ message: `Level Up! 🎉`, icon: '⬆️' });
        setTimeout(() => setToast(null), 3000);
      } else if (xpGained > 0) {
        setToast({ message: `+${xpGained} XP`, icon: '✨' });
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
      {/* Gamification Stats Bar */}
      <div className="bg-gray-800 rounded-lg p-3 mb-4 border border-gray-700">
        <div className="flex items-center justify-between gap-3">
          {/* Level & XP */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-lg">⭐</span>
              <span className="text-sm font-bold text-orange-400">Lv.{level}</span>
            </div>

            {/* XP Progress Bar */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs text-gray-400">
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
            <span className="text-lg">{stats.streak > 0 ? '🔥' : '💤'}</span>
            <span className="text-sm font-medium text-gray-300">
              {stats.streak}
            </span>
          </div>

          {/* Achievements Button */}
          <button
            onClick={() => setShowAchievements(!showAchievements)}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors text-xs text-gray-300"
            title="Lihat pencapaian"
          >
            <span>🏅</span>
            <span>{unlockedAchievements.length}/{ACHIEVEMENTS.length}</span>
          </button>
        </div>
      </div>

      {/* Achievements Panel */}
      {showAchievements && (
        <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-200">Pencapaian</h3>
            <button
              onClick={() => setShowAchievements(false)}
              className="text-gray-400 hover:text-gray-200 text-xs"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Stats summary */}
            <div className="col-span-full flex gap-4 mb-2 text-xs text-gray-400 border-b border-gray-700 pb-2">
              <span>📊 {stats.totalTranslations} terjemahan</span>
              <span>🌍 {stats.languagesUsed.length} bahasa</span>
              <span>⚡ {stats.xp} total XP</span>
            </div>

            {unlockedAchievements.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-2 p-2 rounded-md bg-gray-700 border border-gray-600"
              >
                <span className="text-lg">{a.icon}</span>
                <div>
                  <p className="text-xs font-medium text-gray-200">{a.name}</p>
                  <p className="text-xs text-gray-400">{a.description}</p>
                </div>
              </div>
            ))}
            {lockedAchievements.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-2 p-2 rounded-md bg-gray-700/50 border border-gray-700 opacity-50"
              >
                <span className="text-lg grayscale">🔒</span>
                <div>
                  <p className="text-xs font-medium text-gray-400">{a.name}</p>
                  <p className="text-xs text-gray-500">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className="bg-gray-800 border border-orange-400/50 rounded-lg px-4 py-2 shadow-lg flex items-center gap-2">
            <span className="text-lg">{toast.icon}</span>
            <span className="text-sm font-medium text-gray-200">{toast.message}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default GamificationBar;
