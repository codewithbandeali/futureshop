'use client'

import { Plus, Tag, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import Loading from "@/components/Loading"
import { apiGet } from "@/lib/api"
import { adminCreateCoupon, adminDeleteCoupon, adminListCoupons } from "@/lib/admin"
import { formatDate } from "@/lib/format"

const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

const emptyForm = {
    code: '',
    description: '',
    discount_type: 'percent',
    discount_value: 10,
    min_subtotal: '',
    usage_limit: '',
    first_order_only: false,
    is_public: true,
    active: true,
    starts_at: '',
    expires_at: '',
}

export default function AdminCoupons() {
    const [coupons, setCoupons] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [busy, setBusy] = useState(false)

    const refresh = () =>
        adminListCoupons()
            .then(setCoupons)
            .catch(console.error)
            .finally(() => setLoading(false))

    useEffect(() => { refresh() }, [])

    const set = (k) => (e) => {
        const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
        setForm(f => ({ ...f, [k]: v }))
    }

    const submit = async (e) => {
        e.preventDefault()
        if (busy) return
        setBusy(true)
        try {
            const payload = {
                ...form,
                code: form.code.trim().toUpperCase(),
                discount_value: Number(form.discount_value),
                min_subtotal: form.min_subtotal === '' ? null : Number(form.min_subtotal),
                usage_limit: form.usage_limit === '' ? null : parseInt(form.usage_limit, 10),
                starts_at: form.starts_at || null,
                expires_at: form.expires_at || null,
            }
            await adminCreateCoupon(payload)
            toast.success(`Coupon ${payload.code} created`)
            setForm(emptyForm)
            setShowForm(false)
            refresh()
        } catch (err) {
            toast.error('Could not create coupon. Check the code is unique and fields are valid.')
        } finally {
            setBusy(false)
        }
    }

    const doDelete = async (c) => {
        try {
            await adminDeleteCoupon(c.id)
            setCoupons(prev => prev.filter(x => x.id !== c.id))
            toast.success(`Deleted ${c.code}`)
        } catch {
            toast.error("Couldn't delete")
        }
    }

    if (loading) return <Loading />

    return (
        <div className="pb-16">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl">Coupons</h1>
                    <p className="text-[color:var(--color-text-2)] mt-1">{coupons.length} total</p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowForm(s => !s)}
                    className="btn-primary inline-flex items-center gap-2"
                >
                    <Plus size={16} /> {showForm ? 'Cancel' : 'New coupon'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={submit} className="mt-6 bg-white border border-[color:var(--color-border)] rounded-2xl p-6 max-w-3xl">
                    <h2 className="text-lg mb-4">Create a coupon</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5" htmlFor="c-code">Code</label>
                            <input id="c-code" required maxLength={64} placeholder="NEW20"
                                value={form.code} onChange={set('code')} className="form-input uppercase" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5" htmlFor="c-desc">Description (shown to customer)</label>
                            <input id="c-desc" maxLength={255} placeholder="20% off your first order"
                                value={form.description} onChange={set('description')} className="form-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5" htmlFor="c-type">Discount type</label>
                            <select id="c-type" value={form.discount_type} onChange={set('discount_type')} className="form-input">
                                <option value="percent">Percentage (%)</option>
                                <option value="fixed">Fixed amount ({currency})</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5" htmlFor="c-val">Value</label>
                            <input id="c-val" type="number" min="0" step="0.01" required
                                value={form.discount_value} onChange={set('discount_value')} className="form-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5" htmlFor="c-min">Minimum subtotal (optional)</label>
                            <input id="c-min" type="number" min="0" step="0.01" placeholder="e.g. 50"
                                value={form.min_subtotal} onChange={set('min_subtotal')} className="form-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5" htmlFor="c-limit">Usage limit (optional)</label>
                            <input id="c-limit" type="number" min="1" placeholder="Blank = unlimited"
                                value={form.usage_limit} onChange={set('usage_limit')} className="form-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5" htmlFor="c-start">Starts</label>
                            <input id="c-start" type="date" value={form.starts_at} onChange={set('starts_at')} className="form-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5" htmlFor="c-end">Expires</label>
                            <input id="c-end" type="date" value={form.expires_at} onChange={set('expires_at')} className="form-input" />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-4 text-sm">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={form.first_order_only} onChange={set('first_order_only')} />
                            First-order only
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={form.is_public} onChange={set('is_public')} />
                            Public (anyone can apply)
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={form.active} onChange={set('active')} />
                            Active
                        </label>
                    </div>

                    <button type="submit" disabled={busy} className="btn-primary mt-5 disabled:opacity-60">
                        {busy ? 'Creating…' : 'Create coupon'}
                    </button>
                </form>
            )}

            <div className="bg-white border border-[color:var(--color-border)] rounded-xl mt-6 overflow-hidden">
                {coupons.length === 0 ? (
                    <div className="text-center py-16">
                        <Tag size={32} className="mx-auto text-[color:var(--color-text-3)]" />
                        <p className="text-[color:var(--color-text-2)] mt-3">No coupons yet.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-[color:var(--color-surface-2)] text-left">
                            <tr className="text-[color:var(--color-text-2)]">
                                <th className="px-4 py-3 font-medium">Code</th>
                                <th className="px-4 py-3 font-medium">Discount</th>
                                <th className="px-4 py-3 font-medium hidden md:table-cell">Min</th>
                                <th className="px-4 py-3 font-medium hidden md:table-cell">Used</th>
                                <th className="px-4 py-3 font-medium hidden lg:table-cell">Expires</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[color:var(--color-border)]">
                            {coupons.map(c => (
                                <tr key={c.id} className="hover:bg-[color:var(--color-surface)] transition">
                                    <td className="px-4 py-3">
                                        <p className="font-mono font-semibold text-[color:var(--color-text-1)]">{c.code}</p>
                                        {c.description && (
                                            <p className="text-xs text-[color:var(--color-text-3)] mt-0.5">{c.description}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-[color:var(--color-accent)]">
                                        {c.discount_type === 'percent'
                                            ? `${Number(c.discount_value).toFixed(0)}%`
                                            : `${currency}${Number(c.discount_value).toFixed(2)}`}
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell text-[color:var(--color-text-2)]">
                                        {c.min_subtotal ? `${currency}${Number(c.min_subtotal).toFixed(2)}` : '—'}
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell text-[color:var(--color-text-2)]">
                                        {c.usage_count}{c.usage_limit ? ` / ${c.usage_limit}` : ''}
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-[color:var(--color-text-3)]">
                                        {c.expires_at ? formatDate(c.expires_at) : '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                            c.active
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'bg-slate-50 text-slate-600'
                                        }`}>
                                            {c.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            type="button"
                                            onClick={() => doDelete(c)}
                                            aria-label={`Delete ${c.code}`}
                                            className="p-2 rounded hover:bg-[color:var(--color-accent-soft)] text-[color:var(--color-text-2)] hover:text-[color:var(--color-accent)]"
                                        >
                                            <Trash2 size={16} />
                                        </button>
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
