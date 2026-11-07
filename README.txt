PHOTOSTRIP - FOTO BERDUA
=========================

ISI FOLDER
  index.html            halaman utama (buka ini)
  config.js             pengaturan: nama template, nama tiap frame, pilihan warna, teks judul
  style.css, app.js     tampilan dan program (tidak perlu diubah)
  assets/tamplate.png   TEMPLATE PHOTOSTRIP (ini yang bisa kamu ganti)
  assets/lib/           AI penghapus background (tidak perlu diubah)

CARA MENGGANTI TEMPLATE
  1. Siapkan template PNG. Area tempat foto HARUS transparan (bolong).
     Orang, tulisan, border, dan background strip harus ikut ada di PNG-nya (tidak transparan).
  2. Simpan dengan nama tamplate.png di folder assets (timpa file lama).
     Mau nama lain? Ubah baris  template:'assets/...'  di config.js.
  3. Refresh halaman. Posisi frame foto terdeteksi OTOMATIS dari area transparan,
     jadi jumlah dan ukuran frame boleh beda dari template ini.
  4. Fotomu otomatis ditaruh di sisi yang kosong (berlawanan dengan orang di template).
  5. Ganti nama tiap frame di config.js bagian  names  (urut dari atas ke bawah).

CARA MENJALANKAN
  Web ini harus dibuka lewat server (bukan klik dua kali index.html),
  kalau tidak, browser memblokir tombol download. Pilih salah satu:

  A. Hosting gratis (paling gampang, bisa dibagikan ke orang lain)
     - Netlify: buka app.netlify.com/drop, lalu seret folder ini ke halamannya.
     - Atau GitHub Pages / Vercel / Cloudflare Pages.

  B. Di komputer sendiri
     - Kalau ada Python: buka terminal di folder ini, lalu jalankan
         python -m http.server 8000
       dan buka http://localhost:8000
     - Atau pakai ekstensi "Live Server" di VS Code.

CATATAN
  - Background foto dihapus otomatis oleh AI yang jalan di browser. Foto tidak dikirim ke mana-mana.
  - Untuk hasil paling rapi, hapus background di remove.bg dulu lalu upload PNG transparannya.
  - Foto yang sudah PNG transparan dipakai apa adanya.
