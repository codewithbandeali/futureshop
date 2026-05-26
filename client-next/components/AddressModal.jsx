'use client'

import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { apiPost } from '@/lib/api'
import { addAddress } from '@/lib/features/address/addressSlice'

const empty = {
    full_name: '', phone: '', line1: '', line2: '',
    city: '', state: '', postal_code: '', country: 'US',
}

const AddressModal = ({ setShowAddressModal, onCreated }) => {
    const dispatch = useDispatch()
    const [form, setForm] = useState(empty)
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') setShowAddressModal(false) }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [setShowAddressModal])

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (busy) return
        setBusy(true)
        try {
            const created = await apiPost('/api/address', { ...form, is_default: false })
            dispatch(addAddress(created))
            toast.success('Address saved')
            onCreated?.(created)
            setShowAddressModal(false)
        } catch {
            toast.error("Couldn't save address")
        } finally {
            setBusy(false)
        }
    }

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="address-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
            onClick={(e) => { if (e.target === e.currentTarget) setShowAddressModal(false) }}
        >
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md relative"
            >
                <button
                    type="button"
                    aria-label="Close"
                    onClick={() => setShowAddressModal(false)}
                    className="absolute top-3 right-3 p-2 text-[color:var(--color-text-3)] hover:text-[color:var(--color-text-1)]"
                >
                    <X size={20} />
                </button>
                <h2 id="address-modal-title" className="text-xl">Add a new address</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                    <input className="form-input" placeholder="Full name" required value={form.full_name} onChange={set('full_name')} />
                    <input className="form-input" placeholder="Phone" required value={form.phone} onChange={set('phone')} />
                </div>
                <input className="form-input mt-3" placeholder="Address line 1" required value={form.line1} onChange={set('line1')} />
                <input className="form-input mt-3" placeholder="Address line 2 (optional)" value={form.line2} onChange={set('line2')} />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                    <input className="form-input sm:col-span-2" placeholder="City" required value={form.city} onChange={set('city')} />
                    <input className="form-input" placeholder="State" value={form.state} onChange={set('state')} />
                    <input className="form-input" placeholder="ZIP" required value={form.postal_code} onChange={set('postal_code')} />
                </div>
                <input
                    className="form-input mt-3"
                    placeholder="Country (2 letters)"
                    maxLength={2}
                    value={form.country}
                    onChange={(e) => setForm(f => ({ ...f, country: e.target.value.toUpperCase() }))}
                />

                <button type="submit" disabled={busy} className="btn-primary w-full mt-5 disabled:opacity-60">
                    {busy ? 'Saving…' : 'Save address'}
                </button>
            </form>
        </div>
    )
}

export default AddressModal
