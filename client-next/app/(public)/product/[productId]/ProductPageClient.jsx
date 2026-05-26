'use client'

import Link from "next/link";
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import RelatedProducts from "@/components/RelatedProducts";

export default function ProductPageClient({ product }) {
    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">

                {/* Breadcrumbs */}
                <nav aria-label="Breadcrumb" className="text-slate-500 text-sm mt-8 mb-6 flex items-center gap-1.5">
                    <Link href="/" className="hover:text-slate-700 transition">Home</Link>
                    <span aria-hidden="true">/</span>
                    <Link href="/shop" className="hover:text-slate-700 transition">Products</Link>
                    <span aria-hidden="true">/</span>
                    <span className="text-slate-700">{product?.category}</span>
                </nav>

                <ProductDetails product={product} />
                <ProductDescription product={product} />
                <RelatedProducts product={product} />
            </div>
        </div>
    );
}
