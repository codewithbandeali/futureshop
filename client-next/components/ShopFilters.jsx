'use client'

import { Star, X } from 'lucide-react'

const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

/**
 * Faceted filters — brand checkboxes, price range slider, min-rating
 * radios, in-stock toggle. Reads the available brands/min/max from the
 * full product list (passed in), so the facets adapt when the catalog
 * changes without code edits.
 *
 * Renders inline on desktop (called from ShopFiltersPanel sidebar) and
 * inside the bottom drawer on mobile (called from ShopFiltersDrawer).
 */
const ShopFilters = ({
    products = [],
    brands = [],
    selectedBrands = [],
    priceRange,
    setPriceRange,
    minRating,
    setMinRating,
    inStockOnly,
    setInStockOnly,
    onToggleBrand,
    onReset,
    activeCount,
}) => {
    // Derive price bounds from the catalog so the slider always covers
    // the real range. If catalog is empty, defaults [0, 5000] keep the
    // UI usable for an empty-data preview.
    const allPrices = products.map(p => Number(p.price)).filter(n => Number.isFinite(n))
    const minPrice = allPrices.length ? Math.floor(Math.min(...allPrices)) : 0
    const maxPrice = allPrices.length ? Math.ceil(Math.max(...allPrices)) : 5000

    return (
        <div className="space-y-7 text-sm">
            <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.15em] text-[color:var(--color-text-3)]">
                    Filters{activeCount > 0 ? ` · ${activeCount}` : ''}
                </p>
                {activeCount > 0 && (
                    <button
                        type="button"
                        onClick={onReset}
                        className="text-xs text-[color:var(--color-brand)] hover:text-[color:var(--color-accent)] underline underline-offset-4"
                    >
                        Reset
                    </button>
                )}
            </div>

            {/* Brand */}
            {brands.length > 0 && (
                <fieldset>
                    <legend className="text-sm font-medium mb-3">Brand</legend>
                    <div className="space-y-2">
                        {brands.map(b => (
                            <label key={b} className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                                <input
                                    type="checkbox"
                                    checked={selectedBrands.includes(b)}
                                    onChange={() => onToggleBrand(b)}
                                    className="size-4 rounded border-[color:var(--color-border)]"
                                />
                                <span className="text-[color:var(--color-text-1)]">{b}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>
            )}

            {/* Price */}
            <fieldset>
                <legend className="text-sm font-medium mb-3">Price</legend>
                <div className="flex items-center justify-between text-xs text-[color:var(--color-text-2)] mb-2">
                    <span>{currency}{Number(priceRange[0]).toFixed(0)}</span>
                    <span>{currency}{Number(priceRange[1]).toFixed(0)}</span>
                </div>
                <div className="space-y-2">
                    <label className="sr-only" htmlFor="price-min">Minimum price</label>
                    <input
                        id="price-min"
                        type="range"
                        min={minPrice}
                        max={maxPrice}
                        step="10"
                        value={priceRange[0]}
                        onChange={(e) => {
                            const v = Math.min(Number(e.target.value), priceRange[1] - 10)
                            setPriceRange([v, priceRange[1]])
                        }}
                        className="w-full accent-[color:var(--color-brand)]"
                    />
                    <label className="sr-only" htmlFor="price-max">Maximum price</label>
                    <input
                        id="price-max"
                        type="range"
                        min={minPrice}
                        max={maxPrice}
                        step="10"
                        value={priceRange[1]}
                        onChange={(e) => {
                            const v = Math.max(Number(e.target.value), priceRange[0] + 10)
                            setPriceRange([priceRange[0], v])
                        }}
                        className="w-full accent-[color:var(--color-brand)]"
                    />
                </div>
            </fieldset>

            {/* Rating */}
            <fieldset>
                <legend className="text-sm font-medium mb-3">Customer rating</legend>
                <div className="space-y-1">
                    {[4, 3, 2, 1, 0].map(r => (
                        <label key={r} className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                            <input
                                type="radio"
                                name="rating-filter"
                                checked={minRating === r}
                                onChange={() => setMinRating(r)}
                                className="size-4 border-[color:var(--color-border)]"
                            />
                            {r === 0 ? (
                                <span className="text-[color:var(--color-text-2)]">Any</span>
                            ) : (
                                <span className="inline-flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <Star
                                            key={n}
                                            size={13}
                                            fill={r >= n ? 'var(--color-warning)' : 'transparent'}
                                            className={r >= n ? 'text-[color:var(--color-warning)]' : 'text-[color:var(--color-text-3)]'}
                                        />
                                    ))}
                                    <span className="text-xs text-[color:var(--color-text-2)] ml-1">&amp; up</span>
                                </span>
                            )}
                        </label>
                    ))}
                </div>
            </fieldset>

            {/* In-stock */}
            <fieldset>
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                    <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        className="size-4 rounded border-[color:var(--color-border)]"
                    />
                    <span className="text-[color:var(--color-text-1)] font-medium">Show in-stock only</span>
                </label>
            </fieldset>
        </div>
    )
}

/** Mobile drawer wrapper. Slides up from the bottom on mobile. */
export const ShopFiltersDrawer = ({ open, onClose, ...props }) => {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />
            <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto shadow-xl">
                <div className="sticky top-0 bg-white border-b border-[color:var(--color-border)] flex items-center justify-between p-4">
                    <h2 className="text-lg">Filters</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close filters"
                        className="size-11 flex items-center justify-center text-[color:var(--color-text-2)] hover:text-[color:var(--color-text-1)]"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6">
                    <ShopFilters {...props} />
                </div>
                <div className="sticky bottom-0 bg-white border-t border-[color:var(--color-border)] p-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-primary w-full"
                    >
                        Show results
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ShopFilters
