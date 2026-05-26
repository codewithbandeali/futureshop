# client-next

Next.js 15 storefront for the Order Management System, replacing the legacy CRA `client/`.

Backend stays Laravel (in `../server`). This app proxies `/backend/*` to the Laravel API in dev so client code calls a same-origin path and avoids CORS during development.

## Stack

- Next.js 15 (App Router, Turbopack)
- React 19
- Tailwind CSS 4
- Redux Toolkit + React Redux
- lucide-react (icons)
- react-hot-toast (notifications)
- recharts (admin charts)

## Getting started

1. Install dependencies:

   ```bash
   cd client-next
   npm install
   ```

2. Copy the env file and adjust if your Laravel host/port differs:

   ```bash
   cp .env.example .env.local
   ```

3. Start Laravel API in one terminal:

   ```bash
   cd ../server
   php artisan serve   # listens on http://localhost:8000
   ```

4. Start Next.js in another terminal:

   ```bash
   npm run dev          # listens on http://localhost:3000
   ```

Open [http://localhost:3000](http://localhost:3000).

## Project layout

```
app/
  (public)/            Storefront routes: /, /shop, /product/[id], /cart, /orders
  admin/               Admin dashboard (single-vendor)
  layout.jsx           Root layout — Outfit font, Toaster, Redux Provider
  globals.css          Tailwind 4 entry
  StoreProvider.js     Redux store provider for the app shell

components/            UI components (Navbar, Footer, Hero, ProductCard, ...)
  admin/               Admin sidebar/navbar/layout

lib/
  api.js               Fetch wrappers (apiGet/Post/Put/Delete) + token auth header
  store.js             Redux store configuration
  features/            Redux slices: cart, product, address, rating

assets/                Imported images for Hero, products, profiles
```

## Backend wiring

`next.config.mjs` rewrites `/backend/:path*` → `http://localhost:8000/:path*`.
Inside client code we call `apiGet("/api/products")` which hits `http://localhost:8000/api/products` via the dev proxy.

For auth, `lib/api.js` reads `localStorage.auth_token` and sets `Authorization: Bearer <token>`. Issue tokens from a Laravel route using Sanctum (`->createToken('client')->plainTextToken`).

## Migrated from GoCart

This scaffold started as a fork of [GoCart](https://github.com/GreatStackDev/goCart) — multi-vendor pieces removed:

- `app/store/` (vendor seller dashboard)
- `components/store/`
- `app/(public)/create-store/`, `app/(public)/pricing/`
- Express server, Prisma, socket.io dependencies

Single-vendor admin dashboard is kept in `app/admin/` and `components/admin/`.

## Next steps

- Wire `lib/features/product/productSlice` to real Laravel endpoints (currently expects same shape as GoCart mock data — likely needs adapter)
- Replace seller-side API calls in `app/admin/` with Laravel admin endpoints
- Apply SKILLS.md design tokens to `globals.css` (typography scale, color, spacing)
- Add SEO metadata per page (App Router `generateMetadata`)
