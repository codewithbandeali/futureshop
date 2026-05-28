export const metadata = {
    title: "Terms of service",
    description: "The legal terms that apply to your use of FutureShop.",
    robots: { index: true, follow: false },
}

const updated = "May 2026"

export default function TermsPage() {
    return (
        <article className="mx-6 my-16 max-w-3xl xl:mx-auto text-[color:var(--color-text-1)]">
            <p className="text-xs uppercase tracking-[0.15em] text-[color:var(--color-text-3)]">Legal</p>
            <h1 className="text-4xl mt-2">Terms of service</h1>
            <p className="text-sm text-[color:var(--color-text-3)] mt-2">Last updated {updated}</p>

            <Section title="1. Agreement">
                <p>By placing an order or creating an account on FutureShop, you agree to these terms. If you don't, please don't use the shop.</p>
            </Section>

            <Section title="2. Pricing & taxes">
                <p>Prices are shown in USD and exclude sales tax. Tax is calculated at checkout based on the shipping address. We reserve the right to correct obvious pricing errors before fulfilment.</p>
            </Section>

            <Section title="3. Payment">
                <p>Card payments are processed by a PCI-compliant third party (Stripe or equivalent). Orders are confirmed only when payment authorises.</p>
            </Section>

            <Section title="4. Shipping & risk of loss">
                <p>Ownership and risk transfer to you when the carrier picks up the order. If a package is damaged in transit, file a claim with the carrier and contact us within 7 days — we'll help.</p>
            </Section>

            <Section title="5. Warranty">
                <p>All hardware ships with the original manufacturer warranty (Apple, Dell, HP, Samsung). We act as facilitator for warranty claims; the manufacturer's terms apply.</p>
            </Section>

            <Section title="6. Returns">
                <p>See the <a href="/shipping" className="underline underline-offset-4 text-[color:var(--color-brand)]">shipping &amp; returns</a> page for the 30-day return window, restocking fees on opened items, and how to request an RMA.</p>
            </Section>

            <Section title="7. Account responsibility">
                <p>You're responsible for keeping your password secure. We won't be liable for losses from unauthorised access where you shared credentials.</p>
            </Section>

            <Section title="8. Limitation of liability">
                <p>To the extent permitted by law, our total liability for any claim related to a purchase is capped at the amount you paid for the order in question.</p>
            </Section>

            <Section title="9. Governing law">
                <p>These terms are governed by the laws of California, USA. Disputes go to the courts of San Francisco County.</p>
            </Section>

            <p className="text-sm text-[color:var(--color-text-3)] mt-12 pt-6 border-t border-[color:var(--color-border)]">
                This page is a template suitable for review — replace with the formal legal
                copy your counsel approves before going live.
            </p>
        </article>
    )
}

function Section({ title, children }) {
    return (
        <section className="mt-10">
            <h2 className="text-xl">{title}</h2>
            <div className="mt-3 text-[color:var(--color-text-2)] leading-relaxed">{children}</div>
        </section>
    )
}
