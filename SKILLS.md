# Modern E-Commerce Design Patterns (2025–2026)
## Reference Document for Laravel Platform Modernization

---

## 1. Design Philosophy

The client wants a **2026-standard e-commerce UI** — not a template refresh. Modern e-commerce design has moved decisively away from cluttered, busy layouts toward:

- **Intentional whitespace** — generous padding, room to breathe
- **Typography-led hierarchy** — big, confident headings; restrained body text
- **Subtle motion** — micro-interactions on hover, smooth transitions, no jarring animations
- **Mobile-first thinking** — designed for thumb-reach, not mouse-click
- **Conversion-focused layouts** — every element earns its place by guiding toward purchase

Reference benchmarks: Allbirds, Gymshark, Glossier, ASOS 2024, Apple Store. Study these before designing a single component.

---

## 2. Typography System

### Font Pairing Strategy
```
Display / Hero:     A distinctive serif or geometric sans — e.g. Playfair Display, 
                    DM Serif Display, Fraunces, or Clash Display
Body / UI:          Clean, readable — e.g. DM Sans, Plus Jakarta Sans, Outfit, 
                    or Inter (used sparingly, not as the only font)
Mono (prices/data): JetBrains Mono or IBM Plex Mono for price figures
```

### Type Scale (CSS custom properties)
```css
:root {
  --text-xs:   0.75rem;   /* 12px — labels, badges */
  --text-sm:   0.875rem;  /* 14px — secondary copy */
  --text-base: 1rem;      /* 16px — body text */
  --text-lg:   1.125rem;  /* 18px — lead text */
  --text-xl:   1.25rem;   /* 20px — card titles */
  --text-2xl:  1.5rem;    /* 24px — section headers */
  --text-3xl:  1.875rem;  /* 30px — page titles */
  --text-4xl:  2.25rem;   /* 36px — hero subheadings */
  --text-5xl:  3rem;      /* 48px — hero headings */
  --text-6xl:  3.75rem;   /* 60px — large hero */
}
```

### Typography Rules
- Line height: 1.5 for body, 1.1–1.2 for headings
- Letter spacing: -0.02em to -0.03em for large headings (tighter = more premium)
- Max line length: 65–75 characters for body text (use `max-width: 65ch`)
- Never use all-caps on body text; use sparingly on labels only

---

## 3. Color System

### Approach
Pick one dominant brand color, one accent, and build neutrals around them. Avoid multi-color schemes — they read as cheap.

```css
:root {
  /* Example: Premium dark scheme */
  --color-brand:      #1a1a2e;   /* Deep navy — dominant */
  --color-accent:     #e94560;   /* Warm red — CTAs only */
  --color-surface:    #f8f7f4;   /* Warm off-white — backgrounds */
  --color-surface-2:  #f0ede8;   /* Slightly darker — card backgrounds */
  --color-border:     #e8e4dd;   /* Subtle dividers */
  --color-text-1:     #1a1a1a;   /* Primary text */
  --color-text-2:     #6b6b6b;   /* Secondary text */
  --color-text-3:     #9b9b9b;   /* Muted text, placeholders */
  --color-success:    #22c55e;
  --color-warning:    #f59e0b;
  --color-danger:     #ef4444;
}
```

### Color Usage Rules
- Brand color: navigation, headers, footer
- Accent color: primary CTAs (Add to Cart, Buy Now) ONLY — not used decoratively
- Never use pure `#000000` black — use `#1a1a1a` or `#111111`
- Never use pure `#ffffff` white — use `#f8f7f4` or `#fafaf9` for warmth

---

## 4. Spacing System

```css
:root {
  --space-1:  0.25rem;   /* 4px */
  --space-2:  0.5rem;    /* 8px */
  --space-3:  0.75rem;   /* 12px */
  --space-4:  1rem;      /* 16px */
  --space-5:  1.25rem;   /* 20px */
  --space-6:  1.5rem;    /* 24px */
  --space-8:  2rem;      /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */
  --space-24: 6rem;      /* 96px */
}
```

**Section padding:** `py-20` (80px) desktop, `py-12` (48px) mobile
**Card padding:** `p-6` (24px) desktop, `p-4` (16px) mobile
**Container max-width:** 1280px with auto horizontal margins

---

## 5. Component Patterns

### 5.1 Navigation Bar
```
Desktop:
[Logo]    [Categories]  [New In]  [Sale]       [Search] [Wishlist] [Cart (3)] [Account]

Mobile:
[Hamburger]    [Logo]    [Search] [Cart]

Behavior:
- Transparent on hero, solid on scroll (transition: background 0.3s)
- Height: 72px desktop, 60px mobile
- Sticky, not fixed (avoids layout shift)
- Mega-menu on hover for categories (CSS-only where possible)
- Search: expand inline on desktop, full-screen overlay on mobile
```

### 5.2 Hero Section
```
Pattern A — Full bleed image + overlay text:
[Full-viewport image]
[Brand headline — large serif, white]
[Subheadline — light weight, opacity 0.85]
[CTA button — solid accent]

Pattern B — Split layout:
[Left 50%: headline + copy + CTA]  |  [Right 50%: product image]

Pattern C — Minimal text-led:
[Centered headline — very large, dark on light]
[Single CTA below]
[Product grid or lifestyle image below fold]

Rules:
- Hero height: 85–100vh desktop, auto on mobile
- Always have one primary CTA — never two equal buttons
- Headline max 6 words for maximum impact
```

### 5.3 Product Card
```
┌─────────────────────────┐
│                         │
│   [Product image]       │  ← aspect-ratio: 4/5, object-fit: cover
│   (hover: second image) │  ← swap image on hover, 0.3s transition
│                    [♡]  │  ← wishlist, appears on hover
│                         │
├─────────────────────────┤
│  Category label         │  ← text-xs, color: --text-3, uppercase, letter-spacing
│  Product Name           │  ← text-base, font-weight: 500, 2-line clamp
│  Brand Name             │  ← text-sm, color: --text-2
│  £29.99  ~~£39.99~~     │  ← price prominent, sale in accent, original struck
│  ⭐⭐⭐⭐⭐ (127)         │  ← stars + count, text-xs
│  [Add to Cart ──────→]  │  ← appears on hover (desktop), always visible mobile
└─────────────────────────┘

Hover state (desktop):
- Card lifts: transform: translateY(-4px)
- Shadow increases: box-shadow 0 20px 40px rgba(0,0,0,0.12)
- Secondary product image fades in
- Add to Cart button slides up from bottom
```

### 5.4 Product Detail Page Layout
```
[Breadcrumb: Home > Category > Product]

Left column (55%):          Right column (45%, sticky)
┌──────────────────┐        ┌──────────────────────────┐
│ Main image       │        │ Brand name (small, muted) │
│ (large, zoomable)│        │ Product name (large)      │
│                  │        │ ⭐⭐⭐⭐⭐ 4.8 (234 reviews)│
│ [thumb][thumb]   │        │                          │
│ [thumb][thumb]   │        │ £89.00                   │
└──────────────────┘        │ ~~£120.00~~ Save 26%     │
                            │                          │
                            │ Colour: [○][●][○]        │
                            │ Size:   [S][M][L][XL]    │
                            │                          │
                            │ [──── Add to Cart ────]  │
                            │ [──── Buy Now ────────]  │
                            │                          │
                            │ ✓ Free delivery over £50 │
                            │ ✓ Free returns 30 days   │
                            │ ✓ In stock — ships today │
                            └──────────────────────────┘

Below fold (full width):
[Description] [Specifications] [Reviews] — tab navigation
[You may also like — product carousel]
[Recently viewed]
```

### 5.5 Cart
```
Left (65%):
- Item rows: image (80px) | name + variant | qty stepper | price | remove
- Clear visual separation between items

Right (35%, sticky):
┌───────────────────────┐
│ Order Summary         │
│ Subtotal:    £118.00  │
│ Delivery:    FREE     │
│ ─────────────────     │
│ Total:       £118.00  │
│                       │
│ [── Checkout ──────→] │
│                       │
│ 🔒 Secure checkout    │
│ [Visa][MC][PayPal]... │
└───────────────────────┘
```

### 5.6 Buttons
```css
/* Primary CTA */
.btn-primary {
  background: var(--color-accent);
  color: white;
  padding: 14px 32px;
  border-radius: 6px;
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}
.btn-primary:hover {
  background: color-mix(in srgb, var(--color-accent) 85%, black);
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(233, 69, 96, 0.3);
}

/* Secondary */
.btn-secondary {
  background: transparent;
  border: 1.5px solid var(--color-text-1);
  color: var(--color-text-1);
  padding: 13px 31px; /* 1px less to account for border */
}
.btn-secondary:hover {
  background: var(--color-text-1);
  color: white;
}
```

### 5.7 Forms & Inputs
```css
.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.9375rem;
  color: var(--color-text-1);
  background: white;
  transition: border-color 0.2s;
  outline: none;
}
.form-input:focus {
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px rgba(26, 26, 46, 0.08);
}
```

---

## 6. Motion & Animation

### Principles
- Duration: 150–300ms for UI responses, 400–600ms for page transitions
- Easing: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` for most transitions
- Never animate more than 2 properties simultaneously on the same element
- Respect `prefers-reduced-motion` media query

### Standard Transitions
```css
/* Page-level fade in */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Product card reveal */
.product-card {
  animation: fadeInUp 0.4s ease both;
}
.product-card:nth-child(2) { animation-delay: 0.05s; }
.product-card:nth-child(3) { animation-delay: 0.10s; }
.product-card:nth-child(4) { animation-delay: 0.15s; }

/* Image hover swap */
.product-image-primary   { transition: opacity 0.3s ease; }
.product-image-secondary { opacity: 0; transition: opacity 0.3s ease; position: absolute; inset: 0; }
.product-card:hover .product-image-primary   { opacity: 0; }
.product-card:hover .product-image-secondary { opacity: 1; }
```

### Loading States
- Use skeleton loaders (pulsing grey shapes) — never spinners for content areas
- Add-to-cart button: show spinner inside button, don't disable the entire button

---

## 7. Mobile-First Responsive Patterns

### Breakpoints
```css
/* Mobile first — write base styles for 320px+ */
/* sm  */ @media (min-width: 640px)  { }
/* md  */ @media (min-width: 768px)  { }
/* lg  */ @media (min-width: 1024px) { }
/* xl  */ @media (min-width: 1280px) { }
```

### Mobile-Specific Rules
- Touch targets: minimum 44×44px (Apple HIG standard)
- Bottom navigation bar for mobile (Home, Search, Wishlist, Cart, Account)
- Filters: drawer from bottom on mobile, sidebar on desktop
- Product grid: 2 columns mobile, 3 tablet, 4 desktop
- Images: always use `loading="lazy"` except above-the-fold hero
- No hover-only interactions on mobile — all hover states must have tap equivalent

---

## 8. Page-by-Page Checklist

### Homepage
- [ ] Hero with strong headline + single CTA
- [ ] Category navigation (visual, image-led)
- [ ] Featured / bestseller products (8–12 cards)
- [ ] Promotional banner (full-width, high contrast)
- [ ] New arrivals section
- [ ] Trust signals: reviews count, delivery promise, returns policy
- [ ] Newsletter signup (minimal — email only)
- [ ] Footer: links, payment icons, social, copyright

### Product Listing
- [ ] Filter sidebar (desktop) / bottom drawer (mobile)
- [ ] Active filter tags with remove option
- [ ] Sort dropdown (Newest / Price / Rating / Bestselling)
- [ ] Product count displayed
- [ ] Grid/list view toggle
- [ ] Infinite scroll OR pagination (pick one — not both)
- [ ] Quick add to cart on card hover

### Product Detail
- [ ] Image gallery with zoom on desktop, swipe on mobile
- [ ] Sticky add-to-cart on mobile (fixed bottom bar)
- [ ] Variant selectors (size/colour) with sold-out state
- [ ] Stock urgency: "Only 3 left"
- [ ] Delivery estimate: "Order by 3pm for next-day delivery"
- [ ] Tabbed content: Description / Specs / Reviews
- [ ] Review summary with star distribution chart
- [ ] Related products

### Checkout
- [ ] Progress indicator (Cart → Details → Payment → Confirm)
- [ ] Guest checkout option prominently available
- [ ] Address autocomplete
- [ ] Payment method icons visible before reaching payment step
- [ ] Order summary visible throughout (not hidden)
- [ ] Trust badges near payment button

---

## 9. Performance Standards

| Metric | Target |
|---|---|
| Largest Contentful Paint (LCP) | < 2.5s |
| Cumulative Layout Shift (CLS) | < 0.1 |
| First Input Delay (FID) | < 100ms |
| Time to First Byte (TTFB) | < 600ms |
| Image format | WebP with JPEG fallback |
| Hero image size | < 200KB |
| Total page weight (homepage) | < 1.5MB |

### Laravel-Specific Performance
- Enable OPcache in PHP configuration
- Use Laravel's query caching for product listings
- Implement eager loading to eliminate N+1 queries
- Use database indexes on: products.category_id, products.created_at, orders.user_id, orders.status
- Enable HTTP/2 on server
- Implement CDN for static assets

---

## 10. SEO Structure (Laravel-Specific)

```php
// Every product page must have:
<title>{{ $product->name }} | {{ config('app.name') }}</title>
<meta name="description" content="{{ Str::limit($product->description, 155) }}">
<link rel="canonical" href="{{ url()->current() }}">

// Open Graph
<meta property="og:title"       content="{{ $product->name }}">
<meta property="og:description" content="{{ Str::limit($product->description, 155) }}">
<meta property="og:image"       content="{{ $product->primary_image_url }}">
<meta property="og:type"        content="product">

// Structured data — Product schema
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "{{ $product->name }}",
  "image": "{{ $product->primary_image_url }}",
  "description": "{{ $product->description }}",
  "offers": {
    "@type": "Offer",
    "price": "{{ $product->price }}",
    "priceCurrency": "GBP",
    "availability": "{{ $product->in_stock ? 'InStock' : 'OutOfStock' }}"
  }
}
</script>
```

### URL Structure
```
/                           Homepage
/products                   All products
/category/{slug}            Category listing
/product/{slug}             Product detail
/cart                       Cart
/checkout                   Checkout
/account                    Customer account
/account/orders             Order history
/account/orders/{id}        Order detail
```

All URLs lowercase, hyphen-separated, no query strings for navigation.

---

## 11. Accessibility Baseline

- Colour contrast ratio: minimum 4.5:1 for body text, 3:1 for large text
- All images have descriptive `alt` attributes
- All interactive elements reachable via keyboard Tab
- Focus states visible (not removed with `outline: none` without replacement)
- Form inputs have associated `<label>` elements
- Modals trap focus and close on Escape key
- Screen reader text for icon-only buttons: `<span class="sr-only">Add to wishlist</span>`