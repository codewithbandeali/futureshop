'use client'
import Link from 'next/link'
import { Lock } from 'lucide-react'

/**
 * Cart-side summary. Pure display widget — payment method + address selection
 * happen on /checkout, not here, so we don't duplicate that logic.
 */
const OrderSummary = ({ totalPrice, items = [] }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const subtotal = Number(totalPrice) || 0
    const shipping = subtotal >= 50 ? 0 : 5.99
    const total = subtotal + shipping
    const totalItems = items.reduce((sum, it) => sum + (it.quantity ?? 0), 0)

    return (
        <aside
            aria-labelledby="order-summary-title"
            className="w-full lg:max-w-sm bg-white border border-[color:var(--color-border)] rounded-2xl text-sm p-6 lg:sticky lg:top-24 h-fit"
        >
            <h2 id="order-summary-title" className="text-lg">Order summary</h2>
            <p className="text-xs text-[color:var(--color-text-3)] mt-1">
                {totalItems} item{totalItems !== 1 ? 's' : ''} in cart
            </p>

            <dl className="space-y-2 mt-5">
                <div className="flex justify-between">
                    <dt className="text-[color:var(--color-text-2)]">Subtotal</dt>
                    <dd className="font-medium">{currency}{subtotal.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                    <dt className="text-[color:var(--color-text-2)]">Delivery</dt>
                    <dd className="font-medium">
                        {shipping === 0
                            ? <span className="text-[color:var(--color-success)]">FREE</span>
                            : `${currency}${shipping.toFixed(2)}`}
                    </dd>
                </div>
                {shipping > 0 && (
                    <p className="text-xs text-[color:var(--color-text-3)]">
                        Spend {currency}{(50 - subtotal).toFixed(2)} more for free delivery
                    </p>
                )}
            </dl>

            <div className="flex justify-between border-t border-[color:var(--color-border)] mt-5 pt-4">
                <p className="text-base font-semibold">Total</p>
                <p className="text-base font-semibold">{currency}{total.toFixed(2)}</p>
            </div>

            <Link
                href="/checkout"
                className="btn-primary w-full block text-center mt-6"
            >
                Continue to checkout
            </Link>

            <p className="text-xs text-[color:var(--color-text-3)] flex items-center justify-center gap-1.5 mt-4">
                <Lock size={12} aria-hidden="true" /> Secure SSL checkout
            </p>
        </aside>
    )
}

export default OrderSummary
