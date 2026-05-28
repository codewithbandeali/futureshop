'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { useDispatch, useSelector } from "react-redux"
import { apiGet, apiPost } from "@/lib/api"
import { isLoggedIn } from "@/lib/auth"
import { clearCart } from "@/lib/features/cart/cartSlice"
import { addAddress, setAddresses } from "@/lib/features/address/addressSlice"
import { previewCoupon } from "@/lib/admin"
import { Tag, X } from "lucide-react"

const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$"

const emptyAddress = {
    full_name: "", phone: "", line1: "", line2: "",
    city: "", state: "", postal_code: "", country: "US",
}

export default function CheckoutPage() {
    const router = useRouter()
    const dispatch = useDispatch()

    const cartItems = useSelector(s => s.cart.cartItems) // { productId: qty }
    const cartTotal = useSelector(s => s.cart.total)
    const products = useSelector(s => s.product.list)
    const addresses = useSelector(s => s.address.list)

    const [selectedAddressId, setSelectedAddressId] = useState(null)
    const [addingAddress, setAddingAddress] = useState(false)
    const [newAddress, setNewAddress] = useState(emptyAddress)
    const [busy, setBusy] = useState(false)
    const [authChecked, setAuthChecked] = useState(false)

    // Redirect anonymous shoppers to /login with a return path
    useEffect(() => {
        if (!isLoggedIn()) {
            router.replace("/login?next=/checkout")
            return
        }
        setAuthChecked(true)
        // Refresh addresses on entry — DataInitializer only fetches them once on mount.
        apiGet("/api/address")
            .then(res => dispatch(setAddresses(res?.data ?? res ?? [])))
            .catch(() => {})
    }, [dispatch, router])

    // Default-select the first / preferred address
    useEffect(() => {
        if (!selectedAddressId && addresses.length > 0) {
            const def = addresses.find(a => a.is_default) || addresses[0]
            setSelectedAddressId(def.id)
        }
    }, [addresses, selectedAddressId])

    // Build line items from products + cart map
    const lineItems = useMemo(() => {
        return Object.entries(cartItems)
            .map(([productId, quantity]) => {
                const p = products.find(p => String(p.id) === String(productId))
                if (!p) return null
                const unit = Number(p.price)
                return {
                    productId: p.id,
                    name: p.name,
                    image: p.images?.[0],
                    quantity,
                    unitPrice: unit,
                    lineTotal: unit * quantity,
                }
            })
            .filter(Boolean)
    }, [cartItems, products])

    const subtotal = lineItems.reduce((sum, li) => sum + li.lineTotal, 0)

    // Coupon state. `applied` holds the server-validated result (code +
    // discount amount); `couponInput` is the raw text field.
    const [couponInput, setCouponInput] = useState("")
    const [applied, setApplied] = useState(null)
    const [checkingCoupon, setCheckingCoupon] = useState(false)

    const discount = applied?.discount ?? 0
    const shipping = (subtotal - discount) >= 50 ? 0 : 5.99
    const total = Math.max(0, subtotal - discount + shipping)

    const applyCoupon = async (e) => {
        e?.preventDefault?.()
        const code = couponInput.trim()
        if (!code || checkingCoupon) return
        setCheckingCoupon(true)
        try {
            const res = await previewCoupon(code, subtotal)
            if (res?.valid) {
                setApplied({ code: res.coupon.code, description: res.coupon.description, discount: Number(res.discount) })
                toast.success(`Applied ${res.coupon.code}`)
            } else {
                toast.error(res?.message || "Invalid code")
            }
        } catch (err) {
            // 422/404 from the server land here; surface the message if present.
            toast.error("Code can't be applied")
            setApplied(null)
        } finally {
            setCheckingCoupon(false)
        }
    }

    const clearCoupon = () => {
        setApplied(null)
        setCouponInput("")
    }

    const saveNewAddress = async (e) => {
        e.preventDefault()
        try {
            const created = await apiPost("/api/address", { ...newAddress, is_default: addresses.length === 0 })
            dispatch(addAddress(created))
            setSelectedAddressId(created.id)
            setNewAddress(emptyAddress)
            setAddingAddress(false)
            toast.success("Address saved")
        } catch {
            toast.error("Couldn't save address")
        }
    }

    const placeOrder = async () => {
        if (!selectedAddressId) { toast.error("Pick a delivery address"); return }
        if (lineItems.length === 0) { toast.error("Your cart is empty"); return }
        setBusy(true)
        try {
            const created = await apiPost("/api/orders", {
                address_id: selectedAddressId,
                items: lineItems.map(li => ({ product_id: li.productId, quantity: li.quantity })),
                currency: "USD",
                coupon_code: applied?.code,
            })
            dispatch(clearCart())
            const newId = created?.data?.id ?? created?.id
            toast.success("Order placed!")
            router.push(newId ? `/checkout/success?orderId=${newId}` : "/orders")
        } catch (err) {
            toast.error("Couldn't place order — please try again")
        } finally {
            setBusy(false)
        }
    }

    if (!authChecked) return null

    if (cartTotal === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
                <h1 className="text-3xl mb-3">Your cart is empty</h1>
                <p className="text-[color:var(--color-text-2)] mb-6">Add a few products before checking out.</p>
                <Link href="/shop" className="btn-primary">Browse products</Link>
            </div>
        )
    }

    return (
        <div className="mx-6 my-12 max-w-7xl xl:mx-auto">
            <h1 className="text-3xl mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: address + items */}
                <div className="lg:col-span-2 space-y-10">
                    <section>
                        <h2 className="text-xl mb-4">Delivery address</h2>

                        {addresses.length > 0 && !addingAddress && (
                            <div className="space-y-3">
                                {addresses.map(a => (
                                    <label key={a.id}
                                        className={`flex gap-3 p-4 border rounded-md cursor-pointer transition
                                          ${selectedAddressId === a.id
                                            ? 'border-[color:var(--color-brand)] bg-[color:var(--color-surface-2)]'
                                            : 'border-[color:var(--color-border)] hover:border-[color:var(--color-text-2)]'}`}>
                                        <input
                                            type="radio" name="address"
                                            className="mt-1"
                                            checked={selectedAddressId === a.id}
                                            onChange={() => setSelectedAddressId(a.id)}
                                        />
                                        <div className="text-sm">
                                            <p className="font-medium">{a.full_name}</p>
                                            <p className="text-[color:var(--color-text-2)]">
                                                {a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}
                                                {a.state ? `, ${a.state}` : ''} {a.postal_code}, {a.country}
                                            </p>
                                            <p className="text-[color:var(--color-text-3)]">{a.phone}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}

                        {!addingAddress && (
                            <button
                                type="button"
                                className="mt-4 text-sm underline underline-offset-4 text-[color:var(--color-brand)]"
                                onClick={() => setAddingAddress(true)}>
                                + Add a new address
                            </button>
                        )}

                        {addingAddress && (
                            <form onSubmit={saveNewAddress} className="mt-4 space-y-3 p-5 border border-[color:var(--color-border)] rounded-md bg-white">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <input className="form-input" placeholder="Full name" required
                                        value={newAddress.full_name} onChange={e => setNewAddress({ ...newAddress, full_name: e.target.value })} />
                                    <input className="form-input" placeholder="Phone" required
                                        value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} />
                                </div>
                                <input className="form-input" placeholder="Address line 1" required
                                    value={newAddress.line1} onChange={e => setNewAddress({ ...newAddress, line1: e.target.value })} />
                                <input className="form-input" placeholder="Address line 2 (optional)"
                                    value={newAddress.line2} onChange={e => setNewAddress({ ...newAddress, line2: e.target.value })} />
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <input className="form-input sm:col-span-2" placeholder="City" required
                                        value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                                    <input className="form-input" placeholder="State"
                                        value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} />
                                    <input className="form-input" placeholder="ZIP" required
                                        value={newAddress.postal_code} onChange={e => setNewAddress({ ...newAddress, postal_code: e.target.value })} />
                                </div>
                                <input className="form-input" placeholder="Country code (2 letters)" maxLength={2}
                                    value={newAddress.country} onChange={e => setNewAddress({ ...newAddress, country: e.target.value.toUpperCase() })} />
                                <div className="flex gap-3 pt-1">
                                    <button type="submit" className="btn-primary">Save address</button>
                                    <button type="button" className="btn-secondary"
                                        onClick={() => { setAddingAddress(false); setNewAddress(emptyAddress) }}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>

                    <section>
                        <h2 className="text-xl mb-4">Order items</h2>
                        <div className="space-y-3">
                            {lineItems.map(li => (
                                <div key={li.productId}
                                    className="flex items-center gap-4 p-3 border border-[color:var(--color-border)] rounded-md bg-white">
                                    {li.image && (
                                        <img src={li.image} alt={li.name} className="w-16 h-16 object-contain bg-[color:var(--color-surface-2)] rounded" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{li.name}</p>
                                        <p className="text-xs text-[color:var(--color-text-3)]">Qty {li.quantity}</p>
                                    </div>
                                    <p className="text-sm font-medium">{currency}{li.lineTotal.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right: order summary (sticky) */}
                <aside className="lg:sticky lg:top-24 h-fit">
                    <div className="p-6 border border-[color:var(--color-border)] rounded-md bg-white">
                        <h2 className="text-xl mb-4">Order summary</h2>

                        {/* Coupon */}
                        <div className="mb-5">
                            {applied ? (
                                <div className="flex items-center justify-between gap-2 bg-[color:var(--color-accent-soft)] border border-[color:var(--color-accent)]/30 rounded-md p-2.5 text-xs">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Tag size={14} className="text-[color:var(--color-accent)] shrink-0" />
                                        <div className="min-w-0">
                                            <p className="font-semibold text-[color:var(--color-accent)]">{applied.code}</p>
                                            {applied.description && (
                                                <p className="text-[color:var(--color-text-2)] truncate">{applied.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={clearCoupon}
                                        aria-label="Remove coupon"
                                        className="text-[color:var(--color-text-3)] hover:text-[color:var(--color-text-1)] p-1"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={applyCoupon} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Coupon code"
                                        aria-label="Coupon code"
                                        value={couponInput}
                                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                        className="form-input !py-2 !text-sm flex-1 uppercase tracking-wide"
                                    />
                                    <button
                                        type="submit"
                                        disabled={checkingCoupon || !couponInput.trim()}
                                        className="btn-secondary !py-2 !px-4 text-sm disabled:opacity-50"
                                    >
                                        {checkingCoupon ? '…' : 'Apply'}
                                    </button>
                                </form>
                            )}
                        </div>

                        <dl className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <dt>Subtotal</dt>
                                <dd>{currency}{subtotal.toFixed(2)}</dd>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-[color:var(--color-accent)]">
                                    <dt>Discount{applied?.code ? ` · ${applied.code}` : ''}</dt>
                                    <dd>-{currency}{discount.toFixed(2)}</dd>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <dt>Delivery</dt>
                                <dd>{shipping === 0 ? "FREE" : `${currency}${shipping.toFixed(2)}`}</dd>
                            </div>
                            <div className="border-t border-[color:var(--color-border)] pt-2 mt-2 flex justify-between font-semibold text-base">
                                <dt>Total</dt>
                                <dd>{currency}{total.toFixed(2)}</dd>
                            </div>
                        </dl>
                        <button onClick={placeOrder} disabled={busy || !selectedAddressId}
                            className="btn-primary w-full mt-6 disabled:opacity-60">
                            {busy ? "Placing order…" : "Place order"}
                        </button>
                        <p className="text-xs text-[color:var(--color-text-3)] mt-3 text-center">
                            Payment integration not yet enabled — orders are saved as <em>unpaid</em>.
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    )
}
