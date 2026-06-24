# FOODFLOW 4.1 — Project Presentation Slides

This document contains the slide-by-slide structure and content for the **FOODFLOW 4.1** internship presentation.

---

## Slide 1: Title Slide (Introduction)
* **Slide Title:** FOODFLOW 4.1: Cloud-Based Multi-Vendor Food Ordering SaaS
* **Sub-title:** An Enterprise-Grade Multi-Tenant Ecosystem Connecting Customers, Vendors, and Platform Administrators
* **Presenter Information:**
  * **Student Name:** Sreeharan M Anilkumar (Reg No: MEC23AIM006)
  * **Program:** B.Tech, Artificial Intelligence & Machine Learning
* **Affiliations:**
  * **Host Organization:** Bairuha Tech
  * **Mentors:** Ambika Raj, Ressaan
* **Visual Theme Idea:** Dark premium theme, sleek abstract grid background, gradient accent lines.

---

## Slide 2: Project Overview & Objectives
* **Slide Title:** Project Overview & Objectives
* **Problem Statement:**
  * Traditional local food ordering workflows are fragmented and lack row-level multi-tenant database isolation.
  * Local restaurant vendors lack affordable, enterprise-level menu builders and live order queues.
  * Customers experience poor real-time status updates and disjointed payment flows.
* **Core Project Objectives:**
  * **Multi-Tenant SaaS Architecture:** Provide clean database and portal isolation for independent vendors.
  * **Dedicated Portal Experiences:** Construct custom layouts for Customers, Store Admins, and Super Admins.
  * **Real-Time Synchronizations:** Utilize WebSockets to handle instantaneous order status tracking.
  * **Secure Transactions:** Integrate third-party systems like Razorpay, Resend, and Google OAuth 2.0.

---

## Slide 3: Technology Stack
* **Slide Title:** Enterprise Technology Stack
* **Frontend Ecosystem:**
  * **Framework:** Next.js 16/15 (App Router, React 19, TypeScript)
  * **Styles & Motion:** Tailwind CSS v4, Framer Motion (micro-animations), Recharts (data charts)
  * **State & Sync:** TanStack React Query, Socket.IO client (WebSockets)
* **Backend Ecosystem:**
  * **Framework:** NestJS 11, Node.js (modular architecture, dependency injection)
  * **ORM & Database:** Prisma ORM, PostgreSQL (hosted on Neon Cloud)
* **Third-Party Integrations:**
  * **Payments & Identity:** Razorpay SDK, Google OAuth 2.0 (Passport.js)
  * **Services:** Resend API (transactional emails), Cloudinary CDN (media storage)

---

## Slide 4: System Architecture
* **Slide Title:** System Architecture Overview
* **Key Architecture Design Patterns:**
  * **Decoupled Architecture:** Client (Next.js) communicates with Server (NestJS) over HTTP REST and bi-directional WebSockets (Socket.IO).
  * **Multi-Tenant Row-Level Isolation:** Shared database schema where tables filter records based on vendor tenant IDs (`restaurantId`).
  * **Stateless Authenticated Gateways:** JWT-based route access controls with automatic Refresh Token Rotation.
* **Data Flow Diagram:**
  * Next.js Portals ➔ NestJS API Gateway (JWT & Role Guards) ➔ Prisma Client ➔ PostgreSQL (Neon Cloud).
  * WebSockets (Socket.IO Server) ➔ Real-time order updates pushed directly to Frontend dashboards.

---

## Slide 5: Core Module A — The Customer Experience
* **Slide Title:** Module A: The Customer Portal
* **Key Features:**
  * **Dynamic Discovery:** Live search, scrollable category strips (Arabian, Beverages, Biryanis, etc.), and Veg/Non-Veg filters.
  * **Cart & Check-out Engine:** Local storage cart state verified dynamically with the NestJS backend for active coupons.
  * **Integrated Razorpay Checkout:** Overlay gateway processing secure digital payments and verifying signatures (HMAC-SHA256).
  * **WebSocket-Driven Live Tracking:** Real-time progress timeline showing:
    `PENDING` ➔ `CONFIRMED` ➔ `PREPARING` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`.

---

## Slide 6: Core Module B — The Restaurant Admin Console
* **Slide Title:** Module B: The Restaurant Admin Console
* **Key Features:**
  * **Vendor Analytics Dashboard:** Aggregated metrics showing Total Revenue, Total Orders, Average Order Value, and active customer counts.
  * **Revenue Trend & Item Performance:** Seven-day charts showing sales progress and popular food categories using Recharts.
  * **Live Order Queue:** Real-time incoming order boards with instant audio notifications and step-by-step preparation buttons.
  * **Menu CRUD Builder:** Vendor-specific items management with price controls, status flags, and Cloudinary-integrated media uploads.

---

## Slide 7: Core Module C — The Super Admin Command Center
* **Slide Title:** Module C: The Super Admin Command Center
* **Key Features:**
  * **Executive Platform Overview:** Centralized monitoring of total platform sales, active merchants, and registered users.
  * **Merchant Onboarding Pipeline:** Structured review screens to approve, suspend, or reject restaurant vendor applications.
  * **Platform Governance:** Capability to globally lock or unlock user accounts due to platform violations.
  * **Security Audit Logs:** Searchable audit feeds logging system configuration updates, status changes, and administrative actions.

---

## Slide 8: Key Engineering Deliverables — COD Razorpay Bypass
* **Slide Title:** Cash on Delivery (COD) Payment Flow
* **The Engineering Challenge:**
  * Integrating a flexible Cash on Delivery option that integrates cleanly with the existing digital payment system without breaking invoice triggers or database schemas.
* **Implementation & Design Patterns:**
  * **Frontend Bypass:** Next.js checks selected payment method. If `COD`, it bypasses the Razorpay checkout overlay script, clears the local cart, and routes directly to order tracking.
  * **Backend Conditional Routing:** NestJS skips online payment initialization for COD orders, saving order state directly as `PENDING`.
  * **Zero-Record Database Pattern:** Prevents creation of placeholder payment logs, saving database size and eliminating unnecessary database migrations.

---

## Slide 9: Key Engineering Deliverables — Dynamic Invoicing
* **Slide Title:** Dynamic Invoicing & Lifecycle Completion
* **The Engineering Challenge:**
  * Completing the lifecycle of a Cash on Delivery order automatically, including generating dynamic invoices and notifying customers.
* **Implementation Details:**
  * **Automatic Payment Capture:** When a Restaurant Admin transitions a COD order's status to `DELIVERED`, the NestJS backend automatically flags `paymentStatus` as `PAID`.
  * **Dynamic PDF Generation:** `InvoiceService` creates a custom PDF receipt, labeling the payment method as `Cash on Delivery` and transaction ID as `N/A`.
  * **Automated Mailing Integration:** The invoice is uploaded to storage, logged in the DB, and instantly dispatched to the customer's email as a PDF attachment using the Resend API.

---

## Slide 10: Technical Challenges & Resolutions
* **Slide Title:** Key Technical Challenges Overcome
* **1. Timezone-Safe Analytics:**
  * *Challenge:* Revenue analytics charts displayed empty gaps or mismatched dates at local day boundaries.
  * *Resolution:* Standardized database timestamps to UTC and formulated client-side dynamic parsing based on the user's browser location.
* **2. Tenant-Level Data Security:**
  * *Challenge:* Preventing unauthorized vendors from accessing or modifying another vendor's transaction statistics.
  * *Resolution:* Enforced strict NestJS Guards checking the validated JWT token claims against request route parameters before database retrieval.
* **3. Node Environment Path Configurations:**
  * *Challenge:* Local development encountered compilation errors due to broken global node execution paths on the Windows host.
  * *Resolution:* Configured custom script profiles referencing the local AppData node runtime dynamically.

---

## Slide 11: Internship Learning Reflections
* **Slide Title:** Internship Outcomes & Reflective Learnings
* **Practical Skills Gained:**
  * **SaaS Design Principles:** Gained practical understanding of multi-tenancy, data boundaries, and modular micro-services.
  * **State & Connection Management:** Handled real-time state synchronization, WebSocket channel rooms, and clean connection closures.
  * **System Operations:** Experienced full SDLC management including database schema migrations, environment configuration, and pipeline orchestration.
* **Academic Integration:**
  * Bridged B.Tech AI & ML theoretical knowledge with enterprise software architecture and transaction reliability.

---

## Slide 12: Future Scope & Conclusion
* **Slide Title:** Future Scope & Project Conclusion
* **Future Scope Enhancements:**
  * **AI-Driven Recommendation Engine:** Implement customer menu suggestions based on ordering patterns and user reviews.
  * **Rider Network Tracking:** Connect real-time GPS tracking for delivery drivers on a live mapping screen.
  * **Vendor Subscription Tiers:** Introduce automated subscription billings for storefronts instead of simple commission checkouts.
* **Conclusion:**
  * **FOODFLOW 4.1** represents a fully operational, scalable, and secure multi-vendor SaaS platform ready for deployment. This internship project successfully demonstrates modern web engineering practices and robust cloud integration.
