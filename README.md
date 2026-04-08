# Vibefit — Full-Stack MERN E-Commerce Platform

Vibefit is a full-stack e-commerce application built with the **MERN stack** and structured as a multi-app repository containing a customer-facing storefront, an administrative dashboard, and an Express/MongoDB backend API. The platform supports product discovery, authentication, cart and wishlist workflows, address management, order placement, review submission, media uploads, and online payments.

This repository was developed as a **CS4800 academic project** by **Alisha Pokharel** and **Niraj Tamang**.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Modules](#api-modules)
- [Deployment Notes](#deployment-notes)
- [Authors](#authors)
- [License](#license)

---

## Project Overview

The repository is organized into three major applications:

- **Client** — the public storefront where users browse products, search, compare items, manage carts, complete checkout, and track orders.
- **Admin** — the internal dashboard for managing products, categories, sizes, banners, homepage content, logo assets, users, and orders.
- **Server** — the Express.js API that handles authentication, business logic, database access, file uploads, payment integration, and transactional emails.

The backend exposes RESTful endpoints for user accounts, products, categories, carts, wishlists, addresses, orders, banners, home sliders, and branding assets.

---

## Key Features

### Customer Experience
- User registration and login
- Email verification with OTP flow
- Google sign-in integration
- Forgot password and password reset support
- Product browsing and detailed product pages
- Search, filtering, sorting, and product comparison
- Shopping cart management
- Wishlist (`MyList`) support
- Address book management
- Checkout and order placement
- PayPal and eSewa payment flows
- Order history and status tracking
- Product reviews

### Admin Dashboard
- Dashboard analytics and overview widgets
- Product creation, editing, deletion, and inventory management
- Product size management
- Category and subcategory management
- Banner and homepage slider management
- Logo management
- Order monitoring and status updates
- User administration

### Backend Services
- JWT-based authentication with access and refresh tokens
- MongoDB persistence with Mongoose
- Image upload and deletion via Cloudinary
- Email services via Nodemailer
- Role-aware route protection for authenticated workflows
- Payment processing support for PayPal and eSewa

---

## System Architecture

```text
Client (React + Vite)      Admin (React + Vite)
         |                          |
         +----------- HTTP API -----+
                        |
                 Server (Express)
                        |
                     MongoDB
                        |
     Cloudinary / Firebase / PayPal / eSewa / SMTP
```

---

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Material UI
- React Router
- Axios
- Firebase Authentication support

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT
- Multer
- Cloudinary
- Nodemailer
- Helmet
- CORS
- Cookie Parser

### Payments and Services
- PayPal Checkout
- eSewa
- Firebase
- Gmail SMTP / Nodemailer

---

## Repository Structure

```text
.
├── admin/      # Administrative dashboard
├── client/     # Customer-facing storefront
├── server/     # Express API and MongoDB integration
└── README.md
```

### Important Subdirectories

```text
server/
├── config/         # Database and email configuration
├── controllers/    # Route controllers and business logic
├── middlewares/    # Auth and upload middleware
├── models/         # Mongoose schemas
├── route/          # Express route modules
├── uploads/        # Uploaded assets (local temporary files)
└── utils/          # Token and email template utilities
```

---

## Getting Started

### Prerequisites
Before running the project, make sure you have:

- **Node.js** 18 or later
- **npm** 9 or later
- A **MongoDB** database (local or Atlas)
- A **Cloudinary** account for image hosting
- A **Firebase** project for Google authentication
- A **PayPal** developer account for payment testing
- An **eSewa** merchant configuration if using eSewa checkout
- A valid email account or SMTP credentials for transactional emails

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-username>/<your-repository>.git
   cd <your-repository>
   ```

2. **Install dependencies for each app**
   ```bash
   cd server
   npm install
   ```

   ```bash
   cd ../client
   npm install
   ```

   ```bash
   cd ../admin
   npm install
   ```

3. **Create environment files**
   - `server/.env`
   - `client/.env`
   - `admin/.env`

4. **Start the development servers**

   In three separate terminals:

   **Terminal 1 — backend**
   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2 — client**
   ```bash
   cd client
   npm run dev
   ```

   **Terminal 3 — admin**
   ```bash
   cd admin
   npm run dev
   ```

### Development Notes
- The client and admin applications both expect the API base URL from `VITE_API_URL`.
- The server reads its listening port from `PORT`.
- During local development, ensure `FRONTEND_URL` and `BACKEND_URL` match your actual running URLs.
- Since both frontend apps use Vite, they may run on different local ports depending on availability.

---

## Environment Variables

The codebase reads the following environment variables directly. Use the exact names shown below.

### `server/.env`

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string

JSON_WEB_TOKEN_SECRET_KEY=your_jwt_secret
SECRET_KEY_ACCESS_TOKEN=your_access_token_secret
SECRET_KEY_REFRESH_TOKEN=your_refresh_token_secret

EMAIL=your_email_address
EMAIL_PASS=your_email_app_password

cloudinary_Config_Cloud_Name=your_cloudinary_cloud_name
cloudinary_Config_api_key=your_cloudinary_api_key
cloudinary_Config_api_secret=your_cloudinary_api_secret

PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID_TEST=your_paypal_sandbox_client_id
PAYPAL_SECRET_TEST=your_paypal_sandbox_secret
PAYPAL_CLIENT_ID_LIVE=your_paypal_live_client_id
PAYPAL_SECRET_LIVE=your_paypal_live_secret

ESEWA_MERCHANT_ID=your_esewa_merchant_id
ESEWA_SECRET_KEY=your_esewa_secret_key
ESEWA_PRODUCT_CODE=your_esewa_product_code
ESEWA_ENVIRONMENT=test

BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
```

### `client/.env`

```env
VITE_API_URL=http://localhost:5000
VITE_APP_PAYPAL_CLIENT_ID=your_paypal_client_id
VITE_APP_ESEWA_MERCHANT_ID=your_esewa_merchant_id

VITE_FIREBASE_APP_API_KEY=your_firebase_api_key
VITE_FIREBASE_APP_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_APP_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_APP_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_APP_ID=your_firebase_app_id
```

### `admin/.env`

```env
VITE_API_URL=http://localhost:5000

VITE_FIREBASE_APP_API_KEY=your_firebase_api_key
VITE_FIREBASE_APP_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_APP_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_APP_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_APP_ID=your_firebase_app_id
```

> **Important:** Do not commit real `.env` files or secret credentials to GitHub.

---

## Available Scripts

### Client and Admin
Both `client` and `admin` expose the following scripts:

```bash
npm run dev      # Start Vite development server
npm run build    # Create production build
npm run lint     # Run ESLint
npm run preview  # Preview production build locally
```

### Server
The `server` app exposes:

```bash
npm run dev      # Start backend with nodemon
npm start        # Start backend with node
```

---

## API Modules

The backend is organized into route modules under `server/route/`.

### Core Modules
- **User** — registration, login, Google auth, email verification, password reset, profile updates, reviews, user listing
- **Product** — CRUD operations, banners, sizes, filtering, sorting, searching, featured products
- **Category** — category and subcategory management
- **Cart** — add, update, remove, and empty cart items
- **MyList** — wishlist management
- **Address** — address creation and maintenance
- **Order** — order placement, payment processing, totals, status updates, user/admin order views
- **Home Slides** — homepage slider assets
- **Banner V1 / Banner List2** — promotional banner management
- **Logo** — application branding asset management

If you plan to publish this repository publicly, consider adding a dedicated API reference or Postman collection for endpoint-level documentation.

---

## Deployment Notes

For production deployment, consider the following:

- Build and host `client` and `admin` separately using platforms such as **Vercel**, **Netlify**, or a custom web server.
- Deploy `server` to a Node-compatible environment such as **Render**, **Railway**, **AWS**, or **DigitalOcean**.
- Replace development keys with production credentials.
- Restrict CORS to known frontend origins.
- Store all secrets in your deployment platform's environment variable manager.
- Use PayPal sandbox credentials in development and live credentials only in production.
- Review file upload and payment callback URLs before going live.

---

## Authors

- **Alisha Pokharel**
- **Niraj Tamang**

Developed for **CS4800**.

---

## License

No license file is currently included in this repository.

If you intend to make the project public on GitHub, add a license file such as **MIT**, **Apache-2.0**, or another license appropriate for your use case.
