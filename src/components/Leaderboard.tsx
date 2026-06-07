import React, { useState, useEffect } from 'react';
import { getStats, saveStats } from '../utils/gamification';

interface LeaderboardEntry {
  display_name: string;
  xp: number;
  level: number;
  streak: number;
  total_translations: number;
}

const Leaderboard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('inglify-display-name');
    if (saved) setDisplayName(saved);
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
    } catch {
      // Offline or not configured — show empty
      setLeaderboard([]);
    }
    setLoading(false);
  };

  const syncScore = async () => {
    if (!displayName.trim()) {
      setShowNameInput(true);
      return;
    }

    localStorage.setItem('inglify-display-name', displayName.trim());
    const stats = getStats();

    try {
      await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName.trim(),
          xp: stats.xp,
          level: stats.level,
          streak: stats.streak,
          totalTranslations: stats.totalTranslations,
        }),
      });
      setSynced(true);
      setTimeout(() => setSynced(false), 2000);
      fetchLeaderboard();
    } catch {
      alert('Gagal sync. Periksa koneksi internet.');
    }
  };

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) fetchLeaderboard();
  };

  const handleSaveName = () => {
    if (displayName.trim()) {
      localStorage.setItem('inglify-display-name', displayName.trim());
      setShowNameInput(false);
      syncScore();
    }
  };

  const getRankEmoji = (index: number): string => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4 mb-4 border border-gray-700">
      <button onClick={handleOpen} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏆</span>
          <h3 className="text-base font-semibold text-gray-200">Leaderboard</h3>
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          {/* Sync controls */}
          <div className="flex items-center gap-2 mb-3">
            {showNameInput || !displayName ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nama tampilan"
                  maxLength={20}
                  className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                />
                <button onClick={handleSaveName} className="text-xs text-blue-400 hover:text-blue-300">
                  Simpan & Sync
                </button>
              </div>
            ) : (
              <>
                <span className="text-xs text-gray-400">Bermain sebagai: <span className="text-orange-400">{displayName}</span></span>
                <button
                  onClick={syncScore}
                  className={`ml-auto text-xs px-2 py-1 rounded transition-colors ${
                    synced ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {synced ? '✓ Synced' : 'Sync Score'}
                </button>
              </>
            )}
          </div>

          {/* Leaderboard list */}
          {loading ? (
            <div className="text-center py-4">
              <span className="text-xs text-gray-500">Memuat...</span>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-xs text-gray-500">Belum ada data. Sync score kamu dulu!</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.display_name}
                  className={`flex items-center justify-between p-2 rounded-md ${
                    entry.display_name === displayName
                      ? 'bg-orange-400/10 border border-orange-400/30'
                      : 'bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm w-6">{getRankEmoji(index)}</span>
                    <span className="text-sm text-gray-200 font-medium">{entry.display_name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>Lv.{entry.level}</span>
                    <span className="text-orange-400 font-medium">{entry.xp} XP</span>
                    {entry.streak > 0 && <span>🔥{entry.streak}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
