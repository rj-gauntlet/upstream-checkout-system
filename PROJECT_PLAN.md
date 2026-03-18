# Upstream Literacy E-Commerce Shopping Cart & Checkout System — Project Plan

> Generated from PRD review on 2026-03-17

## 1. Product Overview

### Vision
Upstream Literacy currently lacks a modern e-commerce presence, forcing customers (school districts and educators) to place orders via phone or email. This creates friction, abandoned sales, and 2-3 hours of daily manual order processing. This project builds a full-featured e-commerce storefront with product catalog, shopping cart, secure checkout, payment processing, order management, inventory tracking, customer accounts, and analytics — replacing the manual workflow with a self-service purchasing experience.

### Target Users
- **Primary:** School administrators and district procurement staff purchasing literacy curriculum materials, assessment tools, and professional development resources
- **Secondary:** Individual educators buying classroom resources
- **Internal:** Upstream Literacy staff managing products, orders, and inventory via an admin panel

### Key Outcomes
- Self-service purchasing eliminates manual order processing (saving 2-3 hrs/day)
- Reduced abandoned sales through convenient online ordering with guest checkout
- Real-time inventory accuracy with automated stock management
- Visibility into customer shopping behavior, cart abandonment, and conversion analytics
- Professional admin panel for product, order, and inventory management

---

## 2. Requirements Summary

### Functional Requirements

| ID | Domain | Requirement | Priority |
|----|--------|-------------|----------|
| FR-01 | Catalog | Product catalog with categories, images, and detailed descriptions | Must-have |
| FR-02 | Cart | Shopping cart with add/remove/quantity updates | Must-have |
| FR-03 | Cart | Persistent cart sessions across devices (session-based for guests, DB-based for authenticated users, merge on login) | Must-have |
| FR-04 | Checkout | Guest checkout flow (no account required) | Must-have |
| FR-05 | Checkout | Registered user checkout with pre-filled shipping info | Must-have |
| FR-06 | Payments | Credit card payment via Stripe (sandbox/test mode) | Must-have |
| FR-07 | Payments | PayPal payment integration (sandbox mode) | Must-have |
| FR-08 | Orders | Order status tracking with lifecycle (pending → paid → processing → shipped → delivered) | Must-have |
| FR-09 | Orders | Automated email confirmations (console backend for dev) | Must-have |
| FR-10 | Inventory | Stock-level tracking with atomic decrement on purchase | Must-have |
| FR-11 | Inventory | Out-of-stock handling (disable add-to-cart, show badges) | Must-have |
| FR-12 | Accounts | Customer account creation with email/password | Must-have |
| FR-13 | Accounts | Order history view for authenticated users | Must-have |
| FR-14 | Accounts | Profile management (shipping address, contact info) | Must-have |
| FR-15 | Analytics | Dashboard with cart abandonment rates, conversion funnel, revenue by category, popular products | Must-have |
| FR-16 | Admin | Admin panel for product management (CRUD, images, categories) | Must-have |
| FR-17 | Admin | Admin panel for order management (view, update status, search, filter) | Must-have |
| FR-18 | Admin | Admin panel for inventory management (stock levels, low-stock alerts) | Must-have |

### Non-Functional Requirements

| ID | Category | Requirement | Target |
|----|----------|-------------|--------|
| NFR-01 | Security | PCI compliance via payment gateway (Stripe/PayPal handle card data) | No raw card data on our servers |
| NFR-02 | Performance | Page load time | < 3 seconds |
| NFR-03 | UX | Responsive design | Mobile, tablet, desktop breakpoints |
| NFR-04 | Security | JWT authentication with token refresh | 60-min access, 7-day refresh |
| NFR-05 | Data Integrity | Atomic stock decrement using F() expressions to prevent race conditions | Zero overselling |
| NFR-06 | Data Integrity | Order snapshots (product name/price denormalized at order time) | Historical accuracy |

### Assumptions
- This is a portfolio/hiring project — not deploying to production initially
- Stripe test mode and PayPal sandbox are sufficient (no real payment processing)
- Console email backend is acceptable (no real SMTP needed)
- Single currency (USD)
- No shipping rate calculation (flat or free shipping)
- No tax calculation service (fixed 8% tax rate for demo purposes)
- Product images will use placeholder images for the demo
- Small scale (< 1K orders/month target)

### Open Questions
- Will Upstream Literacy want to adopt this for real use, or is this purely a hiring demonstration?
- Are there specific product categories or items they want showcased in the seed data?
- Any branding assets (logo, colors, fonts) to incorporate into the storefront design?

---

## 3. Architecture

### System Overview

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│         React 19 + Vite + TypeScript + Tailwind      │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ Catalog   │ │ Cart     │ │ Checkout │ │ Account│ │
│  │ Pages     │ │ Context  │ │ + Pay    │ │ Pages  │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│       │             │            │           │       │
│       └─────────────┴────────────┴───────────┘       │
│                     Axios API Client                 │
│                    (JWT + Session)                    │
└────────────────────────┬────────────────────────────┘
                         │ REST API (JSON)
                         ▼
┌─────────────────────────────────────────────────────┐
│                    BACKEND                           │
│          Django 5.2 LTS + DRF + SimpleJWT            │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ Catalog   │ │ Cart     │ │ Orders   │ │Payments│ │
│  │ App       │ │ App      │ │ App      │ │ App    │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│  ┌──────────┐ ┌──────────┐                         │
│  │ Accounts  │ │Analytics │                         │
│  │ App       │ │ App      │                         │
│  └──────────┘ └──────────┘                         │
│       │                                             │
│  ┌─────────────────────────────────────────────┐    │
│  │  Django Admin + Unfold Theme                 │    │
│  │  (Product, Order, Inventory, Analytics Mgmt) │    │
│  └─────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
     ┌──────────────┐    ┌───────────────────┐
     │ PostgreSQL 16│    │ Stripe + PayPal   │
     │ (all data)   │    │ (sandbox/test)    │
     └──────────────┘    └───────────────────┘
```

### Component Breakdown

#### Catalog App
- **Responsibility:** Product and category management, search, filtering, pagination
- **Key interfaces:** REST API for product listing/detail, Django admin for CRUD
- **Technology:** Django 5.2 + DRF + django-filter

#### Cart App
- **Responsibility:** Shopping cart management with dual auth (JWT + session cookie for guests)
- **Key interfaces:** REST API for cart CRUD, cart merge endpoint
- **Technology:** Django 5.2 + DRF, session cookies for guest identification

#### Orders App
- **Responsibility:** Checkout flow, order lifecycle management, email confirmations
- **Key interfaces:** Checkout endpoint, order list/detail, guest order lookup
- **Technology:** Django 5.2 + DRF, Django email framework

#### Payments App
- **Responsibility:** Stripe and PayPal integration, webhook handling
- **Key interfaces:** Payment intent creation, webhook endpoints, capture endpoints
- **Technology:** stripe Python SDK, paypalrestsdk

#### Accounts App
- **Responsibility:** User registration, authentication, profile management
- **Key interfaces:** Register, login, JWT refresh, profile CRUD
- **Technology:** Django auth + djangorestframework-simplejwt

#### Analytics App
- **Responsibility:** Event tracking, conversion funnel, admin dashboard charts
- **Key interfaces:** Event recording middleware, admin dashboard views
- **Technology:** Django + chart rendering in admin (Chart.js via Unfold or custom)

### Data Models

#### Category
```
- id: BigAutoField (PK)
- name: CharField(200)
- slug: SlugField(unique)
- description: TextField(blank)
- image: ImageField(blank)
- parent: ForeignKey(self, nullable) — for subcategories
- is_active: BooleanField(default=True)
- created_at: DateTimeField(auto_now_add)
```

#### Product
```
- id: BigAutoField (PK)
- category: ForeignKey(Category)
- name: CharField(200)
- slug: SlugField(unique)
- description: TextField
- price: DecimalField(max_digits=10, decimal_places=2)
- stock: PositiveIntegerField(default=0)
- sku: CharField(50, unique)
- is_active: BooleanField(default=True)
- featured: BooleanField(default=False)
- created_at: DateTimeField(auto_now_add)
- updated_at: DateTimeField(auto_now)
```

#### ProductImage
```
- id: BigAutoField (PK)
- product: ForeignKey(Product)
- image: ImageField
- alt_text: CharField(200, blank)
- is_primary: BooleanField(default=False)
- sort_order: PositiveIntegerField(default=0)
```

#### Cart
```
- id: UUIDField (PK)
- user: ForeignKey(User, nullable) — for authenticated users
- session_key: CharField(40, nullable, indexed) — for guest users
- created_at: DateTimeField(auto_now_add)
- updated_at: DateTimeField(auto_now)
```

#### CartItem
```
- id: BigAutoField (PK)
- cart: ForeignKey(Cart)
- product: ForeignKey(Product)
- quantity: PositiveIntegerField(default=1)
- added_at: DateTimeField(auto_now_add)
- Constraint: unique_together(cart, product)
```

#### Order
```
- id: UUIDField (PK)
- order_number: CharField(20, unique) — human-readable, e.g. "UL-20260317-0001"
- user: ForeignKey(User, nullable) — null for guest orders
- email: EmailField — always stored (required for guests)
- status: CharField(20, choices=Status) — pending/paid/processing/shipped/delivered/cancelled/refunded
- shipping_name: CharField(200)
- shipping_address_line1: CharField(255)
- shipping_address_line2: CharField(255, blank)
- shipping_city: CharField(100)
- shipping_state: CharField(100)
- shipping_zip: CharField(20)
- payment_method: CharField(20) — 'stripe' or 'paypal'
- payment_id: CharField(255, blank) — Stripe PaymentIntent ID or PayPal Order ID
- payment_status: CharField(20, default='pending')
- subtotal: DecimalField(10, 2)
- tax: DecimalField(10, 2, default=0)
- total: DecimalField(10, 2)
- created_at: DateTimeField(auto_now_add)
- updated_at: DateTimeField(auto_now)
```

#### OrderItem
```
- id: BigAutoField (PK)
- order: ForeignKey(Order)
- product: ForeignKey(Product, nullable, SET_NULL)
- product_name: CharField(200) — snapshot at order time
- product_price: DecimalField(10, 2) — snapshot at order time
- quantity: PositiveIntegerField
- line_total: DecimalField(10, 2)
```

#### UserProfile
```
- id: BigAutoField (PK)
- user: OneToOneField(User)
- phone: CharField(20, blank)
- address_line1: CharField(255, blank)
- address_line2: CharField(255, blank)
- city: CharField(100, blank)
- state: CharField(100, blank)
- zip_code: CharField(20, blank)
- created_at: DateTimeField(auto_now_add)
- updated_at: DateTimeField(auto_now)
```

#### AnalyticsEvent
```
- id: BigAutoField (PK)
- event_type: CharField(50) — 'page_view', 'add_to_cart', 'remove_from_cart', 'checkout_start', 'payment_initiated', 'purchase_complete', 'cart_abandoned'
- user: ForeignKey(User, nullable)
- session_id: CharField(40, blank)
- product: ForeignKey(Product, nullable)
- order: ForeignKey(Order, nullable)
- metadata: JSONField(default=dict) — flexible extra data
- created_at: DateTimeField(auto_now_add)
```

### API Surface

All endpoints prefixed with `/api/v1/`.

#### Auth / Accounts

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register/` | Create account, return JWT pair | No |
| POST | `/auth/login/` | Get JWT token pair | No |
| POST | `/auth/refresh/` | Refresh access token | No |
| GET | `/auth/me/` | Get current user + profile | JWT |
| PATCH | `/auth/me/` | Update profile | JWT |

#### Catalog

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/categories/` | List active categories with product counts | No |
| GET | `/categories/{slug}/` | Category detail | No |
| GET | `/products/` | List products (filter by category, search, price range, ordering, pagination) | No |
| GET | `/products/featured/` | Featured products (up to 8) | No |
| GET | `/products/{slug}/` | Product detail with images | No |

#### Cart

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/cart/` | Get current cart | JWT or Session |
| POST | `/cart/items/` | Add item to cart | JWT or Session |
| PATCH | `/cart/items/{id}/` | Update item quantity | JWT or Session |
| DELETE | `/cart/items/{id}/` | Remove item from cart | JWT or Session |
| DELETE | `/cart/` | Clear entire cart | JWT or Session |
| POST | `/cart/merge/` | Merge guest cart into user cart (on login) | JWT |

#### Checkout / Orders

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/checkout/` | Create order from cart + shipping info | JWT or Session |
| GET | `/orders/` | List user's orders | JWT |
| GET | `/orders/{order_number}/` | Order detail | JWT |
| GET | `/orders/lookup/?order_number=X&email=Y` | Guest order lookup | No |

#### Payments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/payments/stripe/create-intent/` | Create Stripe PaymentIntent | JWT or Session |
| POST | `/payments/stripe/webhook/` | Stripe webhook handler | Stripe signature |
| POST | `/payments/paypal/create-order/` | Create PayPal order | JWT or Session |
| POST | `/payments/paypal/capture/` | Capture PayPal payment | JWT or Session |

#### Analytics

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/analytics/events/` | Record an analytics event | JWT or Session |

### Tech Stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Frontend | React | 19.x | Latest stable, industry standard, wide ecosystem |
| Build Tool | Vite | Latest | Fast HMR, modern bundling |
| Language | TypeScript | 5.x | Type safety, better DX, expected for portfolio |
| CSS | Tailwind CSS | 4.x | Utility-first, rapid responsive UI development |
| Backend | Django | 5.2 LTS | Built-in admin, ORM, auth, sessions — ideal for e-commerce |
| API | Django REST Framework | 3.15.x | Standard REST API for Django |
| Auth | djangorestframework-simplejwt | 5.3.x | JWT auth with token refresh |
| Admin Theme | django-unfold | latest | Modern Tailwind-based admin UI |
| Database | PostgreSQL | 16 | ACID compliance, matches company stack |
| Payments | Stripe Python SDK | latest | Industry-standard payment processing |
| Payments | PayPal REST SDK | latest | PayPal integration |
| Images | Pillow | latest | Image processing for Django ImageField |
| Filtering | django-filter | latest | Declarative API filtering |
| CORS | django-cors-headers | latest | Cross-origin support for frontend |
| Containerization | Docker Compose | v2 | Local dev environment |

### Detected Stack Constraints
Greenfield — no existing constraints. Tech choices from the Upstream Literacy proposal (Python Django/Flask, JavaScript React/Vue.js, PostgreSQL) have been respected.

### Shared Interfaces

| Interface | Location | Purpose | Depended on by |
|-----------|----------|---------|----------------|
| Product model | `apps/catalog/models.py` | Core product entity | Catalog, Cart, Orders, Analytics |
| User model | Django built-in `auth.User` | Authentication identity | Accounts, Cart, Orders, Analytics |
| UserProfile model | `apps/accounts/models.py` | Extended user info | Accounts, Checkout (pre-fill) |
| Cart model | `apps/cart/models.py` | Shopping cart entity | Cart, Orders (checkout consumes cart) |
| Order model | `apps/orders/models.py` | Order entity | Orders, Payments, Analytics |
| JWT auth | SimpleJWT middleware | Request authentication | All authenticated endpoints |
| Axios API client | `frontend/src/api/client.ts` | HTTP client with JWT interceptors | All frontend pages/contexts |
| TypeScript types | `frontend/src/types/index.ts` | Shared type definitions | All frontend components |
| AuthContext | `frontend/src/context/AuthContext.tsx` | Auth state management | Protected routes, Cart merge, Checkout |
| CartContext | `frontend/src/context/CartContext.tsx` | Cart state management | Cart, Checkout, Navbar badge |

---

## 4. Strategy

### Build vs. Buy

| Capability | Decision | Rationale |
|-----------|----------|-----------|
| Payment processing | Buy (Stripe + PayPal SDKs) | Never build your own — use battle-tested gateways |
| Admin panel | Buy (Django admin + Unfold theme) | Free with Django, Unfold adds modern polish |
| Authentication/JWT | Buy (SimpleJWT) | Standard, battle-tested library |
| Analytics tracking | Build (custom) | Simple event model + admin charts, specific to our needs |
| Email sending | Build (Django email framework) | Console backend for dev, swap to SMTP/SendGrid later |
| Image handling | Buy (Pillow + Django ImageField) | Standard approach |
| Search | Build (Django ORM) | `icontains` + django-filter is sufficient at this scale |
| Cart persistence | Build (custom dual-auth) | Session + DB merge is specific to our architecture |

### MVP Scope

**In MVP (this project):**
- Full product catalog with categories, images, search, filtering
- Shopping cart with guest + authenticated support and cross-device merge
- Complete checkout flow with Stripe + PayPal (sandbox)
- Order lifecycle management with status tracking
- Customer accounts with order history and profiles
- Admin panel (Unfold-themed) for products, orders, inventory
- Analytics event tracking with admin dashboard charts
- Seed data with realistic literacy products
- Responsive Tailwind-based storefront

**Explicitly deferred:**
- Real payment processing (just swap keys when ready)
- Real email sending (swap console backend for SMTP/SendGrid)
- Product reviews/ratings
- Wishlist functionality
- Coupon/discount codes
- Shipping rate calculation
- Advanced search (Elasticsearch)
- Multi-language support
- Real product images (using placeholders)

### Iteration Approach
After MVP, the natural next steps would be: production deployment → real payment keys → real email service → product reviews → coupon system → advanced analytics.

### Deployment Strategy

**Development:** Docker Compose with 3 services (PostgreSQL, Django backend, React frontend)

**Production path (when ready):**
- Backend: Railway or Render (Django + PostgreSQL)
- Frontend: Vercel (static React build)
- CI/CD: GitHub Actions for testing and deployment

---

## 5. Project Structure

```
upstream/checkout_system/
├── PROJECT_PLAN.md
├── docker-compose.yml
├── .env.example
├── .env                          # Local dev (git-ignored)
├── .gitignore
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── manage.py
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   └── apps/
│       ├── __init__.py
│       ├── accounts/
│       │   ├── __init__.py
│       │   ├── models.py          # UserProfile
│       │   ├── serializers.py
│       │   ├── views.py
│       │   ├── urls.py
│       │   ├── admin.py
│       │   └── tests.py
│       ├── catalog/
│       │   ├── __init__.py
│       │   ├── models.py          # Category, Product, ProductImage
│       │   ├── serializers.py
│       │   ├── views.py
│       │   ├── urls.py
│       │   ├── admin.py
│       │   ├── management/
│       │   │   └── commands/
│       │   │       └── seed_data.py
│       │   └── tests.py
│       ├── cart/
│       │   ├── __init__.py
│       │   ├── models.py          # Cart, CartItem
│       │   ├── serializers.py
│       │   ├── views.py           # Dual auth (JWT + session)
│       │   ├── urls.py
│       │   └── tests.py
│       ├── orders/
│       │   ├── __init__.py
│       │   ├── models.py          # Order, OrderItem
│       │   ├── serializers.py
│       │   ├── views.py
│       │   ├── urls.py
│       │   ├── admin.py
│       │   ├── services.py        # Checkout logic, email triggers, stock mgmt
│       │   └── tests.py
│       ├── payments/
│       │   ├── __init__.py
│       │   ├── views.py           # Stripe + PayPal endpoints
│       │   ├── services.py        # Payment processing logic
│       │   ├── urls.py
│       │   └── tests.py
│       └── analytics/
│           ├── __init__.py
│           ├── models.py          # AnalyticsEvent
│           ├── views.py           # Event recording API
│           ├── urls.py
│           ├── admin.py           # Dashboard charts
│           └── tests.py
│
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css
        ├── api/
        │   └── client.ts           # Axios instance + JWT interceptors
        ├── context/
        │   ├── AuthContext.tsx
        │   └── CartContext.tsx
        ├── hooks/
        │   ├── useAuth.ts
        │   ├── useCart.ts
        │   └── useOrders.ts
        ├── types/
        │   └── index.ts            # Shared TypeScript types
        ├── pages/
        │   ├── HomePage.tsx
        │   ├── ProductListPage.tsx
        │   ├── ProductDetailPage.tsx
        │   ├── CartPage.tsx
        │   ├── CheckoutPage.tsx
        │   ├── OrderConfirmationPage.tsx
        │   ├── OrderHistoryPage.tsx
        │   ├── LoginPage.tsx
        │   ├── SignupPage.tsx
        │   └── AccountPage.tsx
        └── components/
            ├── Layout.tsx
            ├── Navbar.tsx
            ├── ProductCard.tsx
            ├── CartItemRow.tsx
            ├── CartSummary.tsx
            ├── CheckoutForm.tsx
            ├── PaymentSelector.tsx
            ├── StripePaymentForm.tsx
            ├── PayPalButton.tsx
            ├── OrderStatusBadge.tsx
            └── ProtectedRoute.tsx
```

---

## 6. Implementation Plan

### Timeline
- **Start date:** 2026-03-18
- **Target completion:** 2026-03-24
- **Total estimated duration:** 7 days (~43 working hours at 6-7 hrs/day)

---

### Phase 1: Foundation — 1 day (~6 hrs)

**Goal:** Set up the complete development environment with all tooling, Docker containers running, and basic app skeleton navigable in the browser.

**Deliverables:**
- [ ] Docker Compose file with PostgreSQL 16, Django backend, React frontend
- [ ] Django project with 6 apps scaffolded (accounts, catalog, cart, orders, payments, analytics)
- [ ] Django settings configured (database, CORS, JWT, media, Unfold admin)
- [ ] React + Vite + TypeScript + Tailwind initialized and building
- [ ] Axios API client with JWT interceptor
- [ ] React Router with all route stubs
- [ ] Layout component with Navbar and Footer
- [ ] Git repository initialized

**Key Tasks:**
1. Create `docker-compose.yml` with db, backend, and frontend services
2. Create `.env.example` and `.env` with all environment variables
3. Create backend Dockerfile (python:3.12-slim + libpq-dev)
4. Create `requirements.txt` with all Python dependencies
5. Scaffold Django project: `config/` with settings, urls, wsgi, asgi
6. Create 6 Django app directories with `__init__.py`, empty model/view/url files
7. Configure Django settings: database, installed apps, middleware, DRF, JWT, CORS, Unfold
8. Create frontend Dockerfile (node:20-alpine)
9. Initialize Vite + React + TypeScript project
10. Install frontend deps: react-router-dom, axios, tailwindcss, @stripe/stripe-js, @stripe/react-stripe-js, @paypal/react-paypal-js
11. Configure Tailwind CSS via PostCSS
12. Create `src/api/client.ts` — Axios instance with baseURL, JWT interceptor, token refresh logic
13. Create `src/types/index.ts` — all TypeScript interfaces
14. Create `src/App.tsx` with React Router routes
15. Create `src/components/Layout.tsx` — Navbar + Outlet + Footer
16. Create `src/components/Navbar.tsx` — logo, nav links, cart badge, auth links
17. Create `src/components/ProtectedRoute.tsx` — redirect to login if unauthenticated
18. Create stub pages for all 10 routes
19. Initialize git repo, create `.gitignore`, initial commit
20. Verify: `docker compose up` runs all 3 services, frontend renders layout

**Success Criteria:**
- `docker compose up` starts all 3 services without errors
- Frontend renders at localhost:3000 with working navigation between stub pages
- Backend responds at localhost:8000/admin/ with Unfold-themed login page
- No console errors in browser or Django server

**Risks:**
- Vite version compatibility with Tailwind CSS PostCSS plugin → mitigated by using @tailwindcss/postcss instead of @tailwindcss/vite
- Docker build issues on Windows → use volume mounts for hot reload, node_modules in container

---

### Phase 2: Catalog + Accounts — 1 day (~7 hrs)

**Goal:** Complete product browsing experience with working auth. Users can browse categories, search/filter products, view product details, and register/login.

**Deliverables:**
- [ ] Category, Product, ProductImage models with migrations
- [ ] Catalog REST API (list, detail, featured, filter, search, pagination)
- [ ] Django admin for catalog with Unfold theme (inline images, prepopulated slugs)
- [ ] Seed data command with 15 literacy products across 4 categories
- [ ] Auth API endpoints (register, login, JWT refresh, profile)
- [ ] UserProfile model with post_save signal
- [ ] Frontend AuthContext (login, register, logout, token management)
- [ ] Frontend Login and Signup pages
- [ ] Frontend HomePage with featured products
- [ ] Frontend ProductListPage with category filter sidebar and search
- [ ] Frontend ProductDetailPage with image gallery and add-to-cart button

**Key Tasks:**
1. Implement catalog models (Category, Product, ProductImage) in `apps/catalog/models.py`
2. Create and run migrations
3. Build catalog serializers: ProductListSerializer (with primary image), ProductDetailSerializer (with all images), CategorySerializer (with product count)
4. Build catalog views: CategoryListView, CategoryDetailView, ProductListView (with django-filter), ProductDetailView, FeaturedProductsView
5. Register catalog models in Django admin with Unfold-styled ModelAdmin classes
6. Create `seed_data.py` management command with 4 categories and 15 products
7. Implement UserProfile model with post_save signal in `apps/accounts/models.py`
8. Build account serializers: RegisterSerializer, UserSerializer, UserUpdateSerializer
9. Build account views: RegisterView (returns JWT pair), MeView (retrieve/update)
10. Wire up SimpleJWT TokenObtainPairView and TokenRefreshView
11. Frontend: Build AuthContext with login/register/logout, localStorage token persistence
12. Frontend: Build LoginPage and SignupPage with form validation
13. Frontend: Build HomePage — hero section + featured products grid
14. Frontend: Build ProductCard component — image, name, price, add-to-cart button
15. Frontend: Build ProductListPage — grid layout, category sidebar, search bar, pagination
16. Frontend: Build ProductDetailPage — image display, description, price, stock status, add-to-cart

**Success Criteria:**
- Seed data loads 4 categories and 15 products via management command
- Catalog API returns paginated, filterable product lists
- User can register, login, and see their profile via the API
- Frontend displays product catalog with working search and category filters
- Django admin shows products with Unfold theme

**Risks:**
- Product images need to work without actual image files → use placeholder image URL in seed data or accept null images gracefully

---

### Phase 3: Cart — 1 day (~6 hrs)

**Goal:** Fully working shopping cart with guest and authenticated support, cross-device persistence, and seamless merge on login.

**Deliverables:**
- [ ] Cart and CartItem models with migrations
- [ ] Cart REST API with dual authentication (JWT + session cookie)
- [ ] Cart merge endpoint (guest → authenticated)
- [ ] Session cookie middleware for guest cart identification
- [ ] Frontend CartContext with addItem, updateQuantity, removeItem, clearCart
- [ ] Frontend CartPage with item list, quantity controls, summary, checkout button
- [ ] Cart badge in Navbar showing item count
- [ ] Cart merge trigger on login in AuthContext

**Key Tasks:**
1. Implement Cart and CartItem models in `apps/cart/models.py`
2. Create and run migrations
3. Build cart serializers: CartSerializer, CartItemSerializer, AddToCartSerializer, UpdateCartItemSerializer
4. Implement `get_or_create_cart()` utility — JWT user lookup → session cookie lookup → create new
5. Implement `set_cart_cookie()` — sets HttpOnly cart_session cookie for guests
6. Build CartView (GET cart, DELETE clear), CartItemView (POST add), CartItemDetailView (PATCH quantity, DELETE remove)
7. Build CartMergeView — merge guest cart items into user cart, delete guest cart, clear cookie
8. Frontend: Build CartContext — fetch cart on mount, expose CRUD methods, persist cart ID
9. Frontend: Update AuthContext to call cart merge after login
10. Frontend: Build CartItemRow component — product info, quantity +/- buttons, remove button, line total
11. Frontend: Build CartSummary component — subtotal, item count, checkout button
12. Frontend: Build CartPage — list of CartItemRows + CartSummary
13. Frontend: Update Navbar with cart icon badge (item count from CartContext)
14. Frontend: Add "Add to Cart" functionality to ProductCard and ProductDetailPage

**Success Criteria:**
- Guest can add items to cart, quantity persists across page reloads (via session cookie)
- Authenticated user's cart persists across devices (via DB lookup by user)
- On login, guest cart items merge into user cart without duplicates
- Cart badge in navbar updates in real-time
- Cart page shows correct items, quantities, and totals

**Risks:**
- Session cookie not sent cross-origin (frontend:3000 → backend:8000) → ensure CORS_ALLOW_CREDENTIALS=True and cookie SameSite=Lax

---

### Phase 4: Checkout + Payments — 2 days (~12 hrs)

**Goal:** Complete checkout flow from cart to order confirmation, with working Stripe and PayPal sandbox payments.

**Deliverables:**
- [ ] Order and OrderItem models with migrations
- [ ] Checkout endpoint: validate cart, check stock, create order, decrement stock atomically
- [ ] Order number generation (human-readable: UL-YYYYMMDD-NNNN)
- [ ] Stripe PaymentIntent creation and webhook handler
- [ ] PayPal order creation and capture endpoints
- [ ] Stock restoration on payment failure
- [ ] Console email confirmation on successful payment
- [ ] Frontend CheckoutPage with shipping form and payment method selector
- [ ] Frontend StripePaymentForm using Stripe Elements
- [ ] Frontend PayPalButton using PayPal React SDK
- [ ] Frontend OrderConfirmationPage

**Key Tasks:**
1. Implement Order and OrderItem models in `apps/orders/models.py` with order number generation
2. Create and run migrations
3. Build order serializers: OrderSerializer, OrderListSerializer, CheckoutSerializer
4. Implement `create_order_from_cart()` service — validate items, check stock, create order + items, atomic stock decrement with F() expressions, clear cart
5. Implement `send_order_confirmation()` service — console email with order details
6. Implement `restore_stock()` service — restore stock on failed/cancelled orders
7. Build CheckoutView — accepts shipping info + payment method, creates order
8. Implement Stripe services: `create_stripe_payment_intent()`, `handle_stripe_webhook()`
9. Implement PayPal services: `create_paypal_order()`, `capture_paypal_payment()`
10. Build payment views: StripeCreateIntentView, StripeWebhookView, PayPalCreateOrderView, PayPalCaptureView
11. Register Order and OrderItem in Django admin with Unfold theme
12. Frontend: Build CheckoutForm component — email, shipping address fields (pre-fill from profile if logged in)
13. Frontend: Build PaymentSelector component — Stripe/PayPal radio buttons
14. Frontend: Build StripePaymentForm — Stripe Elements CardElement, confirmCardPayment flow
15. Frontend: Build PayPalButton — PayPal JS SDK createOrder/onApprove callbacks
16. Frontend: Build CheckoutPage — combines CheckoutForm + PaymentSelector + order summary sidebar
17. Frontend: Build OrderConfirmationPage — displays order number, items, total, status
18. Frontend: Build OrderStatusBadge component

**Success Criteria:**
- Checkout creates an order, decrements stock atomically, and clears the cart
- Stripe test payment (card 4242 4242 4242 4242) completes successfully
- PayPal sandbox payment completes successfully
- Order confirmation page displays correct order details
- Failed payment restores stock and cancels order
- Console shows email confirmation output

**Risks:**
- Stripe webhook testing requires Stripe CLI or manual event simulation → document in README
- PayPal sandbox can be slow/unreliable → implement timeout handling
- Race condition on stock → F() expressions with stock__gte filter handle this

---

### Phase 5: Orders + Analytics + Polish — 2 days (~12 hrs)

**Goal:** Complete feature set with order history, analytics dashboard, and polished responsive UI.

**Deliverables:**
- [ ] Order list and detail API endpoints
- [ ] Guest order lookup endpoint (order number + email)
- [ ] AnalyticsEvent model and tracking
- [ ] Analytics admin dashboard with charts (conversion funnel, revenue, popular products)
- [ ] Frontend OrderHistoryPage
- [ ] Frontend AccountPage with profile editing
- [ ] Out-of-stock UI handling (disabled buttons, badges)
- [ ] Responsive design pass (mobile, tablet, desktop)
- [ ] Loading states and error handling across all pages
- [ ] README with setup instructions, screenshots, architecture overview

**Key Tasks:**
1. Build OrderListView and OrderDetailView (authenticated users)
2. Build GuestOrderLookupView (order number + email query params)
3. Implement AnalyticsEvent model in `apps/analytics/models.py`
4. Build analytics event recording view and wire up URL
5. Add analytics tracking to key actions: page view, add to cart, checkout start, purchase complete
6. Build analytics admin dashboard: conversion funnel chart, revenue by category, popular products, cart abandonment rate
7. Frontend: Build OrderHistoryPage — table of past orders with status badges
8. Frontend: Build AccountPage — profile form with address, phone, name editing
9. Frontend: Add out-of-stock visual indicators to ProductCard and ProductDetailPage
10. Frontend: Add loading spinners and skeleton screens to all data-fetching pages
11. Frontend: Add error toast/alert components for API errors
12. Frontend: Responsive design pass — test and fix layouts at mobile (375px), tablet (768px), desktop (1280px)
13. Frontend: Polish Navbar for mobile (hamburger menu)
14. Frontend: Add empty states (empty cart, no orders, no search results)
15. Write README.md with project overview, setup instructions, architecture diagram, screenshots

**Success Criteria:**
- Authenticated users can view their order history and order details
- Guests can look up orders by order number + email
- Analytics admin shows charts with real data from tracked events
- All pages are responsive and look good on mobile
- No unhandled errors — all API failures show user-friendly messages
- README provides clear setup instructions

**Risks:**
- Analytics charting in Django admin may require custom template work → use Unfold's dashboard widget support or simple Chart.js injection
- Responsive design for checkout form (Stripe Elements) needs careful testing

---

## 7. Cost Analysis

### Development Costs

| Phase | Effort Estimate | Paid Tools / Licenses | Phase Cost |
|-------|----------------|----------------------|------------|
| Phase 1: Foundation | ~6 hrs | None (all open-source) | $0 |
| Phase 2: Catalog + Accounts | ~7 hrs | None | $0 |
| Phase 3: Cart | ~6 hrs | None | $0 |
| Phase 4: Checkout + Payments | ~12 hrs | Stripe account (free), PayPal Dev account (free) | $0 |
| Phase 5: Orders + Analytics + Polish | ~12 hrs | None | $0 |
| **Total** | **~43 hrs** | | **$0** |

All tools are open-source or free-tier. No paid licenses required for development.

### Operational Costs at Scale

| Component | 100 users/mo | 1K users/mo | 10K users/mo | 100K users/mo |
|-----------|-------------|-------------|--------------|---------------|
| Railway (backend) | ~$5 | ~$15 | ~$35 | ~$80 |
| Railway (PostgreSQL) | ~$1 | ~$5 | ~$15 | ~$50 |
| Vercel (frontend) | $0 | $0 | $20 | $20 |
| Stripe fees (2.9% + $0.30/txn) | ~$5 | ~$50 | ~$500 | ~$5,000 |
| PayPal fees (3.49% + $0.49/txn) | ~$6 | ~$60 | ~$600 | ~$6,000 |
| Domain + SSL | ~$1 | ~$1 | ~$1 | ~$1 |
| **Monthly Total** | **~$18** | **~$131** | **~$1,171** | **~$11,151** |

*Assumes average order value of $100. Payment fees dominate at scale and are unavoidable with any gateway.*

### Alternative Cost Comparison

#### Hosting

| Option | Monthly @ 1K users | Monthly @ 10K users | Notes |
|--------|-------------------|---------------------|-------|
| **Railway (Chosen)** | ~$20 | ~$50 | Simple deployment, pay-as-you-go |
| Render | ~$19 | ~$50 | Similar pricing, free PostgreSQL tier |
| AWS (ECS + RDS) | ~$50 | ~$120 | More control, more operational complexity |
| Heroku | ~$25 | ~$75 | Simpler but pricier, Eco dynos sleep |

#### Database

| Option | Monthly @ 1K users | Monthly @ 10K users | Notes |
|--------|-------------------|---------------------|-------|
| **Railway PostgreSQL (Chosen)** | ~$5 | ~$15 | Integrated with Railway, simple |
| Supabase PostgreSQL | $0 (free tier) | $25 | Generous free tier, extras included |
| AWS RDS | ~$15 | ~$50 | More robust, more complex |

### Cost Summary

| Category | Low Estimate | High Estimate |
|----------|-------------|---------------|
| Total development cost | $0 | $0 |
| Monthly ops (at 1K users/mo) | $131 | $175 |
| Annual ops (at 1K users/mo) | $1,572 | $2,100 |

*Sources: [Stripe Pricing](https://stripe.com/pricing), [PayPal Business Fees](https://www.paypal.com/us/business/fees), [Railway Pricing](https://railway.com/pricing)*

---

## 8. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| Vite/Tailwind version incompatibility | Med | Med | Use @tailwindcss/postcss instead of @tailwindcss/vite plugin |
| Stripe webhook testing complexity | Low | High | Document Stripe CLI setup in README; manual testing via API calls |
| PayPal sandbox reliability | Low | Med | Implement timeout handling; PayPal is secondary payment option |
| Cart session cookie not sent cross-origin | High | Med | CORS_ALLOW_CREDENTIALS=True, SameSite=Lax, proxy in dev if needed |
| Stock race conditions during checkout | High | Low | Atomic F() expression updates with stock__gte filter |
| Scope creep on analytics dashboard | Med | Med | Keep charts simple — 3-4 key metrics, avoid building a full BI tool |
| Docker volume issues on Windows | Med | Med | Use WSL2 backend, volume mounts for hot reload |
| django-unfold compatibility with Django 5.2 | Med | Low | Verify version compatibility before starting; fallback to plain Django admin |

---

## 9. Next Steps

1. **Begin Phase 1** — set up Docker Compose, scaffold Django + React projects, get the dev environment running
2. **Create Stripe account** — get test API keys from the Stripe Dashboard (free, no credit card needed)
3. **Create PayPal Developer account** — get sandbox credentials from developer.paypal.com (free)
4. **Review seed data categories** — confirm the 4 literacy product categories make sense for the demo
5. **Gather branding assets** — if Upstream Literacy has logo/colors, incorporate them into the storefront design
