'use client'

import { Mail, MapPin, Phone } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })
    const [busy, setBusy] = useState(false)

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

    const onSubmit = (e) => {
        e.preventDefault()
        if (busy) return
        setBusy(true)
        // No mail provider wired yet; cache in localStorage so the
        // operator can drain on next visit. Replace with /api/contact
        // when a mail backend (Mailgun, Postmark, SES) lands.
        try {
            const stored = JSON.parse(window.localStorage.getItem('contact_pending') || '[]')
            stored.push({ ...form, ts: Date.now() })
            window.localStorage.setItem('contact_pending', JSON.stringify(stored))
            toast.success("Message saved — we'll be in touch.")
            setForm({ name: "", email: "", subject: "", message: "" })
        } catch {
            toast.error("Couldn't send — try again later")
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="mx-6 my-16 max-w-5xl xl:mx-auto">
            <p className="text-xs uppercase tracking-[0.15em] text-[color:var(--color-text-3)]">Contact</p>
            <h1 className="text-4xl sm:text-5xl mt-2">We're easy to reach.</h1>
            <p className="text-lg text-[color:var(--color-text-2)] mt-6 max-w-2xl">
                Pre-sale questions, bulk quotes, warranty claims, or just want a second opinion
                on a config — pick a channel and we'll get back within one business day.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-12">
                {/* Contact details */}
                <aside className="space-y-6">
                    <ContactRow icon={Mail} label="Email" value="hello@futureshop.example" href="mailto:hello@futureshop.example" />
                    <ContactRow icon={Phone} label="Phone" value="+1 (555) 010-FUTURE" href="tel:+15550103888" />
                    <ContactRow icon={MapPin} label="Office" value={`123 Main Street\nSan Francisco, CA 94102`} />
                    <p className="text-xs text-[color:var(--color-text-3)] pt-4 border-t border-[color:var(--color-border)]">
                        Hours: Monday–Friday 8am–6pm PT. Closed weekends and US federal holidays.
                    </p>
                </aside>

                {/* Form */}
                <form onSubmit={onSubmit} className="bg-white border border-[color:var(--color-border)] rounded-2xl p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1.5" htmlFor="contact-name">Name</label>
                            <input id="contact-name" required className="form-input" value={form.name} onChange={set("name")} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5" htmlFor="contact-email">Email</label>
                            <input id="contact-email" type="email" required className="form-input" value={form.email} onChange={set("email")} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5" htmlFor="contact-subject">Subject</label>
                        <input id="contact-subject" required className="form-input" value={form.subject} onChange={set("subject")} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5" htmlFor="contact-message">Message</label>
                        <textarea id="contact-message" required rows={6} className="form-input" value={form.message} onChange={set("message")} />
                    </div>
                    <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
                        {busy ? "Sending…" : "Send message"}
                    </button>
                </form>
            </div>
        </div>
    )
}

function ContactRow({ icon: Icon, label, value, href }) {
    const inner = (
        <div className="flex items-start gap-4">
            <div className="size-10 rounded-lg bg-[color:var(--color-surface-2)] flex items-center justify-center text-[color:var(--color-brand)] shrink-0">
                <Icon size={18} aria-hidden="true" />
            </div>
            <div>
                <p className="text-xs uppercase tracking-[0.1em] text-[color:var(--color-text-3)]">{label}</p>
                <p className="text-[color:var(--color-text-1)] mt-1 whitespace-pre-line">{value}</p>
            </div>
        </div>
    )
    return href ? <a href={href} className="block hover:opacity-80 transition">{inner}</a> : inner
}
