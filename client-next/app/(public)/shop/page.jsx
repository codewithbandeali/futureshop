'use client'
import { Filter, MoveLeft, SearchX } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"
import ProductCard from "@/components/ProductCard"
import ShopFilters, { ShopFiltersDrawer } from "@/components/ShopFilters"
import { dateTimestamp } from "@/lib/format"

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

    const { allBrands, fullPriceRange } = useMemo(() => {
        const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean))).sort()
        const prices = products.map(p => Number(p.price)).filter(n => Number.isFinite(n))
        const min = prices.length ? Math.floor(Math.min(...prices)) : 0
        const max = prices.length ? Math.ceil(Math.max(...prices)) : 5000
        return { allBrands: brands, fullPriceRange: [min, max] }
    }, [products])

    const [selectedBrands, setSelectedBrands] = useState([])
    const [priceRange, setPriceRange] = useState(fullPriceRange)
    const [minRating, setMinRating] = useState(0)
    const [inStockOnly, setInStockOnly] = useState(false)
    const [drawerOpen, setDrawerOpen] = useState(false)

    // Reset the price range whenever the catalog finishes loading.
    useEffect(() => {
        setPriceRange(fullPriceRange)
    }, [fullPriceRange[0], fullPriceRange[1]])

    useEffect(() => {
        const raw = (categoryParam || 'all').toLowerCase()
        setCategory(raw.endsWith('s') && raw !== 'all' ? raw.replace(/s$/, '') : raw)
    }, [categoryParam])

    const toggleBrand = (b) => {
        setSelectedBrands(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b])
    }

    const resetFilters = () => {
        setSelectedBrands([])
        setPriceRange(fullPriceRange)
        setMinRating(0)
        setInStockOnly(false)
    }

    const activeFilterCount =
        selectedBrands.length +
        (minRating > 0 ? 1 : 0) +
        (inStockOnly ? 1 : 0) +
        ((priceRange[0] !== fullPriceRange[0] || priceRange[1] !== fullPriceRange[1]) ? 1 : 0)

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
        if (selectedBrands.length > 0) {
            list = list.filter(p => selectedBrands.includes(p.brand))
        }
        list = list.filter(p => {
            const price = Number(p.price)
            return price >= priceRange[0] && price <= priceRange[1]
        })
        if (minRating > 0) {
            list = list.filter(p => avgRating(p) >= minRating)
        }
        if (inStockOnly) {
            list = list.filter(p => p.inStock !== false)
        }
        return [...list].sort((a, b) => {
            if (sort === 'price-low') return Number(a.price) - Number(b.price)
            if (sort === 'price-high') return Number(b.price) - Number(a.price)
            if (sort === 'rating') return avgRating(b) - avgRating(a)
            return dateTimestamp(b.created_at ?? b.createdAt) - dateTimestamp(a.created_at ?? a.createdAt)
        })
    }, [products, search, category, sort, selectedBrands, priceRange, minRating, inStockOnly])

    const setCategoryViaUrl = (slug) => {
        setCategory(slug)
        const params = new URLSearchParams(searchParams.toString())
        if (slug === 'all') params.delete('category')
        else params.set('category', slug)
        router.replace(`/shop${params.toString() ? '?' + params.toString() : ''}`, { scroll: false })
    }

    const filterProps = {
        products,
        brands: allBrands,
        selectedBrands,
        priceRange,
        setPriceRange,
        minRating,
        setMinRating,
        inStockOnly,
        setInStockOnly,
        onToggleBrand: toggleBrand,
        onReset: resetFilters,
        activeCount: activeFilterCount,
    }

    return (
        <div className="min-h-[70vh] mx-6">
            <div className="max-w-7xl mx-auto my-10">

                <h1 className="text-3xl sm:text-4xl flex items-center gap-2">
                    {search && (
                        <button
                            onClick={() => router.push('/shop')}
                            aria-label="Clear search"
                            className="size-11 flex items-center justify-center text-[color:var(--color-text-3)] hover:text-[color:var(--color-text-1)] transition"
                        >
                            <MoveLeft size={22} />
                        </button>
                    )}
                    {search ? <>Results for &ldquo;{search}&rdquo;</> : <>All products</>}
                </h1>

                <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setCategoryViaUrl('all')}
                            className={`min-h-[44px] px-4 py-1.5 rounded-full text-sm border transition ${
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
                                className={`min-h-[44px] px-4 py-1.5 rounded-full text-sm border transition ${
                                    category === c.slug
                                        ? 'bg-[color:var(--color-brand)] text-white border-[color:var(--color-brand)]'
                                        : 'border-[color:var(--color-border)] text-[color:var(--color-text-2)] hover:border-[color:var(--color-text-3)]'
                                }`}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setDrawerOpen(true)}
                            className="lg:hidden inline-flex items-center gap-2 px-4 h-11 rounded-md border border-[color:var(--color-border)] text-sm bg-white"
                        >
                            <Filter size={14} />
                            Filters{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ''}
                        </button>
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            aria-label="Sort products"
                            className="form-input !h-11 !w-auto bg-white !text-sm"
                        >
                            <option value="newest">Sort: Newest</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="rating">Top Rated</option>
                        </select>
                    </div>
                </div>

                <p className="text-sm text-[color:var(--color-text-2)] mt-4">
                    {visibleProducts.length} {visibleProducts.length === 1 ? 'product' : 'products'}
                </p>

                <div className="flex gap-8 mt-6">
                    <aside className="hidden lg:block w-60 shrink-0">
                        <div className="sticky top-24">
                            <ShopFilters {...filterProps} />
                        </div>
                    </aside>

                    <div className="flex-1 min-w-0">
                        {visibleProducts.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mb-32">
                                {visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center py-24">
                                <SearchX size={56} strokeWidth={1.5} className="text-[color:var(--color-text-3)]" />
                                <p className="text-lg font-medium text-[color:var(--color-text-1)] mt-4">No products match these filters</p>
                                <p className="text-sm text-[color:var(--color-text-2)] mt-1">Try widening the price range or clearing a brand.</p>
                                {activeFilterCount > 0 && (
                                    <button type="button" onClick={resetFilters} className="btn-secondary mt-6">
                                        Clear all filters
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ShopFiltersDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} {...filterProps} />
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
