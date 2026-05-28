'use client'

import { CheckCircle2, Star } from "lucide-react"
import { useState } from "react"
import { formatDate } from "@/lib/format"
import APlusContent from "./APlusContent"
import ProductQA from "./ProductQA"

const ProductDescription = ({ product }) => {
    const [selectedTab, setSelectedTab] = useState('description')

    const ratingArr = Array.isArray(product.rating) ? product.rating : []
    const reviewCount = ratingArr.length

    // Distribution: count of reviews per star, average, % bars.
    const distribution = [0, 0, 0, 0, 0] // index 0 = 1-star, index 4 = 5-star
    ratingArr.forEach(r => {
        const n = Math.max(1, Math.min(5, Number(r.rating || 0)))
        distribution[n - 1] += 1
    })
    const average = reviewCount
        ? ratingArr.reduce((acc, r) => acc + Number(r.rating || 0), 0) / reviewCount
        : 0

    const tabs = [
        { key: 'description', label: 'Description' },
        { key: 'specs', label: 'Specifications' },
        { key: 'reviews', label: `Reviews (${reviewCount})` },
        { key: 'qa', label: 'Q&A' },
    ]

    const hasAplus = Array.isArray(product.aplus_blocks) && product.aplus_blocks.length > 0

    return (
        <section className="my-16 text-sm text-[color:var(--color-text-2)]">
            {/* Tab bar */}
            <div role="tablist" aria-label="Product information"
                className="flex gap-2 border-b border-[color:var(--color-border)] mb-8 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        type="button"
                        role="tab"
                        aria-selected={selectedTab === tab.key}
                        onClick={() => setSelectedTab(tab.key)}
                        className={`px-4 py-2.5 font-medium transition whitespace-nowrap ${
                            tab.key === selectedTab
                                ? 'border-b-2 border-[color:var(--color-brand)] text-[color:var(--color-text-1)]'
                                : 'text-[color:var(--color-text-3)] hover:text-[color:var(--color-text-2)]'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Description + A+ content blocks */}
            {selectedTab === 'description' && (
                <div className="space-y-12">
                    <p className="max-w-2xl leading-7 text-[color:var(--color-text-1)]">
                        {product.description || 'No description provided.'}
                    </p>
                    {hasAplus && <APlusContent blocks={product.aplus_blocks} />}
                </div>
            )}

            {/* Specs */}
            {selectedTab === 'specs' && (
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3 max-w-2xl">
                    {product.brand && (
                        <div className="flex justify-between border-b border-[color:var(--color-border)] pb-2">
                            <dt className="text-[color:var(--color-text-2)]">Brand</dt>
                            <dd className="text-[color:var(--color-text-1)]">{product.brand}</dd>
                        </div>
                    )}
                    {product.category && (
                        <div className="flex justify-between border-b border-[color:var(--color-border)] pb-2">
                            <dt className="text-[color:var(--color-text-2)]">Category</dt>
                            <dd className="text-[color:var(--color-text-1)] capitalize">{product.category}</dd>
                        </div>
                    )}
                    {product.sku && (
                        <div className="flex justify-between border-b border-[color:var(--color-border)] pb-2">
                            <dt className="text-[color:var(--color-text-2)]">SKU</dt>
                            <dd className="text-[color:var(--color-text-1)] font-mono text-xs">{product.sku}</dd>
                        </div>
                    )}
                    <div className="flex justify-between border-b border-[color:var(--color-border)] pb-2">
                        <dt className="text-[color:var(--color-text-2)]">Free shipping</dt>
                        <dd className="text-[color:var(--color-text-1)]">{product.shipping ? 'Yes (orders over $50)' : 'Not eligible'}</dd>
                    </div>
                </dl>
            )}

            {/* Q&A */}
            {selectedTab === 'qa' && <ProductQA productId={product.id} />}

            {/* Reviews — with histogram + verified badge + photo strip */}
            {selectedTab === 'reviews' && (
                reviewCount === 0 ? (
                    <p className="text-[color:var(--color-text-3)]">No reviews yet — be the first to review this product.</p>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Histogram aside (Amazon-style) */}
                        <aside className="lg:col-span-1">
                            <div className="bg-white border border-[color:var(--color-border)] rounded-2xl p-5 lg:sticky lg:top-24">
                                <div className="flex items-baseline gap-3">
                                    <p className="text-4xl font-semibold text-[color:var(--color-text-1)]">
                                        {average.toFixed(1)}
                                    </p>
                                    <div>
                                        <div className="flex" aria-label={`Average ${average.toFixed(1)} out of 5`}>
                                            {[1, 2, 3, 4, 5].map(n => (
                                                <Star
                                                    key={n}
                                                    size={14}
                                                    fill={Math.round(average) >= n ? 'var(--color-warning)' : 'transparent'}
                                                    className={Math.round(average) >= n ? 'text-[color:var(--color-warning)]' : 'text-[color:var(--color-text-3)]'}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-[color:var(--color-text-3)] mt-0.5">
                                            {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2 mt-5">
                                    {[5, 4, 3, 2, 1].map(stars => {
                                        const count = distribution[stars - 1]
                                        const pct = reviewCount ? (count / reviewCount) * 100 : 0
                                        return (
                                            <div key={stars} className="flex items-center gap-2 text-xs">
                                                <span className="w-8 text-[color:var(--color-text-2)] tabular-nums">
                                                    {stars}★
                                                </span>
                                                <div className="flex-1 h-2 bg-[color:var(--color-surface-2)] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[color:var(--color-warning)] transition-[width] duration-500"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <span className="w-10 text-right text-[color:var(--color-text-3)] tabular-nums">
                                                    {count}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </aside>

                        {/* Reviews list */}
                        <div className="lg:col-span-2 space-y-5">
                            {ratingArr.map((item, index) => (
                                <article key={item.id ?? index} className="border border-[color:var(--color-border)] rounded-2xl p-5 bg-white">
                                    <header className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-[color:var(--color-text-1)] truncate">
                                                    {item.author_name || 'Anonymous'}
                                                </p>
                                                {item.verified && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.05em] font-medium text-[color:var(--color-success)]">
                                                        <CheckCircle2 size={11} aria-hidden="true" />
                                                        Verified purchase
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center mt-1.5" aria-label={`Rated ${item.rating} out of 5`}>
                                                {[1, 2, 3, 4, 5].map(n => (
                                                    <Star
                                                        key={n}
                                                        size={13}
                                                        fill={item.rating >= n ? 'var(--color-warning)' : 'transparent'}
                                                        className={item.rating >= n ? 'text-[color:var(--color-warning)]' : 'text-[color:var(--color-text-3)]'}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-xs text-[color:var(--color-text-3)] whitespace-nowrap">
                                            {formatDate(item.created_at)}
                                        </p>
                                    </header>
                                    {item.review && (
                                        <p className="text-sm text-[color:var(--color-text-1)] mt-3 leading-6">
                                            {item.review}
                                        </p>
                                    )}
                                    {Array.isArray(item.photos) && item.photos.length > 0 && (
                                        <div className="flex gap-2 mt-4 overflow-x-auto">
                                            {item.photos.map((photo, i) => (
                                                <a
                                                    key={i}
                                                    href={photo}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="size-20 shrink-0 rounded-lg overflow-hidden bg-[color:var(--color-surface-2)] hover:opacity-90 transition"
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={photo} alt="" className="w-full h-full object-cover" />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    </div>
                )
            )}
        </section>
    )
}

export default ProductDescription
