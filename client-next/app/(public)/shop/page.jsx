'use client'
import { Suspense, useEffect, useMemo, useState } from "react"
import ProductCard from "@/components/ProductCard"
import { MoveLeft, SearchX } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"
import { dateTimestamp } from "@/lib/format"

// The display labels for category chips (plural, capitalized) and the
// canonical lowercase singular form stored in the DB. Filter logic compares
// against `slug` so "Laptops" pill matches `category: "laptop"` rows.
const CATEGORY_CHIPS = [
    { slug: 'laptop', label: 'Laptops' },
    { slug: 'desktop', label: 'Desktops' },
    { slug: 'monitor', label: 'Monitors' },
    { slug: 'tablet', label: 'Tablets' },
    { slug: 'printer', label: 'Printers' },
    { slug: 'scanner', label: 'Scanners' },
]

const avgRating = (p) => {
    const count = p.rating?.length || 0
    return count ? p.rating.reduce((acc, r) => acc + r.rating, 0) / count : 0
}

function ShopContent() {
    const searchParams = useSearchParams()
    const search = searchParams.get('search') || ''
    const categoryParam = searchParams.get('category') || 'all'
    const router = useRouter()

    const products = useSelector(state => state.product.list)

    const [category, setCategory] = useState(categoryParam.toLowerCase())
    const [sort, setSort] = useState('newest')

    useEffect(() => {
        // Tolerate plural URL params: ?category=laptops becomes "laptop"
        const raw = (categoryParam || 'all').toLowerCase()
        setCategory(raw.endsWith('s') && raw !== 'all' ? raw.replace(/s$/, '') : raw)
    }, [categoryParam])

    const visibleProducts = useMemo(() => {
        let list = products
        if (search) {
            const q = search.toLowerCase()
            list = list.filter(p =>
                p.name?.toLowerCase().includes(q) ||
                p.brand?.toLowerCase().includes(q) ||
                p.category?.toLowerCase().includes(q)
            )
        }
        if (category !== 'all') {
            list = list.filter(p => p.category?.toLowerCase() === category)
        }
        return [...list].sort((a, b) => {
            if (sort === 'price-low') return Number(a.price) - Number(b.price)
            if (sort === 'price-high') return Number(b.price) - Number(a.price)
            if (sort === 'rating') return avgRating(b) - avgRating(a)
            return dateTimestamp(b.created_at ?? b.createdAt) - dateTimestamp(a.created_at ?? a.createdAt)
        })
    }, [products, search, category, sort])

    const setCategoryViaUrl = (slug) => {
        setCategory(slug)
        const params = new URLSearchParams(searchParams.toString())
        if (slug === 'all') params.delete('category')
        else params.set('category', slug)
        router.replace(`/shop${params.toString() ? '?' + params.toString() : ''}`, { scroll: false })
    }

    return (
        <div className="min-h-[70vh] mx-6">
            <div className="max-w-7xl mx-auto my-10">

                {/* Header */}
                <h1 className="text-3xl sm:text-4xl flex items-center gap-2">
                    {search && (
                        <button
                            onClick={() => router.push('/shop')}
                            aria-label="Clear search"
                            className="text-[color:var(--color-text-3)] hover:text-[color:var(--color-text-1)] transition"
                        >
                            <MoveLeft size={22} />
                        </button>
                    )}
                    {search ? <>Results for &ldquo;{search}&rdquo;</> : <>All products</>}
                </h1>

                {/* Filter + sort */}
                <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setCategoryViaUrl('all')}
                            className={`px-4 py-1.5 rounded-full text-sm border transition ${
                                category === 'all'
                                    ? 'bg-[color:var(--color-brand)] text-white border-[color:var(--color-brand)]'
                                    : 'border-[color:var(--color-border)] text-[color:var(--color-text-2)] hover:border-[color:var(--color-text-3)]'
                            }`}
                        >
                            All
                        </button>
                        {CATEGORY_CHIPS.map(c => (
                            <button
                                key={c.slug}
                                onClick={() => setCategoryViaUrl(c.slug)}
                                className={`px-4 py-1.5 rounded-full text-sm border transition ${
                                    category === c.slug
                                        ? 'bg-[color:var(--color-brand)] text-white border-[color:var(--color-brand)]'
                                        : 'border-[color:var(--color-border)] text-[color:var(--color-text-2)] hover:border-[color:var(--color-text-3)]'
                                }`}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        aria-label="Sort products"
                        className="form-input !py-2 !w-auto bg-white !text-sm"
                    >
                        <option value="newest">Sort: Newest</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Top Rated</option>
                    </select>
                </div>

                <p className="text-sm text-[color:var(--color-text-2)] mt-4 mb-8">
                    {visibleProducts.length} {visibleProducts.length === 1 ? 'product' : 'products'}
                </p>

                {/* Grid */}
                {visibleProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-32">
                        {visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center py-24">
                        <SearchX size={56} strokeWidth={1.5} className="text-[color:var(--color-text-3)]" />
                        <p className="text-lg font-medium text-[color:var(--color-text-1)] mt-4">No products found</p>
                        <p className="text-sm text-[color:var(--color-text-2)] mt-1">Try a different category or search term.</p>
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
    )
}
