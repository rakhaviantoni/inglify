import React, { useState, useEffect } from 'react';
import { TRANSLATION_TONES, SUPPORTED_LANGUAGES } from '../types/translation';
import type { TranslationResponse } from '../types/translation';

const TranslationResult: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [translations, setTranslations] = useState<{ [key: string]: string }>({});
  const [currentSpeech, setCurrentSpeech] = useState<SpeechSynthesisUtterance | null>(null);
  const [copiedTone, setCopiedTone] = useState<string | null>(null);
  const [speakingTone, setSpeakingTone] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState<(typeof SUPPORTED_LANGUAGES)[0]>({ code: 'en', name: 'English', label: 'Inggris' });

  const speakText = (text: string, tone: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech tidak didukung di browser ini.');
      return;
    }

    // If already speaking this tone, stop it
    if (speakingTone === tone) {
      speechSynthesis.cancel();
      setSpeakingTone(null);
      setCurrentSpeech(null);
      return;
    }
    
    // Stop any current speech and wait for it to fully stop
    if (speechSynthesis.speaking || speechSynthesis.pending) {
      speechSynthesis.cancel();
      setSpeakingTone(null);
      setCurrentSpeech(null);
      
      // Wait longer for speech to fully cancel
      setTimeout(() => {
        startSpeech(text, tone);
      }, 300);
    } else {
      startSpeech(text, tone);
    }
  };

  const startSpeech = (text: string, tone: string) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLang.code === 'id' ? 'id-ID' : 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => {
        setSpeakingTone(tone);
      };
      
      utterance.onend = () => {
        setSpeakingTone(null);
        setCurrentSpeech(null);
      };
      
      utterance.onerror = (event) => {
        console.warn('Speech synthesis error:', event.error);
        setSpeakingTone(null);
        setCurrentSpeech(null);
        
        // Only show alert for non-canceled errors
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

  useEffect(() => {
    const handleTranslationComplete = (event: Event) => {
      const customEvent = event as CustomEvent<TranslationResponse>;
      const { results, originalText, targetLanguage } = customEvent.detail;
      
      // Update original text
      setOriginalText(originalText);
      
      // Update translations
      const newTranslations: { [key: string]: string } = {};
      results.forEach(result => {
        newTranslations[result.tone] = result.translation;
      });
      setTranslations(newTranslations);
      
      // Show results
      setIsVisible(true);
      
      // Update page title
      const targetLang = SUPPORTED_LANGUAGES.find(lang => lang.code === targetLanguage);
      if (targetLang) {
        setTargetLang(targetLang);
        document.title = `Bahasa ${targetLang.label}nya "${originalText}" - Inglify`;
      }
      
      // Scroll to results after a short delay
      setTimeout(() => {
        const element = document.getElementById('translation-results');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    };
    
    const handleClearResults = () => {
      setIsVisible(false);
      setOriginalText('');
      setTranslations({});
      setCopiedTone(null);
      setSpeakingTone(null);
      document.title = `Bahasa ${targetLang.label}nya... - Inglify`;
      
      // Stop any current speech
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

  if (!isVisible) {
    return null;
  }

  return (
    <div id="translation-results">
      <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-200">Bahasa <span className='italic text-orange-400'>{targetLang.label}</span>nya "<span className='italic font-bold text-blue-400'>{originalText}</span>"</h3>
          <button
            onClick={() => {
              // Focus back to input and scroll to top
              const inputElement = document.getElementById('input-text');
              if (inputElement) {
                inputElement.focus();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 flex items-center gap-1"
            title="Kembali ke form untuk mencoba frasa lain"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Coba frasa lain
          </button>
        </div>
        {/* <p className="text-gray-300 bg-gray-700 p-3 rounded border border-gray-600 text-sm">
          {originalText}
        </p> */}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {TRANSLATION_TONES.map(tone => (
          <div key={tone.name} className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-semibold text-gray-200">{tone.label}</h4>
              <div className="flex space-x-2">
                <button 
                  onClick={() => translations[tone.name] && speakText(translations[tone.name], tone.name)}
                  className={`transition-colors ${
                    speakingTone === tone.name 
                      ? 'text-orange-400' 
                      : 'text-gray-400 hover:text-orange-400'
                  }`}
                  title="Dengarkan terjemahan"
                  disabled={!translations[tone.name]}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 256 256">
                    <rect width="256" height="256" fill="none"/>
                    <path d="M80,168H32a8,8,0,0,1-8-8V96a8,8,0,0,1,8-8H80l72-56V224Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
                    <line x1="80" y1="88" x2="80" y2="168" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
                    <path d="M192,106.85a32,32,0,0,1,0,42.3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
                    <path d="M221.67,80a72,72,0,0,1,0,96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
                  </svg>
                </button>
                <button 
                  onClick={() => translations[tone.name] && copyText(translations[tone.name], tone.name)}
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                  title="Salin terjemahan"
                  disabled={!translations[tone.name]}
                >
                  {copiedTone === tone.name ? (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
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
    </div>
  );
};

export default TranslationResult;