'use client'
import { Package } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { listOrders, updateOrderStatus } from "@/lib/admin"
import Loading from "@/components/Loading"
import { formatDate } from "@/lib/format"

const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded']

const STATUS_STYLES = {
    pending: 'bg-amber-50 text-amber-700',
    paid: 'bg-emerald-50 text-emerald-700',
    shipped: 'bg-sky-50 text-sky-700',
    delivered: 'bg-emerald-50 text-emerald-700',
    cancelled: 'bg-rose-50 text-rose-700',
    refunded: 'bg-slate-50 text-slate-700',
}

export default function AdminOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState("all")
    const [updating, setUpdating] = useState(null)

    useEffect(() => {
        listOrders()
            .then(setOrders)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const filtered = useMemo(() => {
        if (filter === "all") return orders
        return orders.filter(o => o.status === filter)
    }, [orders, filter])

    const changeStatus = async (orderId, status) => {
        setUpdating(orderId)
        try {
            const updated = await updateOrderStatus(orderId, status)
            const unwrapped = updated?.data ?? updated
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...unwrapped } : o))
            toast.success(`Marked as ${status}`)
        } catch {
            toast.error("Couldn't update status")
        } finally {
            setUpdating(null)
        }
    }

    if (loading) return <Loading />

    return (
        <div className="pb-16">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl">Orders</h1>
                    <p className="text-[color:var(--color-text-2)] mt-1">{orders.length} total</p>
                </div>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    aria-label="Filter orders by status"
                    className="form-input !py-2 !w-auto bg-white"
                >
                    <option value="all">All statuses</option>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="bg-white border border-[color:var(--color-border)] rounded-xl mt-6 overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <Package size={32} className="mx-auto text-[color:var(--color-text-3)]" />
                        <p className="text-[color:var(--color-text-2)] mt-3">No orders to show.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-[color:var(--color-surface-2)] text-left">
                            <tr className="text-[color:var(--color-text-2)]">
                                <th className="px-4 py-3 font-medium">Order</th>
                                <th className="px-4 py-3 font-medium hidden md:table-cell">Items</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Payment</th>
                                <th className="px-4 py-3 font-medium text-right">Total</th>
                                <th className="px-4 py-3 font-medium hidden lg:table-cell">Placed</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[color:var(--color-border)]">
                            {filtered.map(o => (
                                <tr key={o.id} className="hover:bg-[color:var(--color-surface)] transition">
                                    <td className="px-4 py-3 font-medium">#{o.id}</td>
                                    <td className="px-4 py-3 hidden md:table-cell text-[color:var(--color-text-2)]">
                                        {Array.isArray(o.items) ? `${o.items.length} item${o.items.length !== 1 ? 's' : ''}` : '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${STATUS_STYLES[o.status] ?? 'bg-slate-50 text-slate-700'}`}>
                                                {o.status}
                                            </span>
                                            <select
                                                aria-label={`Change status for order ${o.id}`}
                                                value={o.status}
                                                disabled={updating === o.id}
                                                onChange={(e) => changeStatus(o.id, e.target.value)}
                                                className="text-xs bg-white border border-[color:var(--color-border)] rounded px-2 py-1 cursor-pointer disabled:opacity-60"
                                            >
                                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-[color:var(--color-text-2)] capitalize">{o.payment_status}</td>
                                    <td className="px-4 py-3 text-right font-medium">{currency}{Number(o.total ?? 0).toFixed(2)}</td>
                                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-[color:var(--color-text-3)]">
                                        {formatDate(o.created_at) || '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <p className="text-xs text-[color:var(--color-text-3)] mt-3">
                Note: Cancelling or refunding an order automatically restocks every line item.
            </p>
        </div>
    )
}
