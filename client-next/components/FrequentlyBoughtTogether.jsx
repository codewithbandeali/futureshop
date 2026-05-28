'use client'

import { Plus, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { addToCart } from '@/lib/features/cart/cartSlice'
import { apiGet } from '@/lib/api'

const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

/**
 * Amazon-style "Frequently bought together" widget.
 *
 * Fetches the cross-sell endpoint which aggregates real co-purchase
 * data from order_items; falls back to same-category picks for cold-
 * start products. Builds a +-+ visual bundle of the anchor product
 * plus 2 companions, with a single "Add all 3 to cart" CTA that
 * dispatches every product in one click (drawer opens once at the end).
 *
 * Hides itself when the API returns nothing.
 */
const FrequentlyBoughtTogether = ({ anchor }) => {
    const dispatch = useDispatch()
    const [companions, setCompanions] = useState([])
    const [loading, setLoading] = useState(true)
    const [picked, setPicked] = useState({}) // companionId -> boolean

    useEffect(() => {
        if (!anchor?.id) return
        let cancelled = false
        apiGet(`/api/products/${anchor.id}/frequently-bought-together`)
            .then(res => {
                if (cancelled) return
                const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
                setCompanions(list)
                // Default-select the first two (Amazon convention).
                const next = {}
                list.slice(0, 2).forEach(p => { next[p.id] = true })
                setPicked(next)
            })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [anchor?.id])

    const visibleCompanions = companions.slice(0, 3)
    const selectedCompanions = visibleCompanions.filter(p => picked[p.id])
    const bundle = [anchor, ...selectedCompanions]
    const bundleTotal = bundle.reduce((sum, p) => sum + Number(p?.price ?? 0), 0)

    if (loading || visibleCompanions.length === 0 || !anchor) return null

    const addBundle = () => {
        const items = bundle.filter(Boolean)
        items.forEach((p, i) => {
            dispatch(addToCart({ productId: p.id, openDrawer: i === items.length - 1 }))
        })
        toast.success(`Added ${items.length} items to cart`)
    }

    return (
        <section className="my-20" aria-labelledby="fbt-title">
            <header className="mb-6">
                <p className="text-xs uppercase tracking-[0.15em] text-[color:var(--color-text-3)] mb-1">
                    Bundle &amp; save
                </p>
                <h2 id="fbt-title" className="text-2xl">Frequently bought together</h2>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start">
                {/* Bundle row */}
                <div className="flex items-start gap-3 overflow-x-auto pb-2">
                    <BundleCard product={anchor} pickable={false} isAnchor />
                    {visibleCompanions.map((p, i) => (
                        <PlusAndCard
                            key={p.id}
                            product={p}
                            checked={!!picked[p.id]}
                            onToggle={() => setPicked(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                        />
                    ))}
                </div>

                {/* Summary CTA */}
                <aside className="bg-white border border-[color:var(--color-border)] rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-[0.1em] text-[color:var(--color-text-3)]">
                        Bundle total
                    </p>
                    <p className="text-3xl font-semibold mt-2">
                        {currency}{bundleTotal.toFixed(2)}
                    </p>
                    <p className="text-xs text-[color:var(--color-text-2)] mt-1">
                        {bundle.length} item{bundle.length !== 1 ? 's' : ''} selected. Uncheck what you don&apos;t want.
                    </p>
                    <button
                        type="button"
                        onClick={addBundle}
                        disabled={bundle.length < 2}
                        className="btn-primary w-full mt-4 inline-flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        <ShoppingBag size={14} />
                        Add {bundle.length} item{bundle.length !== 1 ? 's' : ''} to cart
                    </button>
                </aside>
            </div>
        </section>
    )
}

function PlusAndCard({ product, checked, onToggle }) {
    return (
        <>
            <div className="self-center text-[color:var(--color-text-3)] shrink-0">
                <Plus size={20} />
            </div>
            <BundleCard product={product} pickable checked={checked} onToggle={onToggle} />
        </>
    )
}

function BundleCard({ product, pickable, checked, onToggle, isAnchor = false }) {
    return (
        <article className={`shrink-0 w-44 bg-white border rounded-xl p-3 ${
            isAnchor ? 'border-[color:var(--color-brand)]' : 'border-[color:var(--color-border)]'
        }`}>
            <Link href={`/product/${product.slug ?? product.id}`} className="block">
                <div className="relative aspect-square bg-[color:var(--color-surface-2)] rounded-lg overflow-hidden">
                    {product.images?.[0] && (
                        <Image
                            src={product.images[0]}
                            alt=""
                            fill
                            sizes="176px"
                            className="object-cover"
                        />
                    )}
                </div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-text-3)] mt-2">
                    {isAnchor ? 'This item' : product.brand}
                </p>
                <p className="text-xs font-medium text-[color:var(--color-text-1)] mt-0.5 line-clamp-2 min-h-[2.4em]">
                    {product.name}
                </p>
                <p className="text-sm font-semibold mt-1">
                    {currency}{Number(product.price).toFixed(2)}
                </p>
            </Link>
            {pickable && (
                <label className="flex items-center gap-1.5 mt-2 text-xs cursor-pointer">
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={onToggle}
                        className="size-3.5 rounded border-[color:var(--color-border)]"
                    />
                    Add this item
                </label>
            )}
        </article>
    )
}

export default FrequentlyBoughtTogether
