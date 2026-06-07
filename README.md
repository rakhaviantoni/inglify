# Inglify - Terjemahan Multi-Gaya

Aplikasi web untuk menerjemahkan teks dari Bahasa Indonesia ke 70+ bahasa dengan berbagai gaya dan nada menggunakan AI.

## Fitur

- 🌍 **70+ Bahasa Target** - Inggris, Jepang, Korea, Mandarin, dll.
- 🎭 **10 Gaya Terjemahan** - Formal, Casual, Friendly, Professional, Simple, Persuasive + Premium (Slang, Poetic, Academic, Marketing)
- 🎮 **Gamifikasi** - XP, Level, Streak, dan 9 Achievements
- 🎯 **Tantangan Harian** - Frasa baru setiap hari dengan bonus XP
- 📖 **Word of the Day** - Pelajari kosakata baru setiap hari
- 📚 **Phrasebook** - Simpan dan organisir terjemahan berdasarkan topik
- 🏆 **Leaderboard** - Bersaing dengan pengguna lain (via Supabase)
- 🎤 **Voice Input** - Dikte teks dengan speech recognition
- 🔊 **Text-to-Speech** - Dengarkan terjemahan
- 📋 **Copy to Clipboard** - Salin terjemahan dengan satu klik
- 💾 **Offline Cache** - Terjemahan yang pernah dibuat tersedia offline
- 📱 **PWA** - Installable, offline-ready app shell
- 📊 **Translation History** - Riwayat 50 terjemahan terakhir

## Tech Stack

- **Framework**: Astro 5 + React 19
- **Styling**: Tailwind CSS 4
- **AI**: SumoPod AI (OpenAI-compatible API)
- **Database**: Supabase (leaderboard, future auth)
- **Storage**: localStorage (history, gamification, phrasebooks, cache)
- **Deployment**: Netlify (SSR + Edge)
- **Language**: TypeScript

## Setup

1. Clone repository ini
2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` ke `.env` dan isi API keys:
```
AI_KEY=your_sumopod_ai_key
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. (Optional) Setup Supabase leaderboard table - jalankan migration:
```bash
supabase db push
```

5. Jalankan development server:
```bash
npm run dev
```

## Struktur Project

```
src/
├── components/
│   ├── Header.tsx                # Header & branding
│   ├── GamificationBar.tsx       # XP, level, streak, achievements
│   ├── DailyChallenge.tsx        # Tantangan harian
│   ├── TranslationForm.tsx       # Form input terjemahan
│   ├── TranslationResult.tsx     # Hasil terjemahan (free + premium tones)
│   ├── WordOfTheDay.tsx          # Kosakata harian
│   ├── PhrasebookPanel.tsx       # Organisir frasa favorit
│   ├── HistoryList.tsx           # Riwayat terjemahan
│   └── Leaderboard.tsx           # Global leaderboard
├── layouts/
│   └── Layout.astro              # Layout utama (SEO, PWA, structured data)
├── pages/
│   ├── index.astro               # Halaman utama
│   └── api/
│       ├── translate.ts          # API endpoint terjemahan (SumoPod AI)
│       └── leaderboard.ts        # API endpoint leaderboard (Supabase)
├── types/
│   └── translation.ts            # Type definitions
├── utils/
│   ├── generatePrompt.ts         # AI prompt builder
│   ├── gamification.ts           # XP, levels, achievements system
│   ├── dailyChallenge.ts         # Tantangan harian logic
│   ├── phrasebooks.ts            # Phrasebook CRUD
│   ├── translationCache.ts       # Offline translation cache
│   └── supabase.ts               # Supabase client
└── styles/
    └── global.css                # Global styles
```

## Donation

Dukung pengembangan Inglify: [Traktir Kopi ☕](https://trakteer.id/rakhaviantoni?quantity=1)

## License

© 2026 Inglify by Rakha Viantoni
