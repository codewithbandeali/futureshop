'use client'
import { Users } from "lucide-react"
import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import { listCustomers } from "@/lib/admin"

const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

export default function AdminCustomers() {
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        listCustomers()
            .then(setCustomers)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <Loading />

    return (
        <div className="pb-16">
            <div>
                <h1 className="text-2xl">Customers</h1>
                <p className="text-[color:var(--color-text-2)] mt-1">
                    {customers.length} customer{customers.length !== 1 ? 's' : ''}
                </p>
            </div>

            <div className="bg-white border border-[color:var(--color-border)] rounded-xl mt-6 overflow-hidden">
                {customers.length === 0 ? (
                    <div className="text-center py-16">
                        <Users size={32} className="mx-auto text-[color:var(--color-text-3)]" />
                        <p className="text-[color:var(--color-text-2)] mt-3">No customers yet.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-[color:var(--color-surface-2)] text-left">
                            <tr className="text-[color:var(--color-text-2)]">
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium hidden md:table-cell">Email</th>
                                <th className="px-4 py-3 font-medium text-right">Orders</th>
                                <th className="px-4 py-3 font-medium text-right">Lifetime value</th>
                                <th className="px-4 py-3 font-medium hidden lg:table-cell">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[color:var(--color-border)]">
                            {customers.map(c => (
                                <tr key={c.id} className="hover:bg-[color:var(--color-surface)] transition">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-[color:var(--color-brand)] text-white flex items-center justify-center text-xs font-semibold">
                                                {(c.name ?? '?').slice(0, 1).toUpperCase()}
                                            </div>
                                            <p className="font-medium">{c.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell text-[color:var(--color-text-2)]">{c.email}</td>
                                    <td className="px-4 py-3 text-right">{c.order_count ?? 0}</td>
                                    <td className="px-4 py-3 text-right font-medium">
                                        {currency}{Number(c.lifetime_value ?? 0).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-[color:var(--color-text-3)]">
                                        {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
