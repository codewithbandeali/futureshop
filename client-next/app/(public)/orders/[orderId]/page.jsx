'use client'

import { ArrowLeft, MapPin, Package, Tag } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import { apiGet } from "@/lib/api"
import { isLoggedIn } from "@/lib/auth"
import { formatDate } from "@/lib/format"

const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$"

const STATUS_STYLES = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    shipped: 'bg-sky-50 text-sky-700 border-sky-200',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    refunded: 'bg-slate-50 text-slate-700 border-slate-200',
}

// Visualises the order lifecycle as a 4-step horizontal timeline.
const STAGES = ['pending', 'paid', 'shipped', 'delivered']

export default function OrderDetailPage() {
    const router = useRouter()
    const { orderId } = useParams()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!isLoggedIn()) {
            router.replace(`/login?next=/orders/${orderId}`)
            return
        }
        apiGet(`/api/orders/${orderId}`)
            .then(res => setOrder(res?.data ?? res))
            .catch(err => setError(err))
            .finally(() => setLoading(false))
    }, [orderId, router])

    if (loading) return <Loading />

    if (error || !order) {
        return (
            <div className="min-h-[60vh] mx-6 flex flex-col items-center justify-center text-center">
                <Package size={48} className="text-[color:var(--color-text-3)]" strokeWidth={1.5} />
                <h1 className="text-2xl mt-4">Order not found</h1>
                <p className="text-[color:var(--color-text-2)] mt-2">
                    We couldn't find that order under your account.
                </p>
                <Link href="/orders" className="btn-primary mt-6">Back to orders</Link>
            </div>
        )
    }

    const address = order.address
    const items = Array.isArray(order.items) ? order.items : []
    const isCancelled = order.status === 'cancelled' || order.status === 'refunded'
    const stageIdx = STAGES.indexOf(order.status)

    return (
        <div className="min-h-[70vh] mx-6">
            <div className="max-w-4xl mx-auto my-10">
                <Link
                    href="/orders"
                    className="text-sm text-[color:var(--color-text-2)] hover:text-[color:var(--color-brand)] inline-flex items-center gap-1.5"
                >
                    <ArrowLeft size={14} /> All orders
                </Link>

                {/* Header */}
                <header className="flex flex-wrap items-start justify-between gap-3 mt-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.15em] text-[color:var(--color-text-3)]">Order</p>
                        <h1 className="text-3xl sm:text-4xl mt-1">#{order.id}</h1>
                        <p className="text-sm text-[color:var(--color-text-2)] mt-2">
                            Placed {formatDate(order.created_at)} · {items.length} item{items.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <span className={`text-xs font-medium px-3 py-1.5 rounded-full border capitalize ${STATUS_STYLES[order.status] ?? 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                        {order.status}
                    </span>
                </header>

                {/* Status timeline — hidden for cancelled/refunded since those branch off */}
                {!isCancelled && (
                    <div className="mt-8 bg-white border border-[color:var(--color-border)] rounded-2xl p-5">
                        <ol className="flex items-center justify-between gap-2">
                            {STAGES.map((stage, i) => {
                                const reached = stageIdx >= i
                                return (
                                    <li key={stage} className="flex-1 flex items-center gap-2">
                                        <div className={`size-7 rounded-full flex items-center justify-center text-xs font-semibold transition ${
                                            reached
                                                ? 'bg-[color:var(--color-brand)] text-white'
                                                : 'bg-[color:var(--color-surface-2)] text-[color:var(--color-text-3)]'
                                        }`}>
                                            {i + 1}
                                        </div>
                                        <span className={`text-xs capitalize hidden sm:inline ${reached ? 'text-[color:var(--color-text-1)] font-medium' : 'text-[color:var(--color-text-3)]'}`}>
                                            {stage}
                                        </span>
                                        {i < STAGES.length - 1 && (
                                            <div className={`flex-1 h-px ${stageIdx > i ? 'bg-[color:var(--color-brand)]' : 'bg-[color:var(--color-border)]'}`} />
                                        )}
                                    </li>
                                )
                            })}
                        </ol>
                    </div>
                )}

                {/* Body grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                    {/* Items */}
                    <section className="lg:col-span-2 bg-white border border-[color:var(--color-border)] rounded-2xl p-5">
                        <h2 className="text-lg mb-4">Items</h2>
                        <ul className="divide-y divide-[color:var(--color-border)]">
                            {items.map(item => (
                                <li key={item.id} className="py-4 flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-medium text-[color:var(--color-text-1)] truncate">{item.product_name}</p>
                                        <p className="text-xs text-[color:var(--color-text-3)] mt-0.5 font-mono">{item.product_sku}</p>
                                        <p className="text-sm text-[color:var(--color-text-2)] mt-1">
                                            Qty {item.quantity} · {currency}{Number(item.unit_price).toFixed(2)} each
                                        </p>
                                    </div>
                                    <p className="font-medium whitespace-nowrap">{currency}{Number(item.line_total).toFixed(2)}</p>
                                </li>
                            ))}
                        </ul>

                        {/* Totals */}
                        <dl className="mt-4 pt-4 border-t border-[color:var(--color-border)] text-sm space-y-2">
                            <Row label="Subtotal" value={`${currency}${Number(order.subtotal).toFixed(2)}`} />
                            {Number(order.discount) > 0 && (
                                <Row
                                    label={
                                        <span className="inline-flex items-center gap-1 text-[color:var(--color-accent)]">
                                            <Tag size={12} /> Discount{order.coupon_code ? ` · ${order.coupon_code}` : ''}
                                        </span>
                                    }
                                    value={<span className="text-[color:var(--color-accent)]">-{currency}{Number(order.discount).toFixed(2)}</span>}
                                />
                            )}
                            <Row label="Delivery" value={Number(order.shipping) === 0 ? 'FREE' : `${currency}${Number(order.shipping).toFixed(2)}`} />
                            {Number(order.tax) > 0 && (
                                <Row label="Tax" value={`${currency}${Number(order.tax).toFixed(2)}`} />
                            )}
                            <div className="border-t border-[color:var(--color-border)] pt-2 mt-2 flex justify-between font-semibold text-base">
                                <dt>Total</dt>
                                <dd>{currency}{Number(order.total).toFixed(2)}</dd>
                            </div>
                        </dl>
                    </section>

                    {/* Sidebar: address + payment */}
                    <aside className="space-y-4">
                        <section className="bg-white border border-[color:var(--color-border)] rounded-2xl p-5">
                            <p className="text-xs uppercase tracking-[0.1em] text-[color:var(--color-text-3)] flex items-center gap-1.5">
                                <MapPin size={12} /> Ship to
                            </p>
                            {address ? (
                                <div className="text-sm mt-3">
                                    <p className="font-medium text-[color:var(--color-text-1)]">{address.full_name}</p>
                                    <p className="text-[color:var(--color-text-2)] mt-1">
                                        {address.line1}{address.line2 ? `, ${address.line2}` : ''}
                                    </p>
                                    <p className="text-[color:var(--color-text-2)]">
                                        {address.city}{address.state ? `, ${address.state}` : ''} {address.postal_code}, {address.country}
                                    </p>
                                    {address.phone && (
                                        <p className="text-[color:var(--color-text-3)] text-xs mt-1">{address.phone}</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-[color:var(--color-text-3)] mt-2">Address not available.</p>
                            )}
                        </section>

                        <section className="bg-white border border-[color:var(--color-border)] rounded-2xl p-5">
                            <p className="text-xs uppercase tracking-[0.1em] text-[color:var(--color-text-3)]">Payment</p>
                            <p className="text-sm mt-3 capitalize">
                                <span className="text-[color:var(--color-text-2)]">Status:</span>{' '}
                                <span className="font-medium">{order.payment_status}</span>
                            </p>
                            {order.payment_method && (
                                <p className="text-sm mt-1">
                                    <span className="text-[color:var(--color-text-2)]">Method:</span>{' '}
                                    <span className="font-medium">{order.payment_method}</span>
                                </p>
                            )}
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    )
}

function Row({ label, value }) {
    return (
        <div className="flex justify-between">
            <dt className="text-[color:var(--color-text-2)]">{label}</dt>
            <dd className="font-medium">{value}</dd>
        </div>
    )
}
