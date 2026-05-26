'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import Loading from "../Loading"
import AdminNavbar from "./AdminNavbar"
import AdminSidebar from "./AdminSidebar"
import { getStoredUser, isLoggedIn } from "@/lib/auth"

/**
 * Admin gate — checks that the logged-in user has role=admin. The Laravel
 * /api/login response embeds the role, so we trust localStorage; on every
 * sensitive mutation the Laravel endpoint re-validates server-side.
 */
const AdminLayout = ({ children }) => {
    const router = useRouter()
    const [status, setStatus] = useState("loading") // loading | authorized | forbidden

    useEffect(() => {
        if (!isLoggedIn()) {
            router.replace("/login?next=/admin")
            return
        }
        const user = getStoredUser()
        setStatus(user?.role === "admin" ? "authorized" : "forbidden")
    }, [router])

    if (status === "loading") return <Loading />

    if (status === "forbidden") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-[color:var(--color-surface)]">
                <h1 className="text-2xl sm:text-4xl">You don't have admin access</h1>
                <p className="text-[color:var(--color-text-2)] mt-3 max-w-md">
                    Your account is signed in but doesn't have the admin role. If this is wrong, contact the shop owner.
                </p>
                <Link href="/" className="btn-primary inline-flex items-center gap-2 mt-8">
                    Back to shop <ArrowRight size={18} />
                </Link>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-[color:var(--color-surface)]">
            <AdminNavbar />
            <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
                <AdminSidebar />
                <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default AdminLayout
