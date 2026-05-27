'use client'
import { Heart, ShoppingBag, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { addToCart } from '@/lib/features/cart/cartSlice'

/**
 * Product card — Amazon/Shopify-style polish.
 *
 * SKILLS.md §5.3 plus a quick-add CTA that slides up over the image on
 * hover (always visible on touch), an always-visible wishlist heart, and
 * a stock-urgency badge that swaps in for the "in stock" pill when
 * inventory drops below 5.
 */
const ProductCard = ({ product }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const dispatch = useDispatch()
    const inCart = useSelector(s => s.cart.cartItems?.[product.id] ?? 0)

    const ratingArr = Array.isArray(product.rating) ? product.rating : []
    const ratingCount = ratingArr.length
    const ratingAvg = ratingCount
        ? Math.round(ratingArr.reduce((acc, r) => acc + Number(r.rating || 0), 0) / ratingCount)
        : 0

    const price = Number(product.price)
    const mrp = product.mrp ? Number(product.mrp) : price
    const discount = mrp > price ? Math.round((1 - price / mrp) * 100) : 0
    const savings = mrp - price

    const stock = Number(product.stock ?? 0)
    const inStock = product.inStock !== false && stock > 0
    const lowStock = inStock && stock <= 5

    const [wished, setWished] = useState(false)

    const toggleWish = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setWished(w => !w)
        toast.success(wished ? 'Removed from wishlist' : 'Added to wishlist')
    }

    const handleAddToCart = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!inStock) return
        dispatch(addToCart({ productId: product.id }))
        toast.success('Added to cart')
    }

    return (
        <Link
            href={`/product/${product.slug ?? product.id}`}
            className="product-card group block rounded-xl focus-visible:outline-2 focus-visible:outline-[color:var(--color-brand)] focus-visible:outline-offset-2"
        >
            {/* Image area — square, image fills via object-cover. */}
            <div className="relative aspect-square bg-[color:var(--color-surface-2)] overflow-hidden rounded-t-xl">
                {product.images?.[0] && (
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                )}

                {/* Sale badge (top-left) */}
                {discount > 0 && (
                    <span className="absolute top-3 left-3 bg-[color:var(--color-accent)] text-white text-[11px] font-semibold px-2 py-1 rounded shadow-sm">
                        -{discount}%
                    </span>
                )}

                {/* Out-of-stock veil */}
                {!inStock && (
                    <span className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center text-sm font-semibold text-[color:var(--color-text-1)]">
                        Out of stock
                    </span>
                )}

                {/* Always-visible wishlist (Amazon-style) */}
                <button
                    type="button"
                    onClick={toggleWish}
                    aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                    aria-pressed={wished}
                    className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors"
                >
                    <Heart
                        size={16}
                        className={wished ? 'fill-[color:var(--color-accent)] text-[color:var(--color-accent)]' : 'text-[color:var(--color-text-2)]'}
                    />
                </button>

                {/* Quick add CTA — slides up over image on hover (desktop)
                    and stays visible on touch (mobile, where there's no hover). */}
                {inStock && (
                    <div className="absolute inset-x-3 bottom-3 sm:translate-y-12 sm:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            className="w-full flex items-center justify-center gap-2 bg-[color:var(--color-brand)] hover:bg-[color:var(--color-accent)] text-white text-sm font-medium py-2.5 px-3 rounded-md shadow-md transition-colors"
                        >
                            <ShoppingBag size={14} aria-hidden="true" />
                            {inCart > 0 ? `In cart · ${inCart}` : 'Add to cart'}
                        </button>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-4">
                <p className="text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-text-3)]">
                    {product.category}
                </p>
                <p className="text-[color:var(--color-text-1)] mt-1 line-clamp-2 leading-snug font-medium min-h-[2.6em]">
                    {product.name}
                </p>
                {product.brand && (
                    <p className="text-sm text-[color:var(--color-text-2)] mt-0.5">{product.brand}</p>
                )}

                {/* Rating */}
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

                {/* Price */}
                <div className="flex items-baseline gap-2 mt-3">
                    <span className="text-lg text-[color:var(--color-text-1)] font-semibold">
                        {currency}{price.toFixed(2)}
                    </span>
                    {discount > 0 && (
                        <span className="text-xs text-[color:var(--color-text-3)] line-through">
                            {currency}{mrp.toFixed(2)}
                        </span>
                    )}
                </div>
                {discount > 0 && (
                    <p className="text-xs text-[color:var(--color-success)] mt-0.5 font-medium">
                        Save {currency}{savings.toFixed(2)}
                    </p>
                )}

                {/* Stock urgency / free shipping */}
                <div className="mt-3 flex items-center justify-between text-xs">
                    {lowStock ? (
                        <span className="font-medium text-[color:var(--color-accent)]">
                            Only {stock} left
                        </span>
                    ) : inStock ? (
                        <span className="font-medium text-[color:var(--color-success)] inline-flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-[color:var(--color-success)]" />
                            In stock
                        </span>
                    ) : null}
                    {price >= 50 && inStock && (
                        <span className="text-[color:var(--color-text-2)]">Free delivery</span>
                    )}
                </div>
            </div>
        </Link>
    )
}

export default ProductCard
