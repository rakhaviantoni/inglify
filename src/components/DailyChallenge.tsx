import React, { useState, useEffect } from 'react';
import { getTodayChallenge, completeChallenge } from '../utils/dailyChallenge';
import { getStats, saveStats, getLevelFromXP } from '../utils/gamification';
import { SUPPORTED_LANGUAGES } from '../types/translation';
import type { DailyChallenge as DailyChallengeType } from '../utils/dailyChallenge';

const DailyChallenge: React.FC = () => {
  const [challenge, setChallenge] = useState<DailyChallengeType | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setChallenge(getTodayChallenge());

    // Listen for challenge completion
    const handleTranslationComplete = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { originalText } = customEvent.detail;
      const currentChallenge = getTodayChallenge();
      
      if (!currentChallenge.completed && 
          originalText.toLowerCase().trim() === currentChallenge.phrase.toLowerCase().trim()) {
        // Challenge completed!
        const xpReward = completeChallenge();
        if (xpReward > 0) {
          // Add bonus XP
          const stats = getStats();
          stats.xp += xpReward;
          stats.level = getLevelFromXP(stats.xp);
          saveStats(stats);

          window.dispatchEvent(new CustomEvent('gamification-update', {
            detail: { xpGained: xpReward, newAchievements: [], streakUpdated: false, levelUp: false }
          }));
          
          setChallenge({ ...currentChallenge, completed: true });
        }
      }
    };

    window.addEventListener('translation-complete', handleTranslationComplete);
    return () => window.removeEventListener('translation-complete', handleTranslationComplete);
  }, []);

  if (!challenge) return null;

  const targetLang = SUPPORTED_LANGUAGES.find(l => l.code === challenge.targetLanguage);
  const difficultyColors = {
    easy: 'text-green-400 bg-green-400/10',
    medium: 'text-yellow-400 bg-yellow-400/10',
    hard: 'text-red-400 bg-red-400/10',
  };

  const handleTryChallenge = () => {
    // Fill the translation form with the challenge phrase
    const inputElement = document.getElementById('input-text') as HTMLTextAreaElement;
    if (inputElement) {
      // Set the value via native input event so React picks it up
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, 'value'
      )?.set;
      nativeInputValueSetter?.call(inputElement, challenge.phrase);
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      inputElement.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Set the target language
    window.dispatchEvent(new CustomEvent('set-language', {
      detail: { targetLanguage: challenge.targetLanguage }
    }));
  };

  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-800/80 rounded-lg p-3 mb-4 border border-orange-400/30">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{challenge.completed ? '✅' : '🎯'}</span>
          <span className="text-sm font-semibold text-gray-200">Tantangan Harian</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${difficultyColors[challenge.difficulty]}`}>
            {challenge.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!challenge.completed && (
            <span className="text-xs text-orange-400">+{challenge.xpReward} XP</span>
          )}
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm text-gray-300 mb-1">
                Terjemahkan ke <span className="text-orange-400 font-medium">Bahasa {targetLang?.label || challenge.targetLanguage}</span>:
              </p>
              <p className="text-base font-medium text-gray-100 mb-1">
                "{challenge.phrase}"
              </p>
              <p className="text-xs text-gray-500 italic">💡 {challenge.hint}</p>
            </div>
            {!challenge.completed ? (
              <button
                onClick={handleTryChallenge}
                className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded-md transition-colors shrink-0"
              >
                Coba!
              </button>
            ) : (
              <span className="text-xs text-green-400 font-medium shrink-0">
                Selesai! 🎉
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyChallenge;
