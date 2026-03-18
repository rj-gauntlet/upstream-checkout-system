# Upstream Literacy -- E-Commerce Checkout System

## Overview

Full-featured e-commerce storefront for Upstream Education's K-5 literacy curriculum materials. Built as a hiring project demonstrating end-to-end e-commerce capabilities including product catalog management, shopping cart functionality, secure payment processing, order lifecycle management, and a branded admin dashboard.

The application mirrors the look and feel of [upstreameducation.org](https://upstreameducation.org), using the same teal/turquoise/gold color palette and typography to present a production-quality storefront experience.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS 4 |
| **Backend** | Django 5.2 LTS, Django REST Framework, SimpleJWT |
| **Database** | PostgreSQL 16 (Docker) / SQLite (local dev fallback) |
| **Payments** | Stripe (test mode), PayPal (sandbox) |
| **Admin** | Django Admin with django-unfold theme |
| **Fonts** | Playfair Display, Poppins (matching Upstream Education branding) |

## Features

### Product Catalog
- Category-based product organization
- Full-text search with filtering and sorting
- Paginated product listings
- Featured products endpoint for homepage display

### Shopping Cart
- Guest cart support (session-based)
- Authenticated cart (persisted to database)
- Cross-device cart merge on login
- Real-time quantity updates and subtotal calculation

### Checkout and Payments
- Stripe test payment integration (card `4242 4242 4242 4242`)
- PayPal sandbox integration
- Secure payment intent creation and confirmation
- Order price snapshots denormalized at order time (prices locked at checkout)

### Order Management
- Human-readable order numbers (`UL-YYYYMMDD-NNNN`)
- Atomic stock management using Django `F()` expressions to prevent overselling
- Order status tracking and history
- Guest order lookup by order number and email

### Customer Accounts
- JWT authentication (access + refresh tokens)
- User registration and login
- Profile management
- Order history with detail views

### Admin Dashboard
- Django Admin with Unfold theme for a modern management interface
- Product, category, and inventory management
- Order processing and status updates
- Analytics event viewer

### Analytics
- Event tracking across the storefront (page views, cart actions, purchases)
- Dashboard API with summary statistics

### Design and Branding
- Upstream Education branded UI (teal/turquoise/gold palette)
- Playfair Display headings and Poppins body text
- Responsive design across mobile, tablet, and desktop breakpoints

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Git

### Setup

```bash
git clone https://github.com/rj-gauntlet/upstream-checkout-system.git
cd upstream-checkout-system

# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py createsuperuser
python manage.py runserver 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

The frontend dev server will start at `http://localhost:5173` and proxy API requests to the Django backend at `http://localhost:8000`.

### Environment Variables

Create a `.env` file in the project root (see `.env.example` for reference):

```
SECRET_KEY=your-django-secret-key
DEBUG=True
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
PAYPAL_CLIENT_ID=your-paypal-sandbox-client-id
PAYPAL_CLIENT_SECRET=your-paypal-sandbox-client-secret
```

Create a `frontend/.env` file:

```
VITE_API_URL=http://localhost:8000
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_PAYPAL_CLIENT_ID=your-paypal-sandbox-client-id
```

## Architecture

The Django backend is organized into six apps, each responsible for a distinct domain:

| App | Responsibility |
|-----|----------------|
| **accounts** | User registration, JWT authentication, profile management |
| **catalog** | Products, categories, search, filtering, featured items |
| **cart** | Session-based guest carts, authenticated carts, cart merge logic |
| **orders** | Order creation, order number generation, stock reservation, status tracking |
| **payments** | Stripe payment intents, PayPal order creation and capture |
| **analytics** | Event ingestion, dashboard summary API |

All API endpoints are versioned under `/api/v1/` and follow RESTful conventions.

## API Endpoints

### Auth

```
POST   /api/v1/auth/register/       Register a new customer account
POST   /api/v1/auth/login/          Obtain JWT access and refresh tokens
POST   /api/v1/auth/refresh/        Refresh an expired access token
GET    /api/v1/auth/me/             Retrieve the authenticated user profile
```

### Catalog

```
GET    /api/v1/products/            List products (search, filter, paginate)
GET    /api/v1/products/{id}/       Product detail
GET    /api/v1/products/featured/   Featured products for homepage
GET    /api/v1/categories/          List all categories
```

### Cart

```
GET    /api/v1/cart/                Retrieve the current cart
POST   /api/v1/cart/items/          Add an item to the cart
PATCH  /api/v1/cart/items/{id}/     Update item quantity
DELETE /api/v1/cart/items/{id}/     Remove an item
POST   /api/v1/cart/merge/          Merge guest cart into authenticated cart
```

### Orders

```
POST   /api/v1/checkout/            Create an order from the current cart
GET    /api/v1/orders/              List orders for the authenticated user
GET    /api/v1/orders/{id}/         Order detail
POST   /api/v1/orders/lookup/       Guest order lookup by order number and email
```

### Payments

```
POST   /api/v1/payments/stripe/create-intent/     Create a Stripe PaymentIntent
POST   /api/v1/payments/paypal/create-order/       Create a PayPal order
POST   /api/v1/payments/paypal/capture-order/      Capture an approved PayPal order
```

### Analytics

```
POST   /api/v1/analytics/events/              Record an analytics event
GET    /api/v1/analytics/dashboard/summary/   Aggregated dashboard statistics
```

## Test Credentials

| Service | Details |
|---------|---------|
| **Stripe** | Card number: `4242 4242 4242 4242`, any future expiration date, any 3-digit CVC |
| **PayPal** | Use a sandbox buyer account from [developer.paypal.com](https://developer.paypal.com) |
| **Admin** | Navigate to `http://localhost:8000/admin/` and log in with the superuser created during setup |

## Project Structure

```
upstream-checkout-system/
├── backend/
│   ├── accounts/          # User auth and profiles
│   ├── catalog/           # Products and categories
│   ├── cart/              # Shopping cart logic
│   ├── orders/            # Order processing and stock management
│   ├── payments/          # Stripe and PayPal integrations
│   ├── analytics/         # Event tracking and dashboard
│   ├── config/            # Django settings, URLs, WSGI/ASGI
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route-level page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API client and service layer
│   │   ├── store/         # State management
│   │   └── types/         # TypeScript type definitions
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
├── .env.example
└── README.md
```

## Screenshots

Screenshots coming soon.

## License

MIT
