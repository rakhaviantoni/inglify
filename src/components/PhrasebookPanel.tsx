import React, { useState, useEffect } from 'react';
import {
  getPhrasebooks,
  createPhrasebook,
  deletePhrasebook,
  addToPhrasebook,
  removeFromPhrasebook,
  DEFAULT_ICONS,
} from '../utils/phrasebooks';
import { SUPPORTED_LANGUAGES } from '../types/translation';
import type { Phrasebook, HistoryItem } from '../types/translation';

const PhrasebookPanel: React.FC = () => {
  const [phrasebooks, setPhrasebooks] = useState<Phrasebook[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeBook, setActiveBook] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('📚');
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [itemToSave, setItemToSave] = useState<HistoryItem | null>(null);

  useEffect(() => {
    setPhrasebooks(getPhrasebooks());

    // Listen for "save to phrasebook" events
    const handleSaveToPhrasebook = (event: Event) => {
      const customEvent = event as CustomEvent<HistoryItem>;
      setItemToSave(customEvent.detail);
      setShowSaveMenu(true);
      setIsOpen(true);
    };

    window.addEventListener('save-to-phrasebook', handleSaveToPhrasebook);
    return () => window.removeEventListener('save-to-phrasebook', handleSaveToPhrasebook);
  }, []);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createPhrasebook(newName.trim(), newIcon);
    setPhrasebooks(getPhrasebooks());
    setNewName('');
    setShowCreate(false);
  };

  const handleDelete = (bookId: string) => {
    if (confirm('Hapus phrasebook ini?')) {
      deletePhrasebook(bookId);
      setPhrasebooks(getPhrasebooks());
      if (activeBook === bookId) setActiveBook(null);
    }
  };

  const handleSaveItem = (bookId: string) => {
    if (itemToSave) {
      addToPhrasebook(bookId, itemToSave);
      setPhrasebooks(getPhrasebooks());
      setShowSaveMenu(false);
      setItemToSave(null);
    }
  };

  const handleRemoveItem = (bookId: string, itemId: string) => {
    removeFromPhrasebook(bookId, itemId);
    setPhrasebooks(getPhrasebooks());
  };

  const handleRestore = (item: HistoryItem) => {
    window.dispatchEvent(new CustomEvent('translation-complete', {
      detail: {
        results: item.results,
        originalText: item.originalText,
        targetLanguage: item.targetLanguage,
        timestamp: item.timestamp,
      }
    }));
  };

  const getLanguageLabel = (code: string): string => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return lang ? lang.label : code;
  };

  const activePhrasebook = phrasebooks.find(b => b.id === activeBook);

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4 mb-4 border border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📖</span>
          <h3 className="text-base font-semibold text-gray-200">Phrasebook</h3>
          <span className="text-xs text-gray-500">({phrasebooks.length})</span>
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          {/* Save to phrasebook menu */}
          {showSaveMenu && itemToSave && (
            <div className="mb-3 p-3 bg-gray-700 rounded-lg border border-orange-400/30">
              <p className="text-xs text-gray-300 mb-2">Simpan "<span className="text-orange-400">{itemToSave.originalText}</span>" ke:</p>
              <div className="flex flex-wrap gap-1">
                {phrasebooks.map(book => (
                  <button
                    key={book.id}
                    onClick={() => handleSaveItem(book.id)}
                    className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded text-gray-200 transition-colors"
                  >
                    {book.icon} {book.name}
                  </button>
                ))}
              </div>
              {phrasebooks.length === 0 && (
                <p className="text-xs text-gray-500 italic">Buat phrasebook dulu ya</p>
              )}
              <button onClick={() => { setShowSaveMenu(false); setItemToSave(null); }} className="text-xs text-gray-500 mt-2 hover:text-gray-300">
                Batal
              </button>
            </div>
          )}

          {/* Phrasebook list */}
          {!activeBook ? (
            <>
              <div className="space-y-1 mb-3">
                {phrasebooks.map(book => (
                  <div key={book.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-700 transition-colors">
                    <button
                      onClick={() => setActiveBook(book.id)}
                      className="flex items-center gap-2 flex-1 text-left"
                    >
                      <span>{book.icon}</span>
                      <span className="text-sm text-gray-200">{book.name}</span>
                      <span className="text-xs text-gray-500">({book.items.length})</span>
                    </button>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                      title="Hapus"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Create new */}
              {showCreate ? (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {DEFAULT_ICONS.slice(0, 5).map(icon => (
                      <button
                        key={icon}
                        onClick={() => setNewIcon(icon)}
                        className={`text-lg p-0.5 rounded ${newIcon === icon ? 'bg-gray-600' : ''}`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nama phrasebook"
                    className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    autoFocus
                  />
                  <button onClick={handleCreate} className="text-xs text-blue-400 hover:text-blue-300">Simpan</button>
                  <button onClick={() => setShowCreate(false)} className="text-xs text-gray-500 hover:text-gray-300">Batal</button>
                </div>
              ) : (
                <button
                  onClick={() => setShowCreate(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Buat Phrasebook Baru
                </button>
              )}
            </>
          ) : (
            /* Active phrasebook detail */
            <div>
              <button
                onClick={() => setActiveBook(null)}
                className="text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1 mb-3"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Kembali
              </button>

              <h4 className="text-sm font-medium text-gray-200 mb-2">
                {activePhrasebook?.icon} {activePhrasebook?.name}
              </h4>

              {activePhrasebook?.items.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-3 text-center">
                  Belum ada frasa tersimpan di sini.
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {activePhrasebook?.items.map(item => (
                    <div key={item.id} className="p-2 bg-gray-700 rounded-md">
                      <div className="flex items-start justify-between">
                        <button onClick={() => handleRestore(item)} className="text-left flex-1">
                          <p className="text-xs text-gray-400">→ {getLanguageLabel(item.targetLanguage)}</p>
                          <p className="text-sm text-gray-200">{item.originalText}</p>
                        </button>
                        <button
                          onClick={() => handleRemoveItem(activeBook, item.id)}
                          className="text-gray-500 hover:text-red-400 p-1 ml-2"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PhrasebookPanel;
