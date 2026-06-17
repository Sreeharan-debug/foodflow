# FOODFLOW 2.1 — API Contracts & Specifications

This document defines the interface endpoints, payloads, return objects, headers, and event hooks for both the REST API and WebSocket interfaces.

---

## 🔒 Authentication & Access Headers

All authenticated endpoints require the Access Token to be supplied via the `Authorization` header:
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

---

## 🗃️ REST API Specification

### 1. Authentication Module

#### Register Customer (`POST /api/auth/register`)
Creates a new customer profile and returns active session credentials.
*   **Request Body**:
    ```json
    {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "password": "Password123!"
    }
    ```
*   **Success Response** (201 Created):
    ```json
    {
      "user": {
        "id": "u-12345",
        "email": "jane@example.com",
        "name": "Jane Doe",
        "role": "CUSTOMER",
        "status": "ACTIVE",
        "createdAt": "2026-06-16T12:00:00Z"
      },
      "tokens": {
        "accessToken": "ey...",
        "refreshToken": "ey..."
      }
    }
    ```

#### Login (`POST /api/auth/login`)
*   **Request Body**:
    ```json
    {
      "email": "jane@example.com",
      "password": "Password123!"
    }
    ```
*   **Success Response** (200 OK): Contains `user` profile and JWT tokens.

#### Refresh Tokens (`POST /api/auth/refresh`)
Uses the refresh token to get a new pair.
*   **Request Body**:
    ```json
    {
      "refreshToken": "ey..."
    }
    ```
*   **Success Response** (200 OK): `{"accessToken": "new_ey...", "refreshToken": "new_ey..."}`

---

### 2. User & Address Management

#### Save Address (`POST /api/users/addresses`)
*   **Request Body**:
    ```json
    {
      "label": "Home",
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    }
    ```
*   **Success Response** (201 Created): Address object with `id`.

#### List Saved Addresses (`GET /api/users/addresses`)
*   **Success Response** (200 OK): Array of saved address objects.

#### Delete Address (`DELETE /api/users/addresses/:id`)
*   **Success Response** (200 OK): `{"message": "Address deleted successfully"}`

#### Update User status / Role (`PUT /api/users/:id` - Admin Only)
Used to block users or change roles.
*   **Request Body**: `{"status": "BLOCKED"}` or `{"role": "ADMIN"}`

---

### 3. Foods & Categories

#### List Foods (`GET /api/foods`)
Public endpoint. Supports category, featured, and search queries.
*   **Query Params**: `categoryId`, `featured=true`, `search=pizza`
*   **Success Response** (200 OK):
    ```json
    {
      "foods": [
        {
          "id": "f-pizza",
          "name": "Pepperoni Pizza",
          "description": "Premium pepperoni on wood-fired crust",
          "price": "14.99",
          "imageUrl": "https://...",
          "rating": 4.9,
          "preparationTime": 15,
          "featured": true,
          "isAvailable": true,
          "categoryId": "c-pizza"
        }
      ]
    }
    ```

#### Create Food (`POST /api/foods` - Admin Only)
Uses `multipart/form-data` to submit text parameters and upload image binary files.

---

### 4. Shopping Cart

#### Get Active Cart (`GET /api/cart`)
*   **Success Response** (200 OK): Cart object with nested items array and calculations.

#### Add Item to Cart (`POST /api/cart/items`)
*   **Request Body**: `{"foodId": "f-pizza", "quantity": 1}`

#### Update Quantity (`PATCH /api/cart/items/:id`)
*   **Request Body**: `{"quantity": 3}`

---

### 5. Orders & Checkout

#### Place Order (`POST /api/orders`)
Validates cart items, applies coupon discount, charges total, creates order, and clears cart.
*   **Request Body**:
    ```json
    {
      "addressId": "addr-12345",
      "couponCode": "FLOW20"
    }
    ```
*   **Success Response** (201 Created): Details of the created Order with status `PENDING`.

#### Update Order Status (`PATCH /api/orders/:id/status` - Admin Only)
Changes order status and triggers WebSocket update.
*   **Request Body**: `{"status": "PREPARING"}`

---

## 📡 WebSockets Gateway Specification

WebSocket events are managed using **Socket.IO** (communicating on the default port `3001`).

### Connection Hook
Include access token in connection query:
```javascript
const socket = io('http://localhost:3001', {
  query: { token: 'JWT_ACCESS_TOKEN' }
});
```

### 📥 Inbound Events (Client to Server)

#### `joinOrderRoom`
Joins the updates room for a specific order.
*   **Payload**: `orderId` (string)

#### `joinAdminRoom`
Joins the administrator updates channel (Admin Only).
*   **Payload**: None

---

### 📤 Outbound Events (Server to Client)

#### `order.created`
Fires when a new customer checkout completes. Received by subscribers in the admin room.
*   **Payload**:
    ```json
    {
      "id": "order-123",
      "total": "28.50",
      "status": "PENDING",
      "user": { "name": "John Doe", "email": "john@example.com" },
      "items": [...]
    }
    ```

#### `order.updated`
Fires when an administrator changes an order status. Received by the target customer's room and the admin live queue room.
*   **Payload**:
    ```json
    {
      "orderId": "order-123",
      "status": "CONFIRMED",
      "order": { ... }
    }
    ```
