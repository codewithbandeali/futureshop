'use client'

import { formatDate } from '@/lib/format'

const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

const STATUS_STYLES = {
    pending: 'bg-amber-50 text-amber-700',
    paid: 'bg-emerald-50 text-emerald-700',
    shipped: 'bg-sky-50 text-sky-700',
    delivered: 'bg-emerald-50 text-emerald-700',
    cancelled: 'bg-rose-50 text-rose-700',
    refunded: 'bg-slate-50 text-slate-700',
}

const OrderItem = ({ order }) => {
    const items = Array.isArray(order.items) ? order.items : []
    const address = order.address || null

    return (
        <article className="bg-white border border-[color:var(--color-border)] rounded-2xl p-5 mb-4">
            <header className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[color:var(--color-border)]">
                <div>
                    <p className="text-xs text-[color:var(--color-text-3)]">Order</p>
                    <p className="font-medium">#{order.id}</p>
                    <p className="text-xs text-[color:var(--color-text-3)] mt-1">
                        {formatDate(order.created_at)}
                    </p>
                </div>
                <div className="text-right">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${STATUS_STYLES[order.status] ?? 'bg-slate-50 text-slate-700'}`}>
                        {order.status}
                    </span>
                    <p className="text-base font-semibold mt-2">
                        {currency}{Number(order.total ?? 0).toFixed(2)}
                    </p>
                </div>
            </header>

            <ul className="space-y-3 mt-4">
                {items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-4 text-sm">
                        <div className="min-w-0">
                            <p className="font-medium line-clamp-1">{item.product_name}</p>
                            <p className="text-xs text-[color:var(--color-text-3)]">
                                Qty {item.quantity} · {currency}{Number(item.unit_price ?? 0).toFixed(2)} each
                            </p>
                        </div>
                        <p className="font-medium whitespace-nowrap">{currency}{Number(item.line_total ?? 0).toFixed(2)}</p>
                    </li>
                ))}
            </ul>

            {address && (
                <footer className="mt-4 pt-4 border-t border-[color:var(--color-border)] text-xs text-[color:var(--color-text-2)]">
                    <p className="font-medium text-[color:var(--color-text-1)]">{address.full_name}</p>
                    <p>
                        {address.line1}{address.line2 ? `, ${address.line2}` : ''}, {address.city}
                        {address.state ? `, ${address.state}` : ''} {address.postal_code}, {address.country}
                    </p>
                    {address.phone && <p>{address.phone}</p>}
                </footer>
            )}
        </article>
    )
}

export default OrderItem
