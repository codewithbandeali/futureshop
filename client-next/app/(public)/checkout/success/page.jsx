'use client'

import { CheckCircle2, Package, Truck } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { apiGet } from "@/lib/api"
import { isLoggedIn } from "@/lib/auth"

const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$"

function SuccessContent() {
    const searchParams = useSearchParams()
    const orderId = searchParams.get('orderId')
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!orderId || !isLoggedIn()) {
            setLoading(false)
            return
        }
        apiGet(`/api/orders/${orderId}`)
            .then(res => setOrder(res?.data ?? res))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [orderId])

    return (
        <div className="min-h-[70vh] mx-6">
            <div className="max-w-2xl mx-auto my-16 text-center">
                <div className="size-16 rounded-full bg-[color:var(--color-success)]/10 text-[color:var(--color-success)] mx-auto flex items-center justify-center">
                    <CheckCircle2 size={32} strokeWidth={1.5} />
                </div>
                <h1 className="text-4xl sm:text-5xl mt-6">Thanks for your order.</h1>
                <p className="text-[color:var(--color-text-2)] mt-3 text-lg">
                    {orderId
                        ? <>Order <span className="font-medium text-[color:var(--color-text-1)]">#{orderId}</span> is in our queue.</>
                        : 'Your order is in our queue.'}
                </p>

                {/* Order snapshot */}
                {order && (
                    <div className="bg-white border border-[color:var(--color-border)] rounded-2xl p-6 mt-8 text-left">
                        <div className="flex items-start justify-between gap-3 pb-4 border-b border-[color:var(--color-border)]">
                            <div>
                                <p className="text-xs uppercase tracking-[0.1em] text-[color:var(--color-text-3)]">Order total</p>
                                <p className="text-2xl font-semibold mt-1">{currency}{Number(order.total).toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-[0.1em] text-[color:var(--color-text-3)]">Items</p>
                                <p className="text-2xl font-semibold mt-1">{order.items?.length ?? 0}</p>
                            </div>
                        </div>
                        {order.address && (
                            <div className="pt-4 text-sm">
                                <p className="text-xs uppercase tracking-[0.1em] text-[color:var(--color-text-3)] mb-1">Shipping to</p>
                                <p className="font-medium">{order.address.full_name}</p>
                                <p className="text-[color:var(--color-text-2)]">
                                    {order.address.line1}, {order.address.city}{order.address.state ? `, ${order.address.state}` : ''} {order.address.postal_code}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* What's next */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 text-left">
                    <div className="bg-white border border-[color:var(--color-border)] rounded-xl p-4">
                        <Package size={18} className="text-[color:var(--color-brand)]" />
                        <p className="font-medium mt-2 text-sm">Confirmation email</p>
                        <p className="text-xs text-[color:var(--color-text-2)] mt-1">
                            We'll send a receipt and tracking info as soon as the order ships.
                        </p>
                    </div>
                    <div className="bg-white border border-[color:var(--color-border)] rounded-xl p-4">
                        <Truck size={18} className="text-[color:var(--color-brand)]" />
                        <p className="font-medium mt-2 text-sm">Next-business-day shipping</p>
                        <p className="text-xs text-[color:var(--color-text-2)] mt-1">
                            Orders placed before 3pm PT go out the same day.
                        </p>
                    </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
                    {orderId && (
                        <Link href={`/orders/${orderId}`} className="btn-primary">
                            View order details
                        </Link>
                    )}
                    <Link href="/shop" className="btn-secondary">
                        Continue shopping
                    </Link>
                </div>

                <p className="text-xs text-[color:var(--color-text-3)] mt-8">
                    Payment integration is not yet enabled. Orders are saved as <em>unpaid</em>. The shop owner will follow up to collect payment.
                </p>
            </div>
        </div>
    )
}

export default function CheckoutSuccess() {
    return (
        <Suspense fallback={<div className="min-h-[60vh]" />}>
            <SuccessContent />
        </Suspense>
    )
}
