'use client'
import { ArrowRight, ShieldCheck, Truck, Headset } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import CategoriesMarquee from './CategoriesMarquee'

/**
 * Hero — SKILLS.md §5.2 Pattern C (text-led).
 * Workhorse tone for a computer-hardware shop: emphasize reliability,
 * support, business-grade kit over fashion.
 */
const Hero = () => {
    return (
        <section className="bg-[color:var(--color-surface)]">
            <div className="max-w-7xl mx-auto px-6 py-20 sm:py-24 lg:py-32 text-center">
                <p className="text-xs uppercase tracking-[0.15em] text-[color:var(--color-text-2)] mb-5">
                    Computers &middot; printers &middot; monitors
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl max-w-3xl mx-auto leading-[1.1]">
                    Computing built for work.
                </h1>
                <p className="text-[color:var(--color-text-2)] max-w-xl mx-auto mt-6 text-base sm:text-lg">
                    Business-grade laptops, desktops, and peripherals from Dell, HP, Apple, and Samsung &mdash; specced by people who actually use them.
                </p>
                <div className="mt-10 flex flex-wrap justify-center gap-3">
                    <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
                        Shop hardware
                        <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                    <Link href="/shop?category=laptop" className="btn-secondary">
                        Laptops
                    </Link>
                </div>

                {/* Trust signals tuned for B2B/SMB tech buyers */}
                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mt-14 text-sm">
                    <li className="flex items-center justify-center gap-2 text-[color:var(--color-text-2)]">
                        <Truck size={16} aria-hidden="true" />
                        Next-business-day shipping
                    </li>
                    <li className="flex items-center justify-center gap-2 text-[color:var(--color-text-2)]">
                        <ShieldCheck size={16} aria-hidden="true" />
                        Manufacturer warranty + 30-day returns
                    </li>
                    <li className="flex items-center justify-center gap-2 text-[color:var(--color-text-2)]">
                        <Headset size={16} aria-hidden="true" />
                        Real human support
                    </li>
                </ul>
            </div>

            <CategoriesMarquee />
        </section>
    )
}

export default Hero
