'use client'

import Link from "next/link"
import { useEffect } from "react"
import ProductDescription from "@/components/ProductDescription"
import ProductDetails from "@/components/ProductDetails"
import RecentlyViewed from "@/components/RecentlyViewed"
import RelatedProducts from "@/components/RelatedProducts"
import { recordRecentlyViewed } from "@/lib/recentlyViewed"

export default function ProductPageClient({ product }) {
    // Record the visit AFTER mount so SSR doesn't have to know about
    // localStorage. Excluding-self happens in <RecentlyViewed>.
    useEffect(() => {
        if (product?.id) recordRecentlyViewed(product.id)
    }, [product?.id])

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">

                {/* Breadcrumbs */}
                <nav
                    aria-label="Breadcrumb"
                    className="text-[color:var(--color-text-2)] text-sm mt-8 mb-6 flex items-center gap-1.5"
                >
                    <Link href="/" className="hover:text-[color:var(--color-text-1)] transition">Home</Link>
                    <span aria-hidden="true">/</span>
                    <Link href="/shop" className="hover:text-[color:var(--color-text-1)] transition">Products</Link>
                    <span aria-hidden="true">/</span>
                    <span className="text-[color:var(--color-text-1)] capitalize">{product?.category}</span>
                </nav>

                <ProductDetails product={product} />
                <ProductDescription product={product} />
                <RelatedProducts product={product} />
                <RecentlyViewed excludeProductId={product?.id} />
            </div>
        </div>
    )
}
