'use client'
import { addToCart, removeFromCart } from "@/lib/features/cart/cartSlice"
import { Minus, Plus } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"

const Counter = ({ productId }) => {
    const cartItems = useSelector(state => state.cart.cartItems)
    const dispatch = useDispatch()

    const quantity = cartItems[productId] ?? 0

    return (
        <div className="inline-flex items-center rounded-lg border border-[color:var(--color-border)] text-[color:var(--color-text-1)] select-none bg-white">
            <button
                type="button"
                onClick={() => dispatch(removeFromCart({ productId }))}
                aria-label="Decrease quantity"
                className="size-9 flex items-center justify-center hover:bg-[color:var(--color-surface-2)] rounded-l-lg transition active:scale-95"
            >
                <Minus size={14} />
            </button>
            <p className="w-10 text-center text-sm font-medium" aria-live="polite">{quantity}</p>
            <button
                type="button"
                onClick={() => dispatch(addToCart({ productId }))}
                aria-label="Increase quantity"
                className="size-9 flex items-center justify-center hover:bg-[color:var(--color-surface-2)] rounded-r-lg transition active:scale-95"
            >
                <Plus size={14} />
            </button>
        </div>
    )
}

export default Counter
