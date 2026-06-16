# FOODFLOW 2.1 — Premium Real-Time Food Ordering Platform

FOODFLOW 2.1 is a production-grade, startup-quality food ordering ecosystem modeled after premium applications like Uber Eats, Stripe, and Linear. It features distinct customer and admin portals, real-time WebSocket-based order progress tracking, coupon management, a live admin queue, an analytics dashboard, and audit logs.

---

## 🌟 Key Features

*   **Customer Experience**: Dynamic menu search, filters, sliding-over cart drawer, multiple saved addresses, and automatic flat/percentage coupon deductions.
*   **Real-Time Tracking**: Interactive, animated order status timeline with live progress updates driven by Socket.IO.
*   **Admin live Order Queue**: Instant order arrival notification and status change quick actions without manual page refresh.
*   **Analytics Dashboard**: Premium interactive charts (recharts) showing revenue trendlines, top foods/categories, status distributions, and key KPIs.
*   **Audit Logging**: Detailed records tracking admin operations (e.g. food creation, price edits, order cancellations, and user blocks).
*   **Premium Design System**: Dark-mode-first styling, Outfit & Inter fonts, custom glassmorphism components, and Framer Motion transitions.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 16/15 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React, Recharts, Framer Motion, TanStack Query |
| **Backend** | NestJS, TypeScript, Passport.io (JWT token rotation), Socket.IO (WebSockets) |
| **Database** | PostgreSQL, Prisma ORM |
| **Storage** | Cloudinary (with local fallback mock service) |

---

## 📂 Project Structure

```text
foodflow/
├── backend/
│   ├── prisma/             # Schema, migrations, and seed.ts script
│   └── src/
│       ├── common/         # Auth guards, status checks, decorators
│       └── modules/        # Auth, users, foods, orders, cart, coupons, websocket, audit, stats
└── frontend/
    ├── src/
    │   ├── app/            # Next.js pages (/login, /register, /customer, /admin, /about-project)
    │   ├── components/     # Shared layout (Navbar, Footer, CartDrawer, dashboard/menu UI)
    │   └── providers/      # Context providers (auth, cart, theme, query, socket)
    └── vitest.config.ts    # Frontend Vitest test setup
```

---

## 🚀 Quick Start Guide

### 1. Database Setup & Seeding

Ensure you have a PostgreSQL server running.

Configure `backend/.env` (duplicate `backend/.env.example`):
```env
DATABASE_URL="postgresql://postgres:SREEHARAN22@localhost:5432/foodflow?schema=public"
PORT=3001
JWT_ACCESS_SECRET="foodflow_jwt_access_secret_key_12345"
JWT_REFRESH_SECRET="foodflow_jwt_refresh_secret_key_12345"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"
```

Run database migrations and seed the data:
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run prisma:seed
```

The seed script creates:
*   **Admin**: `admin@foodflow.com` / `AdminPassword123!`
*   **Customer**: `customer@foodflow.com` / `CustomerPassword123!`
*   20 foods, 5 categories, active coupons, and history logs.

### 2. Running the Backend Dev Server

```bash
cd backend
npm run start:dev
```

The backend API will start on [http://localhost:3001/api](http://localhost:3001/api).

### 3. Running the Frontend Dev Server

Configure `frontend/.env` (duplicate `frontend/.env.example`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Launch the Next.js development server:
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

### Backend tests
Run Jest unit and e2e integration tests:
```bash
cd backend
npm run test       # Run unit tests
npm run test:e2e   # Run end-to-end integration tests
npm run test:cov   # Collect test coverage reports (80%+ target)
```

### Frontend tests
Run Vitest tests:
```bash
cd frontend
npm run test       # Run component math & form validation tests
```

---

## 📖 Extended Documentation

For deeper details, consult the following specialized guides in the project root:
*   [ARCHITECTURE.md](file:///c:/Users/Zreehrn/sprint3/ARCHITECTURE.md): Data flow pipelines, WebSocket handshakes, and system boundaries.
*   [DATABASE_SCHEMA.md](file:///c:/Users/Zreehrn/sprint3/DATABASE_SCHEMA.md): Entity Relationship dictionary, field mappings, and indexing strategies.
*   [API_CONTRACTS.md](file:///c:/Users/Zreehrn/sprint3/API_CONTRACTS.md): REST resources and WebSocket event payloads.
*   [DEPLOYMENT_GUIDE.md](file:///c:/Users/Zreehrn/sprint3/DEPLOYMENT_GUIDE.md): Railway, Neon, and Vercel cloud setup.
*   [TESTING_GUIDE.md](file:///c:/Users/Zreehrn/sprint3/TESTING_GUIDE.md): Quality assurance, unit coverage, and regression checks.
