'use client'

import { ChevronDown, Cpu, Laptop, Monitor, Printer, ScanLine, Tablet } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

const CATEGORY_META = [
    { slug: 'laptop', label: 'Laptops', icon: Laptop, blurb: 'Apple, Dell, HP, Samsung' },
    { slug: 'desktop', label: 'Desktops', icon: Cpu, blurb: 'Workstations and minis' },
    { slug: 'monitor', label: 'Monitors', icon: Monitor, blurb: '27" 4K, 5K, ultra-wide' },
    { slug: 'tablet', label: 'Tablets', icon: Tablet, blurb: 'iPad Pro, Galaxy Tab' },
    { slug: 'printer', label: 'Printers', icon: Printer, blurb: 'Mono and color laser' },
    { slug: 'scanner', label: 'Scanners', icon: ScanLine, blurb: 'Document, sheet-fed' },
]

/**
 * Shop mega-menu — opens on hover (desktop), click/touch (mobile). Two
 * columns: every category with icons on the left, a "featured" panel on
 * the right that hot-swaps to the hovered category's cheapest in-stock
 * product. Closes on outside click and Escape.
 */
const MegaMenu = () => {
    const [open, setOpen] = useState(false)
    const [hovered, setHovered] = useState(null)
    const wrapperRef = useRef(null)
    const products = useSelector(s => s.product.list)

    useEffect(() => {
        const onClick = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
        }
        const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
        document.addEventListener('mousedown', onClick)
        document.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('mousedown', onClick)
            document.removeEventListener('keydown', onKey)
        }
    }, [])

    const featured = useMemo(() => {
        if (!Array.isArray(products) || products.length === 0) return null
        const pool = hovered ? products.filter(p => p.category === hovered) : products
        if (pool.length === 0) return products[0]
        return [...pool].sort((a, b) => Number(a.price) - Number(b.price))[0]
    }, [products, hovered])

    return (
        <div
            ref={wrapperRef}
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <button
                type="button"
                aria-expanded={open}
                aria-haspopup="true"
                onClick={() => setOpen(o => !o)}
                className="inline-flex items-center gap-1 hover:text-[color:var(--color-accent)] transition text-sm h-11"
            >
                Shop <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div role="menu" aria-label="Shop categories" className="absolute left-0 top-full pt-2 z-50">
                    <div className="w-[640px] bg-white border border-[color:var(--color-border)] rounded-2xl shadow-xl overflow-hidden grid grid-cols-[1fr_220px]">
                        <div className="p-5">
                            <p className="text-xs uppercase tracking-[0.15em] text-[color:var(--color-text-3)] mb-3">
                                Browse by category
                            </p>
                            <ul className="grid grid-cols-2 gap-1">
                                {CATEGORY_META.map(c => (
                                    <li key={c.slug}>
                                        <Link
                                            href={`/shop?category=${c.slug}`}
                                            role="menuitem"
                                            onMouseEnter={() => setHovered(c.slug)}
                                            onFocus={() => setHovered(c.slug)}
                                            onClick={() => setOpen(false)}
                                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-[color:var(--color-surface-2)] transition"
                                        >
                                            <div className="size-9 rounded-lg bg-[color:var(--color-surface-2)] flex items-center justify-center text-[color:var(--color-brand)] shrink-0">
                                                <c.icon size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-[color:var(--color-text-1)]">{c.label}</p>
                                                <p className="text-xs text-[color:var(--color-text-3)] mt-0.5 line-clamp-1">{c.blurb}</p>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-4 pt-4 border-t border-[color:var(--color-border)] flex items-center justify-between">
                                <Link
                                    href="/shop"
                                    onClick={() => setOpen(false)}
                                    className="text-sm text-[color:var(--color-brand)] hover:text-[color:var(--color-accent)] font-medium"
                                >
                                    All products →
                                </Link>
                                <Link
                                    href="/wishlist"
                                    onClick={() => setOpen(false)}
                                    className="text-xs text-[color:var(--color-text-2)] hover:text-[color:var(--color-text-1)]"
                                >
                                    Your wishlist
                                </Link>
                            </div>
                        </div>

                        <div className="bg-[color:var(--color-surface)] border-l border-[color:var(--color-border)] p-5">
                            <p className="text-xs uppercase tracking-[0.15em] text-[color:var(--color-text-3)] mb-3">
                                Featured
                            </p>
                            {featured ? (
                                <Link
                                    href={`/product/${featured.slug ?? featured.id}`}
                                    onClick={() => setOpen(false)}
                                    className="block group"
                                >
                                    <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
                                        {featured.images?.[0] && (
                                            <Image
                                                src={featured.images[0]}
                                                alt=""
                                                fill
                                                sizes="220px"
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        )}
                                    </div>
                                    <p className="text-xs uppercase tracking-[0.1em] text-[color:var(--color-text-3)] mt-3">
                                        {featured.brand}
                                    </p>
                                    <p className="text-sm font-medium text-[color:var(--color-text-1)] line-clamp-2 mt-0.5">
                                        {featured.name}
                                    </p>
                                    <p className="text-sm font-semibold mt-1">
                                        {currency}{Number(featured.price).toFixed(2)}
                                    </p>
                                </Link>
                            ) : (
                                <p className="text-xs text-[color:var(--color-text-3)]">Catalog loading…</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MegaMenu
