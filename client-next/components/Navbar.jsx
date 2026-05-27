'use client'
import { Search, ShoppingCart, User, LogOut, Menu, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { openMiniCart } from "@/lib/features/cart/cartSlice"
import { getStoredUser, logout } from "@/lib/auth"

const Navbar = () => {
    const router = useRouter()
    const [search, setSearch] = useState("")
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [user, setUser] = useState(null)
    const dispatch = useDispatch()
    const cartCount = useSelector(state => state.cart.total)

    useEffect(() => { setUser(getStoredUser()) }, [])

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8)
        onScroll()
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    const handleSearch = (e) => {
        e.preventDefault()
        if (!search.trim()) return
        router.push(`/shop?search=${encodeURIComponent(search.trim())}`)
        setMobileOpen(false)
    }

    const handleLogout = async () => {
        await logout()
        setUser(null)
        router.push("/")
    }

    return (
        <nav
            className={`sticky top-0 z-40 transition-[background,box-shadow] duration-300 ${
                scrolled
                    ? "bg-[color:var(--color-surface)]/95 backdrop-blur-sm shadow-[0_1px_0_var(--color-border)]"
                    : "bg-[color:var(--color-surface)]"
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between gap-6">
                <Link href="/" className="text-xl font-semibold tracking-tight text-[color:var(--color-text-1)] select-none">
                    FutureShop<span className="text-[color:var(--color-accent)]">.</span>
                </Link>

                <div className="hidden md:flex items-center gap-7 text-sm text-[color:var(--color-text-1)]">
                    <Link href="/" className="hover:text-[color:var(--color-accent)] transition">Home</Link>
                    <Link href="/shop" className="hover:text-[color:var(--color-accent)] transition">Shop</Link>
                    {user && <Link href="/orders" className="hover:text-[color:var(--color-accent)] transition">Orders</Link>}
                </div>

                <form onSubmit={handleSearch}
                    className="hidden lg:flex items-center flex-1 max-w-sm bg-white border border-[color:var(--color-border)] rounded-full px-4 py-2 focus-within:border-[color:var(--color-brand)] transition">
                    <Search size={16} className="text-[color:var(--color-text-3)]" aria-hidden="true" />
                    <input
                        type="search"
                        placeholder="Search products"
                        aria-label="Search products"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent outline-none text-sm ml-2 flex-1 placeholder:text-[color:var(--color-text-3)]"
                    />
                </form>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => dispatch(openMiniCart())}
                        aria-label={cartCount > 0 ? `Cart (${cartCount} items)` : 'Cart'}
                        className="relative p-2 hover:text-[color:var(--color-accent)] transition"
                    >
                        <ShoppingCart size={20} aria-hidden="true" />
                        {cartCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 bg-[color:var(--color-accent)] text-white text-[10px] font-medium min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    {user ? (
                        <div className="hidden md:flex items-center gap-3 text-sm">
                            <span className="text-[color:var(--color-text-2)] flex items-center gap-1.5">
                                <User size={16} aria-hidden="true" />{user.name?.split(" ")[0]}
                            </span>
                            <button onClick={handleLogout} aria-label="Sign out"
                                className="p-2 hover:text-[color:var(--color-accent)] transition">
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className="hidden md:inline-flex btn-primary !py-2 !px-5 text-sm">
                            Sign in
                        </Link>
                    )}

                    <button
                        type="button"
                        aria-label={mobileOpen ? "Close menu" : "Open menu"}
                        aria-expanded={mobileOpen}
                        onClick={() => setMobileOpen(o => !o)}
                        className="md:hidden p-2"
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <div className="md:hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-5 space-y-4">
                    <form onSubmit={handleSearch} className="flex items-center bg-white border border-[color:var(--color-border)] rounded-full px-4 py-2">
                        <Search size={16} className="text-[color:var(--color-text-3)]" />
                        <input type="search" placeholder="Search products" value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-transparent outline-none text-sm ml-2 flex-1" />
                    </form>
                    <nav className="flex flex-col gap-3 text-sm" aria-label="Mobile navigation">
                        <Link onClick={() => setMobileOpen(false)} href="/">Home</Link>
                        <Link onClick={() => setMobileOpen(false)} href="/shop">Shop</Link>
                        {user && <Link onClick={() => setMobileOpen(false)} href="/orders">Orders</Link>}
                        {user
                            ? <button className="text-left text-[color:var(--color-accent)]" onClick={handleLogout}>Sign out</button>
                            : <Link onClick={() => setMobileOpen(false)} href="/login" className="text-[color:var(--color-accent)]">Sign in</Link>}
                    </nav>
                </div>
            )}
        </nav>
    )
}

export default Navbar
