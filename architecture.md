StockFlow Architecture
1. Architecture Overview

StockFlow menggunakan arsitektur:

Modular Monolith + Layered Architecture

Struktur sistem:

Client
   │
   ▼
REST API
   │
   ▼
Controller Layer
   │
   ▼
Service Layer
   │
   ▼
Repository / ORM Layer
   │
   ▼
PostgreSQL
2. High-Level Architecture
                 ┌──────────────────┐
                 │                  │
                 │     CLIENT       │
                 │                  │
                 └────────┬─────────┘
                          │
                          │ HTTP / JSON
                          ▼
                 ┌──────────────────┐
                 │                  │
                 │    REST API      │
                 │   Express.js     │
                 │                  │
                 └────────┬─────────┘
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
        ┌─────────┐ ┌─────────┐ ┌─────────────┐
        │  Auth   │ │ Product │ │ Transaction │
        └─────────┘ └─────────┘ └─────────────┘
             │            │            │
             └────────────┼────────────┘
                          ▼
                 ┌──────────────────┐
                 │                  │
                 │    PostgreSQL    │
                 │                  │
                 └──────────────────┘
3. Technology Stack
Backend
Node.js
Express.js
TypeScript
Database
PostgreSQL
ORM

Pilihan:

Prisma

Prisma digunakan untuk:

Database schema.
Migration.
Type-safe queries.
Database access.
Authentication
JWT
bcrypt
Containerization
Docker
Docker Compose
Documentation
Swagger / OpenAPI
4. Project Structure
src/

├── config/
│   ├── env.ts
│   └── database.ts
│
├── common/
│   ├── errors/
│   ├── middleware/
│   ├── utils/
│   └── types/
│
├── modules/
│
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.routes.ts
│   │   └── auth.schema.ts
│   │
│   ├── users/
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   └── user.routes.ts
│   │
│   ├── products/
│   │   ├── product.controller.ts
│   │   ├── product.service.ts
│   │   └── product.routes.ts
│   │
│   ├── categories/
│   │
│   ├── inventory/
│   │
│   └── transactions/
│
├── app.ts
└── server.ts
5. Layer Responsibilities
Controller

Controller bertanggung jawab terhadap:

HTTP Request.
HTTP Response.
Memanggil service.

Controller tidak boleh menyimpan business logic kompleks.

Contoh:

Request
   ↓
Controller
   ↓
Service
   ↓
Response
Service

Service merupakan tempat utama business logic.

Contoh:

Create Transaction

Validate Products
        ↓
Check Stock
        ↓
Calculate Total
        ↓
Create Transaction
        ↓
Update Stock
        ↓
Create Inventory Movement
Repository / ORM

Layer ini bertanggung jawab terhadap komunikasi dengan database.

Contoh:

Product.findUnique()

Product.update()

Transaction.create()
6. Database Architecture

Core entities:

User
Role
Category
Product
InventoryMovement
Transaction
TransactionItem

Relationship:

User
 │
 │ belongs to
 ▼
Role


Category
 │
 │ has many
 ▼
Product
 │
 │ has many
 ▼
InventoryMovement


Transaction
 │
 │ has many
 ▼
TransactionItem
 │
 │ belongs to
 ▼
Product
7. Core Database Model
Users
users

id
name
email
password_hash
role
created_at
updated_at
Categories
categories

id
name
created_at
updated_at
Products
products

id
name
sku
price
stock
category_id
created_at
updated_at
Inventory Movements
inventory_movements

id
product_id
type
quantity
previous_stock
new_stock
created_by
created_at

Types:

STOCK_IN
SALE
ADJUSTMENT
Transactions
transactions

id
cashier_id
total_amount
created_at
Transaction Items
transaction_items

id
transaction_id
product_id
quantity
unit_price
subtotal
8. Transaction Processing

Proses transaksi merupakan bagian paling kritis.

Flow:

POST /transactions
        │
        ▼
Validate Request
        │
        ▼
Start Database Transaction
        │
        ▼
Check Product Availability
        │
        ▼
Check Stock
        │
        ▼
Calculate Total
        │
        ▼
Create Transaction
        │
        ▼
Create Transaction Items
        │
        ▼
Reduce Product Stock
        │
        ▼
Create Inventory Movements
        │
        ▼
Commit Transaction

Jika terjadi error:

ROLLBACK
9. Preventing Negative Stock

Pendekatan sederhana:

IF stock < requested_quantity

THROW InsufficientStockError

Namun validation biasa tidak selalu cukup ketika terdapat concurrent request.

Contoh:

Stock = 1

Request A → reads stock = 1
Request B → reads stock = 1

Kedua request dapat lolos validation.

Karena itu implementasi production harus mempertimbangkan:

Database Transaction
+
Atomic Update

Contoh konsep:

UPDATE products

SET stock = stock - requested_quantity

WHERE id = product_id
AND stock >= requested_quantity

Jika:

affected rows = 0

Maka:

Insufficient Stock

Pendekatan ini lebih aman daripada hanya:

Read Stock
↓
Validate
↓
Update Stock
10. Authentication Flow
User Login
     │
     ▼
Verify Email
     │
     ▼
Verify Password
     │
     ▼
Generate JWT
     │
     ▼
Return Access Token

Request berikutnya:

Client

Authorization:

Bearer <JWT>

Middleware:

Verify Token
      │
      ▼
Extract User
      │
      ▼
Attach User To Request
      │
      ▼
Continue Request
11. Authorization Flow

Contoh:

POST /products

Request:

User
  │
  ▼
Authentication Middleware
  │
  ▼
Authorization Middleware
  │
  ▼
Check Role

Allowed roles:

ADMIN
MANAGER

Jika user:

CASHIER

Response:

403 Forbidden
12. Error Handling

Semua error harus memiliki format konsisten.

Contoh:

{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Product stock is insufficient"
  }
}

Contoh error codes:

UNAUTHORIZED
FORBIDDEN
VALIDATION_ERROR
NOT_FOUND
INSUFFICIENT_STOCK
INTERNAL_SERVER_ERROR
13. API Versioning

API menggunakan versioning:

/api/v1

Contoh:

POST /api/v1/auth/login

GET /api/v1/products

POST /api/v1/products

POST /api/v1/transactions
14. Security Considerations

Sistem harus memperhatikan:

Password hashing.
JWT expiration.
Environment variables.
Input validation.
SQL injection prevention.
Role authorization.
Error sanitization.

Secret tidak boleh disimpan di:

GitHub repository

Gunakan:

.env
15. Deployment Architecture

Local development:

Developer
     │
     ▼
Docker Compose
     │
     ├──── Backend Container
     │
     └──── PostgreSQL Container

Production:

Internet
   │
   ▼
Backend API
   │
   ▼
PostgreSQL Database
16. Future Architecture Evolution

Ketika aplikasi berkembang:

Modular Monolith
       │
       ▼
Caching Layer
       │
       ▼
Background Jobs
       │
       ▼
Message Queue
       │
       ▼
Event-Driven Components

Microservices hanya dipertimbangkan ketika terdapat kebutuhan nyata.

Bukan karena teknologi tersebut terlihat lebih modern.

17. Architecture Principles

StockFlow mengikuti prinsip:

Separation of Concerns

Setiap layer memiliki tanggung jawab berbeda.

Modular Design

Domain dipisahkan berdasarkan feature.

Database Consistency

Critical operations menggunakan database transaction.

Security by Default

Endpoint sensitif membutuhkan authentication dan authorization.

Simplicity First

Tidak menggunakan distributed architecture tanpa kebutuhan nyata.

Production-Oriented Thinking

Keputusan teknis dibuat berdasarkan reliability, maintainability, dan scalability.

