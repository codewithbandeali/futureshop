'use client'

import { Search, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

/**
 * Live search dropdown — Amazon/Shopify style. Reads the already-loaded
 * product catalog from Redux (no network hit per keystroke) and ranks
 * matches by where the query hits: name beats brand beats category.
 *
 * Click a result → /product/[slug]. Press Enter or click "See all results"
 * → /shop?search=…
 */
const SearchAutocomplete = ({ className = '', onSelect }) => {
    const router = useRouter()
    const products = useSelector(s => s.product.list)
    const [query, setQuery] = useState('')
    const [open, setOpen] = useState(false)
    const [activeIdx, setActiveIdx] = useState(0)
    const wrapperRef = useRef(null)
    const inputRef = useRef(null)

    // Close on outside click
    useEffect(() => {
        const onClick = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', onClick)
        return () => document.removeEventListener('mousedown', onClick)
    }, [])

    const results = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (q.length < 2) return []
        const scored = products
            .map(p => {
                const name = (p.name || '').toLowerCase()
                const brand = (p.brand || '').toLowerCase()
                const category = (p.category || '').toLowerCase()
                if (name.includes(q)) return { p, score: 3 }
                if (brand.includes(q)) return { p, score: 2 }
                if (category.includes(q)) return { p, score: 1 }
                return null
            })
            .filter(Boolean)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map(s => s.p)
        return scored
    }, [products, query])

    const submit = (e) => {
        e?.preventDefault?.()
        const q = query.trim()
        if (!q) return
        setOpen(false)
        router.push(`/shop?search=${encodeURIComponent(q)}`)
        onSelect?.()
    }

    const goToResult = (product) => {
        setOpen(false)
        setQuery('')
        onSelect?.()
        router.push(`/product/${product.slug ?? product.id}`)
    }

    const onKey = (e) => {
        if (!open || results.length === 0) {
            if (e.key === 'Enter') submit(e)
            return
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIdx(i => Math.min(i + 1, results.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIdx(i => Math.max(i - 1, 0))
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (results[activeIdx]) goToResult(results[activeIdx])
            else submit(e)
        } else if (e.key === 'Escape') {
            setOpen(false)
        }
    }

    const showDropdown = open && query.trim().length >= 2

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <form
                onSubmit={submit}
                role="search"
                className="flex items-center bg-white border border-[color:var(--color-border)] rounded-full px-4 py-2 focus-within:border-[color:var(--color-brand)] transition"
            >
                <Search size={16} className="text-[color:var(--color-text-3)]" aria-hidden="true" />
                <input
                    ref={inputRef}
                    type="search"
                    role="combobox"
                    aria-expanded={showDropdown}
                    aria-controls="search-results"
                    aria-autocomplete="list"
                    placeholder="Search products"
                    aria-label="Search products"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); setOpen(true) }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={onKey}
                    className="bg-transparent outline-none text-sm ml-2 flex-1 placeholder:text-[color:var(--color-text-3)]"
                />
                {query && (
                    <button
                        type="button"
                        onClick={() => { setQuery(''); inputRef.current?.focus() }}
                        aria-label="Clear search"
                        className="text-[color:var(--color-text-3)] hover:text-[color:var(--color-text-1)] p-1 transition"
                    >
                        <X size={14} />
                    </button>
                )}
            </form>

            {showDropdown && (
                <div
                    id="search-results"
                    role="listbox"
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-[color:var(--color-border)] rounded-xl shadow-xl overflow-hidden z-50"
                >
                    {results.length === 0 ? (
                        <p className="text-sm text-[color:var(--color-text-3)] p-4 text-center">
                            No products match &ldquo;{query}&rdquo;
                        </p>
                    ) : (
                        <>
                            <ul>
                                {results.map((p, idx) => (
                                    <li key={p.id}>
                                        <button
                                            type="button"
                                            role="option"
                                            aria-selected={idx === activeIdx}
                                            onMouseEnter={() => setActiveIdx(idx)}
                                            onClick={() => goToResult(p)}
                                            className={`w-full flex items-center gap-3 p-3 text-left transition ${
                                                idx === activeIdx
                                                    ? 'bg-[color:var(--color-surface-2)]'
                                                    : 'hover:bg-[color:var(--color-surface)]'
                                            }`}
                                        >
                                            <div className="relative size-12 bg-[color:var(--color-surface-2)] rounded shrink-0 overflow-hidden">
                                                {p.images?.[0] && (
                                                    <Image
                                                        src={p.images[0]}
                                                        alt=""
                                                        fill
                                                        sizes="48px"
                                                        className="object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-[color:var(--color-text-1)] truncate">
                                                    {p.name}
                                                </p>
                                                <p className="text-xs text-[color:var(--color-text-3)]">
                                                    {p.brand} · {p.category}
                                                </p>
                                            </div>
                                            <p className="text-sm font-medium whitespace-nowrap">
                                                {currency}{Number(p.price).toFixed(2)}
                                            </p>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href={`/shop?search=${encodeURIComponent(query)}`}
                                onClick={() => { setOpen(false); onSelect?.() }}
                                className="block border-t border-[color:var(--color-border)] py-3 text-center text-sm font-medium text-[color:var(--color-brand)] hover:bg-[color:var(--color-surface-2)] transition"
                            >
                                See all results for &ldquo;{query}&rdquo; →
                            </Link>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default SearchAutocomplete
