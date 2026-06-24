# FOODFLOW 4.1: Cloud-Based Multi-Vendor Food Ordering SaaS
## Internship Project Report

**Submitted By:**  
Sreeharan M Anilkumar  
Register No: MEC23AIM006  
B.Tech, Artificial Intelligence & Machine Learning  

**Host Organization:**  
Bairuha Tech  
Mentors: Ambika Raj, Ressaan  

---

## Executive Summary
This report details the architectural design, full-stack development, and cloud deployment of **FOODFLOW 4.1**, an enterprise-grade, multi-vendor food ordering Software-as-a-Service (SaaS) ecosystem. Bridging the gap between academic theory and practical software engineering, this project demonstrates end-to-end full-stack development. The platform connects customers, local restaurant vendors, and platform administrators through dedicated, isolated portals. It integrates secure token-based authentication, real-time WebSocket state synchronizations, Google OAuth identity federation, automated transaction emails, and the Razorpay payment gateway. This report outlines the system requirements, architectural patterns, technical implementation details, major features (including a specialized Cash on Delivery flow and dynamic invoicing), technical challenges overcome, and internship learning outcomes.

---

## 1. Introduction & Problem Domain

### 1.1 Problem Statement
Traditional local food ordering systems suffer from fragmented user workflows, lack of scalability, and limited analytical capabilities. Small local restaurants and independent kitchens often lack the capital to invest in affordable, specialized software to manage online ordering, menu configuration, and sales auditing. Customers face disjointed order-tracking experiences, while platform owners struggle to govern vendor onboarding, enforce marketplace policies, or generate dynamic transactional documents.

### 1.2 Project Objectives
To address these bottlenecks, the objectives of this internship project were to:
- **Build a Scalable Multi-Vendor Platform**: Design a decoupled, multi-tenant architecture allowing independent restaurant vendors to manage separate menus and orders.
- **Provide Role-Based Portals**: Construct isolated user experiences for Customers, Restaurant Admins (Vendors), and Super Administrators.
- **Enforce Security & Data Isolation**: Implement secure authentication (JWT with refresh rotation) and row-level multi-tenant database isolation.
- **Enable Real-Time Operations**: Integrate WebSockets for live status updates and alerts on active orders.
- **Integrate Transactional Systems**: Embed secure payments (Razorpay), automated email notifications (Resend), and dynamic invoicing.

---

## 2. Technology Stack & Architecture

FOODFLOW 4.1 utilizes a decoupled client-server architecture. The system is designed to scale independently, maintaining separation of concerns between presentation, business logic, and storage layers.

| Layer | Technologies | Role / Rationale |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16/15 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Recharts | Deliver a fast, responsive, and SEO-optimized user interface with smooth animations and dynamic data visualizations. |
| **Backend** | NestJS 11, Node.js, Socket.IO, Passport.js | Provide a modular, structured, and enterprise-ready REST API gateway and WebSocket server. |
| **Database** | PostgreSQL 16 (Neon Cloud), Prisma ORM | Ensure high-performance relational storage, schema safety, query optimization, and transaction control. |
| **Authentication** | JWT (Refresh Token Rotation), Google OAuth 2.0 | Enforce secure, stateless authentication and social login integration. |
| **Integrations** | Razorpay SDK, Resend API, Cloudinary | Handle online checkout payments, transactional emails, and CDN media storage. |
| **Deployment** | Vercel (Frontend), Railway (Backend) | Deliver continuous integration and reliable global application delivery. |

---

## 3. System Implementation & Deliverables

### 3.1 Database Design (Prisma Schema)
The database structure leverages a highly normalized PostgreSQL schema. The core entities include:
- **User**: Represents platform users with distinct roles (`CUSTOMER`, `ADMIN`, `SUPER_ADMIN`).
- **Restaurant**: Represents physical vendor kitchens with status tracking (`PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`).
- **Food & Category**: Models menus hierarchically with dietary tags (Veg/Non-Veg), availability flags, and pricing.
- **Order & OrderItem**: Records purchase details, capturing pricing snapshots at checkout.
- **Payment & Invoice**: Tracks Razorpay transaction IDs, payment statuses, and downloadable PDF invoices.
- **AuditLog**: Automatically logs platform-wide administrative actions for traceability.

### 3.2 System Modules

#### Module A: The Customer Portal
Designed for discovery and checkout:
- **Restaurant Discovery**: Search and horizontally scrollable category selectors (Biryanis, Arabian, Desserts, etc.) with Veg/Non-Veg toggles.
- **Cart & Coupon Validation**: Local state preservation with real-time backend verification of promotional codes.
- **Animated Checkout**: Integration of delivery address selectors, tax/discount calculations, and Razorpay modal overlays.
- **Live Order Tracking**: Dynamic timeline updates powered by WebSockets, tracking the kitchen lifecycle (`PENDING` ➔ `CONFIRMED` ➔ `PREPARING` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`).

#### Module B: The Restaurant Admin Console
A vendor dashboard with multi-tenant isolation:
- **Live Order Board**: Real-time incoming order queue with audible alerts.
- **Inventory Builder**: Menu CRUD operations, price configuration, and category tagging.
- **Sales Analytics**: Recharts-driven visual analytics mapping revenue trends (last 7 days), order status distributions, and top-selling food categories.

#### Module C: The Super Admin Control Center
The central command console:
- **Merchants Registry**: Approve, suspend, or reinstate onboarding restaurants.
- **User Management**: Monitor registrations and enforce security blocks on suspicious accounts.
- **Financial Audit**: Centralized feed tracking platform orders, payments, and generated invoices.

---

## 4. Key Engineering Deliverables

During the final phase of development, two major engineering challenges were resolved: the **Cash on Delivery (COD) Payment Flow** and **Dynamic Invoicing**.

### 4.1 Cash on Delivery Razorpay Bypass
Previously, the system initialized the Razorpay payment gateway for all checkouts. To accommodate door-step cash payments, we implemented a bypass:
1. **Frontend Integration**: Updated the checkout interface to pass the selected payment method. If `COD` is chosen, the frontend clears the cart and redirects the user directly to the order tracking page, completely bypassing the Razorpay script execution.
2. **Backend Logic**: Modified `OrdersService.checkout` to skip Razorpay order creation for COD. The order is placed immediately in `PENDING` status.
3. **Data Integrity**: We utilized a zero-record design pattern in the database. Orders placed via COD do not create preliminary records in the `Payment` table, distinguishing them from online orders without requiring database schema migrations.

### 4.2 Dynamic Invoicing & Lifecycle Completion
A critical requirement was closing the payment loop for COD orders:
1. **Invoicing Trigger**: When a store admin updates a COD order status to `DELIVERED`, the system automatically marks `paymentStatus` as `PAID`.
2. **Dynamic PDF Generation**: The `InvoiceService` was updated to dynamically generate the PDF. For COD orders, it lists `Cash on Delivery` as the Payment Method, sets the Transaction ID to `N/A`, and marks the Payment Status as `PAID`.
3. **Transactional Delivery**: The system saves the invoice PDF to CDN storage, creates a database record, and emails the PDF as an attachment to the customer via the Resend API, completing the transaction loop automatically.

---

## 5. Technical Challenges & Solutions

- **Timezone-Safe Analytics**: Solved discrepancies in dashboard charts by standardizing server-side dates in UTC and parsing them on the client relative to the local time, avoiding missing data points at day boundaries.
- **Node Environment PATH Issue on Windows Host**: During local deployment testing, the global NVM node path symlink was broken due to profile directory mismatches (`C:\Users\sreeharan` vs. `C:\Users\Zreehrn`). Resolved by configuring absolute binary paths pointing to AppData local runtimes and appending the executable folders to the shell environment dynamically.
- **Tenant Data Isolation**: Implemented NestJS guards that cross-reference the user's validated JWT payload (`user.restaurant.id`) against the database request query parameter `restaurantId`, ensuring vendors can never view or update another store's orders or revenue metrics.

---

## 6. Internship Learning Outcomes & Conclusion

### 6.1 Practical Skills Acquired
- **Enterprise Design Patterns**: Mastered NestJS modular architecture, dependency injection, and Prisma client transactions.
- **Real-Time Web Application Engineering**: Gained experience in Next.js App Router layout optimizations, React Query cache invalidations, and WebSocket room management.
- **Secure Payment & Systems Integration**: Learned to securely integrate payment gateways, cryptographic signature verification (HMAC SHA256), and external transactional mailing systems.
- **Cloud Infrastructure Deployment**: Acquired skills in environment variable injection, database migrations, and pipeline deployment on Railway and Vercel.

### 6.2 Conclusion
The internship at **Bairuha Tech** facilitated the successful delivery of **FOODFLOW 4.1**. By taking the application from an initial conceptual state to a fully integrated, multi-vendor food commerce SaaS platform, the project demonstrated production-grade stability, role isolation, real-time sync, and flexible checkout flows. This experience has significantly strengthened my understanding of modern full-stack development, cloud-native architecture, and secure software engineering principles.
