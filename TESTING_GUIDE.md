# FOODFLOW 2.1 — Testing Guide

This document describes the testing practices, frameworks, commands, and strategies implemented to verify quality and features across the FOODFLOW codebase.

---

## 🗃️ Backend Testing (NestJS + Jest)

The backend uses **Jest** for unit testing services, guards, and controllers, and end-to-end integration testing.

### Test Architecture
*   **Unit Tests**: Located adjacent to source files (e.g. `auth.service.spec.ts`). Dependencies (such as `PrismaService` and `JwtService`) are replaced with Jest mocks.
*   **E2E Tests**: Located in the `backend/test/` directory. These tests run the full application container, querying a test database (configured in `jest-e2e.json` or `.env.test`) using supertest requests.

### Execution Commands

Navigate to `backend/` and run:
```bash
# Run all unit tests
npm run test

# Run end-to-end integration tests
npm run test:e2e

# Run tests and collect coverage reports
npm run test:cov
```

---

## 💻 Frontend Testing (React + Vitest)

The frontend uses **Vitest** combined with **React Testing Library** and **jsdom** for unit testing.

### Test Architecture
*   **Math and Validation Tests**: Tests located inside `src/__tests/`. Covers Cart subtotal/tax/discount calculations and Zod validation rules (`loginSchema`, `registerSchema`).
*   **Component Tests**: Render specific JSX elements and check error messaging, inputs, and triggers.

### Execution Commands

Navigate to `frontend/` and run:
```bash
# Run frontend tests
npm run test
```

---

## 📈 Reaching the 80%+ Coverage Target

To increase and maintain coverage:
1.  **Mock Prisma Client Methods**: Ensure standard database queries (like `findUnique`, `create`, `update`, `delete`) have mocked resolved values.
2.  **Test Edge Conditions**: Write separate test cases for validation failures, expired tokens, empty carts, and forbidden states.
3.  **Cover Transactions**: Mock transaction workflows (`$transaction` calls) by passing the mocked Prisma client back inside database transaction scopes.
