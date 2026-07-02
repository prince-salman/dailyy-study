# Dailyy Study

Platform bimbingan belajar (les online) interaktif dengan fitur tryout UTBK, kelas live (Zoom), gamifikasi (XP/Level), dan dashboard admin/tutor.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Database / Auth:** Supabase (PostgreSQL)
- **Face Recognition:** face-api.js (Anti-cheat ujian)

## Setup Local

1. Install dependencies:
```bash
npm install
```

2. Buat file `.env.local` di root folder dan isi dengan konfigurasi Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON-KEY]
```

3. Jalankan server:
```bash
npm run dev
```
Buka `http://localhost:3000` di browser.

## Database (Supabase)
Semua tabel sudah dikonfigurasi melalui script SQL. Saat aplikasi pertama kali dijalankan, sistem akan otomatis melakukan *seeding* akun kru (Admin, Tutor, dsb) ketika halaman `/profile` diakses.

## Akses Akun
Role dan pembagian mata pelajaran untuk tutor sudah di-hardcode sementara di dalam sistem *seed* dan tersimpan di database.
- **Admin Default:** `admin@dailystudy.id`
- **Password Default:** `Jual1909` (Untuk staf/tutor lain: `password123` atau `salman123`)

## Deployment
Aplikasi ini sudah siap di-deploy ke Vercel. Jangan lupa masukkan variabel di `.env.local` ke dalam menu Environment Variables di Vercel Settings.
