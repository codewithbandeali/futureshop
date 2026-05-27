'use client'

import { addToCart } from "@/lib/features/cart/cartSlice"
import { CheckCircle2, CreditCard, ShieldCheck, Star, Tag, Truck } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import toast from "react-hot-toast"
import Counter from "./Counter"

const ProductDetails = ({ product }) => {
    const productId = product.id
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const cart = useSelector(state => state.cart.cartItems)
    const dispatch = useDispatch()

    const images = Array.isArray(product.images) && product.images.length ? product.images : []
    const [mainImage, setMainImage] = useState(images[0])
    const [zoomActive, setZoomActive] = useState(false)
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })

    const ratingArr = Array.isArray(product.rating) ? product.rating : []
    const ratingCount = ratingArr.length
    const averageRating = ratingCount
        ? ratingArr.reduce((acc, item) => acc + Number(item.rating || 0), 0) / ratingCount
        : 0

    const price = Number(product.price)
    const mrp = product.mrp ? Number(product.mrp) : price
    const discount = mrp > price ? Math.round((1 - price / mrp) * 100) : 0

    const handleAddToCart = () => {
        dispatch(addToCart({ productId }))
        toast.success('Added to cart')
    }

    const onZoomMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setZoomPos({ x, y })
    }

    const trustBadges = [
        { icon: Truck, label: 'Next-business-day shipping' },
        { icon: CreditCard, label: 'Secure checkout' },
        { icon: ShieldCheck, label: 'Manufacturer warranty' },
    ]

    return (
        <div className="flex max-lg:flex-col gap-10 xl:gap-16 pb-24 lg:pb-0">

            {/* Gallery — SKILLS.md §5.4. Amazon-style hover zoom on desktop. */}
            <div className="flex max-sm:flex-col-reverse gap-3 lg:max-w-xl">
                {images.length > 1 && (
                    <div className="flex sm:flex-col gap-3">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setMainImage(image)}
                                aria-label={`Show image ${index + 1}`}
                                className={`relative bg-[color:var(--color-surface-2)] size-20 sm:size-24 rounded-xl overflow-hidden transition ${
                                    mainImage === image
                                        ? 'ring-2 ring-[color:var(--color-brand)]'
                                        : 'ring-1 ring-[color:var(--color-border)] hover:ring-[color:var(--color-text-3)]'
                                }`}
                            >
                                <Image src={image} alt="" fill sizes="96px" className="object-cover" />
                            </button>
                        ))}
                    </div>
                )}
                <div
                    onMouseEnter={() => setZoomActive(true)}
                    onMouseLeave={() => setZoomActive(false)}
                    onMouseMove={onZoomMove}
                    className="flex-1 relative h-[400px] sm:h-[480px] bg-[color:var(--color-surface-2)] rounded-2xl overflow-hidden cursor-zoom-in"
                >
                    {mainImage && (
                        <Image
                            src={mainImage}
                            alt={product.name}
                            fill
                            sizes="(min-width:1024px) 600px, 100vw"
                            className="object-cover transition-transform duration-300"
                            style={zoomActive ? {
                                transform: 'scale(1.8)',
                                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                            } : undefined}
                            priority
                        />
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="flex-1">
                {product.brand && (
                    <p className="text-xs uppercase tracking-[0.15em] text-[color:var(--color-text-3)] mb-2">
                        {product.brand}
                    </p>
                )}
                <h1 className="text-3xl sm:text-4xl">{product.name}</h1>

                <div className="flex items-center gap-2 mt-3">
                    <div className="flex" aria-label={`Rated ${averageRating.toFixed(1)} out of 5`}>
                        {[1, 2, 3, 4, 5].map(n => (
                            <Star
                                key={n}
                                size={16}
                                fill={averageRating >= n ? 'var(--color-warning)' : 'transparent'}
                                className={averageRating >= n ? 'text-[color:var(--color-warning)]' : 'text-[color:var(--color-text-3)]'}
                            />
                        ))}
                    </div>
                    <p className="text-sm text-[color:var(--color-text-2)]">
                        {ratingCount > 0
                            ? `${averageRating.toFixed(1)} · ${ratingCount} ${ratingCount === 1 ? 'review' : 'reviews'}`
                            : 'No reviews yet'}
                    </p>
                </div>

                <div className="flex items-end gap-3 mt-5 flex-wrap">
                    <p className="text-3xl font-semibold text-[color:var(--color-text-1)]">{currency}{price.toFixed(2)}</p>
                    {discount > 0 && (
                        <p className="text-lg text-[color:var(--color-text-3)] line-through mb-0.5">{currency}{mrp.toFixed(2)}</p>
                    )}
                    {discount > 0 && (
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)] mb-0.5">
                            -{discount}%
                        </span>
                    )}
                </div>
                {discount > 0 && (
                    <div className="flex items-center gap-2 text-[color:var(--color-accent)] text-sm mt-1">
                        <Tag size={14} aria-hidden="true" /> You save {currency}{(mrp - price).toFixed(2)}
                    </div>
                )}

                <div className="mt-5">
                    {product.inStock ? (
                        <span className="inline-flex items-center gap-1.5 text-sm text-[color:var(--color-success)] font-medium">
                            <CheckCircle2 size={16} aria-hidden="true" /> In stock — ships today
                        </span>
                    ) : (
                        <span className="text-sm text-[color:var(--color-accent)] font-medium">Currently out of stock</span>
                    )}
                </div>

                {/* SKU and meta */}
                <dl className="grid grid-cols-2 gap-y-2 gap-x-6 mt-6 text-sm max-w-sm">
                    {product.sku && (
                        <>
                            <dt className="text-[color:var(--color-text-2)]">SKU</dt>
                            <dd className="font-mono text-xs">{product.sku}</dd>
                        </>
                    )}
                    {product.category && (
                        <>
                            <dt className="text-[color:var(--color-text-2)]">Category</dt>
                            <dd className="capitalize">{product.category}</dd>
                        </>
                    )}
                </dl>

                {/* Desktop / tablet CTA row */}
                <div className="hidden sm:flex items-end gap-4 mt-8 flex-wrap">
                    {cart[productId] && (
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-[color:var(--color-text-2)] font-medium">Quantity</p>
                            <Counter productId={productId} />
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={!product.inStock}
                        className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {cart[productId] ? `In cart · ${cart[productId]} · Add another` : 'Add to cart'}
                    </button>
                </div>

                {/* Trust badges */}
                <ul className="grid sm:grid-cols-3 gap-3 mt-10">
                    {trustBadges.map((badge, index) => (
                        <li
                            key={index}
                            className="flex items-center gap-2 text-xs text-[color:var(--color-text-2)] bg-white border border-[color:var(--color-border)] rounded-lg p-3"
                        >
                            <badge.icon size={18} className="text-[color:var(--color-brand)] shrink-0" aria-hidden="true" />
                            <span>{badge.label}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Mobile sticky bottom CTA — SKILLS.md §8 mobile checklist */}
            <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[color:var(--color-border)] p-3 shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-3">
                    <div>
                        <p className="text-base font-semibold leading-none">{currency}{price.toFixed(2)}</p>
                        {discount > 0 && (
                            <p className="text-xs text-[color:var(--color-text-3)] line-through mt-1">{currency}{mrp.toFixed(2)}</p>
                        )}
                    </div>
                    {cart[productId] ? (
                        <div className="ml-auto"><Counter productId={productId} /></div>
                    ) : null}
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={!product.inStock}
                        className="ml-auto btn-primary !py-2.5 !px-5 flex-1 max-w-[60%] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {product.inStock ? (cart[productId] ? 'Add another' : 'Add to cart') : 'Out of stock'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProductDetails
