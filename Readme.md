# Live Chat CSS — Rupi Nephore

Project ini bertujuan membuat tampilan live chat bertema Rupi Nephore untuk digunakan sebagai overlay streaming. Desain akan mengadaptasi gaya visual pada gambar referensi, tetapi kategori dan asetnya disesuaikan dengan kebutuhan live chat Rupi sehingga tidak harus sama persis.

## Referensi desain

Referensi utama dapat dilihat pada [image.png](./Reference/image.png).

Gambar tersebut memiliki tujuh contoh desain. Project ini hanya menggunakan enam variasi dengan pemetaan berikut:

| No. | Penggunaan di live chat Rupi | Desain yang diadaptasi |
| --- | --- | --- |
| 1 | Chat viewer dan subscriber biasa | Box 1 — Viewer |
| 2 | Chat YouTube Member | Box 2 — Subscriber |
| 3 | Chat moderator | Box 3 — VIP User |
| 4 | Chat dari Rupi | Box 5 — Streamer |
| 5 | Notifikasi superchat | Box 6 — Superchat/donasi |
| 6 | Notifikasi member baru | Box 7 — New Raid |

Desain `Moderator` pada box 4 di gambar referensi belum digunakan. Nama kategori pada referensi hanya menunjukkan sumber gaya visual dan tidak selalu sama dengan penggunaannya di live chat Rupi.

## Arah visual

Identitas visual mengambil elemen utama dari karakter Rupi:

- tema medis seperti pil, tablet, plester, jahitan, tag, dan kantong infus;
- kombinasi warna ungu gelap, pink, lavender, dan putih kebiruan;
- sudut bubble yang membulat dengan bentuk asimetris ringan;
- ornamen kecil pada tepi bubble agar tetap menarik tanpa mengganggu keterbacaan pesan;
- kontras yang cukup agar nama pengguna dan pesan tetap terbaca saat ditampilkan di atas video.

Referensi karakter utama untuk menentukan warna adalah [twintails.png](<./Asset/[ standing png ]/twintails.png>).

## Palet warna awal

Palet berikut merupakan perkiraan awal berdasarkan ilustrasi karakter. Nilainya dapat disesuaikan kembali setelah diuji di OBS dan dibandingkan dengan warna video atau background stream.

| Nama | Hex | Penggunaan utama |
| --- | --- | --- |
| Midnight Navy | `#292750` | Bubble gelap, teks pada bidang terang, dan outline |
| Deep Purple | `#5F568D` | Bubble sekunder dan aksen moderator |
| Periwinkle | `#A9ADE2` | Border, highlight, dan aksen lembut |
| Rupi Pink | `#E965A4` | Identitas utama, nama pengguna, dan ornamen |
| Soft Pink | `#F5B5D2` | Bubble member dan background terang |
| Ice Lavender | `#E7E9FF` | Highlight dan bidang sekunder |
| Near White | `#F8F7FF` | Bubble viewer dan teks pada bubble gelap |
| Berry Red | `#C83F72` | Superchat, penekanan nominal, dan aksen penting |

### Kombinasi warna per variasi

| Variasi | Background | Nama/label | Teks pesan | Border dan aksen |
| --- | --- | --- | --- | --- |
| Viewer/subscriber | `#F8F7FF` | `#C83F72` | `#292750` | `#F5B5D2` |
| YouTube Member | `#F5B5D2` | `#292750` | `#292750` | `#E965A4` |
| Moderator | `#5F568D` | `#F8F7FF` | `#F8F7FF` | `#A9ADE2` |
| Rupi | `#292750` | `#F5B5D2` | `#F8F7FF` | `#E965A4` |
| Superchat | `#5F568D` | `#292750` pada label terang | `#F8F7FF` | `#E965A4` dan `#C83F72` |
| Member baru | `#F8F7FF` | `#292750` | `#5F568D` | `#E965A4` dan `#A9ADE2` |

## Asset

Asset asli tersedia di [Google Drive](https://drive.google.com/drive/u/0/folders/1u2J4VEiRtvK2Bd6CrNbQNDgx7wEfkCsL) dan salinannya sudah tersedia di folder [Asset](./Asset/).

Beberapa kandidat penggunaan asset:

- pil dan tablet untuk viewer, member, atau moderator;
- ribbon, tag, dan safety pin untuk bubble chat Rupi;
- ilustrasi angel/devil atau ornamen besar untuk superchat;
- pola background dibuat langsung dengan gradient CSS agar skalanya konsisten; asset clothes pattern tidak digunakan pada desain aktif;
- ilustrasi chibi untuk notifikasi member baru jika ukurannya tidak menutupi teks.

Asset dekoratif sebaiknya menggunakan PNG transparan dan dikompresi agar overlay tidak berat. Ornamen tidak harus dipakai semuanya; keterbacaan chat tetap menjadi prioritas.

## Penyimpanan asset

Jika overlay HTML/CSS dijalankan secara lokal melalui OBS Browser Source, gambar tidak perlu diunggah. Gunakan path relatif dari file CSS atau HTML, misalnya:

```css
background-image: url("../Asset/[ assets ]/ribbon.png");
```

Jika CSS digunakan melalui layanan berbasis web seperti StreamElements, asset lokal tidak dapat diakses oleh browser layanan tersebut. Dalam kondisi itu, unggah asset ke GitHub Pages atau hosting/CDN publik dan gunakan URL HTTPS. Google Drive tidak disarankan sebagai sumber langsung asset karena tautannya tidak selalu berupa direct file URL dan dapat bermasalah saat dimuat oleh browser.

## Pengujian langsung di OBS

Repo ini dapat dimuat melalui jsDelivr, sehingga seluruh isi CSS tidak perlu disalin ke OBS. Tambahkan YouTube Live Chat Popout sebagai Browser Source, kemudian masukkan baris berikut pada kolom **Custom CSS**:

```css
@import url("https://cdn.jsdelivr.net/gh/demnih/RupiNephore@85652bf/CSS/main.css");
```

Path asset di dalam `main.css` bersifat relatif terhadap file CSS. Ketika stylesheet dimuat dari CDN, browser juga akan mengambil gambar dari repo yang sama secara otomatis.

URL di atas menggunakan hash commit agar versi yang tampil di OBS selalu sesuai dengan versi yang sudah diuji. Setelah desain CSS diperbarui, hash pada URL juga perlu diganti dengan hash commit terbaru. Penggunaan branch `main` lebih praktis, tetapi CDN dapat menyimpan versi sebelumnya untuk sementara.

### Preview lokal interaktif

Gunakan [preview.html](./preview.html) untuk menguji desain tanpa koneksi ke live chat YouTube. Halaman ini menyediakan:

- pilihan keenam jenis pesan;
- input nama, isi pesan, dan nominal superchat;
- pilihan background terang, gelap, checker, atau simulasi transparan;
- pengaturan lebar viewport;
- tampilan satu variasi atau seluruh variasi sekaligus.

File dapat dibuka langsung di browser. Untuk membukanya di OBS, buat Browser Source, aktifkan **Local file**, lalu pilih `preview.html`. Klik kanan Browser Source dan pilih **Interact** untuk menggunakan form pengujian.

## Tingkat kompleksitas

Bubble viewer, member, moderator, dan Rupi memiliki kompleksitas rendah sampai menengah. Bentuk utamanya dapat dibuat dengan CSS menggunakan `border-radius`, gradient, shadow, serta pseudo-element, kemudian dilengkapi PNG transparan sebagai ornamen.

Superchat dan notifikasi member baru memiliki kompleksitas menengah karena membutuhkan layout khusus, label terpisah, dekorasi lebih besar, serta penanganan nama dan pesan dengan panjang yang berbeda. Keduanya tetap dapat dibuat menyerupai referensi tanpa menyalin bentuknya secara persis.

## Ketentuan implementasi

- Bubble harus tetap terbaca pada resolusi streaming umum dan tidak bergantung pada satu ukuran layar saja.
- Nama pengguna, badge, nominal, dan isi pesan perlu memiliki class atau selector terpisah.
- Badge membership, moderator, owner, dan ranking YouTube ditampilkan pada baris yang sama dengan username.
- Pesan panjang harus dapat berpindah baris tanpa keluar dari bubble.
- Asset dekoratif tidak boleh menutupi nama, nominal, atau pesan.
- Animasi masuk dan keluar dibuat ringan agar tidak mengganggu performa OBS.
- Font utama perlu ditentukan sebelum tahap final; gunakan fallback yang mudah dibaca jika font khusus gagal dimuat.
- Warna dan ukuran akhir harus diuji di atas background terang maupun gelap.

## Sebelum mulai coding

Hal berikut perlu dipastikan saat integrasi dimulai:

1. Platform atau sumber chat yang digunakan, misalnya OBS lokal atau StreamElements.
2. Struktur HTML dan selector yang tersedia dari platform tersebut.
3. Ukuran area overlay dan posisi chat di layar.
4. Font utama serta lisensi penggunaannya.
5. Durasi dan gaya animasi masuk/keluar.
6. Asset final untuk masing-masing dari enam variasi.

File CSS utama berada di [CSS/main.css](./CSS/main.css).
