'use client'
import { Heart, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import toast from 'react-hot-toast'

const ProductCard = ({ product }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const ratingArr = Array.isArray(product.rating) ? product.rating : []
    const ratingCount = ratingArr.length
    const ratingAvg = ratingCount
        ? Math.round(ratingArr.reduce((acc, r) => acc + Number(r.rating || 0), 0) / ratingCount)
        : 0

    const price = Number(product.price)
    const mrp = product.mrp ? Number(product.mrp) : price
    const discount = mrp > price ? Math.round((1 - price / mrp) * 100) : 0

    const [wished, setWished] = useState(false)
    const toggleWish = (e) => {
        e.preventDefault()
        setWished(w => !w)
        toast.success(wished ? 'Removed from wishlist' : 'Added to wishlist')
    }

    return (
        <Link
            href={`/product/${product.slug ?? product.id}`}
            className="product-card group block focus-visible:outline-2 focus-visible:outline-[color:var(--color-brand)] focus-visible:outline-offset-2 rounded-xl"
        >
            <div className="relative aspect-[4/5] bg-[color:var(--color-surface-2)] overflow-hidden">
                {product.images?.[0] && (
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
                        className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                    />
                )}

                {discount > 0 && (
                    <span className="absolute top-3 left-3 bg-[color:var(--color-accent)] text-white text-[11px] font-semibold px-2 py-1 rounded">
                        -{discount}%
                    </span>
                )}

                {product.inStock === false && (
                    <span className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center text-sm font-semibold text-[color:var(--color-text-1)]">
                        Out of stock
                    </span>
                )}

                <button
                    type="button"
                    onClick={toggleWish}
                    aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                    aria-pressed={wished}
                    className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                >
                    <Heart
                        size={16}
                        className={wished ? 'fill-[color:var(--color-accent)] text-[color:var(--color-accent)]' : 'text-[color:var(--color-text-2)]'}
                    />
                </button>
            </div>

            <div className="p-4">
                <p className="text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-text-3)]">
                    {product.category}
                </p>
                <p className="text-[color:var(--color-text-1)] mt-1 line-clamp-2 leading-snug font-medium">
                    {product.name}
                </p>
                {product.brand && (
                    <p className="text-sm text-[color:var(--color-text-2)] mt-0.5">{product.brand}</p>
                )}

                <div className="flex items-center gap-1 mt-2" aria-label={`Rated ${ratingAvg} out of 5`}>
                    {[1, 2, 3, 4, 5].map(n => (
                        <Star
                            key={n}
                            size={13}
                            fill={ratingAvg >= n ? 'var(--color-warning)' : 'transparent'}
                            className={ratingAvg >= n ? 'text-[color:var(--color-warning)]' : 'text-[color:var(--color-text-3)]'}
                        />
                    ))}
                    <span className="text-xs text-[color:var(--color-text-3)] ml-1">({ratingCount})</span>
                </div>

                <div className="flex items-baseline gap-2 mt-3">
                    <span className="text-[color:var(--color-text-1)] font-semibold">
                        {currency}{price.toFixed(2)}
                    </span>
                    {discount > 0 && (
                        <span className="text-xs text-[color:var(--color-text-3)] line-through">
                            {currency}{mrp.toFixed(2)}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    )
}

export default ProductCard
