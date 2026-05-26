'use client'

import { Tag } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import Loading from "@/components/Loading"
import { listProducts } from "@/lib/admin"

const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

/**
 * Categories are stored as a string on products, not a normalized table.
 * This page derives the list dynamically so the admin can see what's being
 * used and where stock lives. When categories become a real table, this
 * becomes a list-from-DB instead.
 */
export default function AdminCategories() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        listProducts()
            .then(setProducts)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const groups = useMemo(() => {
        const map = new Map()
        for (const p of products) {
            const key = (p.category ?? 'uncategorized').toLowerCase()
            if (!map.has(key)) {
                map.set(key, { name: key, count: 0, totalStock: 0, totalValue: 0 })
            }
            const g = map.get(key)
            g.count += 1
            g.totalStock += Number(p.stock ?? 0)
            g.totalValue += Number(p.price ?? 0) * Number(p.stock ?? 0)
        }
        return Array.from(map.values()).sort((a, b) => b.count - a.count)
    }, [products])

    if (loading) return <Loading />

    return (
        <div className="pb-16">
            <h1 className="text-2xl">Categories</h1>
            <p className="text-[color:var(--color-text-2)] mt-1">
                Derived from the current product catalog. Edit a product to change its category.
            </p>

            {groups.length === 0 ? (
                <div className="bg-white border border-[color:var(--color-border)] rounded-xl mt-6 text-center py-16">
                    <Tag size={32} className="mx-auto text-[color:var(--color-text-3)]" />
                    <p className="text-[color:var(--color-text-2)] mt-3">No categories yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    {groups.map(g => (
                        <Link
                            key={g.name}
                            href={`/admin/products?category=${encodeURIComponent(g.name)}`}
                            className="bg-white border border-[color:var(--color-border)] rounded-xl p-5 hover:shadow-md transition"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="capitalize font-medium">{g.name}</p>
                                    <p className="text-xs text-[color:var(--color-text-3)] mt-1">
                                        {g.count} product{g.count !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="size-10 rounded-lg bg-[color:var(--color-surface-2)] flex items-center justify-center text-[color:var(--color-brand)]">
                                    <Tag size={18} />
                                </div>
                            </div>
                            <dl className="grid grid-cols-2 gap-3 mt-4 text-xs">
                                <div>
                                    <dt className="text-[color:var(--color-text-3)]">In stock</dt>
                                    <dd className="font-medium mt-0.5">{g.totalStock} units</dd>
                                </div>
                                <div>
                                    <dt className="text-[color:var(--color-text-3)]">Inventory value</dt>
                                    <dd className="font-medium mt-0.5">{currency}{g.totalValue.toFixed(2)}</dd>
                                </div>
                            </dl>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
