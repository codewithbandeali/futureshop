'use client'

import { Star, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { apiPost } from '@/lib/api'

const RatingModal = ({ ratingModal, setRatingModal }) => {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [review, setReview] = useState('')
    const [busy, setBusy] = useState(false)

    // Close on Escape — SKILLS.md §11 accessibility
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') setRatingModal(null) }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [setRatingModal])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (rating < 1) {
            toast.error('Pick a rating from 1 to 5')
            return
        }
        if (busy) return
        setBusy(true)
        try {
            await apiPost(`/api/products/${ratingModal.productId}/ratings`, {
                rating,
                review: review.trim() || null,
            })
            toast.success('Review posted')
            setRatingModal(null)
        } catch {
            toast.error('Could not save review')
        } finally {
            setBusy(false)
        }
    }

    const shown = hoverRating || rating

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="rating-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
            onClick={(e) => { if (e.target === e.currentTarget) setRatingModal(null) }}
        >
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md relative"
            >
                <button
                    type="button"
                    aria-label="Close"
                    onClick={() => setRatingModal(null)}
                    className="absolute top-3 right-3 p-2 text-[color:var(--color-text-3)] hover:text-[color:var(--color-text-1)]"
                >
                    <X size={20} />
                </button>
                <h2 id="rating-modal-title" className="text-xl">Rate this product</h2>
                <p className="text-sm text-[color:var(--color-text-2)] mt-1">
                    Your review helps other shoppers decide.
                </p>

                <div className="flex items-center justify-center gap-1 my-6">
                    {[1, 2, 3, 4, 5].map(n => (
                        <button
                            key={n}
                            type="button"
                            aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
                            onMouseEnter={() => setHoverRating(n)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(n)}
                            className="p-1"
                        >
                            <Star
                                size={32}
                                fill={shown >= n ? 'var(--color-warning)' : 'transparent'}
                                className={shown >= n ? 'text-[color:var(--color-warning)]' : 'text-[color:var(--color-text-3)]'}
                            />
                        </button>
                    ))}
                </div>

                <textarea
                    className="form-input"
                    placeholder="Write your review (optional)"
                    rows={4}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                />

                <button
                    type="submit"
                    disabled={busy || rating < 1}
                    className="btn-primary w-full mt-4 disabled:opacity-60"
                >
                    {busy ? 'Posting…' : 'Submit review'}
                </button>
            </form>
        </div>
    )
}

export default RatingModal
