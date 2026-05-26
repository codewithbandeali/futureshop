'use client'
import { Plus, Search, Trash2, Pencil } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { deleteProduct, listProducts } from "@/lib/admin"

const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

export default function AdminProducts() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState("")
    const [category, setCategory] = useState("all")
    const [pendingDelete, setPendingDelete] = useState(null)

    const refresh = async () => {
        setLoading(true)
        try {
            setProducts(await listProducts())
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { refresh() }, [])

    const categories = useMemo(() => {
        return ["all", ...Array.from(new Set(products.map(p => p.category)))].filter(Boolean)
    }, [products])

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        return products.filter(p => {
            if (category !== "all" && p.category !== category) return false
            if (!q) return true
            return (
                p.name?.toLowerCase().includes(q) ||
                p.brand?.toLowerCase().includes(q) ||
                p.sku?.toLowerCase().includes(q)
            )
        })
    }, [products, query, category])

    const confirmDelete = async () => {
        if (!pendingDelete) return
        try {
            await deleteProduct(pendingDelete.id)
            setProducts(p => p.filter(x => x.id !== pendingDelete.id))
            toast.success(`Deleted "${pendingDelete.name}"`)
        } catch {
            toast.error("Couldn't delete")
        } finally {
            setPendingDelete(null)
        }
    }

    return (
        <div className="pb-16">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl">Products</h1>
                    <p className="text-[color:var(--color-text-2)] mt-1">{products.length} total · {filtered.length} shown</p>
                </div>
                <Link href="/admin/products/new" className="btn-primary inline-flex items-center gap-2">
                    <Plus size={16} /> New product
                </Link>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-6">
                <div className="flex items-center bg-white border border-[color:var(--color-border)] rounded-md px-3 py-2 flex-1 min-w-[240px] max-w-md">
                    <Search size={16} className="text-[color:var(--color-text-3)]" />
                    <input
                        type="search"
                        placeholder="Search by name, brand, SKU"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search products"
                        className="bg-transparent outline-none text-sm ml-2 flex-1"
                    />
                </div>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    aria-label="Filter by category"
                    className="form-input !py-2 !w-auto bg-white"
                >
                    {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            <div className="bg-white border border-[color:var(--color-border)] rounded-xl mt-6 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-[color:var(--color-surface-2)] text-left">
                        <tr className="text-[color:var(--color-text-2)]">
                            <th className="px-4 py-3 font-medium">Product</th>
                            <th className="px-4 py-3 font-medium hidden md:table-cell">Category</th>
                            <th className="px-4 py-3 font-medium hidden md:table-cell">Brand</th>
                            <th className="px-4 py-3 font-medium text-right">Price</th>
                            <th className="px-4 py-3 font-medium text-right">Stock</th>
                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[color:var(--color-border)]">
                        {loading && (
                            <tr><td colSpan={6} className="text-center py-10 text-[color:var(--color-text-3)]">Loading…</td></tr>
                        )}
                        {!loading && filtered.length === 0 && (
                            <tr><td colSpan={6} className="text-center py-10 text-[color:var(--color-text-3)]">No products match.</td></tr>
                        )}
                        {!loading && filtered.map(p => (
                            <tr key={p.id} className="hover:bg-[color:var(--color-surface)] transition">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-12 h-12 bg-[color:var(--color-surface-2)] rounded overflow-hidden shrink-0">
                                            {p.images?.[0] && (
                                                <Image
                                                    src={p.images[0]}
                                                    alt={p.name}
                                                    fill
                                                    sizes="48px"
                                                    className="object-contain p-1"
                                                />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium line-clamp-1">{p.name}</p>
                                            <p className="text-xs text-[color:var(--color-text-3)]">{p.sku}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 hidden md:table-cell capitalize">{p.category}</td>
                                <td className="px-4 py-3 hidden md:table-cell">{p.brand}</td>
                                <td className="px-4 py-3 text-right">{currency}{Number(p.price).toFixed(2)}</td>
                                <td className="px-4 py-3 text-right">
                                    <span className={Number(p.stock ?? 0) === 0 ? 'text-[color:var(--color-accent)] font-medium' : ''}>
                                        {p.stock ?? 0}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={`/admin/products/${p.id}/edit`}
                                            aria-label={`Edit ${p.name}`}
                                            className="p-2 rounded hover:bg-[color:var(--color-surface-2)] text-[color:var(--color-text-2)] hover:text-[color:var(--color-brand)]"
                                        >
                                            <Pencil size={16} />
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => setPendingDelete(p)}
                                            aria-label={`Delete ${p.name}`}
                                            className="p-2 rounded hover:bg-[color:var(--color-accent-soft)] text-[color:var(--color-text-2)] hover:text-[color:var(--color-accent)]"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pendingDelete && (
                <div role="dialog" aria-modal="true"
                    className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-6">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full">
                        <h2 className="text-lg">Delete this product?</h2>
                        <p className="text-sm text-[color:var(--color-text-2)] mt-2">
                            "{pendingDelete.name}" will be removed. Orders that already include it stay intact.
                        </p>
                        <div className="flex justify-end gap-2 mt-6">
                            <button className="btn-secondary" onClick={() => setPendingDelete(null)}>Cancel</button>
                            <button
                                className="btn-primary"
                                style={{ background: 'var(--color-accent)' }}
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
