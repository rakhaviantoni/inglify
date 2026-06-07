import React, { useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES } from '../types/translation';
import type { HistoryItem } from '../types/translation';
import { ClockCounterClockwise, Trash, ArrowCounterClockwise } from '@phosphor-icons/react';

const HistoryList: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

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
    if (confirm('Hapus semua riwayat?')) {
      localStorage.removeItem('translation-history');
      setHistory([]);
    }
  };

  const deleteItem = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    const filteredHistory = history.filter(item => item.id !== itemId);
    localStorage.setItem('translation-history', JSON.stringify(filteredHistory));
    setHistory(filteredHistory);
  };

  const restoreItem = (item: HistoryItem) => {
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

    const handleTranslationComplete = () => {
      setTimeout(loadHistory, 100);
    };

    window.addEventListener('translation-complete', handleTranslationComplete);
    return () => window.removeEventListener('translation-complete', handleTranslationComplete);
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-2.5">
          <ClockCounterClockwise size={20} weight="duotone" className="text-blue-400" />
          <h3 className="text-base font-semibold text-gray-200">Riwayat</h3>
          {history.length > 0 && (
            <span className="text-xs text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded-full">{history.length}</span>
          )}
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-700 pt-3">
          {history.length > 0 && (
            <div className="flex justify-end mb-3">
              <button
                onClick={clearAllHistory}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash size={12} />
                Hapus Semua
              </button>
            </div>
          )}

          {history.length === 0 ? (
            <div className="text-center py-8">
              <ClockCounterClockwise size={32} weight="thin" className="text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Belum ada riwayat</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {history.map(item => (
                <div
                  key={item.id}
                  onClick={() => restoreItem(item)}
                  className="group rounded-lg p-[1px] transition-colors cursor-pointer bg-gray-700 hover:bg-gradient-to-r hover:from-orange-400/50 hover:to-blue-400/50"
                >
                  <div className="bg-gray-800 hover:bg-gray-750 rounded-lg p-3 h-full w-full">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 mb-1">
                          <span className="font-medium text-gray-300">→ {getLanguageLabel(item.targetLanguage)}</span>
                          <span className="text-gray-600 mx-1.5">·</span>
                          <span>{formatDate(item.timestamp)}</span>
                        </p>
                        <p className="text-sm text-gray-200 font-medium truncate">{item.originalText}</p>
                      </div>
                      <button
                        onClick={(e) => deleteItem(e, item.id)}
                        className="text-gray-600 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
                        title="Hapus"
                      >
                        <Trash size={14} />
                      </button>
                    </div>

                    {/* Preview first 2 tones */}
                    <div className="flex gap-2">
                      {item.results.slice(0, 2).map((result, i) => (
                        <div key={i} className="flex-1 min-w-0">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">{result.tone}</p>
                          <p className="text-xs text-gray-400 truncate">{result.translation}</p>
                        </div>
                      ))}
                      {item.results.length > 2 && (
                        <span className="text-[10px] text-gray-600 self-end">+{item.results.length - 2}</span>
                      )}
                    </div>
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

export default HistoryList;
