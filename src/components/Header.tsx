import React, { useEffect } from 'react';
import { SUPPORTED_LANGUAGES } from '../types/translation';

const Header: React.FC = () => {
  useEffect(() => {
    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ targetLanguage: string }>;
      const { targetLanguage } = customEvent.detail;
      
      const targetLang = SUPPORTED_LANGUAGES.find(lang => lang.code === targetLanguage);
      if (targetLang) {
        const targetLanguageElement = document.getElementById('target-language');
        if (targetLanguageElement) {
          targetLanguageElement.textContent = targetLang.label;
        }
        
        // Update page title
        document.title = `Bahasa ${targetLang.label}nya... - Inglify`;
      }
    };

    window.addEventListener('language-changed', handleLanguageChange);
    
    return () => {
      window.removeEventListener('language-changed', handleLanguageChange);
    };
  }, []);
  return (
    <header className="text-center mb-8">
      {/* Logo/Brand Section */}
      <div className="flex justify-center items-center gap-2 mb-6">
        {/* <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-orange-500 rounded-xl mb-3 shadow-md">
          <svg className="w-6 h-6 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
          </svg>
        </div> */}
        <img src="/favicon.svg" className="inline-flex items-center justify-center w-12 h-12 shadow-md" />
        <h1 className="text-3xl md:text-4xl font-bold text-gray-200">
          Inglify
        </h1>
      </div>

      {/* Main Heading */}
      <div className="max-w-3xl mx-auto">
        <h2 id="page-title" className="text-2xl md:text-3xl font-bold text-gray-100 mb-3 leading-tight">
          <span className="text-gray-200">Bahasa </span>
          <span id="target-language" className="text-orange-400 italic">Inggris</span>
          <span className="text-gray-200">nya...</span>
        </h2>
        
        {/* Description */}
        {/* <p className="text-base text-gray-300 mb-4 max-w-xl mx-auto">
          Terjemahkan teks Indonesia ke berbagai gaya bahasa
        </p> */}
        
        {/* Subtitle */}
        {/* <p className="text-sm text-gray-400">
          Gausah bingung lagi bahasa Inggrisnya apa
        </p> */}
      </div>
    </header>
  );
};

export default Header;