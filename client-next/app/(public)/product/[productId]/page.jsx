import { notFound } from "next/navigation";
import { fetchProduct } from "@/lib/fetchProduct";
import ProductPageClient from "./ProductPageClient";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

/**
 * Server-side metadata — SKILLS.md §10. This is what Google, Facebook, and
 * Slack actually see. Without this, the SPA shell renders an empty <div>.
 */
export async function generateMetadata({ params }) {
    const { productId } = await params;
    const product = await fetchProduct(productId);
    if (!product) {
        return { title: "Product not found" };
    }

    const description = (product.description || "").slice(0, 155);
    const image = product.images?.[0];
    const canonical = `${siteUrl}/product/${product.slug ?? product.id}`;

    return {
        title: product.name,
        description,
        alternates: { canonical },
        openGraph: {
            type: "website",
            url: canonical,
            title: product.name,
            description,
            images: image ? [{ url: image }] : [],
        },
        twitter: {
            card: "summary_large_image",
            title: product.name,
            description,
            images: image ? [image] : [],
        },
    };
}

function productJsonLd(product) {
    return {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        image: product.images ?? [],
        description: product.description,
        sku: product.sku,
        brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
        offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "USD",
            availability: product.inStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            url: `${siteUrl}/product/${product.slug ?? product.id}`,
        },
    };
}

export default async function ProductPage({ params }) {
    const { productId } = await params;
    const product = await fetchProduct(productId);
    if (!product) notFound();

    return (
        <>
            <script
                type="application/ld+json"
                // JSON-LD is allowed via dangerouslySetInnerHTML — it's data, not HTML.
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
            />
            <ProductPageClient product={product} currency={currency} />
        </>
    );
}
