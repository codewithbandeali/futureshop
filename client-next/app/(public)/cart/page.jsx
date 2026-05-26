'use client'
import Counter from "@/components/Counter"
import OrderSummary from "@/components/OrderSummary"
import { deleteItemFromCart } from "@/lib/features/cart/cartSlice"
import { ShoppingCart, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

export default function Cart() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const { cartItems } = useSelector(state => state.cart)
    const products = useSelector(state => state.product.list)
    const dispatch = useDispatch()

    const [cartArray, setCartArray] = useState([])
    const [totalPrice, setTotalPrice] = useState(0)

    useEffect(() => {
        if (products.length === 0) return
        let total = 0
        const arr = []
        for (const [key, value] of Object.entries(cartItems)) {
            const product = products.find(p => String(p.id) === String(key))
            if (product) {
                arr.push({ ...product, quantity: value })
                total += Number(product.price) * value
            }
        }
        setCartArray(arr)
        setTotalPrice(total)
    }, [cartItems, products])

    const totalItems = cartArray.reduce((sum, item) => sum + item.quantity, 0)

    if (cartArray.length === 0) {
        return (
            <div className="min-h-[70vh] mx-6 flex flex-col items-center justify-center text-center">
                <ShoppingCart size={56} className="text-[color:var(--color-text-3)]" strokeWidth={1.5} />
                <h1 className="text-3xl mt-5">Your cart is empty</h1>
                <p className="text-[color:var(--color-text-2)] mt-2">Add a few products to get started.</p>
                <Link href="/shop" className="btn-primary mt-6">Browse products</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen mx-6">
            <div className="max-w-7xl mx-auto my-12">
                <h1 className="text-3xl">Your cart</h1>
                <p className="text-sm text-[color:var(--color-text-2)] mt-1">
                    {totalItems} item{totalItems !== 1 ? 's' : ''}
                </p>

                <div className="flex items-start gap-8 max-lg:flex-col mt-8">
                    <ul className="w-full flex flex-col gap-4">
                        {cartArray.map(item => (
                            <li key={item.id} className="flex items-center gap-4 bg-white border border-[color:var(--color-border)] rounded-2xl p-4 transition hover:shadow-md">
                                <Link
                                    href={`/product/${item.slug ?? item.id}`}
                                    className="flex items-center justify-center bg-[color:var(--color-surface-2)] size-24 rounded-xl shrink-0 overflow-hidden"
                                >
                                    {item.images?.[0] && (
                                        <Image
                                            src={item.images[0]}
                                            alt={item.name}
                                            width={80}
                                            height={80}
                                            className="max-h-20 w-auto object-contain"
                                        />
                                    )}
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-text-3)]">{item.category}</p>
                                    <Link
                                        href={`/product/${item.slug ?? item.id}`}
                                        className="font-medium block truncate text-[color:var(--color-text-1)] hover:text-[color:var(--color-brand)] transition"
                                    >
                                        {item.name}
                                    </Link>
                                    <p className="text-sm text-[color:var(--color-text-2)] mt-0.5">
                                        {currency}{Number(item.price).toFixed(2)}
                                    </p>
                                    <div className="mt-2"><Counter productId={item.id} /></div>
                                </div>
                                <div className="flex flex-col items-end justify-between self-stretch">
                                    <button
                                        type="button"
                                        onClick={() => dispatch(deleteItemFromCart({ productId: item.id }))}
                                        aria-label={`Remove ${item.name}`}
                                        className="text-[color:var(--color-text-3)] hover:text-[color:var(--color-accent)] hover:bg-[color:var(--color-accent-soft)] p-2 rounded-full transition"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <p className="font-semibold whitespace-nowrap">
                                        {currency}{(Number(item.price) * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <OrderSummary totalPrice={totalPrice} items={cartArray} />
                </div>
            </div>
        </div>
    )
}
