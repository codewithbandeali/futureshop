'use client'

import { ShoppingBag, X, Minus, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    addToCart,
    removeFromCart,
    deleteItemFromCart,
    closeMiniCart,
} from '@/lib/features/cart/cartSlice'

const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

/**
 * Mini-cart drawer — Shopify-style slide-in from the right.
 *
 * Visible when `cart.miniCartOpen` is true (set on Add-to-cart). Locks
 * background scroll while open. Lists every cart item with image, name,
 * price, qty stepper and a remove button. Footer shows subtotal + a CTA
 * to /checkout. Clicking the backdrop or the X closes it.
 */
const MiniCart = () => {
    const dispatch = useDispatch()
    const open = useSelector(s => s.cart.miniCartOpen ?? false)
    const cartItems = useSelector(s => s.cart.cartItems ?? {})
    const products = useSelector(s => s.product.list)

    // Build line items from cart map + product catalog
    const items = Object.entries(cartItems).map(([productId, quantity]) => {
        const product = products.find(p => String(p.id) === String(productId))
        if (!product) return null
        return {
            id: product.id,
            slug: product.slug,
            name: product.name,
            brand: product.brand,
            image: product.images?.[0],
            unitPrice: Number(product.price),
            quantity,
            lineTotal: Number(product.price) * quantity,
        }
    }).filter(Boolean)

    const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0)
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

    // Close on Escape; lock body scroll while open
    useEffect(() => {
        if (!open) return
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        const onKey = (e) => { if (e.key === 'Escape') dispatch(closeMiniCart()) }
        window.addEventListener('keydown', onKey)
        return () => {
            document.body.style.overflow = prev
            window.removeEventListener('keydown', onKey)
        }
    }, [open, dispatch])

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={() => dispatch(closeMiniCart())}
                aria-hidden="true"
                className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
                    open ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            />

            {/* Drawer */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Shopping cart"
                aria-hidden={!open}
                className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
                    open ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* Header */}
                <header className="flex items-center justify-between px-6 py-4 border-b border-[color:var(--color-border)]">
                    <div className="flex items-center gap-2">
                        <ShoppingBag size={18} aria-hidden="true" />
                        <h2 className="text-lg font-medium">
                            Your cart
                            {itemCount > 0 && (
                                <span className="text-sm text-[color:var(--color-text-2)] ml-2">({itemCount})</span>
                            )}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={() => dispatch(closeMiniCart())}
                        aria-label="Close cart"
                        className="p-2 text-[color:var(--color-text-2)] hover:text-[color:var(--color-text-1)] rounded transition"
                    >
                        <X size={18} />
                    </button>
                </header>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center px-6">
                            <ShoppingBag size={48} strokeWidth={1.5} className="text-[color:var(--color-text-3)]" />
                            <p className="text-base font-medium text-[color:var(--color-text-1)] mt-4">Your cart is empty</p>
                            <p className="text-sm text-[color:var(--color-text-2)] mt-1">Browse the catalog and add a few things.</p>
                            <Link
                                href="/shop"
                                onClick={() => dispatch(closeMiniCart())}
                                className="btn-primary mt-6"
                            >
                                Shop hardware
                            </Link>
                        </div>
                    ) : (
                        <ul className="divide-y divide-[color:var(--color-border)]">
                            {items.map(item => (
                                <li key={item.id} className="flex gap-3 p-4">
                                    <Link
                                        href={`/product/${item.slug ?? item.id}`}
                                        onClick={() => dispatch(closeMiniCart())}
                                        className="shrink-0 size-20 bg-[color:var(--color-surface-2)] rounded overflow-hidden relative"
                                    >
                                        {item.image && (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                sizes="80px"
                                                className="object-cover"
                                            />
                                        )}
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/product/${item.slug ?? item.id}`}
                                            onClick={() => dispatch(closeMiniCart())}
                                            className="text-sm font-medium text-[color:var(--color-text-1)] hover:text-[color:var(--color-brand)] line-clamp-2 transition"
                                        >
                                            {item.name}
                                        </Link>
                                        {item.brand && (
                                            <p className="text-xs text-[color:var(--color-text-3)] mt-0.5">{item.brand}</p>
                                        )}
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="inline-flex items-center rounded-md border border-[color:var(--color-border)] bg-white">
                                                <button
                                                    type="button"
                                                    onClick={() => dispatch(removeFromCart({ productId: item.id }))}
                                                    aria-label={`Decrease quantity of ${item.name}`}
                                                    className="size-7 flex items-center justify-center hover:bg-[color:var(--color-surface-2)] rounded-l-md transition"
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => dispatch(addToCart({ productId: item.id }))}
                                                    aria-label={`Increase quantity of ${item.name}`}
                                                    className="size-7 flex items-center justify-center hover:bg-[color:var(--color-surface-2)] rounded-r-md transition"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                            <p className="text-sm font-medium">{currency}{item.lineTotal.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => dispatch(deleteItemFromCart({ productId: item.id }))}
                                        aria-label={`Remove ${item.name} from cart`}
                                        className="p-1 self-start text-[color:var(--color-text-3)] hover:text-[color:var(--color-accent)] transition"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <footer className="border-t border-[color:var(--color-border)] p-5 space-y-3 bg-[color:var(--color-surface)]">
                        <div className="flex justify-between text-sm">
                            <span className="text-[color:var(--color-text-2)]">Subtotal</span>
                            <span className="font-semibold text-[color:var(--color-text-1)]">{currency}{subtotal.toFixed(2)}</span>
                        </div>
                        {subtotal < 50 && (
                            <p className="text-xs text-[color:var(--color-text-3)]">
                                Spend {currency}{(50 - subtotal).toFixed(2)} more for free delivery
                            </p>
                        )}
                        <div className="flex gap-2">
                            <Link
                                href="/cart"
                                onClick={() => dispatch(closeMiniCart())}
                                className="btn-secondary flex-1 text-center !py-2.5"
                            >
                                View cart
                            </Link>
                            <Link
                                href="/checkout"
                                onClick={() => dispatch(closeMiniCart())}
                                className="btn-primary flex-1 text-center !py-2.5"
                            >
                                Checkout
                            </Link>
                        </div>
                        <p className="text-[11px] text-[color:var(--color-text-3)] text-center">
                            Shipping &amp; taxes calculated at checkout
                        </p>
                    </footer>
                )}
            </aside>
        </>
    )
}

export default MiniCart
