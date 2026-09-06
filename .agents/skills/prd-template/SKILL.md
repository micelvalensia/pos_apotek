---
name: prd-template
description: >-
  Use this skill when designing new feature specifications, authoring PRD files, or detailing module requirements for the POS Apotek project.
---

# Feature PRD & Specification Authoring Skill

Skill ini memandu penulisan dokumen spesifikasi kebutuhan produk (PRD) yang konsisten dan siap dieksekusi.

---

## 1. Lokasi Dokumen
- Master PRD: `docs/PRD.md`
- Skema Database: `docs/DATABASE_SCHEMA.md`
- Spesifikasi Modul Fitur: `docs/features/XX_feature_name.md`
- Template Standar: `docs/templates/PRD_TEMPLATE.md`

---

## 2. Struktur Wajib Dokumen Spesifikasi Fitur
Saat membuat file spesifikasi baru di `docs/features/`:

1. **Title & Ringkasan Fitur**: Jelaskan fungsi utama dan siapa penggunanya.
2. **User Flow & Mermaid Diagram**: Visualisasikan alur interaksi pengguna dari awal hingga akhir.
3. **Komponen Antarmuka (UI/UX)**: Uraikan tabel, filter pencarian, tombol aksi, dialog modal, dan responsivitas mobile.
4. **Skema & Kebutuhan Data**: Definisikan relasi tabel dan aturan validasi form.
5. **Logika Backend / Business Rules**: Cantumkan kalkulasi spesifik, pembatasan hak akses, atau query khusus.
6. **Acceptance Criteria**: Checklist kriteria yang harus dipenuhi saat fitur selesai diuji.
