# POS Apotek — Agent Directives & Context

## Project Overview
Aplikasi Point of Sale (POS) dan Manajemen Inventori berbasis Web khusus Apotek yang dibangun dengan Laravel 11/12, Inertia.js v3, React 19, TypeScript, dan Tailwind CSS v4.

## AI Execution Guide (Wajib Dibaca Sebelum Memulai Fitur)
👉 **[docs/AI_DEVELOPMENT_GUIDE.md](file:///home/miceldoang/Documents/project/alone/pos_apotek/docs/AI_DEVELOPMENT_GUIDE.md)**: Panduan urutan eksekusi task dari Phase 1 (Database & Models) hingga Phase 9 (Testing).

## Key Rules & Directives

### 1. Aturan UI & Desain (Wajib Dipatuhi)
- **Komponen Reusable**: Utamakan komponen yang modular dan reusable di `resources/js/components/`.
- **Konsistensi Warna**: Gunakan HANYA token warna resmi:
  - `primary` (`#0d9488` Teal)
  - `secondary` (`#10b981` Emerald)
  - `tertiary` (`#64748b` Slate)
  - `neutral` (`#f8fafc` Slate 50)
- **Responsif di Semua Menu**: Tampilan wajib responsif (Desktop & Mobile).
- **Mobile Bottom Navigation**: Di mobile (`< md`), Sidebar tersembunyi dan otomatis digantikan oleh **`AppBottomBar`** melalui wrapper layout `<AppSidebarLayout>`.

### 2. Aturan Bisnis Apotek
- Stok selalu disimpan dalam satuan dasar (`base_unit_name`) di tabel `product_batches`.
- Satuan jual memiliki `multiplier` ke satuan dasar di tabel `product_units`.
- Pengurangan stok penjualan wajib menggunakan metode **FEFO** (`expiry_date ASC`) dan menghitung COGS/HPP per batch yang terpotong.
- Baca detail aturan di [.agents/rules/business_rules.md](file:///home/miceldoang/Documents/project/alone/pos_apotek/.agents/rules/business_rules.md).

### 3. Pedoman Kode & Arsitektur
- Gunakan `AppSidebarLayout` untuk semua halaman terotentikasi.
- Gunakan type-safe routing dari Wayfinder.
- Pisahkan logika kalkulasi stok/transaksi ke dalam Service Class.
- Baca detail pedoman di [.agents/rules/coding_guidelines.md](file:///home/miceldoang/Documents/project/alone/pos_apotek/.agents/rules/coding_guidelines.md).

## Dokumentasi & PRD
- Master PRD: [docs/PRD.md](file:///home/miceldoang/Documents/project/alone/pos_apotek/docs/PRD.md)
- Skema Database: [docs/DATABASE_SCHEMA.md](file:///home/miceldoang/Documents/project/alone/pos_apotek/docs/DATABASE_SCHEMA.md)
- Spesifikasi Menu: [docs/features/](file:///home/miceldoang/Documents/project/alone/pos_apotek/docs/features/)
- Template PRD: [docs/templates/PRD_TEMPLATE.md](file:///home/miceldoang/Documents/project/alone/pos_apotek/docs/templates/PRD_TEMPLATE.md)

## Skills Tersedia
- `pos-feature-dev`: Alur kerja pembuatan fitur baru dari migration, model, controller, hingga Inertia UI.
- `pharmacy-fefo-stock`: Logika perhitungan alokasi stok FEFO dan konversi multi-satuan.
- `prd-template`: Panduan penulisan spesifikasi fitur baru.
