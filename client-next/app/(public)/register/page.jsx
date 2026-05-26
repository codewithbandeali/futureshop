'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import toast from "react-hot-toast"
import { register } from "@/lib/auth"

export default function RegisterPage() {
    const router = useRouter()
    const [form, setForm] = useState({
        name: "", email: "", password: "", password_confirmation: ""
    })
    const [busy, setBusy] = useState(false)

    const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

    const onSubmit = async (e) => {
        e.preventDefault()
        if (busy) return
        if (form.password !== form.password_confirmation) {
            toast.error("Passwords don't match")
            return
        }
        setBusy(true)
        try {
            await register(form)
            toast.success("Account created")
            router.push("/")
        } catch (err) {
            toast.error("Registration failed — check your details")
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
            <div className="w-full max-w-md">
                <h1 className="text-3xl mb-2">Create your account</h1>
                <p className="text-[color:var(--color-text-2)] mb-8">Save addresses, track orders, check out faster.</p>

                <form onSubmit={onSubmit} className="space-y-4" noValidate>
                    <div>
                        <label htmlFor="name" className="block text-sm mb-1.5 font-medium">Full name</label>
                        <input id="name" type="text" autoComplete="name" required
                            value={form.name} onChange={set("name")} className="form-input" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm mb-1.5 font-medium">Email</label>
                        <input id="email" type="email" autoComplete="email" required
                            value={form.email} onChange={set("email")} className="form-input" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm mb-1.5 font-medium">Password</label>
                        <input id="password" type="password" autoComplete="new-password" required
                            value={form.password} onChange={set("password")} className="form-input" />
                        <p className="text-xs text-[color:var(--color-text-3)] mt-1">
                            At least 5 characters, with upper, lower, and a digit.
                        </p>
                    </div>
                    <div>
                        <label htmlFor="password_confirmation" className="block text-sm mb-1.5 font-medium">Confirm password</label>
                        <input id="password_confirmation" type="password" autoComplete="new-password" required
                            value={form.password_confirmation} onChange={set("password_confirmation")} className="form-input" />
                    </div>
                    <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
                        {busy ? "Creating account…" : "Create account"}
                    </button>
                </form>

                <p className="text-sm text-[color:var(--color-text-2)] mt-6 text-center">
                    Already have an account?{" "}
                    <Link href="/login" className="text-[color:var(--color-brand)] underline underline-offset-4">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}
