# HEMATIN — Smart Electricity Saving Advisor

Prototype web untuk tugas Kecerdasan Buatan: sistem rekomendasi penghematan energi listrik rumah tangga menggunakan pendekatan **rule-based system**.

## Fitur yang berfungsi
- Menambahkan dan menghapus perangkat listrik.
- Menghitung estimasi konsumsi bulanan dengan rumus: daya (W) × jumlah × jam/hari × 30 ÷ 1000.
- Mengestimasi biaya dari tarif Rp/kWh yang bisa diedit.
- Menghasilkan rekomendasi berbasis aturan sederhana berdasarkan durasi, daya, dan kategori nama perangkat.
- Menampilkan simulasi biaya/konsumsi sebelum dan sesudah pengurangan pemakaian.
- Memuat data contoh untuk demo.

## Cara menjalankan
1. Ekstrak ZIP.
2. Buka folder `hematin-website`.
3. Buka `index.html` di browser atau gunakan Live Server di VS Code.
4. Tidak perlu install dependency. Google Fonts butuh internet, tetapi website tetap berjalan dengan font fallback.

## Catatan akademik
- Ini prototipe demonstrasi rule-based, bukan AI generatif dan bukan pengukuran meter listrik aktual.
- Tarif awal Rp1.444,70/kWh hanya nilai contoh. Ubah sesuai tarif pada tagihan pengguna.
- Estimasi penghematan merupakan ilustrasi dari aturan sederhana, bukan jaminan pengurangan tagihan.
- Data tidak dikirim ke server; penghitungan dilakukan di browser. Data perangkat tidak disimpan setelah halaman dimuat ulang.
- Lengkapi laporan proyek dengan aturan, skenario uji, dan hasil pengujian sesuai implementasi final.
