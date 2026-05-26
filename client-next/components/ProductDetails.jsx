'use client'

import { addToCart } from "@/lib/features/cart/cartSlice"
import { Star, Tag, Globe, CreditCard, ShieldCheck, CheckCircle2, Truck } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import Counter from "./Counter"
import { useDispatch, useSelector } from "react-redux"

const ProductDetails = ({ product }) => {
    const productId = product.id
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const cart = useSelector(state => state.cart.cartItems)
    const dispatch = useDispatch()
    const router = useRouter()

    const images = Array.isArray(product.images) && product.images.length ? product.images : []
    const [mainImage, setMainImage] = useState(images[0])

    const ratingArr = Array.isArray(product.rating) ? product.rating : []
    const ratingCount = ratingArr.length
    const averageRating = ratingCount
        ? ratingArr.reduce((acc, item) => acc + Number(item.rating || 0), 0) / ratingCount
        : 0

    const price = Number(product.price)
    const mrp = product.mrp ? Number(product.mrp) : price
    const discount = mrp > price ? Math.round((1 - price / mrp) * 100) : 0

    const trustBadges = [
        { icon: Truck, label: 'Next-business-day shipping' },
        { icon: CreditCard, label: 'Secure checkout' },
        { icon: ShieldCheck, label: 'Manufacturer warranty' },
    ]

    return (
        <div className="flex max-lg:flex-col gap-10 xl:gap-16">

            {/* Gallery — SKILLS.md §5.4 */}
            <div className="flex max-sm:flex-col-reverse gap-3 lg:max-w-xl">
                {images.length > 1 && (
                    <div className="flex sm:flex-col gap-3">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setMainImage(image)}
                                aria-label={`Show image ${index + 1}`}
                                className={`bg-[color:var(--color-surface-2)] flex items-center justify-center size-20 sm:size-24 rounded-xl transition ${
                                    mainImage === image
                                        ? 'ring-2 ring-[color:var(--color-brand)]'
                                        : 'ring-1 ring-[color:var(--color-border)] hover:ring-[color:var(--color-text-3)]'
                                }`}
                            >
                                <Image src={image} className="max-h-14 w-auto" alt="" width={60} height={60} />
                            </button>
                        ))}
                    </div>
                )}
                <div className="flex-1 flex justify-center items-center h-[400px] sm:h-[460px] bg-[color:var(--color-surface-2)] rounded-2xl overflow-hidden group">
                    {mainImage && (
                        <Image
                            src={mainImage}
                            alt={product.name}
                            width={500}
                            height={500}
                            className="max-h-80 w-auto transition-transform duration-500 group-hover:scale-110 cursor-zoom-in"
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

                <div className='flex items-center gap-2 mt-3'>
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

                <div className="flex items-end gap-3 mt-5">
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

                <div className="flex items-end gap-4 mt-8 flex-wrap">
                    {cart[productId] && (
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-[color:var(--color-text-2)] font-medium">Quantity</p>
                            <Counter productId={productId} />
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => !cart[productId] ? dispatch(addToCart({ productId })) : router.push('/cart')}
                        disabled={!product.inStock}
                        className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {!cart[productId] ? 'Add to cart' : 'View cart'}
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
        </div>
    )
}

export default ProductDetails
