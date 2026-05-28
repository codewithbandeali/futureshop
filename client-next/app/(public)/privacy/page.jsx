export const metadata = {
    title: "Privacy policy",
    description: "What data FutureShop collects, why, and your rights.",
    robots: { index: true, follow: false },
}

const updated = "May 2026"

export default function PrivacyPage() {
    return (
        <article className="mx-6 my-16 max-w-3xl xl:mx-auto text-[color:var(--color-text-1)]">
            <p className="text-xs uppercase tracking-[0.15em] text-[color:var(--color-text-3)]">Legal</p>
            <h1 className="text-4xl mt-2">Privacy policy</h1>
            <p className="text-sm text-[color:var(--color-text-3)] mt-2">Last updated {updated}</p>

            <p className="text-[color:var(--color-text-2)] leading-relaxed mt-8">
                FutureShop is committed to handling your personal information responsibly.
                This page is a plain-language summary of what we collect, why, and how to
                exercise your rights. We don't sell your data and we don't use dark patterns
                to make opting out hard.
            </p>

            <Section title="What we collect">
                <ul className="space-y-2">
                    <li>• <strong>Account details:</strong> name, email, hashed password.</li>
                    <li>• <strong>Order details:</strong> products, shipping address, payment status. Payment card data never touches our servers — it's tokenised by our payment processor.</li>
                    <li>• <strong>Browser context:</strong> cookies for authentication and cart persistence; analytics tags (if enabled in your region) record page views without PII.</li>
                </ul>
            </Section>

            <Section title="Why we collect it">
                <p>Strictly to fulfil orders, provide customer support, prevent fraud, and meet our legal obligations (tax records, warranty handling). We do not build advertising profiles.</p>
            </Section>

            <Section title="Who we share it with">
                <p>Only processors we use to run the shop: shipping carriers (USPS, UPS, FedEx, in-transit data only), payment processor (Stripe or equivalent), and the email provider for transactional mail. Every processor is bound by a Data Processing Agreement.</p>
            </Section>

            <Section title="Your rights">
                <p>You can request a copy or deletion of your data at any time by emailing <a href="mailto:privacy@futureshop.example" className="underline underline-offset-4 text-[color:var(--color-brand)]">privacy@futureshop.example</a>. EU/UK residents have full GDPR rights including portability and lodging a complaint with a supervisory authority.</p>
            </Section>

            <Section title="Retention">
                <p>Order records are kept for 7 years (tax law). Authentication data is wiped 90 days after account closure. Anonymous analytics expire after 26 months.</p>
            </Section>

            <Section title="Cookies">
                <p>Strictly necessary cookies (cart, auth) cannot be disabled. Analytics cookies are opt-in where required by local law (EU/UK).</p>
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
