# POS Apotek Coding Guidelines & Architecture Rules

Dokumen aturan ini berlaku untuk seluruh pengembangan di dalam proyek **POS Apotek**.

---

## 1. Stack & Tools
- **Backend**: Laravel 11/12 (PHP 8.3+)
- **Frontend**: Inertia.js v3 + React 19 (TypeScript)
- **Styling**: Tailwind CSS v4 (`resources/css/app.css` dengan CSS theme tokens)
- **UI Components**: Radix UI + Lucide React + Sonner (Toast notifications)
- **Routing**: `@laravel/vite-plugin-wayfinder` (Gunakan helper route bawaan Wayfinder untuk navigasi type-safe)

---

## 2. Aturan Wajib UI / UX & Desain (UI Design Rules)

> [!IMPORTANT]
> **1. Utamakan Komponen Reusable (Reusable Components First)**
> - Pisahkan komponen berulang ke `resources/js/components/` (misal: summary card, modal dialog, searchable dropdown, data table, badge status, filter bar, quick action button).
> - Jangan menduplikasi markup atau style yang sama di berbagai file page.

> [!IMPORTANT]
> **2. Konsistensi Warna (Strict Theme Tokens)**
> Gunakan HANYA 4 palet warna utama dari theme tokens yang sudah didefinisikan di `app.css`:
> - **`primary`** (`#0d9488` Teal): Warna aksi utama, tombol primary, active nav state, branding apotek.
> - **`secondary`** (`#10b981` Emerald): Warna sukses, margin profit, indikator positif, batch aman.
> - **`tertiary`** (`#64748b` Slate): Warna teks sekunder, subtitle, placeholder, border subtil.
> - **`neutral`** (`#f8fafc` Slate 50): Warna background container, background halaman (`bg-neutral`), hover effect.
> *Dilarang keras memakai warna heksadesimal baru atau warna default Tailwind yang tidak harmonis.*

> [!IMPORTANT]
> **3. Wajib Responsif di Semua Menu (Mobile & Desktop)**
> - Semua menu (Dashboard, Inventory, Supplier, POS, Reports, Settings) wajib nyaman digunakan di layar Desktop, Tablet, dan Smartphone (Mobile).
> - **Aturan Navigasi Mobile**: Di layar mobile (`< md`), Sidebar desktop otomatis tersembunyi dan **wajib digantikan oleh Bottom Bar (`AppBottomBar`)** yang telah terpasang di `AppSidebarLayout`.
> - Pastikan seluruh halaman menggunakan layout `<AppSidebarLayout>` agar padding bawah (`pb-20 md:pb-0`) mencegah konten tertutup oleh Bottom Bar.

---

## 3. Backend Coding Standards
1. **Controller & Service Layer**:
   - Jaga Controller tetap ramping (*thin controllers*).
   - Logika bisnis kompleks (seperti kalkulasi alokasi stok FEFO, kalkulasi COGS/margin, perhitungan pajak, dan pemrosesan multi-satuan) harus diisolasi dalam Service Class (misal: `App\Services\FefoStockService`, `App\Services\PosSaleService`, `App\Services\ReportService`).
2. **Form Request & Validation**:
   - Selalu gunakan Dedicated Form Request (`app/Http/Requests/...`) untuk validasi input form.
   - Jangan melakukan validasi langsung di dalam controller jika memiliki lebih dari 2 field.
3. **Database Transactions**:
   - Selalu gunakan `DB::transaction()` saat melakukan mutasi data yang melibatkan lebih dari satu tabel (misal: simpan penjualan -> simpan sale items -> potong batch stok).
4. **Code Quality Checks**:
   - Jalankan `composer run lint` (Laravel Pint) dan `npm run types:check` (TypeScript) sebelum menyelesaikan fitur.

---

## 4. Frontend TypeScript Standards
1. **Type Definitions**:
   - Selalu definisikan tipe data di `resources/js/types/` (misal: `Product`, `ProductUnit`, `ProductBatch`, `Supplier`, `Sale`, `SaleItem`, `ReportFilterDTO`).
   - Hindari penggunaan `any`.
2. **Toast Feedback**:
   - Gunakan `sonner` untuk notifikasi sukses/gagal operasi: `toast.success('...')` atau `toast.error('...')`.
