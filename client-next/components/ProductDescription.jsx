'use client'

import { Star } from "lucide-react"
import { useState } from "react"

const ProductDescription = ({ product }) => {
    const [selectedTab, setSelectedTab] = useState('description')

    const ratingArr = Array.isArray(product.rating) ? product.rating : []
    const reviewCount = ratingArr.length

    const tabs = [
        { key: 'description', label: 'Description' },
        { key: 'specs', label: 'Specifications' },
        { key: 'reviews', label: `Reviews (${reviewCount})` },
    ]

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

            {/* Description */}
            {selectedTab === 'description' && (
                <p className="max-w-2xl leading-7 text-[color:var(--color-text-1)]">
                    {product.description || 'No description provided.'}
                </p>
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

            {/* Reviews */}
            {selectedTab === 'reviews' && (
                reviewCount === 0 ? (
                    <p className="text-[color:var(--color-text-3)]">No reviews yet — be the first to review this product.</p>
                ) : (
                    <div className="grid sm:grid-cols-2 gap-5 max-w-3xl">
                        {ratingArr.map((item, index) => (
                            <article key={item.id ?? index} className="border border-[color:var(--color-border)] rounded-2xl p-5 bg-white">
                                <header className="flex items-center justify-between">
                                    <div className="flex items-center" aria-label={`Rated ${item.rating} out of 5`}>
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <Star
                                                key={n}
                                                size={15}
                                                fill={item.rating >= n ? 'var(--color-warning)' : 'transparent'}
                                                className={item.rating >= n ? 'text-[color:var(--color-warning)]' : 'text-[color:var(--color-text-3)]'}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-[color:var(--color-text-3)]">
                                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                                    </p>
                                </header>
                                <p className="text-sm text-[color:var(--color-text-1)] mt-3 leading-6">{item.review}</p>
                            </article>
                        ))}
                    </div>
                )
            )}
        </section>
    )
}

export default ProductDescription
