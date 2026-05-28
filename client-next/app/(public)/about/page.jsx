import Link from "next/link"

export const metadata = {
    title: "About",
    description: "Why FutureShop exists, who runs it, and what we stand for.",
}

export default function AboutPage() {
    return (
        <article className="mx-6 my-16 max-w-3xl xl:mx-auto prose-page">
            <p className="text-xs uppercase tracking-[0.15em] text-[color:var(--color-text-3)]">About</p>
            <h1 className="text-4xl sm:text-5xl mt-2">Computers, picked carefully.</h1>
            <p className="text-lg text-[color:var(--color-text-2)] mt-6 leading-relaxed">
                FutureShop is a small, opinionated computer hardware shop. We carry
                laptops, desktops, monitors, tablets, printers and scanners from Apple,
                Dell, HP and Samsung — only the configurations we'd actually buy ourselves.
            </p>

            <h2 className="text-2xl mt-12">What we promise</h2>
            <ul className="space-y-3 mt-4 text-[color:var(--color-text-1)]">
                <li>• <strong>Authorized reseller pricing.</strong> No grey-market stock, no warranty surprises.</li>
                <li>• <strong>Next-business-day shipping</strong> on orders placed before 3pm local time.</li>
                <li>• <strong>30-day returns</strong> on every unopened item, half-priced restocking on opened ones.</li>
                <li>• <strong>Human support.</strong> Email or phone someone who actually uses this equipment for a living.</li>
            </ul>

            <h2 className="text-2xl mt-12">Who's behind this</h2>
            <p className="text-[color:var(--color-text-2)] mt-4 leading-relaxed">
                FutureShop is run by a small team of IT veterans who got tired of explaining
                to friends why the laptop the big-box site recommended was wrong for them.
                We specialise in pre-sale configuration advice for small businesses, design
                studios, and engineering teams that don't have an IT department.
            </p>

            <div className="mt-12 p-6 bg-[color:var(--color-surface-2)] rounded-2xl">
                <p className="text-sm">
                    Looking for a quote on 10+ units, or need help picking between two
                    configurations? <Link href="/contact" className="font-medium text-[color:var(--color-brand)] hover:text-[color:var(--color-accent)] underline underline-offset-4">Get in touch</Link>.
                </p>
            </div>
        </article>
    )
}
