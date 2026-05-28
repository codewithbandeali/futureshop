'use client'

import { Inbox, Mail, MailOpen, Reply, Trash2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import Loading from "@/components/Loading"
import {
    adminDeleteContactMessage,
    adminListContactMessages,
    adminUpdateContactMessage,
} from "@/lib/admin"
import { formatDate } from "@/lib/format"

/**
 * Admin contact-form inbox. Rows are the durable record of every customer
 * submission; the mail provider is best-effort. The list is the source of truth
 * if delivery ever silently fails.
 */
export default function AdminMessagesPage() {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [selectedId, setSelectedId] = useState(null)
    const [busyId, setBusyId] = useState(null)

    const refresh = (which = filter) =>
        adminListContactMessages({ unread: which === 'unread' })
            .then(rows => {
                setMessages(rows)
                if (rows.length && (selectedId == null || !rows.find(r => r.id === selectedId))) {
                    setSelectedId(rows[0].id)
                }
                if (!rows.length) setSelectedId(null)
            })
            .catch(err => {
                console.error(err)
                toast.error("Couldn't load messages.")
            })
            .finally(() => setLoading(false))

    useEffect(() => {
        setLoading(true)
        refresh(filter)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter])

    const selected = useMemo(
        () => messages.find(m => m.id === selectedId) || null,
        [messages, selectedId]
    )

    const unreadCount = useMemo(
        () => messages.filter(m => !m.read_at).length,
        [messages]
    )

    const patch = async (id, body) => {
        setBusyId(id)
        try {
            const updated = await adminUpdateContactMessage(id, body)
            setMessages(prev => prev.map(m => (m.id === id ? { ...m, ...updated } : m)))
        } catch {
            toast.error("Couldn't update.")
        } finally {
            setBusyId(null)
        }
    }

    const onSelect = (m) => {
        setSelectedId(m.id)
        if (!m.read_at) patch(m.id, { read: true })
    }

    const onToggleRead = (m) => patch(m.id, { read: !m.read_at })
    const onToggleReplied = (m) => patch(m.id, { replied: !m.replied_at })

    const onDelete = async (m) => {
        if (!confirm(`Delete message from ${m.name}?`)) return
        setBusyId(m.id)
        try {
            await adminDeleteContactMessage(m.id)
            setMessages(prev => prev.filter(x => x.id !== m.id))
            if (selectedId === m.id) setSelectedId(null)
            toast.success("Deleted")
        } catch {
            toast.error("Couldn't delete.")
        } finally {
            setBusyId(null)
        }
    }

    if (loading) return <Loading />

    return (
        <div className="pb-16">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl">Messages</h1>
                    <p className="text-[color:var(--color-text-2)] mt-1">
                        {messages.length} {filter === 'unread' ? 'unread' : 'total'}
                        {filter === 'all' && unreadCount > 0 && (
                            <span className="ml-2 text-[color:var(--color-accent)] font-medium">
                                {unreadCount} unread
                            </span>
                        )}
                    </p>
                </div>
                <div className="inline-flex rounded-lg border border-[color:var(--color-border)] bg-white text-sm overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 transition ${
                            filter === 'all'
                                ? 'bg-[color:var(--color-surface-2)] text-[color:var(--color-brand)] font-medium'
                                : 'text-[color:var(--color-text-2)] hover:bg-[color:var(--color-surface-2)]'
                        }`}
                    >
                        All
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter('unread')}
                        className={`px-3 py-1.5 border-l border-[color:var(--color-border)] transition ${
                            filter === 'unread'
                                ? 'bg-[color:var(--color-surface-2)] text-[color:var(--color-brand)] font-medium'
                                : 'text-[color:var(--color-text-2)] hover:bg-[color:var(--color-surface-2)]'
                        }`}
                    >
                        Unread
                    </button>
                </div>
            </div>

            {messages.length === 0 ? (
                <div className="bg-white border border-[color:var(--color-border)] rounded-xl mt-6 text-center py-20">
                    <Inbox size={32} className="mx-auto text-[color:var(--color-text-3)]" />
                    <p className="text-[color:var(--color-text-2)] mt-3">
                        {filter === 'unread' ? 'No unread messages.' : 'No messages yet.'}
                    </p>
                </div>
            ) : (
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
                    {/* Mailbox list */}
                    <ul className="bg-white border border-[color:var(--color-border)] rounded-xl overflow-hidden divide-y divide-[color:var(--color-border)] max-h-[70vh] overflow-y-auto">
                        {messages.map(m => {
                            const isSelected = m.id === selectedId
                            const unread = !m.read_at
                            return (
                                <li key={m.id}>
                                    <button
                                        type="button"
                                        onClick={() => onSelect(m)}
                                        className={`w-full text-left px-4 py-3 transition flex flex-col gap-1 ${
                                            isSelected
                                                ? 'bg-[color:var(--color-surface-2)]'
                                                : 'hover:bg-[color:var(--color-surface)]'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className={`truncate text-sm ${unread ? 'font-semibold text-[color:var(--color-text-1)]' : 'text-[color:var(--color-text-2)]'}`}>
                                                {m.name}
                                            </span>
                                            <span className="text-xs text-[color:var(--color-text-3)] shrink-0">
                                                {formatDate(m.created_at)}
                                            </span>
                                        </div>
                                        <p className={`text-sm truncate ${unread ? 'text-[color:var(--color-text-1)]' : 'text-[color:var(--color-text-2)]'}`}>
                                            {m.subject}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs">
                                            {unread && (
                                                <span className="inline-flex items-center gap-1 text-[color:var(--color-accent)] font-medium">
                                                    <span className="size-1.5 rounded-full bg-[color:var(--color-accent)]" />
                                                    New
                                                </span>
                                            )}
                                            {m.replied_at && (
                                                <span className="inline-flex items-center gap-1 text-emerald-700">
                                                    <Reply size={12} /> Replied
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>

                    {/* Reading pane */}
                    {selected ? (
                        <article className="bg-white border border-[color:var(--color-border)] rounded-xl p-6">
                            <header className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-[color:var(--color-border)]">
                                <div className="min-w-0">
                                    <h2 className="text-xl break-words">{selected.subject}</h2>
                                    <p className="text-sm text-[color:var(--color-text-2)] mt-1 break-words">
                                        <span className="font-medium text-[color:var(--color-text-1)]">{selected.name}</span>{' '}
                                        <a
                                            href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                                            className="text-[color:var(--color-brand)] hover:underline"
                                        >
                                            &lt;{selected.email}&gt;
                                        </a>
                                    </p>
                                    <p className="text-xs text-[color:var(--color-text-3)] mt-1">
                                        {formatDate(selected.created_at)}
                                        {selected.ip ? ` from ${selected.ip}` : ''}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <a
                                        href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}&body=${encodeURIComponent('\n\n---\nOn ' + (selected.created_at || '') + ', ' + selected.name + ' wrote:\n\n' + (selected.message || '').split('\n').map(l => '> ' + l).join('\n'))}`}
                                        className="btn-primary inline-flex items-center gap-2"
                                        onClick={() => { if (!selected.replied_at) onToggleReplied(selected) }}
                                    >
                                        <Reply size={14} /> Reply
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => onToggleRead(selected)}
                                        disabled={busyId === selected.id}
                                        title={selected.read_at ? 'Mark unread' : 'Mark read'}
                                        className="p-2 rounded-lg border border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-2)] text-[color:var(--color-text-2)] disabled:opacity-50"
                                    >
                                        {selected.read_at ? <Mail size={16} /> : <MailOpen size={16} />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(selected)}
                                        disabled={busyId === selected.id}
                                        title="Delete"
                                        className="p-2 rounded-lg border border-[color:var(--color-border)] hover:bg-[color:var(--color-accent-soft)] text-[color:var(--color-text-2)] hover:text-[color:var(--color-accent)] disabled:opacity-50"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </header>

                            <pre className="mt-5 whitespace-pre-wrap break-words font-sans text-[15px] leading-relaxed text-[color:var(--color-text-1)]">
{selected.message}
                            </pre>

                            <footer className="mt-6 pt-4 border-t border-[color:var(--color-border)] flex items-center gap-3 text-xs text-[color:var(--color-text-3)] flex-wrap">
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={!!selected.replied_at}
                                        onChange={() => onToggleReplied(selected)}
                                        disabled={busyId === selected.id}
                                    />
                                    Marked as replied
                                </label>
                                {selected.user_agent && (
                                    <span className="truncate max-w-md" title={selected.user_agent}>
                                        UA: {selected.user_agent}
                                    </span>
                                )}
                            </footer>
                        </article>
                    ) : (
                        <div className="bg-white border border-[color:var(--color-border)] rounded-xl flex items-center justify-center text-center py-20 text-[color:var(--color-text-2)]">
                            Select a message to read it.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
