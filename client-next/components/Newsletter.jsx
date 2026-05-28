'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import Title from './Title'

const Newsletter = () => {
    const [email, setEmail] = useState('')
    const [busy, setBusy] = useState(false)

    const onSubmit = (e) => {
        e.preventDefault()
        if (!email || busy) return
        setBusy(true)
        // No mail provider wired yet; store locally for the operator to pick up
        // from server logs / future integration.
        try {
            const stored = JSON.parse(window.localStorage.getItem('newsletter_pending') || '[]')
            stored.push({ email, ts: Date.now() })
            window.localStorage.setItem('newsletter_pending', JSON.stringify(stored))
            toast.success("You're on the list")
            setEmail('')
        } catch {
            toast.error("Couldn't subscribe. Try again.")
        } finally {
            setBusy(false)
        }
    }

    return (
        <section className="px-6 my-24 max-w-3xl mx-auto text-center">
            <Title
                title="Stay in the loop"
                description="New arrivals, restocks, and occasional good deals. No spam."
                visibleButton={false}
            />
            <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 mt-10 max-w-xl mx-auto">
                <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                <input
                    id="newsletter-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="form-input flex-1"
                />
                <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60 whitespace-nowrap">
                    {busy ? 'Subscribing…' : 'Subscribe'}
                </button>
            </form>
        </section>
    )
}

export default Newsletter
