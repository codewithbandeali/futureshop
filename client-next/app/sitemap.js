import { fetchProducts } from "@/lib/fetchProduct"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export default async function sitemap() {
    const now = new Date()
    const staticEntries = [
        { url: `${siteUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
        { url: `${siteUrl}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
        { url: `${siteUrl}/cart`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
        { url: `${siteUrl}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
        { url: `${siteUrl}/register`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    ]

    let productEntries = []
    try {
        const products = await fetchProducts()
        productEntries = (products || []).map(p => ({
            url: `${siteUrl}/product/${p.slug ?? p.id}`,
            lastModified: p.updated_at ? new Date(p.updated_at) : now,
            changeFrequency: "weekly",
            priority: 0.7,
        }))
    } catch {
        // Sitemap must always render; missing products simply means fewer URLs.
    }

    return [...staticEntries, ...productEntries]
}
