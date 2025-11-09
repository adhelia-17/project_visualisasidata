Spotify Trends 2024 — Interactive Music Visualization

Proyek Spotify Trends 2024 bertujuan untuk mengeksplorasi tren musik global berdasarkan data lagu Spotify yang paling banyak diputar sepanjang tahun 2024. Kami membangun visualisasi interaktif berbasis web menggunakan D3.js dan Plotly.js, agar pengguna dapat memahami pola popularitas lagu, karakteristik musik, dan keterkaitan antara performa lagu di Spotify dengan platform lain seperti TikTok.

Spotify merupakan salah satu platform streaming musik terbesar di dunia dengan jutaan pengguna aktif setiap hari. Lagu-lagu yang paling banyak diputar setiap tahunnya mencerminkan preferensi global, tren genre, serta pengaruh media sosial. Namun, data mentah yang kompleks sering kali sulit dipahami oleh publik secara langsung. Oleh karena itu, proyek ini dirancang untuk menyajikan informasi tersebut dalam bentuk dashboard visual interaktif yang mudah diakses dan menarik secara visual.

Melalui pendekatan berbasis data, visualisasi ini diharapkan dapat:
- Menyajikan tren musik global secara informatif dan interaktif.  
- Membantu pengguna menganalisis pola popularitas lagu serta karakteristik musik seperti tempo, danceability, dan valence.  
- Menggambarkan hubungan antara performa lagu di Spotify, TikTok, dan YouTube.  
- Menjadi media edukatif yang membantu publik, musisi, dan peneliti memahami dinamika industri musik modern.

Manfaat Visualisasi:
- Eksplorasi Data Musik: Pengguna dapat melihat lagu-lagu terpopuler, karakteristik audio, dan distribusi eksplisit secara intuitif.
- Analisis Tren: Visualisasi membantu mengidentifikasi pola seperti genre dominan, tempo favorit, atau korelasi antara popularitas dan engagement TikTok.
- Edukasi & Hiburan: Dashboard ini cocok untuk penelitian ringan maupun eksplorasi publik tentang tren musik.
- Mendorong Diskusi dan Kreativitas: Insight dari data bisa digunakan oleh musisi, label, atau peneliti untuk memahami pasar musik lebih dalam.

Teknologi yang Digunakan:
- HTML5 — Struktur halaman web
- CSS3 — Desain visual dan tema gelap
- JavaScript (ES6) — Logika interaktif dan pengelolaan data
- D3.js — Visualisasi data 2D (Bar, Donut, Box Plot)
- Plotly.js — Visualisasi data 3D (Scatter, Surface)
- GitHub Pages — Deployment web publik

Dataset
Sumber: Kaggle — Most Streamed Spotify Songs 2024
Jumlah data: 100+ lagu populer
File: spotify_songs_2024.csv

Kolom yang digunakan:
- Track Name → Judul lagu
- Artist → Nama penyanyi atau grup
- Spotify Streams → Jumlah streaming di Spotify
- Spotify Popularity → Skor popularitas lagu (0–100)
- Explicit Track → 0 (non-eksplisit) atau 1 (eksplisit)
- TikTok Posts → Jumlah video yang memakai lagu
- TikTok Views → Jumlah total penayangan video
- TikTok Likes → Jumlah total likes
- YouTube Views → Jumlah total tayangan video musik

Proses Cleaning Data:
- Menghapus data duplikat dan baris kosong.
- Mengonversi nilai string angka menjadi numerik.
- Menyeragamkan nama artis dan kolom agar sesuai format CSV.

Cara Menjalankan:
1. Unduh seluruh file proyek dari repositori.
2. Pastikan file spotify_songs_2024.csv berada di direktori utama.
3. Jalankan proyek menggunakan Live Server di Visual Studio Code atau buka index.html langsung di browser.
4. Untuk versi online, buka halaman GitHub Pages dari repository ini.

Hasilnya proyek berhasil menampilkan tren musik Spotify secara interaktif dan informatif. Semua fitur berjalan normal saat diuji secara lokal maupun saat diunggah ke GitHub Pages. Visualisasi 3D dapat diputar, di-zoom, dan diekspor dengan lancar. Secara keseluruhan, tampilan dan interaktivitas dashboard sudah memenuhi tujuan awal — informatif, menarik, dan profesional.

Waktu pengerjaan proyek: ± 2 minggu dengan timeline sebagai berikut:
+----------------+----------------+-----------------+-----------------+
| Hari/Tanggal   | Kegiatan Utama | Penanggung      | Target          |
|                |                | Jawab           |                 |
+================+================+=================+=================+
| 27 Oktober     | Kick-off &     | Semua anggota   | Struktur kerja, |
| 2025           | pembagian      |                 | pembagian peran |
|                | tugas          |                 | jelas           |
+----------------+----------------+-----------------+-----------------+
| 28 Oktober     | Download &     | Zahra           | File CSV awal + |
| 2025           | eksplorasi     |                 | deskripsi kolom |
|                | dataset        |                 |                 |
+----------------+----------------+-----------------+-----------------+
| 29 Oktober     | Data cleaning  | Zahra           | Dataset bersih: |
| 2025           | & seleksi      |                 | Track, Artist,  |
|                | kolom          |                 | Streams, dll    |
+----------------+----------------+-----------------+-----------------+
| 30 Oktober     | Desain konsep  | Ayu             | Sketsa layout + |
| 2025           | visualisasi    |                 | jenis grafik    |
|                | (jenis chart)  |                 | yang dipilih    |
+----------------+----------------+-----------------+-----------------+
| 31 Oktober     | Desain warna & | Ayu             | Mockup awal     |
| 2025           | gaya tampilan  |                 | (Canva/Figma)   |
+----------------+----------------+-----------------+-----------------+
| 1 November     | Bangun         | Endin           | index.html +    |
| 2025           | struktur HTML  |                 | style.css       |
|                | & CSS dasar    |                 |                 |
+----------------+----------------+-----------------+-----------------+
| 2 November     | Implementasi   | Endin           | Visualisasi     |
| 2025           | bar chart &    |                 | interaktif awal |
|                | donut chart    |                 |                 |
+----------------+----------------+-----------------+-----------------+
| 3 November     | Implementasi   | Endin           | Visualisasi     |
| 2025           | box plot &     |                 | tambahan +      |
|                | scatter 3D     |                 | filter          |
|                |                |                 | interaktif      |
+----------------+----------------+-----------------+-----------------+
| 4 November     | Korelasi       | Endin           | 3D correlation  |
| 2025           | Sp             |                 | chart +         |
|                | otify–TikTok + |                 | h               |
|                | animasi        |                 | over/transition |
+----------------+----------------+-----------------+-----------------+
| 5, 6 November  | Finalisasi     | Endin, Ayu      | Tampilan web    |
| 2025           | layout &       |                 | rapi di semua   |
|                | responsivitas  |                 | device          |
+----------------+----------------+-----------------+-----------------+
| 7 November     | Deploy ke      | Adhel           | Web online &    |
| 2025           | GitHub Pages   |                 | bisa diakses    |
|                |                |                 | publik          |
+----------------+----------------+-----------------+-----------------+
| 8 November     | Tulis          | Findi           | Dokumentasi     |
| 2025           | README.md +    |                 | lengkap +       |
|                | insight        |                 | insight utama   |
|                | analisis       |                 |                 |
+----------------+----------------+-----------------+-----------------+
| 9 November     | Rekam & edit   | Findi, Semua    | Video 5 menit:  |
| 2025           | video          | Anggota         | demo +          |
|                | presentasi     |                 | insight +       |
|                |                |                 | narasi          |
+----------------+----------------+-----------------+-----------------+

Kesimpulan:
Spotify Trends 2024 menghadirkan cara baru untuk memahami tren musik global melalui visualisasi data interaktif. Dengan kombinasi D3.js, Plotly.js, dan tema dark dashboard profesional, proyek ini tidak hanya menampilkan data tetapi juga menciptakan pengalaman eksplorasi yang menarik dan responsif. Visualisasi ini diharapkan dapat menjadi referensi untuk analisis tren digital, riset data musik, dan pengembangan dashboard analitik hiburan.