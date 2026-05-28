export const metadata = {
    title: "Shipping & returns",
    description: "How fast FutureShop ships, where, and how returns work.",
}

export default function ShippingPage() {
    return (
        <article className="mx-6 my-16 max-w-3xl xl:mx-auto text-[color:var(--color-text-1)]">
            <p className="text-xs uppercase tracking-[0.15em] text-[color:var(--color-text-3)]">Help</p>
            <h1 className="text-4xl mt-2">Shipping &amp; returns</h1>

            <Section title="Shipping speed">
                <p>Orders placed before 3pm PT on a business day ship the same day. Otherwise the next business day. You'll get a tracking number by email as soon as the carrier scans the parcel.</p>
            </Section>

            <Section title="Cost">
                <ul className="space-y-2">
                    <li>• <strong>Free</strong> on orders over $50 (continental US).</li>
                    <li>• <strong>$5.99 flat rate</strong> on orders under $50.</li>
                    <li>• <strong>Expedited (next-day air)</strong> available at checkout — quoted live by the carrier.</li>
                </ul>
            </Section>

            <Section title="Where we ship">
                <p>Continental US, Alaska, Hawaii, and Canada. International orders by quote. <a href="/contact" className="underline underline-offset-4 text-[color:var(--color-brand)]">Contact us</a> for details.</p>
            </Section>

            <Section title="Returns within 30 days">
                <p>Unopened items can be returned for a full refund within 30 days of delivery. Opened items in like-new condition are accepted with a 15% restocking fee. The return shipping label is on us if the issue is ours; otherwise it's on you.</p>
                <p className="mt-3">To start a return, email <a href="mailto:returns@futureshop.example" className="underline underline-offset-4 text-[color:var(--color-brand)]">returns@futureshop.example</a> with your order number. We'll send the RMA and the prepaid label.</p>
            </Section>

            <Section title="Damaged on arrival">
                <p>Photograph the box and the contents within 24 hours of delivery, then email us. We'll arrange replacement or refund without a restocking fee.</p>
            </Section>

            <Section title="Warranty issues">
                <p>If a unit fails inside the manufacturer warranty window, file directly with the manufacturer for fastest service. Apple, Dell, HP, and Samsung all offer first-party warranty repair. We'll help if you'd rather we handle it.</p>
            </Section>
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
