// ============ PENGATURAN (boleh diubah) ============
window.CONFIG={
  // File template. Ganti file ini saja, atau ubah path-nya di sini.
  // Area tempat foto HARUS transparan di PNG-nya. Frame akan terdeteksi otomatis.
  template:'assets/tamplate.png',

  // Nama tiap frame, urut dari atas ke bawah (hanya label di panel upload)
  names:['Sangga Rahandika','Alaski Madhava','Gamadhi Caraka','Gauri Adwitya'],

  // Pilihan warna background foto di dalam frame
  photoColors:['#ffffff','#f4efe6','#dfe9f1','#f6dde3','#e6dff3','#dcefe3','#c9d3db','#1f2a35'],

  // Teks di bagian atas halaman
  title:'Foto berdua di photostrip',
  subtitle:'Upload fotomu, background otomatis terhapus, lalu geser sampai pas di samping orang di frame.',

  // Cadangan posisi frame kalau deteksi otomatis gagal (x,y,w,h dalam piksel template).
  // side: 0 = fotomu di kiri, 1 = fotomu di kanan.
  fallbackFrames:[
    {x:73,y:113,w:454,h:325,side:0},
    {x:73,y:493,w:454,h:325,side:1},
    {x:73,y:873,w:454,h:325,side:0},
    {x:73,y:1253,w:454,h:325,side:1}
  ]
};
