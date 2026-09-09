Product Requirements Document (PRD)
1. Product Overview
Product Name

StockFlow

Product Type

Backend REST API untuk sistem Point of Sale (POS) dan Inventory Management.

Product Description

StockFlow adalah sistem backend yang membantu bisnis retail mengelola produk, kategori, stok barang, transaksi penjualan, dan pengguna berdasarkan role mereka.

Sistem dirancang sebagai representasi sederhana dari workflow yang umum ditemukan dalam ERP, khususnya pada area:

Inventory Management
Sales Transaction
User Management
Role-Based Access Control

StockFlow tidak bertujuan menjadi ERP lengkap seperti SAP atau Odoo. Produk ini berfokus pada beberapa domain bisnis utama agar dapat dikembangkan dengan arsitektur yang realistis dan maintainable.

2. Problem Statement

Bisnis retail membutuhkan sistem untuk mencatat produk dan transaksi penjualan secara konsisten.

Tanpa sistem yang terintegrasi, beberapa masalah dapat terjadi:

Stok barang tidak akurat.
Stok dapat menjadi negatif.
Riwayat transaksi sulit dilacak.
Semua pengguna memiliki akses yang sama terhadap data sensitif.
Kesalahan transaksi dapat menyebabkan data tidak konsisten.

Contoh masalah kritis:

Dua kasir menjual produk yang sama pada waktu hampir bersamaan.

Stock tersedia: 1

Kasir A membaca stock = 1
Kasir B membaca stock = 1

Kasir A menjual barang
Kasir B menjual barang

Hasil:
Stock = -1

Sistem harus dirancang agar kondisi seperti ini dapat dicegah.

3. Product Goals

StockFlow bertujuan untuk:

Mengelola data produk dan kategori.
Mengelola stok barang secara konsisten.
Memproses transaksi penjualan.
Mengurangi stok secara otomatis ketika transaksi berhasil.
Menjaga konsistensi data menggunakan database transaction.
Membatasi akses berdasarkan role pengguna.
Menyediakan REST API yang terdokumentasi.
Menyediakan aplikasi backend yang dapat dijalankan menggunakan Docker.
4. Non-Goals

Versi pertama StockFlow tidak mencakup:

Accounting lengkap.
Payroll.
Human Resource Management.
Supplier management kompleks.
Multi-company ERP.
Marketplace integration.
Machine learning forecasting.

Fitur-fitur tersebut dapat menjadi pengembangan di masa depan.

5. Target Users
Admin

Memiliki akses penuh terhadap manajemen sistem.

Admin dapat:

Mengelola user.
Mengelola role.
Mengelola kategori.
Mengelola produk.
Melihat transaksi.
Manager

Bertanggung jawab terhadap inventory.

Manager dapat:

Menambahkan produk.
Mengubah produk.
Menambah stok.
Melihat inventory.
Melihat transaksi.

Manager tidak dapat mengelola user administrator.

Cashier

Bertanggung jawab terhadap transaksi penjualan.

Cashier dapat:

Melihat produk.
Melihat stok yang tersedia.
Membuat transaksi penjualan.
Melihat transaksi yang relevan.

Cashier tidak dapat:

Menambahkan produk.
Menambah stok.
Mengubah role pengguna.
6. Core Features
6.1 Authentication

User dapat:

Register.
Login.
Mendapatkan access token.
Mengakses endpoint berdasarkan authentication.

Sistem menggunakan:

JWT Authentication

Password tidak boleh disimpan dalam bentuk plain text.

Password harus di-hash menggunakan:

bcrypt
6.2 Role-Based Access Control

Setiap user memiliki role.

Role awal:

ADMIN
MANAGER
CASHIER

Authorization dilakukan melalui middleware.

Contoh:

POST /products

Allowed:
ADMIN
MANAGER

Denied:
CASHIER
6.3 Category Management

Admin dan Manager dapat:

Membuat kategori.
Melihat kategori.
Mengubah kategori.
Menghapus kategori.

Contoh:

Food
Drink
Electronics
Stationery
6.4 Product Management

Produk memiliki informasi:

Name
SKU
Price
Category
Current Stock

Admin dan Manager dapat:

Membuat produk.
Mengubah produk.
Menghapus produk.
Melihat daftar produk.
6.5 Inventory Management

Manager dapat menambahkan stok.

Setiap perubahan stok harus tercatat.

Contoh:

Initial Stock: 10

Stock Added: +20

Current Stock: 30

Sistem juga menyimpan riwayat perubahan stok.

Contoh:

INVENTORY MOVEMENT

Product: Coca Cola

Type: STOCK_IN

Quantity: 20

Previous Stock: 10

New Stock: 30
6.6 Sales Transaction

Cashier dapat membuat transaksi penjualan.

Contoh request:

{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 5,
      "quantity": 1
    }
  ]
}

Sistem akan:

Memvalidasi produk.
Mengecek stok.
Mengurangi stok.
Membuat transaction record.
Membuat transaction items.
Menghitung total harga.
Menyimpan semua perubahan secara atomic.
7. Critical Business Rules
Rule 1 — Stock Cannot Be Negative

Stok tidak boleh kurang dari nol.

IF requested_quantity > available_stock

THEN

Reject transaction
Rule 2 — Transaction Must Be Atomic

Jika salah satu item gagal diproses:

Transaction must rollback

Contoh:

Product A → Success

Product B → Stock insufficient

Result:

Product A stock must return to original value.

Tidak boleh terjadi kondisi:

Half transaction completed.
Rule 3 — Transaction Price Must Be Recorded

Harga produk dapat berubah di masa depan.

Contoh:

Today:

Coca Cola = Rp10.000

Tomorrow:

Coca Cola = Rp12.000

Transaksi lama harus tetap menyimpan harga:

Rp10.000

Karena itu transaction item menyimpan:

unit_price

Harga tidak boleh hanya diambil dari tabel product saat transaksi lama dibaca.

Rule 4 — Inventory Changes Must Be Traceable

Perubahan stok tidak boleh terjadi tanpa jejak.

Semua perubahan harus menghasilkan:

InventoryMovement
8. Success Criteria

Versi MVP dianggap berhasil jika:

User dapat login.
Role-based authorization berjalan.
Produk dapat dikelola.
Stok dapat ditambahkan.
Transaksi dapat dibuat.
Stok otomatis berkurang.
Stok tidak dapat negatif.
Database transaction berjalan.
API dapat dijalankan melalui Docker.
API memiliki dokumentasi.
9. MVP Scope

Fitur MVP:

Authentication
        ↓
Users & Roles
        ↓
Categories
        ↓
Products
        ↓
Inventory
        ↓
Sales Transaction
        ↓
Transaction History
10. Future Improvements
