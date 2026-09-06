# Project Vibe & Context — POS Apotek

## Vibe Coding & UI Rules
- **Reusable Component First**: Selalu utamakan komponen modular di `resources/js/components/` dan hindari duplikasi markup/styling.
- **Strict Color Tokens**: Wajib gunakan `primary` (`#0d9488`), `secondary` (`#10b981`), `tertiary` (`#64748b`), dan `neutral` (`#f8fafc`).
- **Responsive Everywhere**: Setiap menu (Dashboard, Inventory, Supplier, POS, Reports, Settings) wajib adaptif untuk Desktop dan Mobile.
- **Mobile Bottom Navigation**: Di layar mobile, navigasi menggunakan `AppBottomBar` yang sudah terintegrasi di `AppSidebarLayout` dengan `pb-20 md:pb-0`.
- **Backend Cleanliness**: Pertahankan pattern error handling, DB transaction, dan Service layer.
- **Aturan Bisnis**: Selalu ikuti aturan multi-satuan dan pengurangan stok FEFO di `docs/PRD.md` dan `.agents/rules/business_rules.md`.

## Dokumentasi Inti
- AI Task Execution Guide: `docs/AI_DEVELOPMENT_GUIDE.md`
- Master PRD: `docs/PRD.md`
- Database Schema: `docs/DATABASE_SCHEMA.md`
- Fitur Spesifikasi: `docs/features/`
  - `01_dashboard.md`
  - `02_inventory.md`
  - `03_supplier.md`
  - `04_pos.md`
  - `05_reports.md`
  - `06_settings.md`
- Template PRD Baru: `docs/templates/PRD_TEMPLATE.md`
- Coding Guidelines: `.agents/rules/coding_guidelines.md`
- Business Domain Rules: `.agents/rules/business_rules.md`
