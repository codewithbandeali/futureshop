'use client'

import { usePathname } from "next/navigation"
import { LayoutDashboard, Mail, Package, Percent, ShoppingBag, Users, Tag } from "lucide-react"
import Link from "next/link"

const AdminSidebar = () => {
    const pathname = usePathname()

    const sidebarLinks = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Products', href: '/admin/products', icon: Package },
        { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
        { name: 'Customers', href: '/admin/customers', icon: Users },
        { name: 'Categories', href: '/admin/categories', icon: Tag },
        { name: 'Coupons', href: '/admin/coupons', icon: Percent },
        { name: 'Messages', href: '/admin/messages', icon: Mail },
    ]

    return (
        <aside className="inline-flex h-full flex-col border-r border-[color:var(--color-border)] bg-white sm:min-w-64">
            <div className="flex flex-col gap-1 p-3 max-sm:mt-4 max-sm:items-center">
                {sidebarLinks.map((link) => {
                    const active = pathname === link.href || (link.href !== '/admin' && pathname?.startsWith(link.href))
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                                active
                                    ? 'bg-[color:var(--color-surface-2)] text-[color:var(--color-brand)] font-medium'
                                    : 'text-[color:var(--color-text-2)] hover:bg-[color:var(--color-surface-2)]'
                            }`}
                        >
                            <link.icon size={18} />
                            <span className="max-sm:hidden">{link.name}</span>
                        </Link>
                    )
                })}
            </div>
        </aside>
    )
}

export default AdminSidebar
