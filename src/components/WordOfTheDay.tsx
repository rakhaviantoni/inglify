import React, { useState } from 'react';
import { Book, CaretDown } from '@phosphor-icons/react';

interface WordEntry {
  id: string;
  word: string;
  pronunciation: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
  category: string;
}

// Curated vocabulary - rotates daily
const WORDS: WordEntry[] = [
  { id: '1', word: 'Serendipity', pronunciation: '/ˌser.ənˈdɪp.ə.ti/', meaning: 'Keberuntungan menemukan sesuatu yang bagus secara tidak sengaja', example: 'Finding this café was pure serendipity.', exampleTranslation: 'Menemukan kafe ini benar-benar kebetulan yang menyenangkan.', category: 'noun' },
  { id: '2', word: 'Eloquent', pronunciation: '/ˈel.ə.kwənt/', meaning: 'Fasih, pandai berbicara dengan indah dan meyakinkan', example: 'She gave an eloquent speech at the conference.', exampleTranslation: 'Dia memberikan pidato yang fasih di konferensi.', category: 'adjective' },
  { id: '3', word: 'Ephemeral', pronunciation: '/ɪˈfem.ər.əl/', meaning: 'Bersifat sementara, hanya berlangsung singkat', example: 'Social media fame is often ephemeral.', exampleTranslation: 'Ketenaran di media sosial sering bersifat sementara.', category: 'adjective' },
  { id: '4', word: 'Resilience', pronunciation: '/rɪˈzɪl.i.əns/', meaning: 'Ketahanan, kemampuan pulih dari kesulitan', example: 'Her resilience helped her overcome many challenges.', exampleTranslation: 'Ketahanannya membantunya mengatasi banyak tantangan.', category: 'noun' },
  { id: '5', word: 'Meticulous', pronunciation: '/məˈtɪk.jə.ləs/', meaning: 'Sangat teliti dan cermat dalam detail', example: 'He is meticulous about his work.', exampleTranslation: 'Dia sangat teliti dengan pekerjaannya.', category: 'adjective' },
  { id: '6', word: 'Pragmatic', pronunciation: '/præɡˈmæt.ɪk/', meaning: 'Praktis, berpikir realistis', example: 'We need a pragmatic approach to this problem.', exampleTranslation: 'Kita membutuhkan pendekatan pragmatis untuk masalah ini.', category: 'adjective' },
  { id: '7', word: 'Ubiquitous', pronunciation: '/juːˈbɪk.wɪ.təs/', meaning: 'Ada di mana-mana', example: 'Smartphones have become ubiquitous in modern life.', exampleTranslation: 'Smartphone telah menjadi ada di mana-mana dalam kehidupan modern.', category: 'adjective' },
  { id: '8', word: 'Ambiguous', pronunciation: '/æmˈbɪɡ.ju.əs/', meaning: 'Bermakna ganda, tidak jelas', example: 'The message was ambiguous and confused everyone.', exampleTranslation: 'Pesannya bermakna ganda dan membingungkan semua orang.', category: 'adjective' },
  { id: '9', word: 'Procrastinate', pronunciation: '/prəˈkræs.tɪ.neɪt/', meaning: 'Menunda-nunda pekerjaan', example: "Don't procrastinate - start working on it now.", exampleTranslation: 'Jangan menunda-nunda - mulai kerjakan sekarang.', category: 'verb' },
  { id: '10', word: 'Empathy', pronunciation: '/ˈem.pə.θi/', meaning: 'Kemampuan merasakan perasaan orang lain', example: 'A good leader shows empathy toward their team.', exampleTranslation: 'Pemimpin yang baik menunjukkan empati terhadap timnya.', category: 'noun' },
  { id: '11', word: 'Versatile', pronunciation: '/ˈvɜː.sə.taɪl/', meaning: 'Serbaguna, bisa digunakan untuk banyak hal', example: 'Python is a versatile programming language.', exampleTranslation: 'Python adalah bahasa pemrograman yang serbaguna.', category: 'adjective' },
  { id: '12', word: 'Leverage', pronunciation: '/ˈlev.ər.ɪdʒ/', meaning: 'Memanfaatkan sesuatu untuk keuntungan', example: 'We can leverage AI to improve productivity.', exampleTranslation: 'Kita bisa memanfaatkan AI untuk meningkatkan produktivitas.', category: 'verb' },
  { id: '13', word: 'Candid', pronunciation: '/ˈkæn.dɪd/', meaning: 'Terus terang, jujur tanpa ditutup-tutupi', example: 'I appreciate your candid feedback.', exampleTranslation: 'Saya menghargai masukan jujurmu.', category: 'adjective' },
  { id: '14', word: 'Nuance', pronunciation: '/ˈnjuː.ɑːns/', meaning: 'Perbedaan halus dalam makna atau ekspresi', example: 'Translation requires understanding cultural nuances.', exampleTranslation: 'Penerjemahan memerlukan pemahaman nuansa budaya.', category: 'noun' },
];

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

const WordOfTheDay: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const dayIndex = getDayOfYear() % WORDS.length;
  const word = WORDS[dayIndex];

  const categoryColors: Record<string, string> = {
    noun: 'text-blue-400 bg-blue-400/10',
    verb: 'text-green-400 bg-green-400/10',
    adjective: 'text-purple-400 bg-purple-400/10',
    adverb: 'text-yellow-400 bg-yellow-400/10',
  };

  return (
    <div className="bg-gray-800 rounded-lg p-3 mb-4 border border-gray-700">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Book size={18} weight="duotone" className="text-purple-400" />
          <span className="text-sm font-semibold text-gray-200">Word of the Day</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-orange-400">{word.word}</span>
          <CaretDown size={14} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-baseline gap-2 mb-1">
            <h4 className="text-lg font-bold text-gray-100">{word.word}</h4>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${categoryColors[word.category] || 'text-gray-400 bg-gray-700'}`}>
              {word.category}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-2 font-mono">{word.pronunciation}</p>
          <p className="text-sm text-gray-300 mb-3">{word.meaning}</p>
          
          <div className="bg-gray-700/50 rounded p-2.5 border border-gray-600/50">
            <p className="text-sm text-gray-200 italic mb-1">"{word.example}"</p>
            <p className="text-xs text-gray-400">{word.exampleTranslation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordOfTheDay;
