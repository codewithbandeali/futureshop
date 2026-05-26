'use client'
import { LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getStoredUser, logout } from "@/lib/auth"

const AdminNavbar = () => {
    const router = useRouter()
    const [user, setUser] = useState(null)

    useEffect(() => { setUser(getStoredUser()) }, [])

    const handleLogout = async () => {
        await logout()
        router.push("/login")
    }

    return (
        <div className="flex items-center justify-between px-6 sm:px-10 py-3 border-b border-[color:var(--color-border)] bg-white">
            <Link href="/" className="text-xl font-semibold tracking-tight text-[color:var(--color-text-1)] relative">
                FutureShop<span className="text-[color:var(--color-accent)]">.</span>
                <span className="absolute -top-1 -right-12 text-[10px] font-semibold px-2 py-0.5 rounded-full text-white bg-[color:var(--color-brand)]">
                    Admin
                </span>
            </Link>
            <div className="flex items-center gap-4">
                <div className="text-right max-sm:hidden">
                    <p className="text-sm font-medium text-[color:var(--color-text-1)]">
                        {user?.name ?? "Admin"}
                    </p>
                    <p className="text-xs text-[color:var(--color-text-3)]">{user?.email ?? "admin@futureshop"}</p>
                </div>
                <div className="size-9 rounded-full bg-[color:var(--color-brand)] text-white flex items-center justify-center font-semibold text-sm">
                    {(user?.name ?? "A").slice(0, 1).toUpperCase()}
                </div>
                <button
                    onClick={handleLogout}
                    aria-label="Sign out"
                    className="p-2 hover:text-[color:var(--color-accent)] transition"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </div>
    )
}

export default AdminNavbar
