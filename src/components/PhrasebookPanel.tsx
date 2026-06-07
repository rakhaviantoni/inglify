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
import { BookOpen, Plus, ArrowLeft, X, CaretDown, Book, AirplaneTilt, Briefcase, ForkKnife, GraduationCap, ChatCircle, Heart, House, Target, Globe } from '@phosphor-icons/react';

const PHRASEBOOK_ICON_MAP: Record<string, React.ReactNode> = {
  'book': <Book size={16} weight="duotone" className="text-blue-400" />,
  'airplane': <AirplaneTilt size={16} weight="duotone" className="text-cyan-400" />,
  'briefcase': <Briefcase size={16} weight="duotone" className="text-gray-300" />,
  'fork-knife': <ForkKnife size={16} weight="duotone" className="text-orange-400" />,
  'graduation-cap': <GraduationCap size={16} weight="duotone" className="text-purple-400" />,
  'chat-circle': <ChatCircle size={16} weight="duotone" className="text-green-400" />,
  'heart': <Heart size={16} weight="duotone" className="text-red-400" />,
  'house': <House size={16} weight="duotone" className="text-yellow-400" />,
  'target': <Target size={16} weight="duotone" className="text-orange-400" />,
  'globe': <Globe size={16} weight="duotone" className="text-cyan-300" />,
};

function PhrasebookIcon({ icon, size = 16 }: { icon: string; size?: number }) {
  // Handle legacy emoji icons from old localStorage data
  if (PHRASEBOOK_ICON_MAP[icon]) {
    return <>{PHRASEBOOK_ICON_MAP[icon]}</>;
  }
  // If it's a legacy emoji string, just show the default book icon
  return <Book size={size} weight="duotone" className="text-blue-400" />;
}

const PhrasebookPanel: React.FC = () => {
  const [phrasebooks, setPhrasebooks] = useState<Phrasebook[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeBook, setActiveBook] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('book');
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [itemToSave, setItemToSave] = useState<HistoryItem | null>(null);

  useEffect(() => {
    setPhrasebooks(getPhrasebooks());

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
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-2.5">
          <BookOpen size={20} weight="duotone" className="text-green-400" />
          <h3 className="text-base font-semibold text-gray-200">Phrasebook</h3>
          {phrasebooks.length > 0 && (
            <span className="text-xs text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded-full">{phrasebooks.length}</span>
          )}
        </div>
        <CaretDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-700 pt-3">
          {/* Save menu */}
          {showSaveMenu && itemToSave && (
            <div className="mb-3 p-3 bg-gray-700/50 rounded-lg border border-orange-400/20">
              <p className="text-xs text-gray-300 mb-2">
                Simpan "<span className="text-orange-400 font-medium">{itemToSave.originalText}</span>" ke:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {phrasebooks.map(book => (
                  <button
                    key={book.id}
                    onClick={() => handleSaveItem(book.id)}
                    className="px-2.5 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded-md text-gray-200 transition-colors flex items-center gap-1.5"
                  >
                    <PhrasebookIcon icon={book.icon} /> {book.name}
                  </button>
                ))}
              </div>
              {phrasebooks.length === 0 && (
                <p className="text-xs text-gray-500 italic">Buat phrasebook dulu</p>
              )}
              <button onClick={() => { setShowSaveMenu(false); setItemToSave(null); }} className="text-xs text-gray-500 mt-2 hover:text-gray-300">
                Batal
              </button>
            </div>
          )}

          {!activeBook ? (
            <>
              {/* List */}
              {phrasebooks.length > 0 && (
                <div className="space-y-1 mb-3">
                  {phrasebooks.map(book => (
                    <div key={book.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-700/60 transition-colors">
                      <button
                        onClick={() => setActiveBook(book.id)}
                        className="flex items-center gap-2.5 flex-1 text-left"
                      >
                        <PhrasebookIcon icon={book.icon} />
                        <span className="text-sm text-gray-200">{book.name}</span>
                        <span className="text-[10px] text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded-full">{book.items.length}</span>
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
                        className="text-gray-600 hover:text-red-400 p-1 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {phrasebooks.length === 0 && !showCreate && (
                <div className="text-center py-6 mb-3">
                  <BookOpen size={28} weight="thin" className="text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Simpan frasa favoritmu di sini</p>
                </div>
              )}

              {/* Create */}
              {showCreate ? (
                <div className="p-3 bg-gray-700/40 rounded-lg space-y-2">
                  <div className="flex gap-1">
                    {DEFAULT_ICONS.map(icon => (
                      <button
                        key={icon}
                        onClick={() => setNewIcon(icon)}
                        className={`p-1.5 rounded ${newIcon === icon ? 'bg-gray-600 ring-1 ring-blue-500' : 'hover:bg-gray-600'}`}
                      >
                        <PhrasebookIcon icon={icon} />
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Nama phrasebook"
                      className="flex-1 px-2.5 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                      autoFocus
                    />
                    <button onClick={handleCreate} className="text-xs px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">Buat</button>
                    <button onClick={() => setShowCreate(false)} className="text-xs px-2 text-gray-500 hover:text-gray-300">Batal</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCreate(true)}
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Plus size={12} weight="bold" />
                  Buat Phrasebook
                </button>
              )}
            </>
          ) : (
            /* Detail view */
            <div>
              <button
                onClick={() => setActiveBook(null)}
                className="text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1 mb-3"
              >
                <ArrowLeft size={12} />
                Kembali
              </button>

              <h4 className="text-sm font-medium text-gray-200 mb-3 flex items-center gap-2">
                <PhrasebookIcon icon={activePhrasebook?.icon || 'book'} />
                {activePhrasebook?.name}
              </h4>

              {activePhrasebook?.items.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-gray-500 italic">Belum ada frasa tersimpan</p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {activePhrasebook?.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2.5 bg-gray-700/50 rounded-lg hover:bg-gray-700/80 transition-colors">
                      <button onClick={() => handleRestore(item)} className="text-left flex-1 min-w-0">
                        <p className="text-[10px] text-gray-500">→ {getLanguageLabel(item.targetLanguage)}</p>
                        <p className="text-sm text-gray-200 truncate">{item.originalText}</p>
                      </button>
                      <button
                        onClick={() => handleRemoveItem(activeBook, item.id)}
                        className="text-gray-600 hover:text-red-400 p-1 ml-2 shrink-0"
                      >
                        <X size={12} />
                      </button>
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
