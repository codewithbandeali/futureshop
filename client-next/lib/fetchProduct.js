/**
 * Server-side product fetch — used by generateMetadata and the product page
 * itself. Hits the Laravel backend directly (no /backend rewrite, since this
 * runs on the Next.js server). Returns `null` on 404 so callers can render
 * notFound() rather than throwing.
 */
const SERVER_API_BASE =
    process.env.SERVER_API_URL || process.env.API_URL || "http://localhost:8000";

export async function fetchProduct(productId) {
    try {
        const res = await fetch(`${SERVER_API_BASE}/api/products/${productId}`, {
            // Cache for 60s; revalidates without blocking the page.
            next: { revalidate: 60 },
            headers: { Accept: "application/json" },
        });
        if (!res.ok) return null;
        const json = await res.json();
        // Laravel API Resource wraps single resources in { data: {...} }
        return json.data ?? json;
    } catch (err) {
        console.error("fetchProduct failed:", err);
        return null;
    }
}

export async function fetchProducts() {
    try {
        const res = await fetch(`${SERVER_API_BASE}/api/products`, {
            next: { revalidate: 60 },
            headers: { Accept: "application/json" },
        });
        if (!res.ok) return [];
        const json = await res.json();
        return json.data ?? json;
    } catch (err) {
        console.error("fetchProducts failed:", err);
        return [];
    }
}
