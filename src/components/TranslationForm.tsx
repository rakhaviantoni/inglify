import React, { useState, useEffect, useRef } from 'react';
import { SUPPORTED_LANGUAGES } from '../types/translation';
import type { TranslationResponse } from '../types/translation';

interface SpeechRecognitionEvent {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

const TranslationForm: React.FC = () => {
  const [text, setText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Set client-side flag
    setIsClient(true);
    
    // Add keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (text.trim() && !isLoading) {
          const form = document.getElementById('translation-form') as HTMLFormElement;
          if (form) {
            form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
          }
        }
      }
      // Escape to clear
      if (e.key === 'Escape') {
        setText('');
        window.dispatchEvent(new CustomEvent('clear-results'));
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // return () => {
    //   document.removeEventListener('keydown', handleKeyDown);
    // };
    
    // Initialize speech recognition only on client
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'id-ID';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => {
        setIsRecording(true);
      };
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setText(transcript);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        
        if (event.error === 'not-allowed') {
          alert('Akses mikrofon ditolak. Silakan izinkan akses mikrofon untuk menggunakan fitur ini.');
        } else if (event.error === 'network') {
          alert('Terjadi kesalahan jaringan. Pastikan koneksi internet Anda stabil dan coba lagi.');
        } else {
          alert(`Terjadi kesalahan pengenalan suara: ${event.error}`);
        }
      };
      
      recognitionRef.current = recognition;
    }
    
    // Listen for header language changes
    const handleHeaderLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ targetLanguage: string }>;
      const { targetLanguage } = customEvent.detail;
      setTargetLanguage(targetLanguage);
    };
    
    window.addEventListener('header-language-changed', handleHeaderLanguageChange);
    
    return () => {
      document.addEventListener('keydown', handleKeyDown);
      window.removeEventListener('header-language-changed', handleHeaderLanguageChange);
    };
  }, []);

  const handleSpeechToggle = () => {
    if (!recognitionRef.current || !isClient) return;
    
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      alert('Mohon masukkan teks yang ingin diterjemahkan');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, targetLanguage })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Terjadi kesalahan saat menerjemahkan');
      }
      
      const result: TranslationResponse = await response.json();
      
      // Save to localStorage
      const historyItem = {
        id: Date.now().toString(),
        originalText: result.originalText,
        targetLanguage: result.targetLanguage,
        results: result.results,
        timestamp: result.timestamp
      };
      
      const history = JSON.parse(localStorage.getItem('translation-history') || '[]');
      history.unshift(historyItem);
      // Keep only last 50 items
      if (history.length > 50) {
        history.splice(50);
      }
      localStorage.setItem('translation-history', JSON.stringify(history));
      
      // Dispatch custom event to update results
      window.dispatchEvent(new CustomEvent('translation-complete', {
        detail: result
      }));
      
      // Don't clear form to allow trying other phrases easily
      
    } catch (error) {
      console.error('Translation error:', error);
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat menerjemahkan');
    } finally {
      setIsLoading(false);
    }
  };

  const isSpeechSupported = isClient && (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window));

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4 mb-6 border border-gray-700">
      <form id="translation-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          {/* <label htmlFor="input-text" className="block text-sm font-medium text-gray-300 mb-2">
            Masukkan teks dalam Bahasa Indonesia:
          </label> */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              id="input-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 pr-24 bg-gray-700 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
              placeholder="Masukkan teks dalam Bahasa Indonesia... (Ctrl+Enter untuk terjemahkan, Esc untuk bersihkan)"
              required
            />
            <div className="absolute bottom-1 left-2 text-xs text-gray-500">
              {text.length}/500
            </div>
            <div className="absolute right-2 top-2 flex gap-1">
              {isSpeechSupported && (
                <button
                  type="button"
                  onClick={handleSpeechToggle}
                  disabled={!isClient}
                  className={`p-2 text-gray-400 hover:text-orange-400 transition-colors rounded ${
                    isRecording ? 'animate-pulse text-red-500' : ''
                  } ${!isClient ? 'cursor-not-allowed opacity-50' : ''}`}
                  title="Rekam suara"
                >
                  {isRecording ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading || !text.trim()}
                className={`p-2 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 disabled:cursor-not-allowed ${
                  isLoading 
                    ? 'bg-blue-500 animate-pulse' 
                    : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95'
                } ${!text.trim() ? 'opacity-50' : ''}`}
                title={isLoading ? 'Sedang menerjemahkan...' : 'Terjemahkan'}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <div className="relative">
              <select
                id="target-language"
                value={targetLanguage}
                onChange={(e) => {
                  const newLanguage = e.target.value;
                  setTargetLanguage(newLanguage);
                  
                  // Dispatch language change event
                  if (isClient) {
                    window.dispatchEvent(new CustomEvent('language-changed', {
                      detail: { targetLanguage: newLanguage }
                    }));
                  }
                }}
                className="w-full px-3 py-2 pr-8 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setText('');
              // Dispatch event to hide results
              window.dispatchEvent(new CustomEvent('clear-results'));
            }}
            className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200 text-sm font-medium flex items-center gap-2"
            title="Bersihkan dan coba frasa baru"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default TranslationForm;