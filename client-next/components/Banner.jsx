'use client'
import { X } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Banner() {
    const [isOpen, setIsOpen] = useState(true)

    const handleClaim = async () => {
        try {
            await navigator.clipboard.writeText('NEW20')
            toast.success('Code NEW20 copied to clipboard')
        } catch {
            toast.success('Use code NEW20 at checkout')
        }
        setIsOpen(false)
    }

    if (!isOpen) return null

    return (
        <div className="w-full px-6 py-2 text-sm text-white text-center bg-[color:var(--color-brand)]">
            <div className="flex items-center justify-between max-w-7xl mx-auto gap-4">
                <p className="flex-1 sm:flex-none">
                    <span className="font-semibold text-[color:var(--color-accent)]">20% OFF</span>
                    <span className="ml-2">your first order — use code NEW20</span>
                </p>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleClaim}
                        className="font-medium bg-white text-[color:var(--color-brand)] px-5 py-1.5 rounded-full text-xs hover:bg-[color:var(--color-surface-2)] transition max-sm:hidden"
                    >
                        Copy code
                    </button>
                    <button
                        type="button"
                        aria-label="Dismiss promotional banner"
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-white/10 rounded transition"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
        </div>
    )
}
