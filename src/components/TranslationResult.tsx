import React, { useState, useEffect } from 'react';
import { TRANSLATION_TONES, SUPPORTED_LANGUAGES } from '../types/translation';
import type { TranslationResponse, HistoryItem } from '../types/translation';

const TranslationResult: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [translations, setTranslations] = useState<{ [key: string]: string }>({});
  const [currentSpeech, setCurrentSpeech] = useState<SpeechSynthesisUtterance | null>(null);
  const [copiedTone, setCopiedTone] = useState<string | null>(null);
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
      results.forEach(result => {
        newTranslations[result.tone] = result.translation;
      });
      setTranslations(newTranslations);
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

  const freeTones = TRANSLATION_TONES.filter(t => !t.premium);
  const premiumTones = TRANSLATION_TONES.filter(t => t.premium);

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
              className={`px-3 py-1 text-xs rounded-md transition duration-200 flex items-center gap-1 ${
                savedToPhrasebook
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title="Simpan ke phrasebook"
            >
              {savedToPhrasebook ? (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Tersimpan
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Simpan
                </>
              )}
            </button>
            <button
              onClick={() => {
                const inputElement = document.getElementById('input-text');
                if (inputElement) {
                  inputElement.focus();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 flex items-center gap-1"
              title="Kembali ke form"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Coba frasa lain
            </button>
          </div>
        </div>
      </div>
      
      {/* Free tones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {freeTones.map(tone => (
          <div key={tone.name} className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-semibold text-gray-200">{tone.label}</h4>
              <div className="flex space-x-2">
                <button 
                  onClick={() => translations[tone.name] && speakText(translations[tone.name], tone.name)}
                  className={`transition-colors ${speakingTone === tone.name ? 'text-orange-400' : 'text-gray-400 hover:text-orange-400'}`}
                  title="Dengarkan"
                  disabled={!translations[tone.name]}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 256 256">
                    <path d="M80,168H32a8,8,0,0,1-8-8V96a8,8,0,0,1,8-8H80l72-56V224Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
                    <path d="M192,106.85a32,32,0,0,1,0,42.3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
                    <path d="M221.67,80a72,72,0,0,1,0,96" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
                  </svg>
                </button>
                <button 
                  onClick={() => translations[tone.name] && copyText(translations[tone.name], tone.name)}
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                  title="Salin"
                  disabled={!translations[tone.name]}
                >
                  {copiedTone === tone.name ? (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-3">{tone.description}</p>
            <div className="bg-gray-700 p-3 rounded border border-gray-600">
              <p className="text-gray-200 leading-relaxed text-sm">
                {translations[tone.name] || ''}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Premium tones */}
      {premiumTones.some(t => translations[t.name]) && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-gray-300">✨ Premium Tones</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {premiumTones.map(tone => (
              translations[tone.name] && (
                <div key={tone.name} className="bg-gray-800 rounded-lg shadow-lg p-4 border border-orange-400/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-semibold text-gray-200">{tone.label}</h4>
                      <span className="text-xs px-1.5 py-0.5 bg-orange-400/10 text-orange-400 rounded-full">PRO</span>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => speakText(translations[tone.name], tone.name)}
                        className={`transition-colors ${speakingTone === tone.name ? 'text-orange-400' : 'text-gray-400 hover:text-orange-400'}`}
                        title="Dengarkan"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 256 256">
                          <path d="M80,168H32a8,8,0,0,1-8-8V96a8,8,0,0,1,8-8H80l72-56V224Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
                          <path d="M192,106.85a32,32,0,0,1,0,42.3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
                        </svg>
                      </button>
                      <button 
                        onClick={() => copyText(translations[tone.name], tone.name)}
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                        title="Salin"
                      >
                        {copiedTone === tone.name ? (
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{tone.description}</p>
                  <div className="bg-gray-700 p-3 rounded border border-orange-400/20">
                    <p className="text-gray-200 leading-relaxed text-sm">
                      {translations[tone.name]}
                    </p>
                  </div>
                </div>
              )
            ))}
          </div>
        </>
      )}

      {/* Locked premium tones teaser */}
      {premiumTones.some(t => !translations[t.name]) && (
        <div className="bg-gradient-to-r from-gray-800 to-gray-800/50 rounded-lg p-4 mb-4 border border-gray-700/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🔒</span>
            <span className="text-sm font-medium text-gray-300">Gaya tambahan</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {premiumTones.filter(t => !translations[t.name]).map(tone => (
              <span key={tone.name} className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-400">
                {tone.label}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Dukung via Trakteer untuk buka gaya terjemahan slang, puitis, akademis, dan marketing.
          </p>
        </div>
      )}
    </div>
  );
};

export default TranslationResult;
