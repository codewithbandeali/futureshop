'use client'

import { addToCart } from "@/lib/features/cart/cartSlice"
import { CheckCircle2, CreditCard, ImageIcon, Minus, Play, Plus, RotateCcw, ShieldCheck, Star, Tag, Truck, Zap } from "lucide-react"
import Image from "next/image"
import { useRouter as useRouterClient } from "next/navigation"
import { useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import toast from "react-hot-toast"
import Spinner360 from "./Spinner360"
import VariantPicker, { defaultVariantSelection } from "./VariantPicker"
import VideoPlayer from "./VideoPlayer"

function ModeTab({ active, onClick, icon: Icon, children }) {
    return (
        <button
            type="button"
            role="tab"
            aria-selected={active}
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border transition min-h-[36px] ${
                active
                    ? 'border-[color:var(--color-brand)] bg-[color:var(--color-brand)] text-white'
                    : 'border-[color:var(--color-border)] bg-white text-[color:var(--color-text-2)] hover:border-[color:var(--color-text-3)]'
            }`}
        >
            <Icon size={13} />
            {children}
        </button>
    )
}

const ProductDetails = ({ product }) => {
    const productId = product.id
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const cart = useSelector(state => state.cart.cartItems)
    const dispatch = useDispatch()

    const images = Array.isArray(product.images) && product.images.length ? product.images : []
    const view360 = Array.isArray(product.view_360_urls) ? product.view_360_urls.filter(Boolean) : []
    const has360 = view360.length >= 2
    const hasVideo = !!product.video_url
    const [mainImage, setMainImage] = useState(images[0])
    const [zoomActive, setZoomActive] = useState(false)
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
    // mediaMode: 'image' (gallery), '360' (spinner), 'video'
    const [mediaMode, setMediaMode] = useState('image')

    // Soft variants — UI state only for now. The selection rides along to
    // the cart toast and gets formatted for the cart line. Per-variant
    // inventory is a follow-up (see migration comment).
    const initialSelection = useMemo(() => defaultVariantSelection(product.options), [product.options])
    const [variantSelection, setVariantSelection] = useState(initialSelection)
    const hasVariants = !!initialSelection

    const variantSummary = variantSelection
        ? Object.values(variantSelection).join(' · ')
        : null

    const ratingArr = Array.isArray(product.rating) ? product.rating : []
    const ratingCount = ratingArr.length
    const averageRating = ratingCount
        ? ratingArr.reduce((acc, item) => acc + Number(item.rating || 0), 0) / ratingCount
        : 0

    const price = Number(product.price)
    const mrp = product.mrp ? Number(product.mrp) : price
    const discount = mrp > price ? Math.round((1 - price / mrp) * 100) : 0

    // Quantity picker — always visible (B&H/Newegg pattern for hardware
    // shops where buyers often want 5+ at a time). Local state, decoupled
    // from cart; Add to cart dispatches it N times in one go.
    const stock = Number(product.stock ?? 99)
    const [qty, setQty] = useState(1)
    const inCart = cart[productId] ?? 0
    const maxAddable = Math.max(0, stock - inCart)
    const clampedMax = Math.min(99, maxAddable) // sane upper bound
    const decQty = () => setQty(q => Math.max(1, q - 1))
    const incQty = () => setQty(q => Math.min(clampedMax || 1, q + 1))

    const handleAddToCart = () => {
        for (let i = 0; i < qty; i++) {
            // Suppress the mini-cart drawer on intermediate dispatches so
            // it only opens once at the end (state.miniCartOpen latches true).
            dispatch(addToCart({ productId, openDrawer: i === qty - 1 }))
        }
        const noun = qty === 1 ? 'Added' : `Added ${qty} ×`
        if (variantSummary) {
            toast.success(`${noun} ${variantSummary} to cart`)
        } else {
            toast.success(`${noun} to cart`)
        }
    }

    // Buy Now — adds the chosen quantity to the cart without opening the
    // drawer, then routes straight to checkout. Amazon's "one-click"
    // equivalent without payment-on-file.
    const router = useRouterClient()
    const handleBuyNow = () => {
        for (let i = 0; i < qty; i++) {
            dispatch(addToCart({ productId, openDrawer: false }))
        }
        router.push('/checkout')
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

            {/* Gallery — SKILLS.md §5.4. Image mode has Amazon-style hover
                zoom; 360° mode swaps in the Spinner360; video mode shows
                the demo. Mode tabs appear above the main view when the
                product has any non-image media. */}
            <div className="flex max-sm:flex-col-reverse gap-3 lg:max-w-xl flex-1">
                {images.length > 1 && mediaMode === 'image' && (
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

                <div className="flex-1 min-w-0">
                    {/* Mode tabs — only render when there's a choice */}
                    {(has360 || hasVideo) && (
                        <div className="flex gap-2 mb-3" role="tablist" aria-label="Product media">
                            <ModeTab active={mediaMode === 'image'} onClick={() => setMediaMode('image')} icon={ImageIcon}>
                                Photos
                            </ModeTab>
                            {has360 && (
                                <ModeTab active={mediaMode === '360'} onClick={() => setMediaMode('360')} icon={RotateCcw}>
                                    360° view
                                </ModeTab>
                            )}
                            {hasVideo && (
                                <ModeTab active={mediaMode === 'video'} onClick={() => setMediaMode('video')} icon={Play}>
                                    Video
                                </ModeTab>
                            )}
                        </div>
                    )}

                    {mediaMode === 'image' && (
                        <div
                            onMouseEnter={() => setZoomActive(true)}
                            onMouseLeave={() => setZoomActive(false)}
                            onMouseMove={onZoomMove}
                            className="relative h-[400px] sm:h-[480px] bg-[color:var(--color-surface-2)] rounded-2xl overflow-hidden cursor-zoom-in"
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
                    )}

                    {mediaMode === '360' && has360 && (
                        <Spinner360 frames={view360} alt={product.name} />
                    )}

                    {mediaMode === 'video' && hasVideo && (
                        <VideoPlayer url={product.video_url} title={`${product.name} demo`} poster={mainImage} />
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
                            <CheckCircle2 size={16} aria-hidden="true" /> In stock. Ships today.
                        </span>
                    ) : (
                        <span className="text-sm text-[color:var(--color-accent)] font-medium">Currently out of stock</span>
                    )}
                </div>

                {/* Variant selectors (chips) — only rendered if the product
                    carries an `options` map. See VariantPicker for the shape. */}
                {hasVariants && (
                    <VariantPicker
                        options={product.options}
                        selected={variantSelection}
                        onChange={setVariantSelection}
                    />
                )}

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

                {/* Desktop / tablet CTA row — qty picker is always visible
                    so buyers can pick before adding (hardware-shop pattern). */}
                <div className="hidden sm:flex items-end gap-4 mt-8 flex-wrap">
                    <div className="flex flex-col gap-2">
                        <label htmlFor={`qty-${productId}`} className="text-sm text-[color:var(--color-text-2)] font-medium">
                            Quantity
                        </label>
                        <div className="inline-flex items-center rounded-lg border border-[color:var(--color-border)] bg-white select-none">
                            <button
                                type="button"
                                onClick={decQty}
                                disabled={qty <= 1}
                                aria-label="Decrease quantity"
                                className="size-10 flex items-center justify-center hover:bg-[color:var(--color-surface-2)] rounded-l-lg transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <Minus size={14} />
                            </button>
                            <input
                                id={`qty-${productId}`}
                                type="number"
                                min={1}
                                max={clampedMax || 99}
                                value={qty}
                                onChange={(e) => {
                                    const v = parseInt(e.target.value || '1', 10)
                                    if (Number.isFinite(v)) setQty(Math.max(1, Math.min(clampedMax || 99, v)))
                                }}
                                aria-label="Quantity"
                                className="w-12 text-center text-sm font-medium bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                                type="button"
                                onClick={incQty}
                                disabled={clampedMax > 0 && qty >= clampedMax}
                                aria-label="Increase quantity"
                                className="size-10 flex items-center justify-center hover:bg-[color:var(--color-surface-2)] rounded-r-lg transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={!product.inStock || maxAddable === 0}
                        className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {product.inStock
                            ? (inCart > 0 ? `Add ${qty} more · ${inCart} in cart` : `Add ${qty > 1 ? qty + ' ' : ''}to cart`)
                            : 'Out of stock'}
                    </button>
                    {product.inStock && (
                        <button
                            type="button"
                            onClick={handleBuyNow}
                            disabled={maxAddable === 0}
                            className="btn-secondary inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Buy now. Skip the cart and go straight to checkout."
                        >
                            <Zap size={14} aria-hidden="true" />
                            Buy now
                        </button>
                    )}
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

            {/* Mobile sticky bottom CTA — SKILLS.md §8 mobile checklist.
                Qty picker collapses to a compact inline stepper. */}
            <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[color:var(--color-border)] p-3 shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-2">
                    <div className="shrink-0">
                        <p className="text-base font-semibold leading-none">{currency}{(price * qty).toFixed(2)}</p>
                        <p className="text-[10px] text-[color:var(--color-text-3)] mt-0.5">
                            {qty > 1 ? `${qty} × ${currency}${price.toFixed(2)}` : (discount > 0 ? `was ${currency}${mrp.toFixed(2)}` : 'each')}
                        </p>
                    </div>
                    <div className="inline-flex items-center rounded-md border border-[color:var(--color-border)] bg-white select-none">
                        <button
                            type="button"
                            onClick={decQty}
                            disabled={qty <= 1}
                            aria-label="Decrease quantity"
                            className="size-8 flex items-center justify-center disabled:opacity-40"
                        >
                            <Minus size={12} />
                        </button>
                        <span className="w-7 text-center text-sm font-medium" aria-live="polite">{qty}</span>
                        <button
                            type="button"
                            onClick={incQty}
                            disabled={clampedMax > 0 && qty >= clampedMax}
                            aria-label="Increase quantity"
                            className="size-8 flex items-center justify-center disabled:opacity-40"
                        >
                            <Plus size={12} />
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={!product.inStock || maxAddable === 0}
                        className="ml-auto btn-primary !py-2.5 !px-4 flex-1 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                    >
                        {product.inStock ? 'Add to cart' : 'Out of stock'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProductDetails
