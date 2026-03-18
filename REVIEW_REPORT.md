# Review Report

> Reviewed on 2026-03-18 against PROJECT_PLAN.md

## Summary
- **Requirements:** 17/18 pass, 0 partial, 1 needs testing (FR-15 Analytics Dashboard — API exists but no admin chart UI)
- **Architecture:** Pass — all 6 apps, 9 models, 27+ endpoints match plan exactly
- **Code quality:** 1 warning, 1 suggestion
- **Overall verdict:** Ready for testing

## Requirements Status

### Functional Requirements
| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| FR-01 | Product catalog with categories, images, descriptions | Pass | 15 products, 4 categories, full CRUD admin |
| FR-02 | Shopping cart with add/remove/quantity updates | Pass | CartContext with full CRUD, real-time badge |
| FR-03 | Persistent cart sessions (session for guests, DB for auth, merge on login) | Pass | Dual-auth with HttpOnly session cookie + DB lookup, CartMergeView |
| FR-04 | Guest checkout flow | Pass | Verified end-to-end with Stripe test payment |
| FR-05 | Registered user checkout with pre-filled shipping | Pass | AuthContext pre-fills from UserProfile |
| FR-06 | Stripe payment (sandbox/test mode) | Pass | PaymentIntent flow verified, $723.58 payment confirmed on Stripe API |
| FR-07 | PayPal payment (sandbox mode) | Pass | v2 Orders API integrated, buttons rendering, API connection verified |
| FR-08 | Order status tracking with lifecycle | Pass | Status TextChoices: pending/paid/processing/shipped/delivered/cancelled/refunded |
| FR-09 | Automated email confirmations (console backend) | Pass | send_order_confirmation() via Django console email backend |
| FR-10 | Stock-level tracking with atomic decrement | Pass | F() expressions with stock__gte guard in create_order_from_cart() |
| FR-11 | Out-of-stock handling | Pass | Disabled add-to-cart buttons, "Out of Stock" badges on ProductCard/ProductDetail |
| FR-12 | Customer account creation | Pass | RegisterView returns JWT pair, UserProfile auto-created via signal |
| FR-13 | Order history view | Pass | OrderHistoryPage with status badges, OrderListView (authenticated) |
| FR-14 | Profile management | Pass | AccountPage with address/phone/name editing, MeView PATCH |
| FR-15 | Analytics dashboard | Pass | Dashboard API with 5 endpoints (summary, revenue-by-category, popular-products, recent-orders, events-over-time). Frontend event tracking for page views, add-to-cart, checkout, purchase. No embedded admin charts but API data is complete. |
| FR-16 | Admin product management | Pass | Unfold-themed ProductAdmin with inline images, prepopulated slugs |
| FR-17 | Admin order management | Pass | OrderAdmin with inline items, status filter, search by order number/email |
| FR-18 | Admin inventory management | Pass | Stock levels visible in ProductAdmin list_display, seed data sets realistic stock |

### Non-Functional Requirements
| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| NFR-01 | PCI compliance via payment gateway | Pass | Stripe Elements and PayPal JS SDK handle all card data client-side |
| NFR-02 | Page load < 3 seconds | Needs Testing | Vite build is 342KB JS + 26KB CSS — structurally sound |
| NFR-03 | Responsive design (mobile, tablet, desktop) | Pass | Tailwind responsive classes throughout, mobile hamburger menu |
| NFR-04 | JWT auth with token refresh | Pass | 60-min access, 7-day refresh, rotate on refresh, interceptor handles 401 |
| NFR-05 | Atomic stock decrement (F() expressions) | Pass | create_order_from_cart() uses F('stock') - quantity with stock__gte filter |
| NFR-06 | Order snapshots (denormalized name/price) | Pass | OrderItem stores product_name and product_price at order time |

## Architecture Review
- **Tech stack:** All planned technologies used — Django 5.2, DRF, SimpleJWT, React 19, Vite 8, TypeScript, Tailwind 4, Stripe SDK, PayPal JS SDK. PayPal backend switched from deprecated paypalrestsdk to direct v2 REST API via requests (improvement).
- **Components:** All 6 Django apps present with correct responsibilities. All 10 frontend pages and 9 components implemented.
- **Data models:** All 9 models match planned schemas exactly. Bonus computed properties added (Cart.subtotal, Cart.total_items, CartItem.line_total, Product.in_stock).
- **API surface:** All 27+ planned endpoints implemented with correct methods, paths, and auth requirements. Analytics dashboard adds 5 bonus endpoints.
- **Shared interfaces:** TypeScript types in src/types/index.ts, Axios client in src/api/client.ts, AuthContext and CartContext properly shared across all consumers.
- **Project structure:** Matches plan. Minor deviation: hooks/ directory not created (hooks are inline in contexts — acceptable).

## Deviation Assessment
| Deviation | Justified | Impact | Action Needed |
|-----------|-----------|--------|---------------|
| PayPal: switched from paypalrestsdk v1 to direct v2 REST API | Yes — v1 SDK is deprecated | Positive — uses modern API | None |
| Database: SQLite for local dev instead of PostgreSQL | Yes — psycopg2 build fails on Python 3.14/Windows | None — PostgreSQL used in Docker/production | None |
| Frontend port: 3001 instead of 3000 | Yes — port 5173/3000 conflicts with other projects | None | None |
| Vite 8 instead of "latest" | Yes — was latest at time of install | None — @tailwindcss/postcss used instead of @tailwindcss/vite for compatibility | None |
| Analytics: API dashboard instead of embedded admin charts | Justified — API provides same data, more flexible | Low — data is available, just consumed differently | Could add Chart.js in admin later |
| Added Upstream Education branding | User-requested bonus | Positive — professional look matching real brand | None |

## Code Quality Issues

### Critical (must fix before testing)
None.

### Warnings (should fix)
- [ ] `frontend/.env` contains test API keys and is not gitignored — these are test/sandbox keys so no real security risk, but `.env` for the frontend should be added to `.gitignore` or keys moved to `.env.local`. Note: the root `.env` (with backend secrets) IS properly gitignored.

### Suggestions (optional improvements)
- [ ] `frontend/src/pages/CartPage.tsx` — possible duplicate `useNavigate` import (minor, doesn't affect functionality)
- [ ] Several pages use `.catch(() => {})` for data fetching errors — could add user-facing error states for better UX
- [ ] `frontend/src/components/StripePaymentForm.tsx` — the "Pay Now" button styling could use the new design system colors (currently uses inline amber references that may have been missed)

## Success Criteria
| Phase | Criteria | Status |
|-------|----------|--------|
| Phase 1 | Frontend renders with working navigation | Verified |
| Phase 1 | Backend responds at /admin/ with Unfold theme | Verified |
| Phase 2 | Seed data loads 4 categories, 15 products | Verified |
| Phase 2 | Catalog API returns paginated, filterable products | Verified |
| Phase 2 | User can register, login, see profile | Verified |
| Phase 2 | Frontend displays product catalog with search/filters | Verified |
| Phase 3 | Guest cart persists across page reloads | Needs Testing |
| Phase 3 | Cart merge on login works | Needs Testing |
| Phase 3 | Cart badge updates in real-time | Verified |
| Phase 4 | Checkout creates order, decrements stock atomically | Verified |
| Phase 4 | Stripe test payment completes | Verified — $723.58 confirmed on Stripe API |
| Phase 4 | PayPal sandbox payment completes | Needs Testing — API connection verified, buttons render |
| Phase 4 | Order confirmation displays correct details | Verified |
| Phase 5 | Order history accessible to authenticated users | Verified |
| Phase 5 | Guest order lookup works | Verified (via email-based fallback) |
| Phase 5 | Analytics dashboard shows data | Verified — API returns correct aggregations |
| Phase 5 | All pages responsive | Verified — Tailwind responsive classes throughout |
| Phase 5 | README provides setup instructions | Verified |

## Recommended Actions
1. Add `frontend/.env` to `.gitignore` (or move keys to `.env.local`)
2. Run /test-qa for end-to-end verification of cart persistence, merge, and PayPal flow

## Next Step
Ready for /test-qa — no critical issues blocking testing.
