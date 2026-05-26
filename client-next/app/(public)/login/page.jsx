'use client'

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import toast from "react-hot-toast"
import { login } from "@/lib/auth"

export default function LoginPage() {
    const router = useRouter()
    const search = useSearchParams()
    const redirectTo = search.get("next") || "/"

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [busy, setBusy] = useState(false)

    const onSubmit = async (e) => {
        e.preventDefault()
        if (busy) return
        setBusy(true)
        try {
            await login({ email, password })
            toast.success("Signed in")
            router.push(redirectTo)
        } catch (err) {
            toast.error(err?.message?.includes("401") ? "Invalid email or password" : "Sign-in failed")
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
            <div className="w-full max-w-md">
                <h1 className="text-3xl mb-2">Welcome back</h1>
                <p className="text-[color:var(--color-text-2)] mb-8">Sign in to continue shopping.</p>

                <form onSubmit={onSubmit} className="space-y-4" noValidate>
                    <div>
                        <label htmlFor="email" className="block text-sm mb-1.5 font-medium">Email</label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm mb-1.5 font-medium">Password</label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
                        {busy ? "Signing in…" : "Sign in"}
                    </button>
                </form>

                <p className="text-sm text-[color:var(--color-text-2)] mt-6 text-center">
                    No account?{" "}
                    <Link href="/register" className="text-[color:var(--color-brand)] underline underline-offset-4">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    )
}
