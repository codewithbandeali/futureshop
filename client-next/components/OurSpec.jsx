import { Truck, ShieldCheck, Headset, BadgeDollarSign, Recycle, Lock } from 'lucide-react'
import Title from './Title'

/**
 * Trust-signals grid. SKILLS.md §8 (Homepage checklist) calls for visible
 * delivery promise, returns policy, payment security. Six is plenty.
 */
const specs = [
    { icon: Truck, title: 'Next-day shipping', description: 'Order by 3pm for next-business-day delivery anywhere in the lower 48.' },
    { icon: ShieldCheck, title: 'Manufacturer warranty', description: 'Full Apple, Dell, HP and Samsung warranty on every order — no third-party gotchas.' },
    { icon: Headset, title: 'Real human support', description: 'Talk to someone who knows the difference between RAM and SSD. Phone, chat, email.' },
    { icon: BadgeDollarSign, title: 'Price-match guarantee', description: "Found it cheaper at an authorized reseller? We'll match within 30 days." },
    { icon: Recycle, title: '30-day returns', description: 'Change of mind, dead pixel, doesn\'t suit your workflow — send it back, no questions.' },
    { icon: Lock, title: 'Secure checkout', description: 'PCI-DSS compliant payment. We never store your card details.' },
]

const OurSpec = () => {
    return (
        <section className="px-6 my-24 max-w-7xl mx-auto">
            <Title
                visibleButton={false}
                title="Why FutureShop"
                description="A small, opinionated shop staffed by people who actually use this stuff."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
                {specs.map((spec, index) => (
                    <article
                        key={index}
                        className="relative bg-white border border-[color:var(--color-border)] rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                    >
                        <div className="size-11 flex items-center justify-center rounded-xl bg-[color:var(--color-surface-2)] text-[color:var(--color-brand)] mb-4">
                            <spec.icon size={20} aria-hidden="true" />
                        </div>
                        <h3 className="text-[color:var(--color-text-1)] font-medium">{spec.title}</h3>
                        <p className="text-sm text-[color:var(--color-text-2)] mt-2 leading-6">{spec.description}</p>
                    </article>
                ))}
            </div>
        </section>
    )
}

export default OurSpec
