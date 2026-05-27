'use client'
import { Suspense, useEffect, useMemo, useState } from "react"
import ProductCard from "@/components/ProductCard"
import { categories } from "@/assets/assets"
import { MoveLeftIcon, SearchXIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"
import { dateTimestamp } from "@/lib/format"

// Average rating of a product (0 when it has no reviews).
const avgRating = (p) => {
    const count = p.rating?.length || 0
    return count ? p.rating.reduce((acc, r) => acc + r.rating, 0) / count : 0
}

function ShopContent() {

    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const categoryParam = searchParams.get('category')
    const router = useRouter()

    const products = useSelector(state => state.product.list)

    const [category, setCategory] = useState(categoryParam || 'All')
    const [sort, setSort] = useState('newest')

    // Keep the active category in sync when arriving via a ?category= link.
    useEffect(() => {
        setCategory(categoryParam || 'All')
    }, [categoryParam])

    const visibleProducts = useMemo(() => {
        let list = products
        if (search) {
            list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
        }
        if (category !== 'All') {
            list = list.filter(p => p.category === category)
        }
        return [...list].sort((a, b) => {
            if (sort === 'price-low') return a.price - b.price
            if (sort === 'price-high') return b.price - a.price
            if (sort === 'rating') return avgRating(b) - avgRating(a)
            return dateTimestamp(b.created_at ?? b.createdAt) - dateTimestamp(a.created_at ?? a.createdAt) // newest
        })
    }, [products, search, category, sort])

    return (
        <div className="min-h-[70vh] mx-6">
            <div className="max-w-7xl mx-auto my-10">

                {/* Header */}
                <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 flex items-center gap-2">
                    {search && (
                        <button onClick={() => router.push('/shop')} aria-label="Clear search" className="text-slate-400 hover:text-slate-700">
                            <MoveLeftIcon size={22} />
                        </button>
                    )}
                    {search ? <>Results for &ldquo;{search}&rdquo;</> : <>All <span className="text-slate-500 font-normal">Products</span></>}
                </h1>

                {/* Filter + sort bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                    <div className="flex flex-wrap gap-2">
                        {['All', ...categories].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-sm border transition ${category === cat ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 outline-none focus:border-slate-400 cursor-pointer"
                    >
                        <option value="newest">Sort: Newest</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Top Rated</option>
                    </select>
                </div>

                <p className="text-sm text-slate-500 mt-4 mb-8">
                    {visibleProducts.length} {visibleProducts.length === 1 ? 'product' : 'products'}
                </p>

                {/* Grid */}
                {visibleProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-32">
                        {visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center py-24 text-slate-400">
                        <SearchXIcon size={56} strokeWidth={1.5} />
                        <p className="text-lg font-medium text-slate-600 mt-4">No products found</p>
                        <p className="text-sm mt-1">Try a different category or search term.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function Shop() {
    return (
        <Suspense fallback={<div className="min-h-[70vh]" />}>
            <ShopContent />
        </Suspense>
    );
}
