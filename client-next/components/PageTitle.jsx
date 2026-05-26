'use client'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

const PageTitle = ({ heading, text, path = "/", linkText }) => {
    return (
        <header className="my-6">
            <h1 className="text-2xl sm:text-3xl">{heading}</h1>
            <div className="flex items-center gap-3 mt-2">
                {text && <p className="text-[color:var(--color-text-2)] text-sm">{text}</p>}
                {linkText && (
                    <Link
                        href={path}
                        className="flex items-center gap-1 text-[color:var(--color-brand)] hover:text-[color:var(--color-accent)] text-sm hover:gap-2 transition-all"
                    >
                        {linkText} <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                )}
            </div>
        </header>
    )
}

export default PageTitle
