# FOODFLOW 2.1 — System Architecture

This document describes the high-level system architecture, data flow paths, security model, and real-time synchronization pipelines of the FOODFLOW application.

---

## 🏗️ High-Level Design

The application consists of a decoupled Client (Next.js) and API/WebSocket Server (NestJS), sharing a Postgres relational database.

```mermaid
graph TD
    Client[Next.js Client app] -->|HTTPS REST API| API[NestJS Backend API]
    Client -->|WebSockets Socket.IO| WS[NestJS WS Gateway]
    API -->|Prisma Client| DB[(PostgreSQL Database)]
    API -->|Upload Media| Cloudinary[Cloudinary CDN]
    WS -->|Broadcast updates| Client
```

---

## 🔑 Authentication & Security Model

FOODFLOW implements a stateless JWT-based authentication system with **Token Rotation** to protect user accounts and session lifecycles.

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    Customer->>API: POST /auth/login (credentials)
    Note over API: Verify email & bcrypt password
    API-->>Customer: Returns Access Token (15m) & Refresh Token (7d)
    Note over Customer: Saved in localStorage
    Customer->>API: GET /cart (Authorization: Bearer Access)
    Note over API: JwtAuthGuard validates token
    API-->>Customer: 200 OK (Cart items)
    Note over Customer: Access Token expires
    Customer->>API: GET /cart (Authorization: Bearer ExpiredAccess)
    API-->>Customer: 401 Unauthorized
    Note over Customer: Axios Interceptor catches 401
    Customer->>API: POST /auth/refresh (refreshToken)
    Note over API: Rotate token: Invalidate old token, issue new pair
    API-->>Customer: New Access Token & New Refresh Token
    Customer->>API: Re-try GET /cart (Authorization: Bearer NewAccess)
    API-->>Customer: 200 OK
```

### Protection Guards
1.  **JwtAuthGuard**: Validates the access token in the Authorization header.
2.  **RolesGuard**: Restricts access based on user role (`ADMIN` vs `CUSTOMER`).
3.  **StatusGuard**: Blocks requests if the user's status is `BLOCKED`.

---

## 📡 Real-Time WebSocket Pipeline

WebSockets via **Socket.IO** enable instantaneous interface updates for order statuses and queue management without manual reloading.

### Room Subscriptions
Clients subscribe to distinct rooms on connection:
*   **Customer Rooms**: Subscribed to `order:orderId` to track specific delivery milestones.
*   **Admin Room**: Subscribed to `admin:orders` to monitor the live incoming order queue.

### State Synchronization Flow

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    actor Customer
    Customer->>API: Places Order (POST /orders)
    API->>DB: Save order in Pending status
    API->>WS: Emit order.created (Order payload)
    WS-->>Admin: Broadcast order.created to admin:orders
    Note over Admin: Admin Live Queue displays card instantly
    Admin->>API: Confirm Order (PATCH /orders/:id/status)
    API->>DB: Update status to CONFIRMED
    API->>WS: Emit order.updated (status: CONFIRMED)
    WS-->>Customer: Broadcast order.updated to order:orderId
    Note over Customer: Timeline updates with animated Confirmed dot
```

---

## 🖼️ Image Management (Cloudinary Upload)

To handle food item images, the platform utilizes Cloudinary:
1.  **Upload**: The administrator selects an image file. The frontend transmits a multipart/form-data request to the backend.
2.  **CDN Integration**: The backend processes the request and streams the upload to Cloudinary.
3.  **Database Storage**: Only the secure CDN URL returned by Cloudinary is stored in the database.
4.  **Mock Fallback**: If Cloudinary credentials are not set, a fallback mock service generates placeholder food imagery URLs automatically.
