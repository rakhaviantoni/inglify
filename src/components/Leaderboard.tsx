import React, { useState, useEffect } from 'react';
import { getStats } from '../utils/gamification';
import { Trophy, ArrowsClockwise, UserCircle } from '@phosphor-icons/react';

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
      alert('Gagal sync. Cek koneksi.');
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

  const getRankDisplay = (index: number): React.ReactNode => {
    if (index === 0) return <span className="text-yellow-400 font-bold">#1</span>;
    if (index === 1) return <span className="text-gray-300 font-bold">#2</span>;
    if (index === 2) return <span className="text-orange-400 font-bold">#3</span>;
    return <span className="text-gray-500 font-medium">#{index + 1}</span>;
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 mt-4">
      <button onClick={handleOpen} className="w-full flex items-center justify-between p-4">
        <div className="flex items-center gap-2.5">
          <Trophy size={20} weight="duotone" className="text-yellow-400" />
          <h3 className="text-base font-semibold text-gray-200">Leaderboard</h3>
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-700 pt-3">
          {/* Sync controls */}
          <div className="flex items-center gap-2 mb-4 p-2.5 bg-gray-750 rounded-lg">
            {showNameInput || !displayName ? (
              <div className="flex items-center gap-2 flex-1">
                <UserCircle size={18} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nama kamu"
                  maxLength={20}
                  className="flex-1 px-2.5 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  autoFocus
                />
                <button onClick={handleSaveName} className="text-xs px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors shrink-0">
                  Simpan
                </button>
              </div>
            ) : (
              <>
                <UserCircle size={18} className="text-gray-400 shrink-0" />
                <span className="text-xs text-gray-300 flex-1 truncate">{displayName}</span>
                <button
                  onClick={syncScore}
                  disabled={synced}
                  className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md transition-colors shrink-0 ${
                    synced
                      ? 'bg-green-600/20 text-green-400'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <ArrowsClockwise size={12} className={synced ? '' : 'animate-none'} />
                  {synced ? 'Synced' : 'Sync'}
                </button>
              </>
            )}
          </div>

          {/* List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <ArrowsClockwise size={20} className="text-gray-500 animate-spin" />
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <Trophy size={32} weight="thin" className="text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Belum ada data. Sync score kamu dulu!</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.display_name}
                  className={`flex items-center justify-between p-2.5 rounded-lg transition-colors ${
                    entry.display_name === displayName
                      ? 'bg-orange-400/10 border border-orange-400/20'
                      : 'bg-gray-700/40 hover:bg-gray-700/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs w-7 text-center">{getRankDisplay(index)}</span>
                    <span className="text-sm text-gray-200">{entry.display_name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-gray-500">Lv.{entry.level}</span>
                    <span className="text-orange-400 font-medium">{entry.xp.toLocaleString()} XP</span>
                    {entry.streak > 0 && (
                      <span className="text-red-400">{entry.streak}d</span>
                    )}
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
