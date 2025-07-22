# Inglify - Terjemahan Multi-Gaya

Aplikasi web untuk menerjemahkan teks dari Bahasa Indonesia ke berbagai gaya bahasa menggunakan AI Google Gemini Flash 2.5.

## Fitur

- 🌐 **Multi-bahasa**: Terjemahkan ke 8 bahasa berbeda (Inggris, Jepang, Korea, Mandarin, Prancis, Spanyol, Jerman, Arab)
- 🎭 **6 Gaya Bahasa**: Formal, Casual, Friendly, Professional, Simple, Persuasive
- 📱 **Responsif**: Desain mobile-first yang optimal di semua perangkat
- 💾 **Riwayat Lokal**: Simpan dan kelola riwayat terjemahan di localStorage
- ⚡ **Performa Tinggi**: Dibangun dengan Astro untuk loading yang cepat
- 🎨 **UI Modern**: Menggunakan Tailwind CSS untuk tampilan yang bersih

## Teknologi

- **Framework**: Astro (React)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **AI**: Google Gemini Flash 2.5 API
- **Storage**: localStorage

## Instalasi

1. Install dependencies:
```bash
npm install
```

2. Setup environment variables:
```bash
cp .env.example .env
```

3. Dapatkan API key dari [Google AI Studio](https://makersuite.google.com/app/apikey) dan tambahkan ke file `.env`:
```
GEMINI_API_KEY=your_api_key_here
```

4. Jalankan development server:
```bash
npm run dev
```

5. Buka browser dan akses `http://localhost:4321`

## Struktur Proyek

```
src/
├── components/
│   ├── TranslationForm.astro    # Form input teks & pilih bahasa
│   ├── TranslationResult.astro  # Tampilan hasil multi-gaya
│   └── HistoryList.astro        # Riwayat terjemahan
├── layouts/
│   └── Layout.astro             # Layout utama
├── pages/
│   ├── index.astro              # Halaman utama
│   └── api/
│       └── gemini.ts            # API route untuk Gemini
├── types/
│   └── translation.ts           # Definisi tipe data
├── utils/
│   └── generatePrompt.ts        # Generator prompt untuk AI
└── styles/
    └── global.css               # Global styles
```

## Cara Penggunaan

1. **Input Teks**: Masukkan teks dalam Bahasa Indonesia
2. **Pilih Bahasa**: Pilih bahasa target (default: Bahasa Inggris)
3. **Terjemahkan**: Klik tombol "Terjemahkan"
4. **Lihat Hasil**: Dapatkan 6 versi terjemahan dengan gaya berbeda
5. **Salin Teks**: Klik ikon copy untuk menyalin terjemahan
6. **Lihat Riwayat**: Akses riwayat terjemahan di bagian bawah

## Build untuk Production

```bash
npm run build
npm run preview
```
