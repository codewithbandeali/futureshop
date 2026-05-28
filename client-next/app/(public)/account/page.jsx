'use client'

import { Heart, MapPin, Package, Settings, ShoppingBag, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Loading from '@/components/Loading'
import PageTitle from '@/components/PageTitle'
import { apiGet } from '@/lib/api'
import { getStoredUser, isLoggedIn } from '@/lib/auth'

const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

export default function AccountPage() {
    const router = useRouter()
    const [user, setUser] = useState(null)
    const [orders, setOrders] = useState([])
    const [addresses, setAddresses] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isLoggedIn()) {
            router.replace('/login?next=/account')
            return
        }
        setUser(getStoredUser())
        Promise.allSettled([
            apiGet('/api/orders').then(r => r?.data ?? r),
            apiGet('/api/address').then(r => r?.data ?? r),
        ]).then(([o, a]) => {
            if (o.status === 'fulfilled' && Array.isArray(o.value)) setOrders(o.value)
            if (a.status === 'fulfilled' && Array.isArray(a.value)) setAddresses(a.value)
            setLoading(false)
        })
    }, [router])

    if (loading) return <Loading />

    const recentOrder = orders[0]
    const defaultAddress = addresses.find(a => a.is_default) || addresses[0]
    const lifetimeSpend = orders
        .filter(o => o.payment_status === 'paid')
        .reduce((sum, o) => sum + Number(o.total ?? 0), 0)

    return (
        <div className="min-h-[70vh] mx-6">
            <div className="max-w-5xl mx-auto my-10">
                <PageTitle
                    heading={`Hi, ${user?.name?.split(' ')[0] ?? 'there'}`}
                    text="Your FutureShop account"
                />

                {/* Summary tiles */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    <Tile
                        label="Orders"
                        value={orders.length}
                        href="/orders"
                        icon={ShoppingBag}
                    />
                    <Tile
                        label="Lifetime spend"
                        value={`${currency}${lifetimeSpend.toFixed(2)}`}
                        icon={Package}
                    />
                    <Tile
                        label="Saved addresses"
                        value={addresses.length}
                        icon={MapPin}
                    />
                    <Tile
                        label="Wishlist"
                        value="View"
                        href="/wishlist"
                        icon={Heart}
                    />
                </div>

                {/* Two-column layout: profile + addresses on left, recent order on right */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                    <section className="bg-white border border-[color:var(--color-border)] rounded-2xl p-5 lg:col-span-1">
                        <div className="flex items-center gap-3">
                            <div className="size-12 rounded-full bg-[color:var(--color-brand)] text-white flex items-center justify-center font-semibold">
                                {(user?.name ?? '?').slice(0, 1).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="font-medium truncate">{user?.name}</p>
                                <p className="text-xs text-[color:var(--color-text-3)] truncate">{user?.email}</p>
                            </div>
                        </div>
                        <p className="text-xs text-[color:var(--color-text-3)] mt-4 uppercase tracking-[0.1em]">
                            Account type
                        </p>
                        <p className="text-sm text-[color:var(--color-text-1)] capitalize mt-1">
                            {user?.role ?? 'customer'}
                        </p>

                        <p className="text-xs text-[color:var(--color-text-3)] mt-5 uppercase tracking-[0.1em] flex items-center gap-1">
                            <Settings size={12} /> Settings
                        </p>
                        <p className="text-sm text-[color:var(--color-text-2)] mt-2">
                            Profile editing &amp; password changes are coming soon.
                        </p>
                    </section>

                    <section className="bg-white border border-[color:var(--color-border)] rounded-2xl p-5 lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg">Most recent order</h2>
                            <Link href="/orders" className="text-sm text-[color:var(--color-brand)] hover:text-[color:var(--color-accent)]">
                                View all →
                            </Link>
                        </div>
                        {!recentOrder ? (
                            <div className="text-center py-10">
                                <Package size={32} className="mx-auto text-[color:var(--color-text-3)]" strokeWidth={1.5} />
                                <p className="text-sm text-[color:var(--color-text-2)] mt-3">
                                    You haven't placed an order yet.
                                </p>
                                <Link href="/shop" className="btn-primary inline-block mt-4">Start shopping</Link>
                            </div>
                        ) : (
                            <div className="text-sm">
                                <div className="flex items-center justify-between">
                                    <p className="font-medium">#{recentOrder.id}</p>
                                    <span className="capitalize text-xs px-2 py-1 rounded-full bg-[color:var(--color-surface-2)]">
                                        {recentOrder.status}
                                    </span>
                                </div>
                                <p className="text-[color:var(--color-text-3)] text-xs mt-1">
                                    {recentOrder.created_at
                                        ? new Date(recentOrder.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                                        : ''}
                                </p>
                                <p className="mt-3">{recentOrder.items?.length ?? 0} items · {currency}{Number(recentOrder.total ?? 0).toFixed(2)}</p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Addresses */}
                <section className="mt-8">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg">Saved addresses</h2>
                        {addresses.length > 0 && (
                            <p className="text-xs text-[color:var(--color-text-3)]">
                                Manage addresses from checkout.
                            </p>
                        )}
                    </div>
                    {addresses.length === 0 ? (
                        <div className="bg-white border border-[color:var(--color-border)] rounded-2xl p-8 text-center">
                            <MapPin size={28} className="mx-auto text-[color:var(--color-text-3)]" strokeWidth={1.5} />
                            <p className="text-sm text-[color:var(--color-text-2)] mt-3">No saved addresses yet.</p>
                            <p className="text-xs text-[color:var(--color-text-3)] mt-1">Your first address is created at checkout.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {addresses.map(a => (
                                <article
                                    key={a.id}
                                    className={`bg-white border rounded-2xl p-5 text-sm ${
                                        a.id === defaultAddress?.id
                                            ? 'border-[color:var(--color-brand)]'
                                            : 'border-[color:var(--color-border)]'
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <p className="font-medium">{a.full_name}</p>
                                        {a.id === defaultAddress?.id && (
                                            <span className="text-[10px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-full bg-[color:var(--color-surface-2)] text-[color:var(--color-brand)]">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[color:var(--color-text-2)]">
                                        {a.line1}{a.line2 ? `, ${a.line2}` : ''}
                                    </p>
                                    <p className="text-[color:var(--color-text-2)]">
                                        {a.city}{a.state ? `, ${a.state}` : ''} {a.postal_code}, {a.country}
                                    </p>
                                    <p className="text-[color:var(--color-text-3)] text-xs mt-1">{a.phone}</p>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}

function Tile({ label, value, icon: Icon, href }) {
    const Content = (
        <div className="bg-white border border-[color:var(--color-border)] rounded-2xl p-4 h-full">
            <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.1em] text-[color:var(--color-text-3)]">{label}</p>
                <Icon size={16} className="text-[color:var(--color-brand)]" aria-hidden="true" />
            </div>
            <p className="text-xl font-semibold text-[color:var(--color-text-1)] mt-2">{value}</p>
        </div>
    )
    return href ? <Link href={href} className="block hover:shadow-md transition">{Content}</Link> : Content
}
