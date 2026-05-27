# Order Management System — Setup & Recovery Guide

This document is the **single source of truth** for getting the platform running locally and what work remains. Written as a recovery brief for whoever picks this up next.

---

## 1. Repository layout

```
Order-Management-System/
├── server/         Laravel 8 + Sanctum API (was already here)
├── client/         Legacy CRA React app (kept intact — DO NOT extend)
├── client-next/    Next.js 15 storefront (NEW — this is the canonical frontend)
├── SKILLS.md       2026 design reference doc
├── SETUP.md        ← this file
└── README.md       Original project README (outdated)
```

The migration plan: build new features in `client-next/`, leave `client/` as a fallback during cutover, then remove `client/` once the Next.js app is at parity.

---

## 2. Backend recovery (priority #1)

### 2.1 What was broken

- **No `.env` file** existed in `server/`. Laravel can't boot without one. This is the actual root cause of the "DB connection unclear" symptom from the brief.
- **No `orders` table.** Despite the project name, the database had no orders / order_items / addresses / ratings. The "/orders" route on the old client was reading the products list.

### 2.2 First-time setup (Windows + XAMPP)

1. Start **Apache + MySQL** from the XAMPP control panel.
2. Open `http://localhost/phpmyadmin` → create a new database called `order_management` (UTF-8, utf8mb4_unicode_ci).
3. Copy the env template:

   ```powershell
   cd server
   Copy-Item .env.example.local .env
   ```

   Then open `.env` and confirm `DB_DATABASE=order_management`, `DB_USERNAME=root`, `DB_PASSWORD=` (blank for default XAMPP).

4. Install Composer deps + generate app key + migrate + seed:

   ```powershell
   composer install
   php artisan key:generate
   php artisan migrate
   php artisan db:seed
   php artisan storage:link
   ```

   Seeded test accounts (created by `UserSeeder`):
   - Admin — `admin@example.com` / `Admin123`
   - Shopper — `user@example.com` / `User1234`

   `ProductSeeder` creates **16 sample products** (laptops, desktops, monitors, tablets, printers, scanners — Apple / Dell / HP / Samsung) with stock, MRP, branded placeholder thumbnails. Real product photos get uploaded later through `/admin/products/new` (Cloudinary).

### 2.6 Cloudinary (image hosting)

Cloudinary handles image upload, CDN delivery, and automatic format conversion (WebP / AVIF). Credentials live in `server/.env` under `CLOUDINARY_URL` and friends. The package `cloudinary-labs/cloudinary-laravel` is in `composer.json` — make sure `composer install` ran.

- Backend wrapper: `app/Services/CloudinaryService.php` — `upload()`, `uploadFromUrl()`, `destroy()`, `url()`. Other code talks to this service, never the SDK directly.
- Defaults are in `config/cloudinary.php`: `upload_folder = futureshop/products`, `default_transformations = f_auto,q_auto`.
- `ProductController::store/update` upload through this service. Delivered URLs already include the `f_auto,q_auto` transform.

**Security note**: a single `CLOUDINARY_URL` value contains the API secret. Treat it like a password — never commit `.env`, rotate the secret in the Cloudinary dashboard if it leaks (e.g. pasted into chat, screenshot, etc.).

5. Start the API:

   ```powershell
   php artisan serve
   # listens on http://localhost:8000
   ```

### 2.3 What the new migrations add

| Migration | Adds |
|---|---|
| `2026_05_26_000001_create_addresses_table` | `addresses` (FK → users) |
| `2026_05_26_000002_create_orders_table` | `orders` (FK → users, addresses) with subtotal/shipping/tax/total |
| `2026_05_26_000003_create_order_items_table` | `order_items` (FK → orders, products) with snapshot of name/sku/price |
| `2026_05_26_000004_create_ratings_table` | `ratings` (FK → users, products) with 1–5 score + optional review |
| `2026_05_26_000005_add_commerce_fields_to_products_table` | adds `mrp`, `stock`, `slug` to `products` |

### 2.4 API surface

Public:
- `GET  /api/products` — list, shape adapted via `ProductResource`
- `GET  /api/products/{id}` — single
- `GET  /api/products/{id}/ratings` — reviews
- `POST /api/login`, `POST /api/register`

Authenticated (Sanctum bearer token in `Authorization` header):
- `GET/POST/DELETE /api/address` — customer addresses
- `GET  /api/orders`, `GET /api/orders/{id}`, `POST /api/orders` — orders
- `POST /api/products/{id}/ratings`
- `POST /api/logout`

Admin (`log.api.request` middleware preserved):
- `POST /api/products` — multipart upload, sends thumbnail + images through Cloudinary
- `PUT  /api/products/{id}` — multipart, additive image uploads
- `DELETE /api/products/{id}`
- `GET  /api/admin/orders` — shop-wide order list
- `PATCH /api/admin/orders/{id}/status` — transition status, auto-restocks on cancel/refund
- `GET  /api/admin/customers` — users with order count + lifetime value aggregates
- `GET  /api/admin/customers/{id}` — single user with full order history

### 2.5 Order creation is transactional

`OrderController::store` runs inside a `DB::transaction`, locks the relevant product rows with `lockForUpdate()`, decrements stock, and creates `order_items` atomically. This prevents the "two customers buy the last unit" race condition.

---

## 3. Frontend (`client-next/`)

### 3.1 First-time setup

```powershell
cd client-next
npm install
Copy-Item .env.example .env.local
npm run dev
# listens on http://localhost:3000
```

The Next.js dev server rewrites `/backend/*` → `http://localhost:8000/*` so client-side code calls a same-origin path and avoids CORS during development. See `next.config.mjs`.

### 3.2 Stack

- Next.js 15 (App Router, Turbopack), React 19
- Tailwind CSS 4 (via `@tailwindcss/postcss`)
- Redux Toolkit (cart, product, address, rating slices)
- lucide-react, react-hot-toast, recharts

### 3.3 What's already wired

- **SKILLS.md design tokens** are live in `app/globals.css` — type scale, spacing scale, brand/accent colors, neutrals, `.btn-primary`, `.btn-secondary`, `.form-input`, `.skeleton`, `.product-card`, `prefers-reduced-motion` respect, `.sr-only` for a11y.
- **SEO**: root `layout.jsx` has `metadataBase`, OpenGraph, Twitter card, robots. Product page (`app/(public)/product/[productId]/page.jsx`) is now a **Server Component** that calls `generateMetadata` and emits a **JSON-LD Product schema** — crawlers and Slack/Facebook can finally see product info.
- **Server-side product fetch**: `lib/fetchProduct.js` hits Laravel directly during SSR (bypasses the dev rewrite).
- **API shape adapter**: server-side `App\Http\Resources\ProductResource` translates Laravel's `{thumbnail, images:[{image}]}` into the UI-friendly `{images:[urls], inStock, mrp, rating:[]}` shape the storefront expects.
- **API client**: `lib/api.js` adds `Authorization: Bearer <token>` from `localStorage.auth_token` (Sanctum-compatible).
- **DataInitializer** unwraps Laravel's `{ data: [...] }` envelope and only calls `/api/address` when a token exists, so anonymous visitors aren't blocked by 401s.

### 3.4 Branding decisions (what was ported from `client/`, what changed)

| Asset | Original (`client/`) | `client-next/` |
|---|---|---|
| Favicon | `client/public/favicon.ico` | ✅ ported (was GoCart's by mistake — fixed) |
| Logo (shopping bag SVG) | `client/src/assets/logo.svg` | ✅ copied to `client-next/assets/logo.svg` — not used in Navbar yet; current Navbar uses text-only `FutureShop.` for cleaner scaling |
| Brand colors | `#243E8B` navy + `#FFB81C` yellow | **Deliberately changed** to `#1a1a2e` brand + `#e94560` accent per SKILLS.md §3 (one brand + one accent is the 2026 spec; the original 4-5 competing colors don't fit). To revert, edit `--color-brand` and `--color-accent` in `app/globals.css`. |
| Hero image (`hero.jpg`) | Workshop photo | Not used — replaced with text-led hero per SKILLS.md §5.2 Pattern C. Can come back as a secondary section. |
| PWA icons (`logo192.png`, `logo512.png`) | Default CRA placeholders | Not migrated — generate fresh ones per the new brand if you want PWA install. |

### 3.5 Multi-vendor pieces removed (since this is single-vendor)

- `app/store/`, `components/store/` (vendor seller dashboards)
- `app/(public)/create-store/`, `app/(public)/pricing/` (vendor signup + pricing)
- Express, Prisma, socket.io, concurrently dependencies

---

## 4. Outstanding work (honest list)

These are NOT done. Prioritized.

### 4.1 Critical — blocks production launch

1. ~~**Wire login UI to Laravel `/api/login`.**~~ ✅ DONE — `app/(public)/login/page.jsx`, `register/page.jsx`, `lib/auth.js`
2. ~~**Build a checkout page**~~ ✅ DONE — `app/(public)/checkout/page.jsx` POSTs `/api/orders` with address selection + new-address inline form
3. **Payment integration.** Stripe is the safest default (Laravel Cashier, or direct PaymentIntent API). Webhook security requires careful review — do not ship this without testing the signature verification. Checkout page currently saves orders as `unpaid`.
4. ~~**`app/admin/` and `components/admin/` are still GoCart's vendor-approval flows.**~~ ✅ DONE — gutted and rebuilt for FutureShop:
   - `/admin` — dashboard (stats: products, orders, revenue, customers + recent orders + low stock)
   - `/admin/products` — list with search, category filter, inline edit/delete
   - `/admin/products/new` — create form with thumbnail + gallery upload (Cloudinary)
   - `/admin/products/[id]/edit` — same form, edits existing
   - `/admin/orders` — list with status filter **and inline status mutation** (`PATCH /api/admin/orders/{id}/status`); cancelling auto-restocks line items in a transaction
   - `/admin/customers` — list with order count + lifetime value (joined via SQL aggregate)
   - `/admin/categories` — derived from product catalog (no normalized table yet); each card links to filtered products list
   - `/admin/stores`, `/admin/approve`, `/admin/coupons` → redirect to `/admin` (legacy GoCart routes)
   - Admin chrome rebranded to FutureShop, auth-gated by `role === 'admin'` from the token user. Server still validates per-request on every mutation.

### 4.2 Important — affects quality

5. ~~**Most components still use GoCart's slate/green palette.**~~ ✅ DONE for the entire storefront and admin surface: Navbar, Footer, Hero, ProductCard, CategoriesMarquee, ProductDetails, ProductDescription, RelatedProducts, Counter, OrderSummary, OrderItem, Banner, Title, Loading, PageTitle, AddressModal, RatingModal, Rating, LatestProducts, BestSelling, OurSpec, Newsletter, AdminLayout, AdminSidebar, AdminNavbar. The few remaining GoCart-themed files (`OrdersAreaChart`, `StoreInfo`) are unused and can be deleted.
6. **Image domains.** `next.config.mjs` has `images: { unoptimized: true }` — fine for dev. For production:
   - Set `images.unoptimized = false`
   - Add `remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/dolxbkvwe/**' }]` (replace cloud name)
   - Add `placehold.co` for seeded placeholders, then remove once real photos are uploaded
   ProductCard already uses `next/image` `fill` mode.
7. **Old CRA `client/` Sanctum auth flow** could be referenced if needed — but `client-next/lib/auth.js` now has a working implementation.
8. ~~**Sample data**~~ ✅ DONE — `UserSeeder` (2 accounts) + `ProductSeeder` (8 products) wired into `DatabaseSeeder`. Run `php artisan db:seed`.

### 4.3 Nice-to-have — modernization

9. **Laravel 8 → 11 upgrade.** Sanctum 2 → 4 has breaking changes. Plan ~2 days. Not urgent — Laravel 8 LTS support ended but the project still works.
10. **TypeScript** in `client-next/` (currently `.jsx`). Big lift but pays off long-term.
11. ~~**Test suite**~~ ✅ Initial coverage in:
    - `server/tests/Feature/ProductsApiTest.php` — public listing shape, 404 path, auth gate on destroy
    - `server/tests/Feature/OrdersApiTest.php` — transactional stock decrement, insufficient-stock rejection, auto-restock on admin cancel
    - `server/tests/Feature/AuthApiTest.php` — login success/failure, password policy
    - `server/tests/Unit/CloudinaryServiceTest.php` — URL builder
    - `client-next/test/Rating.test.jsx` — accessibility + render
    - `client-next/test/OrderSummary.test.jsx` — free-shipping logic
    - `client-next/test/fetchProduct.test.js` — Laravel API Resource unwrap + error paths
12. ~~**CI**~~ ✅ `.github/workflows/ci.yml` runs PHPUnit + Vitest + `npm run build` on push/PR. `.github/workflows/security.yml` scans for leaked secrets with gitleaks weekly + on every PR.
13. **Performance audit** with real Core Web Vitals once there are real images. Targets in SKILLS.md §9 are aspirational until measured.

### 4.4 Production deployment & observability

**Frontend (Vercel recommended):**

- Env vars to set in Vercel project settings:
  - `NEXT_PUBLIC_API_URL` — full Laravel URL (no `/backend` rewrite in production)
  - `API_URL` — same as above (used by SSR fetch)
  - `NEXT_PUBLIC_SITE_URL` — `https://yourdomain.com`
  - `NEXT_PUBLIC_CURRENCY_SYMBOL` — e.g. `$`
  - `NEXT_PUBLIC_SENTRY_DSN` — from Sentry project setup (or skip for now)
  - `SENTRY_DSN` — server-side equivalent
- Sentry SDK stubs are in `client-next/sentry.{client,server,edge}.config.js`. They auto-no-op when DSN is missing. To turn them on: `npm install` to pick up `@sentry/nextjs`, then `npx @sentry/wizard@latest -i nextjs` once locally.

**Backend (DigitalOcean App Platform / Forge / Render):**

- Production `.env`: `APP_DEBUG=false`, real `DB_PASSWORD`, `FRONTEND_URL` (consumed by `config/cors.php`).
- Sentry Laravel: `composer require sentry/sentry-laravel`, `php artisan sentry:publish --dsn=YOUR_DSN`. Logs ship on exception + manual `report()` calls.
- OPcache: `opcache.enable=1`, `opcache.memory_consumption=256` — 2-3x request speedup with no code change.
- Caches: `php artisan config:cache route:cache view:cache` on every deploy.

**Secrets management:**

- Never commit `.env`. Use the platform's secret vault (Vercel env vars, AWS Secrets Manager, Doppler).
- CI security workflow (`gitleaks-action`) blocks any commit containing a Cloudinary URL, AWS keys, or known token patterns.
- Rotate `CLOUDINARY_URL` if it ever appears in chat / Slack / screenshots — that string contains the API secret.

**Real product photos (no code needed):**

1. Log into the deployed admin as `admin@example.com`.
2. `/admin/products` → click a seeded product → **Edit**.
3. Upload real thumbnail + gallery images (5MB max). They go to Cloudinary; the row's URL gets replaced.
4. Repeat. The seeded `placehold.co` URLs disappear from the storefront.
5. For bulk import, write a one-shot Artisan command that loops a CSV and calls `CloudinaryService::uploadFromUrl()`.

**Performance audit (once live):**

- `npx unlighthouse` against the homepage + 5 product pages.
- SKILLS.md §9: LCP < 2.5s, CLS < 0.1, FID < 100ms, page weight < 1.5 MB.
- Cloudinary handles WebP/AVIF; biggest remaining win is usually 3rd-party JS reduction.

---

## 5. What was DELIBERATELY not done in the initial recovery

Anyone claiming "complete frontend + backend integration" in a single session is selling you something. The realistic delivery for the brief's stated $2k–$5k / 4–8 week scope:

- **Week 1**: items 1–4 above (auth wiring, checkout, payment, admin)
- **Week 2**: items 5, 7, 8 (palette, port auth, seeders)
- **Weeks 3–4**: visual QA of every page against SKILLS.md, mobile-first audit (bottom nav, filter drawer, sticky add-to-cart), real-data testing
- **Weeks 5–6**: items 9, 10, 12 (Laravel upgrade, TS, CI)
- **Weeks 7–8**: production deployment, observability (Sentry), perf tuning, SEO submission (sitemap.xml, Google Search Console)

---

## 6. Deployment checklist (when ready)

Backend:
- [ ] `APP_DEBUG=false`, `APP_ENV=production` in `.env`
- [ ] Real `DB_PASSWORD`, never blank
- [ ] `FRONTEND_URL=https://yourdomain.com` (consumed by `config/cors.php`)
- [ ] `SANCTUM_STATEFUL_DOMAINS=yourdomain.com`
- [ ] HTTPS-only cookies: `SESSION_SECURE_COOKIE=true`, `SESSION_DOMAIN=.yourdomain.com`
- [ ] OPcache enabled in PHP (`opcache.enable=1`, `opcache.memory_consumption=256`)
- [ ] `php artisan config:cache && php artisan route:cache && php artisan view:cache`
- [ ] Database indexes: `addresses(user_id, is_default)`, `orders(user_id, status)`, `orders(created_at)`, `order_items(order_id)`, `products(category)` are in the new migrations. Verify `EXPLAIN` on slow queries.

Frontend:
- [ ] `NEXT_PUBLIC_SITE_URL=https://yourdomain.com`
- [ ] `API_URL=https://api.yourdomain.com`
- [ ] `NEXT_PUBLIC_API_URL=https://api.yourdomain.com` (drop the `/backend` rewrite in production)
- [ ] Turn on `images.unoptimized = false`, list product image hostnames
- [ ] Add `app/sitemap.ts` and `app/robots.ts`
- [ ] Submit sitemap to Google Search Console

---

## 7. Contacts / references

- Original CRA app: `client/` (do not extend)
- Design reference: `SKILLS.md`
- Source of `client-next/` scaffold: forked from [GoCart](https://github.com/GreatStackDev/goCart) — multi-vendor pieces removed
