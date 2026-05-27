'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import ProductCard from './ProductCard'
import { getRecentlyViewedIds } from '@/lib/recentlyViewed'

/**
 * Recently viewed — shows the most recent N products the shopper has
 * looked at, hydrated from the Redux product catalog. Hidden when there
 * aren't enough recent products to fill the row.
 */
const RecentlyViewed = ({ excludeProductId = null, max = 4, title = 'Recently viewed' }) => {
    const products = useSelector(s => s.product.list)
    const [ids, setIds] = useState([])

    useEffect(() => {
        // Only read localStorage on the client; SSR would render nothing
        // anyway because the list is hydrated post-mount.
        setIds(getRecentlyViewedIds(excludeProductId))
    }, [excludeProductId])

    const items = ids
        .map(id => products.find(p => String(p.id) === String(id)))
        .filter(Boolean)
        .slice(0, max)

    if (items.length < 2) return null

    return (
        <section className="my-20">
            <header className="mb-8">
                <p className="text-xs uppercase tracking-[0.15em] text-[color:var(--color-text-3)] mb-2">
                    For you
                </p>
                <h2 className="text-2xl">{title}</h2>
            </header>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {items.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
        </section>
    )
}

export default RecentlyViewed
