# FOODFLOW 2.1 — Production Deployment Guide

This guide details steps to deploy the PostgreSQL database on Neon, the NestJS backend on Railway, and the Next.js frontend on Vercel.

---

## 🗄️ Step 1: Database Setup on Neon

1.  Sign in to [Neon Console](https://neon.tech/).
2.  Create a new project named `foodflow`. Select PostgreSQL version 16/18.
3.  Navigate to the **Connection Details** dashboard. Copy the Connection URI.
4.  Copy this connection string and use it as your `DATABASE_URL` (ensure it includes `?sslmode=require`).

---

## 🖼️ Step 2: Asset Management on Cloudinary

1.  Log in to [Cloudinary](https://cloudinary.com/).
2.  Go to the **Dashboard** and copy:
    *   `Cloud Name`
    *   `API Key`
    *   `API Secret`
3.  Set these values in your backend environment configuration (see Step 3) to enable product image uploads. If omitted, the application will degrade gracefully to mock image generation.

---

## ⚙️ Step 3: Backend Deployment on Railway

1.  Sign in to [Railway](https://railway.app/).
2.  Click **New Project** -> **Deploy from GitHub repo** -> Select the `foodflow` repository.
3.  Set the Root Directory to `backend`.
4.  In the service **Variables** settings, configure the following keys:
    *   `DATABASE_URL`: *[Your Neon PostgreSQL connection string]*
    *   `PORT`: `3001`
    *   `JWT_ACCESS_SECRET`: *[Generate a strong secret key string]*
    *   `JWT_REFRESH_SECRET`: *[Generate another strong secret key string]*
    *   `JWT_ACCESS_EXPIRATION`: `15m`
    *   `JWT_REFRESH_EXPIRATION`: `7d`
    *   `CLOUDINARY_CLOUD_NAME`: *[Cloudinary cloud name]*
    *   `CLOUDINARY_API_KEY`: *[Cloudinary API key]*
    *   `CLOUDINARY_API_SECRET`: *[Cloudinary API secret]*
5.  Railway will detect the NestJS structure, install dependencies, compile TypeScript, run the database migrations, and launch the server.

---

## 💻 Step 4: Frontend Deployment on Vercel

1.  Go to [Vercel](https://vercel.com/) and click **Add New** -> **Project**.
2.  Import the GitHub repository.
3.  In the configuration:
    *   Set **Framework Preset** to `Next.js`.
    *   Set **Root Directory** to `frontend`.
4.  Under **Environment Variables**, add:
    *   `NEXT_PUBLIC_API_URL`: *[The domain of your backend deployed on Railway, e.g. `https://foodflow-backend-production.up.railway.app/api`]*
5.  Click **Deploy**. Next.js will build, optimize static assets, and assign a production URL.
