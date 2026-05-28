import { Compass } from "lucide-react"
import Link from "next/link"

export const metadata = {
    title: "Page not found",
}

export default function NotFound() {
    return (
        <div className="min-h-[60vh] mx-6 my-16 flex flex-col items-center justify-center text-center">
            <Compass size={56} className="text-[color:var(--color-text-3)]" strokeWidth={1.5} />
            <p className="text-xs uppercase tracking-[0.15em] text-[color:var(--color-text-3)] mt-6">404</p>
            <h1 className="text-4xl mt-2">This page wandered off.</h1>
            <p className="text-[color:var(--color-text-2)] mt-3 max-w-md">
                We couldn't find what you were looking for. The link might be old or
                the product might have sold out.
            </p>
            <div className="flex gap-3 mt-8">
                <Link href="/" className="btn-secondary">Back home</Link>
                <Link href="/shop" className="btn-primary">Browse the catalog</Link>
            </div>
        </div>
    )
}
