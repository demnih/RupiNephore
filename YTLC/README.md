# Rupi Nephore — YTLC Overlay

Folder ini berisi versi custom overlay untuk <https://ytlc.miukyo.my.id/>. Versi ini tidak menggunakan selector internal YouTube; pesan dirender dari data `ChatItem` yang diberikan runtime YTLC.

## File yang ditempel ke editor

| Tab YTLC | File |
| --- | --- |
| HTML | `overlay.html` |
| CSS | `overlay.css` |
| TypeScript | `overlay.ts` |

Salin **isi file**, bukan nama atau pembungkus Markdown-nya. File `ytlc.d.ts` dan `tsconfig.json` hanya dipakai untuk pemeriksaan tipe lokal dan tidak perlu ditempel ke website.

TypeScript akan dikompilasi menjadi JavaScript oleh YTLC. File `overlay.js` disertakan sebagai hasil kompilasi/referensi, tetapi tidak perlu ditempel jika tab TypeScript sudah memakai `overlay.ts`. Jangan menempel `overlay.ts` dan `overlay.js` sekaligus.

## Cara mencoba

1. Buka YTLC dan buat draft baru.
2. Tempel isi `overlay.html`, `overlay.css`, dan `overlay.ts` pada tab masing-masing.
3. Tekan **Send Dummy** beberapa kali untuk memeriksa layout dan animasi.
4. Masukkan salah satu dari **Handle**, **Channel ID**, atau **Live ID**.
5. Tekan **Start Chat** untuk menguji live chat.
6. Tekan **Export Overlay**, lalu gunakan URL hasil export sebagai URL Browser Source OBS.

Rekomendasi ukuran awal Browser Source:

- Width: `700`
- Height: `900`
- FPS: `30` atau `60`
- Custom CSS OBS: kosong

## Variasi otomatis

`overlay.ts` menentukan desain berdasarkan data YTLC:

1. Viewer/subscriber biasa
2. YouTube Member
3. Moderator
4. Owner/Rupi
5. Superchat/Super Sticker
6. Membership baru, milestone, dan gift

Badge, verified state, ranking, emoji, sticker, dan membership details hanya ditampilkan jika data tersebut benar-benar dikirim oleh YTLC.

## Lebar bubble dinamis

Bubble memakai `fit-content`, sehingga lebarnya mengikuti isi pesan dengan batas aman:

- Chat biasa: minimum `270px`, maksimum `720px`
- Superchat/membership: minimum `390px`, maksimum `720px`
- Pada viewport kecil, batas tersebut otomatis menyesuaikan lebar layar

Nilai ini dapat disesuaikan pada `.rupi-chat` dan `.rupi-event` di `overlay.css`.

## Ornament pil dan tablet

Setiap chat biasa mendapat satu ornament acak dari enam aset berikut:

- Blue, pink, dan purple pill
- Blue, pink, dan purple tablet

Pil/tablet ditempatkan sebagai elemen gambar di sudut kanan bawah bubble, bukan lagi background transparan. Pilihan yang sama tidak digunakan dua kali berturut-turut.

## Animasi

Animasi masuk dan keluar dijalankan melalui Web Animations API di TypeScript. Maksimal pesan yang dipertahankan dapat diubah melalui konstanta berikut pada bagian atas `overlay.ts`:

```ts
const MAX_MESSAGES = 12;
```

Pesan tertua dianimasikan keluar ketika batas tersebut dilewati. Ornament memiliki animasi pop saat muncul, gerakan mengambang saat diam, serta spin kecil saat keluar. Preferensi sistem `prefers-reduced-motion` juga dihormati.

## Aset

Semua gambar dekoratif memakai URL absolut jsDelivr yang dipin ke commit `01d1594`. Ini diperlukan karena overlay export berjalan di domain YTLC dan tidak dapat memakai path lokal `../Asset/...`.

Jika aset diperbarui, ganti hash tersebut pada URL di `overlay.css` dengan commit aset terbaru.
