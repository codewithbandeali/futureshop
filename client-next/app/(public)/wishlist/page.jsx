'use client'

import { Heart } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import ProductCard from '@/components/ProductCard'
import PageTitle from '@/components/PageTitle'
import { getWishlistIds, WISHLIST_EVENT } from '@/lib/wishlist'

export default function WishlistPage() {
    const products = useSelector(s => s.product.list)
    const [ids, setIds] = useState([])
    const [hydrated, setHydrated] = useState(false)

    useEffect(() => {
        const refresh = () => setIds(getWishlistIds())
        refresh()
        setHydrated(true)
        window.addEventListener(WISHLIST_EVENT, refresh)
        window.addEventListener('storage', refresh)
        return () => {
            window.removeEventListener(WISHLIST_EVENT, refresh)
            window.removeEventListener('storage', refresh)
        }
    }, [])

    const items = ids
        .map(id => products.find(p => String(p.id) === String(id)))
        .filter(Boolean)

    if (!hydrated) {
        return <div className="min-h-[60vh]" />
    }

    return (
        <div className="min-h-[70vh] mx-6">
            <div className="max-w-7xl mx-auto my-10">
                <PageTitle
                    heading="Wishlist"
                    text={items.length === 0 ? "Nothing saved yet" : `${items.length} saved`}
                    path="/shop"
                    linkText="Keep shopping"
                />

                {items.length === 0 ? (
                    <div className="bg-white border border-[color:var(--color-border)] rounded-2xl p-12 text-center mt-8">
                        <Heart size={40} className="mx-auto text-[color:var(--color-text-3)]" strokeWidth={1.5} />
                        <h2 className="text-xl mt-4">No saved items</h2>
                        <p className="text-[color:var(--color-text-2)] mt-2 max-w-md mx-auto">
                            Tap the heart on any product to save it for later. Your wishlist lives in this browser.
                        </p>
                        <Link href="/shop" className="btn-primary inline-block mt-6">
                            Browse products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-24 mt-6">
                        {items.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                )}
            </div>
        </div>
    )
}
