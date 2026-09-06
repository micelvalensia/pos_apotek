# POS Apotek Business Domain Rules

Dokumen aturan bisnis apotek yang wajib dipatuhi dalam setiap logika backend dan frontend.

---

## 1. Konversi Multi-Satuan (Multi-Unit Conversion)
1. Setiap produk (`products`) memiliki tepat satu satuan dasar (`base_unit_name`), misalnya: `tablet`, `kapsul`, `botol`, `ampul`, atau `pcs`.
2. Semua pencatatan stok di database fisik (`product_batches.base_qty`) **wajib disimpan dalam satuan dasar**.
3. Satuan kemasan jual (`product_units`) mendefinisikan faktor pengali (*multiplier*):
   - $\text{Total Base Qty} = \text{Qty Jual} \times \text{Multiplier}$.
   - Contoh: Obat Paracetamol memiliki satuan dasar `tablet`.
     - Satuan Jual `strip` (multiplier = 10): Jual 2 strip = potong 20 tablet dari batch.
     - Satuan Jual `box` (multiplier = 100): Jual 1 box = potong 100 tablet dari batch.

---

## 2. Pengurangan Stok FEFO (First Expired, First Out)
1. Saat penjualan (`sales`) diproses, sistem **wajib** mengambil stok dari batch (`product_batches`) yang memiliki tanggal kedaluwarsa paling dekat (`expiry_date ASC`) dan memiliki `base_qty > 0`.
2. Jika kuantitas pembelian melebihi sisa stok di batch terdekat, sisa kebutuhan dialokasikan otomatis ke batch berikutnya.
3. Transaksi **harus dibatalkan (rollback/throw exception)** jika total stok seluruh batch aktif suatu produk kurang dari total kebutuhan dasar.
4. Total HPP barang yang terjual (`total_cogs`) dihitung per bagian kuantitas yang dipotong dari masing-masing batch:
   $$\text{Total COGS} = \sum (\text{Base Qty yang dipotong dari Batch}_i \times \text{Cost per Base Unit}_i)$$

---

## 3. Inbound (Penerimaan Barang)
1. Penerimaan barang dari supplier wajib mencatat:
   - Produk yang diterima
   - Supplier asal
   - Jumlah barang (dikonversi ke `base_qty`)
   - Nomor batch
   - Tanggal kedaluwarsa (*expiry date*)
   - Harga beli per satuan dasar (`cost_per_base_unit`)
2. Setiap kali ada inbound baru, buat baris baru di `product_batches`.

---

## 4. Keamanan & Hak Akses (Role Permissions)
1. **Admin**:
   - Memiliki akses penuh ke seluruh menu: Dashboard Admin, Inventory, Supplier, Reports, Settings, dan Manajemen User.
2. **Cashier (Kasir)**:
   - Dibatasi hanya untuk transaksi POS dan Dashboard Kasir.
   - Tidak dapat menghapus master produk, tidak dapat mengubah harga beli/COGS, dan tidak dapat mengakses laporan keuangan laba/rugi.
