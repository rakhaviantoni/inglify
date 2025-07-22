import React, { useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES } from '../types/translation';
import type { HistoryItem } from '../types/translation';

const HistoryList: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLanguageLabel = (code: string): string => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return lang ? lang.label : code;
  };

  const loadHistory = () => {
    const historyData: HistoryItem[] = JSON.parse(localStorage.getItem('translation-history') || '[]');
    setHistory(historyData);
  };

  const clearAllHistory = () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua riwayat terjemahan?')) {
      localStorage.removeItem('translation-history');
      setHistory([]);
    }
  };

  const deleteItem = (itemId: string) => {
    if (confirm('Hapus item ini dari riwayat?')) {
      const filteredHistory = history.filter(item => item.id !== itemId);
      localStorage.setItem('translation-history', JSON.stringify(filteredHistory));
      setHistory(filteredHistory);
    }
  };

  const restoreItem = (item: HistoryItem) => {
    // Dispatch event to show this translation
    window.dispatchEvent(new CustomEvent('translation-complete', {
      detail: {
        results: item.results,
        originalText: item.originalText,
        targetLanguage: item.targetLanguage,
        timestamp: item.timestamp
      }
    }));
  };

  useEffect(() => {
    loadHistory();

    // Listen for new translations to update history
    const handleTranslationComplete = () => {
      setTimeout(loadHistory, 100); // Small delay to ensure localStorage is updated
    };

    window.addEventListener('translation-complete', handleTranslationComplete);

    return () => {
      window.removeEventListener('translation-complete', handleTranslationComplete);
    };
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-200">Riwayat Terjemahan</h3>
        {history.length > 0 && (
          <button
            onClick={clearAllHistory}
            className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
          >
            Hapus Semua
          </button>
        )}
      </div>
      
      <div>
        {history.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm">Belum ada riwayat terjemahan</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map(item => (
              <div key={item.id} onClick={() => restoreItem(item)} className="group rounded-lg p-[1px] transition-colors cursor-pointer bg-gradient-to-tl from-gray-500 to-gray-600 hover:from-orange-400 hover:to-blue-400">
              <div className="bg-gray-800 hover:bg-gray-700 rounded-lg p-3 h-full w-full">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-xs text-gray-300 mb-1 truncate">
                      <span className="font-medium">Ke Bahasa {getLanguageLabel(item.targetLanguage)}</span> •&nbsp;
                      <span>{formatDate(item.timestamp)}</span>
                    </p>
                    <p className="text-gray-200 font-medium mb-2 line-clamp-2 text-sm">{item.originalText}</p>
                  </div>
                  <button 
                    onClick={() => deleteItem(item.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors ml-2"
                    title="Hapus item ini"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {item.results.map((result, index) => (
                    <div key={index} className="bg-gray-700 group-hover:bg-gray-800 p-2 rounded text-xs">
                      <div className="font-medium text-gray-300 mb-1 capitalize">{result.tone}</div>
                      <div className="text-gray-400 line-clamp-2">{result.translation}</div>
                    </div>
                  ))}
                </div>
                
                {/* <button 
                  onClick={() => restoreItem(item)}
                  className="text-orange-400 hover:text-orange-300 text-xs font-medium transition-colors"
                >
                  Muat
                </button> */}
              </div>
            </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryList;