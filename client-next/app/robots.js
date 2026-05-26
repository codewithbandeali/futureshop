const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export default function robots() {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                // Block authenticated/checkout funnels from indexing — they
                // have no SEO value and risk leaking PII in cached snapshots.
                disallow: ["/cart", "/checkout", "/orders", "/login", "/register"],
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
        host: siteUrl,
    }
}
