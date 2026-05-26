'use client'
import { CircleDollarSign, Package, ShoppingBag, Users } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { listProducts, listOrders } from "@/lib/admin"
import Loading from "@/components/Loading"

const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState([])
    const [orders, setOrders] = useState([])

    useEffect(() => {
        Promise.all([
            listProducts().catch(() => []),
            listOrders().catch(() => []),
        ]).then(([p, o]) => {
            setProducts(p)
            setOrders(o)
            setLoading(false)
        })
    }, [])

    const stats = useMemo(() => {
        const revenue = orders
            .filter(o => o.payment_status === 'paid')
            .reduce((sum, o) => sum + Number(o.total || 0), 0)
        const pending = orders.filter(o => o.status === 'pending').length
        const lowStock = products.filter(p => Number(p.stock ?? 0) > 0 && Number(p.stock) <= 5).length
        return { revenue, pending, lowStock }
    }, [products, orders])

    if (loading) return <Loading />

    const cards = [
        { title: 'Total products', value: products.length, icon: Package, hint: `${lowStockText(stats.lowStock)}` },
        { title: 'Total orders', value: orders.length, icon: ShoppingBag, hint: stats.pending > 0 ? `${stats.pending} pending` : 'All cleared' },
        { title: 'Revenue', value: `${currency}${stats.revenue.toFixed(2)}`, icon: CircleDollarSign, hint: 'From paid orders' },
        { title: 'Customers', value: new Set(orders.map(o => o.user_id)).size || '—', icon: Users, hint: 'Unique buyers' },
    ]

    return (
        <div className="pb-16">
            <h1 className="text-2xl">Dashboard</h1>
            <p className="text-[color:var(--color-text-2)] mt-1">A quick look at the shop today.</p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                {cards.map((c) => (
                    <div key={c.title} className="bg-white border border-[color:var(--color-border)] rounded-xl p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.1em] text-[color:var(--color-text-3)]">{c.title}</p>
                                <p className="text-2xl font-semibold text-[color:var(--color-text-1)] mt-2">{c.value}</p>
                                <p className="text-xs text-[color:var(--color-text-2)] mt-1">{c.hint}</p>
                            </div>
                            <div className="size-10 rounded-lg bg-[color:var(--color-surface-2)] flex items-center justify-center text-[color:var(--color-brand)]">
                                <c.icon size={18} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
                <section className="bg-white border border-[color:var(--color-border)] rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg">Recent orders</h2>
                        <Link href="/admin/orders" className="text-sm text-[color:var(--color-brand)] hover:text-[color:var(--color-accent)]">View all →</Link>
                    </div>
                    {orders.length === 0 ? (
                        <p className="text-sm text-[color:var(--color-text-3)]">No orders yet.</p>
                    ) : (
                        <ul className="divide-y divide-[color:var(--color-border)]">
                            {orders.slice(0, 6).map(o => (
                                <li key={o.id} className="flex items-center justify-between py-3 text-sm">
                                    <div>
                                        <p className="font-medium">#{o.id}</p>
                                        <p className="text-xs text-[color:var(--color-text-3)]">{o.status}</p>
                                    </div>
                                    <p className="font-medium">{currency}{Number(o.total ?? 0).toFixed(2)}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="bg-white border border-[color:var(--color-border)] rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg">Low stock</h2>
                        <Link href="/admin/products" className="text-sm text-[color:var(--color-brand)] hover:text-[color:var(--color-accent)]">Manage →</Link>
                    </div>
                    {products.filter(p => Number(p.stock ?? 0) <= 5).length === 0 ? (
                        <p className="text-sm text-[color:var(--color-text-3)]">All products comfortably stocked.</p>
                    ) : (
                        <ul className="divide-y divide-[color:var(--color-border)]">
                            {products
                                .filter(p => Number(p.stock ?? 0) <= 5)
                                .slice(0, 6)
                                .map(p => (
                                    <li key={p.id} className="flex items-center justify-between py-3 text-sm">
                                        <div>
                                            <p className="font-medium line-clamp-1">{p.name}</p>
                                            <p className="text-xs text-[color:var(--color-text-3)]">{p.category} · {p.brand}</p>
                                        </div>
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                            Number(p.stock) === 0
                                                ? 'bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]'
                                                : 'bg-amber-50 text-amber-700'
                                        }`}>
                                            {p.stock} left
                                        </span>
                                    </li>
                                ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    )
}

function lowStockText(n) {
    if (n === 0) return 'All in good supply'
    return `${n} low on stock`
}
