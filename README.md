# 🍔 FOODFLOW 4.1 — Enterprise Multi-Vendor Food Ordering Platform

[![Next.js](https://img.shields.io/badge/Next.js-16%2F15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.20-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payment-blue?style=for-the-badge&logo=razorpay)](https://razorpay.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](https://opensource.org/licenses/MIT)

FOODFLOW 4.1 is a production-grade, enterprise-scale **Multi-Vendor Food Ordering Platform** designed for seamless interactions between **Customers**, **Restaurant Admins (Vendors)**, and **Super Administrators**.

Built on a modern decoupled stack featuring **Next.js 16/15 (App Router)** and **NestJS 11**, the platform delivers a fast, responsive, and real-time experience using WebSockets, dynamic dashboard analytics, secure JWT token rotation, Google OAuth, and integrated Razorpay payments.

---

## 📖 Table of Contents
1. [Project Description](#-project-description)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [System Architecture Overview](#-system-architecture-overview)
5. [Folder Structure](#-folder-structure)
6. [Prerequisites](#-prerequisites)
7. [Installation Instructions](#-installation-instructions)
8. [Environment Variables Setup](#-environment-variables-setup)
9. [Database Setup](#-database-setup)
10. [Running the Database](#-running-the-database)
11. [Running the Backend](#-running-the-backend)
12. [Running the Frontend](#-running-the-frontend)
13. [API Overview](#-api-overview)
14. [Authentication Flow](#-authentication-flow)
15. [User Roles and Permissions](#-user-roles-and-permissions)
16. [Deployment Instructions](#-deployment-instructions)
17. [Screenshots](#-screenshots)
18. [Future Enhancements](#-future-enhancements)
19. [Contributing Guidelines](#-contributing-guidelines)
20. [License](#-license)
21. [Developer Information](#-developer-information)

---

## 📝 Project Description

FOODFLOW 4.1 shifts from a single-restaurant model to a full-fledged **Multi-Vendor Marketplace** structure. 
* Customers browse local approved restaurants, place consolidated cart orders, make payments via Razorpay, and track delivery progress in real time.
* Restaurant Admins register their storefronts, manage menus (items, availability, dietary classifications), process incoming orders, and review customer feedback.
* Super Admins govern the entire platform, approving or rejecting restaurant applications, managing global user states, and tracking comprehensive platform analytics.

---

## 🌟 Key Features

### 👤 Customer Experience
* **Dynamic Menu & Discovery**: Advanced search, filtering by category, vegetarian/non-vegetarian preferences, trending items, and bestseller badges.
* **Smart Shopping Cart**: Seamless cart management with auto-saved states.
* **Coupon & Discount Engine**: Automated checkout deductions supporting global and restaurant-specific flat or percentage-based coupons.
* **Interactive Checkout**: Quick address selection and saving, tax calculations, and instant Razorpay payment gateway integration.
* **Real-Time Order Tracking**: Dynamic, animated status timeline showing order progress (`PENDING` ➔ `CONFIRMED` ➔ `PREPARING` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`) powered by WebSockets.
* **Restaurant Reviews**: Rating and commenting system for ordered food items.

### 🏪 Restaurant Admin (Vendor) Dashboard
* **Storefront Management**: Configure logo, description, and physical address.
* **Live Order Queue**: Real-time order dispatch board with instant sound/visual arrival alerts.
* **Menu Builder**: CRUD operations on food items with image uploads (Cloudinary integrated) and availability flags.
* **Coupon Creator**: Create custom coupon codes restricted to the vendor's storefront.
* **Business Analytics**: Track revenue metrics, popular categories, and order statistics over time.

### 🛡️ Super Admin Control Center
* **Vendor Approval Pipeline**: Approve, reject, or suspend restaurant registrations.
* **Platform Security**: Block or unblock users (Customers or Vendors) globally.
* **Audit Logger**: Platform-wide activity logging for actions such as user blocks, category updates, and platform configurations.
* **Aggregated Dashboard**: Global statistics showing total platform sales, system status, active vendors, and user distribution.

---

## 🛠️ Technology Stack

### Frontend
* **Core Framework**: Next.js 16/15 (App Router)
* **Programming Language**: TypeScript
* **Styling & Theme**: Tailwind CSS v4 (Sleek Dark Mode first design, custom glassmorphism)
* **Animation**: Framer Motion
* **Interactive Elements**: Three.js / React Three Fiber (Optional premium layout scenes)
* **Charts**: Recharts
* **State & Data Fetching**: TanStack React Query & Axios
* **Real-time Engine**: Socket.IO Client

### Backend
* **Core Framework**: NestJS 11
* **Database Driver**: Prisma ORM
* **Real-time Server**: Platform Socket.IO (WebSockets)
* **Task Management**: RxJS

### Database & Security
* **Relational Database**: PostgreSQL 16
* **Authentication**: Stateless JSON Web Tokens (JWT) with Refresh Token Rotation
* **Social Identity**: Google OAuth 2.0 (Passport-Google)

### External Integrations
* **Payments**: Razorpay Node SDK
* **Emails**: Resend API (For transactional onboarding/order emails)
* **Storage**: Cloudinary CDN (For restaurant logos and food item images, with local mock fallback)

---

## 🏗️ System Architecture Overview

The system operates on a decoupled client-server architecture. Communication between Next.js and NestJS occurs through HTTP RESTful endpoints and bi-directional WebSockets (Socket.IO).

```mermaid
graph TD
    subgraph Client App [Next.js Client Applications]
        Customer[Customer Portal]
        VendorAdmin[Restaurant Admin Dashboard]
        SuperAdmin[Super Admin Control Center]
    end

    subgraph API Gateway [NestJS Server / WebSockets Gateway]
        Auth[Auth Service]
        OrderSys[Order & Payment Processor]
        RealTime[Socket.IO WS Server]
        AdminModule[Super-Admin Controller]
        Prisma[Prisma ORM Client]
    end

    subgraph External Cloud Services
        Razorpay[Razorpay API]
        Cloudinary[Cloudinary Media CDN]
        Resend[Resend Email API]
        GoogleOAuth[Google Identity Services]
    end

    subgraph Storage Layer
        PostgreSQL[(PostgreSQL Relational DB)]
    end

    %% Connections
    Customer & VendorAdmin & SuperAdmin -->|HTTPS REST Request| Auth & OrderSys & AdminModule
    Customer & VendorAdmin -->|WebSockets Room Subscriptions| RealTime
    OrderSys -->|Process Payment| Razorpay
    AdminModule -->|Upload Images| Cloudinary
    Auth -->|Social Authenticate| GoogleOAuth
    OrderSys -->|Send Confirmation| Resend
    Auth & OrderSys & AdminModule --> Prisma
    Prisma --> PostgreSQL
    RealTime -->|Emit Status Changes| Customer & VendorAdmin
```

---

## 📂 Folder Structure

```text
foodflow/
├── backend/
│   ├── prisma/                 # Database schema, migration logs, and seed.ts
│   ├── src/
│   │   ├── common/             # Auth guards, request filters, status checks, interceptors
│   │   ├── modules/
│   │   │   ├── audit/          # Administrative audit trail logger
│   │   │   ├── auth/           # JWT credentials signup/login and Google OAuth
│   │   │   ├── cart/           # User shopping cart operations
│   │   │   ├── categories/     # Restaurant and system food categories
│   │   │   ├── cloudinary/     # CDN asset uploads with local fallback service
│   │   │   ├── coupons/        # Global & vendor coupon rules
│   │   │   ├── dashboard/      # Analytics aggregator for admins
│   │   │   ├── email/          # Resend API email triggers
│   │   │   ├── foods/          # Food inventory database rules
│   │   │   ├── orders/         # Order creation & checkout
│   │   │   ├── payments/       # Razorpay webhook and validation
│   │   │   ├── reviews/        # Food & Restaurant rating and review logs
│   │   │   ├── super-admin/    # Super Admin configuration tools
│   │   │   ├── users/          # Address and user profile state
│   │   │   └── websocket/      # Socket.IO Gateway for live event subscriptions
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js routes (/customer, /admin, /super-admin)
│   │   ├── components/         # Shared layouts, visual UI elements, wrappers
│   │   ├── providers/          # React contexts (Auth, Theme, Cart, React Query, Sockets)
│   │   ├── services/           # Axios network controllers for endpoints
│   │   ├── utils/              # Client-side formulas, formatters, and assets
│   │   └── __tests/            # Vitest unit test files
│   ├── package.json
│   └── vitest.config.ts
├── API_CONTRACTS.md            # Route details and schema layouts
├── ARCHITECTURE.md             # Detailed data models and sequence diagrams
├── DATABASE_SCHEMA.md          # Database ER-Diagram and specifications
└── README.md                   # Project Root Information
```

---

## ⚡ Prerequisites

Before installing the application, ensure you have the following installed:
* **Node.js**: `v20.x` or higher (Includes `npm`)
* **PostgreSQL**: `v15.x` or `v16.x` database running locally or in the cloud (e.g., Neon).
* **Git**: To clone the repository and manage version control.

---

## ⚙️ Environment Variables Setup

You must configure environment variables in both the `backend` and `frontend` folders before booting the servers.

### 1. Backend Environment Variables (`backend/.env`)
Create a file named `.env` in the `backend/` directory by copying the example file:
```bash
cp backend/.env.example backend/.env
```

Define the configuration keys:
```env
# Database Config
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/foodflow?schema=public"
PORT=3001

# JWT Secrets
JWT_ACCESS_SECRET="generate-a-strong-random-key-here"
JWT_REFRESH_SECRET="generate-another-strong-random-key-here"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# Google OAuth Credentials
GOOGLE_CLIENT_ID="your-google-client-id-here"
GOOGLE_CLIENT_SECRET="your-google-client-secret-here"
GOOGLE_CALLBACK_URL="http://localhost:3000/login"

# Email Configuration (Resend API)
RESEND_API_KEY="re_your_resend_api_key"
EMAIL_FROM="FOODFLOW <onboarding@resend.dev>"

# Cloudinary Integration (Image Uploads)
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Razorpay Payment Gateway
RAZORPAY_KEY_ID="rzp_test_your_key_id_here"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret-here"
```
> ⚠️ **Note**: If you do not configure Cloudinary credentials, the application automatically uses a mocked fallback image upload controller, mapping placeholder visuals.

### 2. Frontend Environment Variables (`frontend/.env.local`)
Create a file named `.env.local` inside the `frontend/` folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here
```

---

## 🗄️ Database Setup

Ensure your PostgreSQL service is active.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the database migration script. This establishes tables, foreign keys, and indexes:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Seed the database with sample users, restaurants, menu items, coupons, and mock order histories:
   ```bash
   npm run prisma:seed
   ```

### 🔐 Default Seed Credentials
The database seed script generates accounts for quick testing:

| Role | Email | Password | Assigned Restaurant / Details |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `owner@foodflow.com` | `SuperAdminPassword123!` | Manages global approval pipelines & user states |
| **Restaurant Admin** | `admin@foodflow.com` | `Admin@123` | Owns **Malabar Kitchen** (Status: `APPROVED`) |
| **Restaurant Admin** | `vendor-north@foodflow.com` | `Admin@123` | Owns **Punjab Grill** (Status: `APPROVED`) |
| **Restaurant Admin** | `vendor-chinese@foodflow.com` | `Admin@123` | Owns **Chinatown Express** (Status: `PENDING`) |
| **Customer** | `customer@foodflow.com` | `CustomerPassword123!` | Test Customer Profile |

---

## 🏃 Running the Database

### Option A: Cloud Instance (Neon.tech)
1. Sign up on [Neon](https://neon.tech/) and create a database named `foodflow`.
2. Grab the connection string from your dashboard.
3. Configure `DATABASE_URL` inside `backend/.env` containing the connection string with `?sslmode=require`.

### Option B: Local PostgreSQL (Docker CLI)
If you prefer running a database locally using Docker, run this command to boot a PostgreSQL container:
```bash
docker run --name foodflow-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=SREEHARAN22 -e POSTGRES_DB=foodflow -p 5432:5432 -d postgres:16
```
Update your `DATABASE_URL` in `backend/.env` accordingly:
```env
DATABASE_URL="postgresql://postgres:SREEHARAN22@localhost:5432/foodflow?schema=public"
```

---

## 🚀 Running the Backend

With dependencies installed and the database successfully seeded:

1. Start the development backend API server:
   ```bash
   cd backend
   npm run start:dev
   ```
2. The server spins up at: `http://localhost:3001/api`
3. WebSocket handshake gateway triggers at: `http://localhost:3001`
4. Run Jest unit and integration tests to verify correctness:
   ```bash
   npm run test
   ```
5. Run end-to-end integration tests:
   ```bash
   npm run test:e2e
   ```

---

## 💻 Running the Frontend

To boot the Next.js client application:

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the hot-reloading development server:
   ```bash
   npm run dev
   ```
4. Access the web application on: `http://localhost:3000`
5. Run component and mathematical tests using Vitest:
   ```bash
   npm run test
   ```

---

## 📡 API Overview

### REST Endpoints Summary

| Endpoint | HTTP Method | Guard / Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Register a new customer |
| `/api/auth/login` | `POST` | Public | Authenticate credentials and rotate JWT |
| `/api/auth/refresh` | `POST` | Public | Refresh expired access tokens |
| `/api/users/addresses` | `GET` | `CUSTOMER` | List saved address entries |
| `/api/users/addresses` | `POST` | `CUSTOMER` | Create and save a new address |
| `/api/foods` | `GET` | Public | List and search food menu items |
| `/api/foods` | `POST` | `ADMIN` (Vendor) | Add new food menu item |
| `/api/cart` | `GET` | `CUSTOMER` | Retrieve current cart items |
| `/api/cart/items` | `POST` | `CUSTOMER` | Add items to cart |
| `/api/orders` | `POST` | `CUSTOMER` | Initiate checkout and place order |
| `/api/orders/:id/status` | `PATCH` | `ADMIN` | Update order status and emit websocket event |
| `/api/super-admin/vendors`| `GET` | `SUPER_ADMIN` | View restaurant registration pipeline |
| `/api/super-admin/vendors/:id/status` | `PATCH` | `SUPER_ADMIN` | Change vendor status (Approve/Reject/Suspend) |

### WebSocket Event Signals

| Inbound Event (Client ➔ Server) | Payload | Purpose |
| :--- | :--- | :--- |
| `joinOrderRoom` | `{ orderId: string }` | Subscribe to order-specific lifecycle updates |
| `joinAdminRoom` | None | Subscribe to real-time incoming order feeds (Admin only) |

| Outbound Event (Server ➔ Client) | Payload | Purpose |
| :--- | :--- | :--- |
| `order.created` | `{ order: Order }` | Emitted to vendor's live queue dashboard |
| `order.updated` | `{ status: OrderStatus }` | Emitted to customer to update tracking page |

---

## 🔒 Authentication Flow

FoodFlow uses JWT Access Token (15-minute lifespan) and Refresh Token (7-day lifespan) rotation schemas alongside Google OAuth.

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    actor Google
    participant API as NestJS Backend
    participant DB as PostgreSQL DB

    Note over Customer, API: JWT Credentials Flow
    Customer->>API: POST /api/auth/login (email, password)
    API->>DB: Fetch user & verify bcrypt password hash
    API->>DB: Generate Refresh Token & save
    API-->>Customer: Return Access Token & Rotated Refresh Token
    Note over Customer: Save credentials in secure client storage

    Note over Customer, API: Token Expiration & Renewal
    Customer->>API: GET /api/cart (Expired Access Token)
    API-->>Customer: 401 Unauthorized Response
    Customer->>API: POST /api/auth/refresh (send Refresh Token)
    API->>DB: Match Refresh Token & verify expirations
    API->>DB: Invalidate old Refresh Token & Save new token
    API-->>Customer: Return new Access Token & new Refresh Token
    Customer->>API: Resend GET /api/cart with new Access Token
    API-->>Customer: 200 OK (Cart Payload)
```

---

## 👥 User Roles and Permissions

The application uses role-based security controls to guarantee separation of duties:

```
┌─────────────────────────────────────────────────────────────┐
│                      SUPER_ADMIN                            │
│   • Approve / reject restaurant signups                     │
│   • Block / unblock users globally                          │
│   • Read system logs and aggregated metrics                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            │               ADMIN                 │
            │   • Edit restaurant storefront      │
            │   • Manage menus and categories     │
            │   • Process orders / update statuses│
            │   • Create store-specific coupons   │
            └──────────────────┬──────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            │             CUSTOMER                │
            │   • Search menu items               │
            │   • Manage addresses & carts        │
            │   • Pay via Razorpay                │
            │   • Track orders & leave reviews    │
            └─────────────────────────────────────┘
```

---

## 📦 Deployment Instructions

### Database (Neon.tech)
1. Provision a PostgreSQL project on Neon.
2. Select your closest server location and get the connection string.
3. Replace your production server `DATABASE_URL` variable with the Neon URI.

### Backend (Railway)
1. Sign in to [Railway](https://railway.app/).
2. Setup a project connected to your Github Repository.
3. Configure the Root Directory to `/backend`.
4. Inject all backend environment variables (`DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, etc.).
5. Railway compiles the NestJS project using the build command `npm run build` and automatically runs database migrations on boot.

### Frontend (Vercel)
1. Connect Vercel to your repository.
2. Set the Root Directory to `/frontend`.
3. Select the **Next.js** framework preset.
4. Set the environment variable `NEXT_PUBLIC_API_URL` to point to the production Railway URL (e.g. `https://your-backend.railway.app/api`).
5. Complete deployment. Vercel optimizes static pages, sets up serverless functions, and assigns a domain name.

---

## 🖼️ Screenshots

*Place screenshots here to showcase your beautiful visual designs:*

| Page | Mobile View | Desktop View |
| :--- | :--- | :--- |
| **Customer Marketplace** | *[Placeholder for Customer Menu]* | *[Placeholder for Customer Desktop Menu]* |
| **Order Progress Tracking** | *[Placeholder for Live Track Timeline]* | *[Placeholder for Live Track Timeline]* |
| **Vendor Admin Queue** | *[Placeholder for Incoming Live Queue]* | *[Placeholder for Incoming Live Queue]* |
| **Super Admin Dashboard** | *[Placeholder for Admin Status Grid]* | *[Placeholder for Admin Status Grid]* |

---

## 🔮 Future Enhancements

* **AI Dish Recommendation Engine**: Generate flavor profile matches based on historic customer orders.
* **Driver Mobile Application**: Dedicated React Native app for delivery partners with live geolocation mapping.
* **Aggregated Group Carts**: Real-time collaborative cart sharing where groups of users can add items together.
* **Multi-Currency Support**: Dynamic checkout scaling currency metrics relative to geographic location.

---

## 🤝 Contributing Guidelines

We welcome contributions to FOODFLOW! Follow these steps:

1. **Fork the Repository**: Clone the project onto your local GitHub account.
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/cool-new-feature
   ```
3. **Commit Your Changes**: Add detailed descriptions to your commits following conventional format guidelines:
   ```bash
   git commit -m "feat: integrate group-cart functionality"
   ```
4. **Push to Your Branch**:
   ```bash
   git push origin feature/cool-new-feature
   ```
5. **Open a Pull Request**: Detail the changes, test cases run, and screenshot updates for visual elements.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more details.

---

## 👤 Developer Information

* **Project Name**: FOODFLOW 4.1
* **Developer Name**: Sreeharan M Anilkumar
* **Contact Email**: `sreeharanma@gmail.com`
* **GitHub Profile**: [sreeharan-debug](https://github.com/sreeharan-debug)
* **Linked In**: [Sreeharan M Anilkumar Profile](www.linkedin.com/in/sreeharan-m-anilkumar-8853a1351)

---
*Created and maintained with ❤️ for FOODFLOW 4.1 Enterprise Marketplace.*
