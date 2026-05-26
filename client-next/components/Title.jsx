'use client'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

const Title = ({ title, description, visibleButton = true, href = '' }) => {
    return (
        <div className="text-center">
            <h2 className="text-3xl sm:text-4xl">{title}</h2>
            {description && (
                <div className="flex max-sm:flex-col items-center justify-center gap-x-5 gap-y-1 text-sm text-[color:var(--color-text-2)] mt-4">
                    <p className="max-w-lg">{description}</p>
                    {visibleButton && href && (
                        <Link
                            href={href}
                            className="text-[color:var(--color-brand)] hover:text-[color:var(--color-accent)] font-medium inline-flex items-center gap-1 hover:gap-2 transition-all whitespace-nowrap"
                        >
                            View more <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                    )}
                </div>
            )}
        </div>
    )
}

export default Title
