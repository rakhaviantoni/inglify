export interface DailyChallenge {
  id: string;
  date: string;
  phrase: string;
  hint: string;
  targetLanguage: string;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  xpReward: number;
}

// Curated daily phrases - rotates based on day of year
const DAILY_PHRASES: Omit<DailyChallenge, 'id' | 'date' | 'completed'>[] = [
  { phrase: 'Terima kasih banyak', hint: 'Ucapan syukur', targetLanguage: 'en', difficulty: 'easy', xpReward: 15 },
  { phrase: 'Saya sangat senang bertemu denganmu', hint: 'Sapaan hangat', targetLanguage: 'en', difficulty: 'easy', xpReward: 15 },
  { phrase: 'Bisakah kamu membantu saya?', hint: 'Meminta bantuan', targetLanguage: 'en', difficulty: 'easy', xpReward: 15 },
  { phrase: 'Apa kabar hari ini?', hint: 'Sapaan sehari-hari', targetLanguage: 'ja', difficulty: 'medium', xpReward: 25 },
  { phrase: 'Saya ingin memesan makanan', hint: 'Di restoran', targetLanguage: 'ko', difficulty: 'medium', xpReward: 25 },
  { phrase: 'Tolong antarkan saya ke bandara', hint: 'Transportasi', targetLanguage: 'en', difficulty: 'easy', xpReward: 15 },
  { phrase: 'Cuaca hari ini sangat cerah', hint: 'Membicarakan cuaca', targetLanguage: 'fr', difficulty: 'medium', xpReward: 25 },
  { phrase: 'Saya sedang belajar bahasa baru', hint: 'Tentang hobi', targetLanguage: 'de', difficulty: 'medium', xpReward: 25 },
  { phrase: 'Di mana stasiun kereta terdekat?', hint: 'Bertanya arah', targetLanguage: 'ja', difficulty: 'medium', xpReward: 25 },
  { phrase: 'Saya sangat menikmati perjalanan ini', hint: 'Traveling', targetLanguage: 'es', difficulty: 'medium', xpReward: 25 },
  { phrase: 'Mohon maaf atas ketidaknyamanan ini', hint: 'Formal apology', targetLanguage: 'en', difficulty: 'easy', xpReward: 15 },
  { phrase: 'Kapan kita bisa bertemu lagi?', hint: 'Membuat janji', targetLanguage: 'ko', difficulty: 'medium', xpReward: 25 },
  { phrase: 'Saya ingin mendaftar untuk kursus ini', hint: 'Pendidikan', targetLanguage: 'en', difficulty: 'easy', xpReward: 15 },
  { phrase: 'Apakah ada diskon untuk pelajar?', hint: 'Belanja', targetLanguage: 'zh', difficulty: 'hard', xpReward: 35 },
  { phrase: 'Tolong jangan berisik', hint: 'Di perpustakaan', targetLanguage: 'ja', difficulty: 'medium', xpReward: 25 },
  { phrase: 'Saya bangga dengan pencapaianmu', hint: 'Memberi pujian', targetLanguage: 'en', difficulty: 'easy', xpReward: 15 },
  { phrase: 'Deadline proyek ini minggu depan', hint: 'Kerja kantoran', targetLanguage: 'en', difficulty: 'easy', xpReward: 15 },
  { phrase: 'Mari kita rayakan keberhasilan ini', hint: 'Merayakan', targetLanguage: 'fr', difficulty: 'medium', xpReward: 25 },
  { phrase: 'Saya tidak setuju dengan pendapat itu', hint: 'Diskusi', targetLanguage: 'en', difficulty: 'easy', xpReward: 15 },
  { phrase: 'Pemandangan di sini sangat indah', hint: 'Wisata alam', targetLanguage: 'it', difficulty: 'medium', xpReward: 25 },
  { phrase: 'Bagaimana cara menggunakan aplikasi ini?', hint: 'Teknologi', targetLanguage: 'en', difficulty: 'easy', xpReward: 15 },
  { phrase: 'Saya sudah menunggu cukup lama', hint: 'Mengekspresikan ketidaksabaran', targetLanguage: 'de', difficulty: 'medium', xpReward: 25 },
  { phrase: 'Ini adalah pengalaman yang tak terlupakan', hint: 'Kenangan', targetLanguage: 'es', difficulty: 'medium', xpReward: 25 },
  { phrase: 'Bisakah kamu ulangi sekali lagi?', hint: 'Meminta pengulangan', targetLanguage: 'ja', difficulty: 'medium', xpReward: 25 },
  { phrase: 'Saya perlu istirahat sebentar', hint: 'Lelah', targetLanguage: 'ko', difficulty: 'medium', xpReward: 25 },
  { phrase: 'Selamat atas kelulusanmu', hint: 'Ucapan selamat', targetLanguage: 'en', difficulty: 'easy', xpReward: 15 },
  { phrase: 'Apakah tempat ini buka setiap hari?', hint: 'Informasi tempat', targetLanguage: 'zh', difficulty: 'hard', xpReward: 35 },
  { phrase: 'Saya mau pesan kopi tanpa gula', hint: 'Di kafe', targetLanguage: 'en', difficulty: 'easy', xpReward: 15 },
  { phrase: 'Jangan lupa bawa payung', hint: 'Peringatan cuaca', targetLanguage: 'fr', difficulty: 'medium', xpReward: 25 },
  { phrase: 'Kita harus lebih sering berkomunikasi', hint: 'Hubungan', targetLanguage: 'en', difficulty: 'easy', xpReward: 15 },
];

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getTodayChallenge(): DailyChallenge {
  const today = getToday();
  const dayIndex = getDayOfYear() % DAILY_PHRASES.length;
  const template = DAILY_PHRASES[dayIndex];
  
  // Check if already completed
  const completedChallenges = getCompletedChallenges();
  const isCompleted = completedChallenges.includes(today);
  
  return {
    id: `challenge-${today}`,
    date: today,
    ...template,
    completed: isCompleted,
  };
}

function getCompletedChallenges(): string[] {
  try {
    const raw = localStorage.getItem('inglify-completed-challenges');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function completeChallenge(): number {
  const today = getToday();
  const completed = getCompletedChallenges();
  
  if (completed.includes(today)) return 0;
  
  completed.push(today);
  // Keep only last 90 days
  if (completed.length > 90) completed.splice(0, completed.length - 90);
  localStorage.setItem('inglify-completed-challenges', JSON.stringify(completed));
  
  const challenge = getTodayChallenge();
  return challenge.xpReward;
}

export function getChallengeStreak(): number {
  const completed = getCompletedChallenges();
  if (completed.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    
    if (completed.includes(dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  
  return streak;
}
