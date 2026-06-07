import React, { useState, useEffect } from 'react';
import { TRANSLATION_TONES, SUPPORTED_LANGUAGES, FREE_TONES, PREMIUM_TONES } from '../types/translation';
import type { TranslationResponse, HistoryItem } from '../types/translation';
import { SpeakerHigh, Copy, Check, ArrowsClockwise, BookmarkSimple, Plus, Sparkle } from '@phosphor-icons/react';

const TranslationResult: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [translations, setTranslations] = useState<{ [key: string]: string }>({});
  const [currentSpeech, setCurrentSpeech] = useState<SpeechSynthesisUtterance | null>(null);
  const [copiedTone, setCopiedTone] = useState<string | null>(null);
  const [regeneratingTone, setRegeneratingTone] = useState<string | null>(null);
  const [previewTones, setPreviewTones] = useState<Set<string>>(new Set());
  const [speakingTone, setSpeakingTone] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState<(typeof SUPPORTED_LANGUAGES)[0]>({ code: 'en', name: 'English', label: 'Inggris' });
  const [savedToPhrasebook, setSavedToPhrasebook] = useState(false);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(Date.now());

  const speakText = (text: string, tone: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech tidak didukung di browser ini.');
      return;
    }

    if (speakingTone === tone) {
      speechSynthesis.cancel();
      setSpeakingTone(null);
      setCurrentSpeech(null);
      return;
    }
    
    if (speechSynthesis.speaking || speechSynthesis.pending) {
      speechSynthesis.cancel();
      setSpeakingTone(null);
      setCurrentSpeech(null);
      setTimeout(() => startSpeech(text, tone), 300);
    } else {
      startSpeech(text, tone);
    }
  };

  const startSpeech = (text: string, tone: string) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLang.code === 'id' ? 'id-ID' : `${targetLang.code}`;
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setSpeakingTone(tone);
      utterance.onend = () => { setSpeakingTone(null); setCurrentSpeech(null); };
      utterance.onerror = (event) => {
        console.warn('Speech synthesis error:', event.error);
        setSpeakingTone(null);
        setCurrentSpeech(null);
        if (event.error !== 'canceled') {
          alert('Terjadi kesalahan saat memutar audio.');
        }
      };
      
      setCurrentSpeech(utterance);
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error creating speech utterance:', error);
      setSpeakingTone(null);
      setCurrentSpeech(null);
    }
  };

  const copyText = async (text: string, tone: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTone(tone);
      setTimeout(() => setCopiedTone(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
      alert('Gagal menyalin teks');
    }
  };

  const regenerateTone = async (tone: string) => {
    if (regeneratingTone) return;
    setRegeneratingTone(tone);

    try {
      const res = await fetch('/api/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: originalText,
          targetLanguage: targetLang.code,
          tone,
          currentTranslation: translations[tone] || '',
        }),
      });

      if (!res.ok) throw new Error('Failed');

      const data = await res.json();
      setTranslations(prev => ({ ...prev, [tone]: data.translation }));
    } catch {
      alert('Gagal regenerate. Coba lagi.');
    } finally {
      setRegeneratingTone(null);
    }
  };

  const handleSaveToPhrasebook = () => {
    const historyItem: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      originalText,
      targetLanguage: targetLang.code,
      results: Object.entries(translations).map(([tone, translation]) => ({ tone, translation })),
      timestamp: currentTimestamp,
    };
    
    window.dispatchEvent(new CustomEvent('save-to-phrasebook', { detail: historyItem }));
    setSavedToPhrasebook(true);
    setTimeout(() => setSavedToPhrasebook(false), 2000);
  };

  useEffect(() => {
    const handleTranslationComplete = (event: Event) => {
      const customEvent = event as CustomEvent<TranslationResponse>;
      const { results, originalText, targetLanguage, timestamp } = customEvent.detail;
      
      setOriginalText(originalText);
      setCurrentTimestamp(timestamp);
      setSavedToPhrasebook(false);
      
      const newTranslations: { [key: string]: string } = {};
      const newPreviewTones = new Set<string>();
      results.forEach(result => {
        newTranslations[result.tone] = result.translation;
        if (result.preview) newPreviewTones.add(result.tone);
      });
      setTranslations(newTranslations);
      setPreviewTones(newPreviewTones);
      setIsVisible(true);
      
      const foundLang = SUPPORTED_LANGUAGES.find(lang => lang.code === targetLanguage);
      if (foundLang) {
        setTargetLang(foundLang);
        document.title = `Bahasa ${foundLang.label}nya "${originalText}" - Inglify`;
      }
      
      setTimeout(() => {
        const element = document.getElementById('translation-results');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };
    
    const handleClearResults = () => {
      setIsVisible(false);
      setOriginalText('');
      setTranslations({});
      setCopiedTone(null);
      setSpeakingTone(null);
      setSavedToPhrasebook(false);
      document.title = `Bahasa ${targetLang.label}nya... - Inglify`;
      if (currentSpeech) {
        speechSynthesis.cancel();
        setCurrentSpeech(null);
      }
    };

    window.addEventListener('translation-complete', handleTranslationComplete);
    window.addEventListener('clear-results', handleClearResults);

    return () => {
      window.removeEventListener('translation-complete', handleTranslationComplete);
      window.removeEventListener('clear-results', handleClearResults);
      if (currentSpeech) {
        speechSynthesis.cancel();
        setCurrentSpeech(null);
        setSpeakingTone(null);
      }
    };
  }, [currentSpeech]);

  if (!isVisible) return null;

  return (
    <div id="translation-results">
      <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-base font-semibold text-gray-200">
            Bahasa <span className="italic text-orange-400">{targetLang.label}</span>nya "<span className="italic font-bold text-blue-400">{originalText}</span>"
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToPhrasebook}
              className={`px-3 py-1 text-xs rounded-md transition duration-200 flex items-center gap-1.5 ${
                savedToPhrasebook
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title="Simpan ke phrasebook"
            >
              {savedToPhrasebook ? <Check size={12} weight="bold" /> : <BookmarkSimple size={12} />}
              {savedToPhrasebook ? 'Tersimpan' : 'Simpan'}
            </button>
            <button
              onClick={() => {
                const inputElement = document.getElementById('input-text');
                if (inputElement) {
                  inputElement.focus();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition duration-200 flex items-center gap-1.5"
            >
              <Plus size={12} weight="bold" />
              Coba lain
            </button>
          </div>
        </div>
      </div>

      {/* Free tones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {FREE_TONES.map(tone => (
          <ToneCard
            key={tone.name}
            tone={tone}
            translation={translations[tone.name] || ''}
            copiedTone={copiedTone}
            speakingTone={speakingTone}
            regeneratingTone={regeneratingTone}
            onSpeak={() => translations[tone.name] && speakText(translations[tone.name], tone.name)}
            onCopy={() => translations[tone.name] && copyText(translations[tone.name], tone.name)}
            onRegenerate={() => regenerateTone(tone.name)}
          />
        ))}
      </div>

      {/* Premium tones section */}
      {PREMIUM_TONES.some(t => translations[t.name]) && (() => {
        const isPreview = PREMIUM_TONES.some(t => previewTones.has(t.name));
        
        return (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkle size={14} weight="duotone" className="text-orange-400" />
              <span className="text-sm font-medium text-gray-300">Pro Tones</span>
              <div className="flex-1 h-px bg-gray-700" />
              {isPreview && (
                <a
                  href="#pricing"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-[11px] text-orange-400 hover:text-orange-300 font-medium"
                >
                  Buka semua
                </a>
              )}
            </div>

            {!isPreview ? (
              /* Full pro cards for premium users */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PREMIUM_TONES.filter(t => translations[t.name]).map(tone => (
                  <ToneCard
                    key={tone.name}
                    tone={tone}
                    translation={translations[tone.name]}
                    copiedTone={copiedTone}
                    speakingTone={speakingTone}
                    regeneratingTone={regeneratingTone}
                    onSpeak={() => speakText(translations[tone.name], tone.name)}
                    onCopy={() => copyText(translations[tone.name], tone.name)}
                    onRegenerate={() => regenerateTone(tone.name)}
                    isPremium
                  />
                ))}
              </div>
            ) : (
              /* Blurred preview cards for free users */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PREMIUM_TONES.filter(t => translations[t.name]).map(tone => (
                  <div key={tone.name} className="bg-gray-800 rounded-lg p-4 border border-orange-400/10 relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-gray-300">{tone.label}</h4>
                      <span className="text-[10px] px-1.5 py-0.5 bg-orange-400/10 text-orange-400 rounded-full font-medium">PRO</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mb-2">{tone.description}</p>
                    <div className="p-3 rounded border bg-gray-700/50 border-gray-600/50 relative">
                      <p className="text-gray-400 text-sm italic select-none blur-[3px]">
                        {translations[tone.name]}
                      </p>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-800/30 to-gray-800/80 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};

// Tone card sub-component
interface ToneCardProps {
  tone: { name: string; label: string; description: string };
  translation: string;
  copiedTone: string | null;
  speakingTone: string | null;
  regeneratingTone: string | null;
  onSpeak: () => void;
  onCopy: () => void;
  onRegenerate: () => void;
  isPremium?: boolean;
}

function ToneCard({ tone, translation, copiedTone, speakingTone, regeneratingTone, onSpeak, onCopy, onRegenerate, isPremium }: ToneCardProps) {
  return (
    <div className={`bg-gray-800 rounded-lg p-4 border ${isPremium ? 'border-orange-400/20' : 'border-gray-700'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-gray-200">{tone.label}</h4>
          {isPremium && (
            <span className="text-[10px] px-1.5 py-0.5 bg-orange-400/10 text-orange-400 rounded-full font-medium">PRO</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onRegenerate}
            disabled={!translation || regeneratingTone === tone.name}
            className={`p-1.5 rounded transition-colors ${
              regeneratingTone === tone.name
                ? 'text-blue-400 animate-spin'
                : 'text-gray-500 hover:text-blue-400'
            }`}
            title="Coba versi lain"
          >
            <ArrowsClockwise size={14} />
          </button>
          <button
            onClick={onSpeak}
            disabled={!translation}
            className={`p-1.5 rounded transition-colors ${
              speakingTone === tone.name ? 'text-orange-400' : 'text-gray-500 hover:text-orange-400'
            }`}
            title="Dengarkan"
          >
            <SpeakerHigh size={14} />
          </button>
          <button
            onClick={onCopy}
            disabled={!translation}
            className="p-1.5 rounded text-gray-500 hover:text-blue-400 transition-colors"
            title="Salin"
          >
            {copiedTone === tone.name
              ? <Check size={14} className="text-green-400" weight="bold" />
              : <Copy size={14} />
            }
          </button>
        </div>
      </div>
      <p className="text-[11px] text-gray-500 mb-2">{tone.description}</p>
      <div className={`p-3 rounded border ${isPremium ? 'bg-gray-700/70 border-orange-400/10' : 'bg-gray-700 border-gray-600'}`}>
        <p className="text-gray-200 leading-relaxed text-sm">
          {translation || ''}
        </p>
      </div>
    </div>
  );
}

export default TranslationResult;
