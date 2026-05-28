import Link from "next/link"

const Footer = () => {
    const year = new Date().getUTCFullYear()
    return (
        <footer className="bg-[color:var(--color-brand)] text-white mt-20">
            <div className="max-w-7xl mx-auto px-6 py-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <p className="text-xl font-semibold tracking-tight">
                        FutureShop<span className="text-[color:var(--color-accent)]">.</span>
                    </p>
                    <p className="text-sm text-white/70 mt-3 max-w-xs">
                        Business-grade computers, printers, and peripherals. Next-business-day shipping, manufacturer warranty.
                    </p>
                </div>
                <nav aria-label="Shop">
                    <p className="text-sm uppercase tracking-[0.1em] text-white/60 mb-3">Shop</p>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/shop" className="hover:text-[color:var(--color-accent)] transition">All products</Link></li>
                        <li><Link href="/shop?category=laptop" className="hover:text-[color:var(--color-accent)] transition">Laptops</Link></li>
                        <li><Link href="/shop?category=desktop" className="hover:text-[color:var(--color-accent)] transition">Desktops</Link></li>
                        <li><Link href="/shop?category=monitor" className="hover:text-[color:var(--color-accent)] transition">Monitors</Link></li>
                        <li><Link href="/wishlist" className="hover:text-[color:var(--color-accent)] transition">Wishlist</Link></li>
                    </ul>
                </nav>
                <nav aria-label="Help">
                    <p className="text-sm uppercase tracking-[0.1em] text-white/60 mb-3">Help</p>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/orders" className="hover:text-[color:var(--color-accent)] transition">Track an order</Link></li>
                        <li><Link href="/shipping" className="hover:text-[color:var(--color-accent)] transition">Shipping &amp; returns</Link></li>
                        <li><Link href="/contact" className="hover:text-[color:var(--color-accent)] transition">Contact us</Link></li>
                        <li><Link href="/account" className="hover:text-[color:var(--color-accent)] transition">Your account</Link></li>
                    </ul>
                </nav>
                <nav aria-label="Company">
                    <p className="text-sm uppercase tracking-[0.1em] text-white/60 mb-3">Company</p>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/about" className="hover:text-[color:var(--color-accent)] transition">About</Link></li>
                        <li><Link href="/privacy" className="hover:text-[color:var(--color-accent)] transition">Privacy</Link></li>
                        <li><Link href="/terms" className="hover:text-[color:var(--color-accent)] transition">Terms</Link></li>
                    </ul>
                </nav>
            </div>
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row sm:justify-between gap-3 text-xs text-white/50">
                    <p>&copy; {year} FutureShop. All rights reserved.</p>
                    <p>Apple &middot; Dell &middot; HP &middot; Samsung &mdash; authorized reseller</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
