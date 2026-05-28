'use client'

import { Camera, Star, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/backend'

const RatingModal = ({ ratingModal, setRatingModal }) => {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [review, setReview] = useState('')
    const [photos, setPhotos] = useState([])
    const [busy, setBusy] = useState(false)
    const photoInput = useRef(null)

    // ESC to close — SKILLS.md §11 accessibility
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') setRatingModal(null) }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [setRatingModal])

    const onPickPhotos = (e) => {
        const next = Array.from(e.target.files || [])
        // Cap at 5 — server validation matches.
        setPhotos(prev => [...prev, ...next].slice(0, 5))
    }
    const removePhoto = (i) => {
        setPhotos(prev => prev.filter((_, idx) => idx !== i))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (rating < 1) {
            toast.error('Pick a rating from 1 to 5')
            return
        }
        if (busy) return
        setBusy(true)

        // Multipart submit so the server can accept the photos[] files. We
        // don't go through apiPost (which does JSON) — direct fetch keeps
        // the bearer header but lets the browser set the boundary.
        const fd = new FormData()
        fd.append('rating', String(rating))
        if (review.trim()) fd.append('review', review.trim())
        photos.forEach((file, i) => fd.append(`photos[${i}]`, file))

        const headers = { Accept: 'application/json' }
        if (typeof window !== 'undefined') {
            const token = window.localStorage.getItem('auth_token')
            if (token) headers.Authorization = `Bearer ${token}`
        }

        try {
            const res = await fetch(`${API_BASE}/api/products/${ratingModal.productId}/ratings`, {
                method: 'POST',
                headers,
                body: fd,
            })
            if (!res.ok) throw new Error(`Review POST ${res.status}`)
            toast.success('Review posted')
            setRatingModal(null)
        } catch (err) {
            console.error(err)
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
                className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md relative max-h-[90vh] overflow-y-auto"
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

                <label className="block text-sm font-medium mb-1.5" htmlFor="review-text">Review</label>
                <textarea
                    id="review-text"
                    className="form-input"
                    placeholder="What did you like or want to warn other buyers about?"
                    rows={4}
                    maxLength={2000}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                />

                <div className="mt-4">
                    <p className="block text-sm font-medium mb-1.5">Photos (optional)</p>
                    <div className="flex flex-wrap gap-2">
                        {photos.map((file, i) => (
                            <div key={i} className="relative size-16 rounded-lg overflow-hidden bg-[color:var(--color-surface-2)]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removePhoto(i)}
                                    aria-label="Remove photo"
                                    className="absolute top-0.5 right-0.5 size-5 rounded-full bg-black/70 text-white flex items-center justify-center"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        ))}
                        {photos.length < 5 && (
                            <button
                                type="button"
                                onClick={() => photoInput.current?.click()}
                                className="size-16 border-2 border-dashed border-[color:var(--color-border)] rounded-lg flex items-center justify-center text-[color:var(--color-text-3)] hover:border-[color:var(--color-brand)] hover:text-[color:var(--color-brand)] transition"
                            >
                                <Camera size={18} />
                            </button>
                        )}
                    </div>
                    <input
                        ref={photoInput}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={onPickPhotos}
                        className="sr-only"
                    />
                    <p className="text-xs text-[color:var(--color-text-3)] mt-1.5">
                        Up to 5 photos · 5 MB each
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={busy || rating < 1}
                    className="btn-primary w-full mt-5 disabled:opacity-60"
                >
                    {busy ? 'Posting…' : 'Submit review'}
                </button>
            </form>
        </div>
    )
}

export default RatingModal
