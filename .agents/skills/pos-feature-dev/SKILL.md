---
name: pos-feature-dev
description: >-
  Use this skill when developing or modifying features, routes, pages, or database models for the POS Apotek project. Provides standard step-by-step end-to-end development workflow from migrations, models, services, controllers, to Inertia React components.
---

# POS Feature Development Workflow

Gunakan alur kerja terstandarisasi ini saat membuat atau memperbarui fitur di POS Apotek:

## Step 1: Database Migration & Model
1. Buat migration baru jika diperlukan:
   ```bash
   php artisan make:migration create_xxx_table
   ```
2. Buat Model Eloquent di `app/Models/`:
   - Definisikan `$fillable` dan relasi (`belongsTo`, `hasMany`).
   - Tambahkan type hints untuk relasi.
3. Buat Seeder/Factory jika dibutuhkan data testing di `database/seeders/`.

## Step 2: Service Layer & Business Logic
1. Tempatkan logika kalkulasi / mutasi database di `app/Services/`:
   - Gunakan `DB::transaction()` untuk operasi multi-tabel.
   - Tangani validasi stok atau batasan bisnis apotek.

## Step 3: Form Request & Controller
1. Buat Form Request di `app/Http/Requests/` untuk validasi input.
2. Buat Controller di `app/Http/Controllers/`:
   - Kembalikan respons Inertia: `Inertia::render('admin/inventory/index', [...])` atau redirect dengan flash message.

## Step 4: Routing & Wayfinder
1. Daftarkan route di `routes/web.php` di dalam group middleware yang sesuai (`role:admin` atau `role:cashier`).
2. Wayfinder akan otomatis menghasilkan helper fungsi rute di `resources/js/routes/`.

## Step 5: Frontend UI (Inertia + React + TypeScript)
1. Buat/perbarui halaman di `resources/js/pages/`:
   - Bungkus dengan `<AppSidebarLayout breadcrumbs={[...]}>`.
   - Gunakan komponen UI dari `resources/js/components/ui/`.
   - Gunakan Sonner (`toast.success`, `toast.error`) untuk umpan balik pengguna.
2. Tambahkan definisi tipe TypeScript di `resources/js/types/`.

## Step 6: Verifikasi & Quality Check
1. Jalankan pemeriksaan tipe:
   ```bash
   npm run types:check
   ```
2. Jalankan linter:
   ```bash
   composer run lint
   ```
