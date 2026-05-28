'use client'

import { MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { apiGet, apiPost } from '@/lib/api'
import { isLoggedIn } from '@/lib/auth'
import { formatDate } from '@/lib/format'

/**
 * Product Q&A list + ask-a-question form. Reads /api/products/{id}/questions
 * on mount and reflects new questions optimistically. Unauthenticated
 * shoppers see a "Sign in to ask" prompt instead of the form.
 */
const ProductQA = ({ productId }) => {
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [text, setText] = useState('')
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        let cancelled = false
        apiGet(`/api/products/${productId}/questions`)
            .then(res => {
                if (cancelled) return
                const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
                setQuestions(list)
            })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [productId])

    const submit = async (e) => {
        e.preventDefault()
        const q = text.trim()
        if (q.length < 8) {
            toast.error('Please ask a more specific question (8+ characters).')
            return
        }
        setBusy(true)
        // Optimistic: prepend immediately
        const tempId = `temp-${Date.now()}`
        const optimistic = {
            id: tempId,
            author_name: 'You',
            question: q,
            answer: null,
            created_at: new Date().toISOString(),
        }
        setQuestions(prev => [optimistic, ...prev])
        setText('')
        try {
            const saved = await apiPost(`/api/products/${productId}/questions`, { question: q })
            setQuestions(prev => prev.map(x => x.id === tempId ? saved : x))
            toast.success("Question submitted. We'll answer shortly.")
        } catch {
            setQuestions(prev => prev.filter(x => x.id !== tempId))
            toast.error("Couldn't submit. Try again later.")
        } finally {
            setBusy(false)
        }
    }

    const loggedIn = isLoggedIn()
    const answered = questions.filter(q => q.answer).length

    return (
        <div className="max-w-3xl">
            <div className="flex items-baseline justify-between mb-5">
                <p className="text-sm text-[color:var(--color-text-2)]">
                    {questions.length} question{questions.length !== 1 ? 's' : ''}
                    {answered > 0 && <> · {answered} answered</>}
                </p>
            </div>

            {/* Ask form */}
            {loggedIn ? (
                <form onSubmit={submit} className="bg-white border border-[color:var(--color-border)] rounded-2xl p-4 mb-8">
                    <label htmlFor="qa-input" className="block text-sm font-medium mb-2">
                        Ask a question
                    </label>
                    <textarea
                        id="qa-input"
                        rows={3}
                        maxLength={1000}
                        placeholder="e.g. Does this monitor work with the Mac mini via USB-C?"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="form-input"
                    />
                    <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-[color:var(--color-text-3)]">
                            {text.length}/1000
                        </p>
                        <button
                            type="submit"
                            disabled={busy || text.trim().length < 8}
                            className="btn-primary disabled:opacity-60"
                        >
                            {busy ? 'Submitting…' : 'Ask question'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)] rounded-2xl p-4 mb-8 text-sm">
                    <a href="/login" className="text-[color:var(--color-brand)] font-medium hover:text-[color:var(--color-accent)] underline underline-offset-4">
                        Sign in
                    </a>{' '}
                    to ask a question about this product.
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2].map(i => (
                        <div key={i} className="skeleton h-20 rounded-2xl" />
                    ))}
                </div>
            ) : questions.length === 0 ? (
                <div className="text-center py-12 bg-white border border-[color:var(--color-border)] rounded-2xl">
                    <MessageCircle size={36} className="mx-auto text-[color:var(--color-text-3)]" strokeWidth={1.5} />
                    <p className="text-[color:var(--color-text-2)] mt-3">
                        No questions yet. Be the first to ask.
                    </p>
                </div>
            ) : (
                <ul className="space-y-4">
                    {questions.map(q => (
                        <li key={q.id} className="bg-white border border-[color:var(--color-border)] rounded-2xl p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-xs text-[color:var(--color-text-3)] uppercase tracking-[0.1em]">
                                        Q · {q.author_name}
                                    </p>
                                    <p className="text-sm text-[color:var(--color-text-1)] mt-1.5 leading-6">
                                        {q.question}
                                    </p>
                                </div>
                                <p className="text-xs text-[color:var(--color-text-3)] whitespace-nowrap">
                                    {formatDate(q.created_at)}
                                </p>
                            </div>
                            {q.answer ? (
                                <div className="mt-4 pt-4 border-t border-[color:var(--color-border)]">
                                    <p className="text-xs text-[color:var(--color-text-3)] uppercase tracking-[0.1em] flex items-center gap-1">
                                        <MessageCircle size={11} /> Answered by FutureShop
                                        {q.answered_at && <span className="font-normal normal-case text-[color:var(--color-text-3)] ml-2">
                                            · {formatDate(q.answered_at)}
                                        </span>}
                                    </p>
                                    <p className="text-sm text-[color:var(--color-text-1)] mt-1.5 leading-6">
                                        {q.answer}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-xs text-[color:var(--color-text-3)] mt-3 italic">
                                    Awaiting answer.
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default ProductQA
