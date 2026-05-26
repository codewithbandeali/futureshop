'use client'

import { Package } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import OrderItem from "@/components/OrderItem"
import PageTitle from "@/components/PageTitle"
import Loading from "@/components/Loading"
import { apiGet } from "@/lib/api"
import { isLoggedIn } from "@/lib/auth"

export default function Orders() {
    const router = useRouter()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isLoggedIn()) {
            router.replace("/login?next=/orders")
            return
        }
        apiGet("/api/orders")
            .then(res => {
                // Laravel paginated resource: { data: [...], meta: {...} }
                const list = Array.isArray(res?.data) ? res.data : (res ?? [])
                setOrders(list)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [router])

    if (loading) return <Loading />

    return (
        <div className="min-h-[70vh] mx-6">
            <div className="my-12 max-w-4xl mx-auto">
                <PageTitle
                    heading="My orders"
                    text={`${orders.length} order${orders.length !== 1 ? 's' : ''}`}
                    path="/shop"
                    linkText="Keep shopping"
                />

                {orders.length === 0 ? (
                    <div className="bg-white border border-[color:var(--color-border)] rounded-2xl p-12 text-center mt-8">
                        <Package size={40} className="mx-auto text-[color:var(--color-text-3)]" strokeWidth={1.5} />
                        <h2 className="text-xl mt-4">No orders yet</h2>
                        <p className="text-[color:var(--color-text-2)] mt-2">
                            Once you place an order, it will show up here.
                        </p>
                        <Link href="/shop" className="btn-primary inline-block mt-6">
                            Start shopping
                        </Link>
                    </div>
                ) : (
                    <div className="mt-8">
                        {orders.map(order => (
                            <OrderItem key={order.id} order={order} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
