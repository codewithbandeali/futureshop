'use client'
import { ArrowDown, ArrowUp, Plus, Trash2, Upload } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import toast from "react-hot-toast"
import { createProduct, updateProduct } from "@/lib/admin"

const CATEGORIES = ["laptop", "desktop", "monitor", "tablet", "printer", "scanner"]
const BRANDS = ["Apple", "Dell", "HP", "Samsung", "Other"]

export default function ProductForm({ product, onSuccess }) {
    const isEdit = !!product?.id

    const [form, setForm] = useState({
        name: product?.name ?? "",
        description: product?.description ?? "",
        price: product?.price ?? "",
        mrp: product?.mrp ?? "",
        stock: product?.stock ?? 0,
        category: product?.category ?? CATEGORIES[0],
        brand: product?.brand ?? BRANDS[0],
        sku: product?.sku ?? "",
        shipping: product?.shipping ?? true,
        video_url: product?.video_url ?? "",
    })
    // 360° frames are stored as a textarea (one URL per line) for ease
    // of bulk-pasting from Cloudinary/S3 upload tools. Submitted as
    // view_360_urls[0], view_360_urls[1], … to Laravel array validation.
    const [view360Text, setView360Text] = useState(
        Array.isArray(product?.view_360_urls) ? product.view_360_urls.join('\n') : ''
    )
    // A+ content blocks — repeater UI; submitted as aplus_blocks[N][field].
    const [aplusBlocks, setAplusBlocks] = useState(
        Array.isArray(product?.aplus_blocks) ? product.aplus_blocks : []
    )
    const addAplusBlock = (type) => {
        setAplusBlocks(prev => [...prev, { type, heading: '', body: '', image: '', caption: '' }])
    }
    const updateAplusBlock = (idx, field, value) => {
        setAplusBlocks(prev => prev.map((b, i) => i === idx ? { ...b, [field]: value } : b))
    }
    const moveAplusBlock = (idx, delta) => {
        setAplusBlocks(prev => {
            const next = [...prev]
            const target = idx + delta
            if (target < 0 || target >= next.length) return prev
            ;[next[idx], next[target]] = [next[target], next[idx]]
            return next
        })
    }
    const removeAplusBlock = (idx) => {
        setAplusBlocks(prev => prev.filter((_, i) => i !== idx))
    }
    const [thumbnail, setThumbnail] = useState(null)
    const [images, setImages] = useState([])
    const [thumbPreview, setThumbPreview] = useState(product?.images?.[0] ?? null)
    const [busy, setBusy] = useState(false)

    const set = (k) => (e) => {
        const v = e.target.type === "checkbox" ? e.target.checked : e.target.value
        setForm(f => ({ ...f, [k]: v }))
    }

    const onThumbnail = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setThumbnail(file)
        setThumbPreview(URL.createObjectURL(file))
    }

    const onImages = (e) => {
        setImages(Array.from(e.target.files || []))
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        if (busy) return
        setBusy(true)

        const fd = new FormData()
        Object.entries(form).forEach(([k, v]) => {
            if (v === "" || v === null || v === undefined) return
            // Laravel boolean validator accepts "1"/"0" and "true"/"false"
            fd.append(k, typeof v === "boolean" ? (v ? "1" : "0") : v)
        })
        if (thumbnail) fd.append("thumbnail", thumbnail)
        images.forEach((f, i) => fd.append(`images[${i}]`, f))

        // Parse 360 frame URLs — one per line, blank lines skipped.
        const frames = view360Text
            .split('\n')
            .map(s => s.trim())
            .filter(Boolean)
        frames.forEach((url, i) => fd.append(`view_360_urls[${i}]`, url))

        // Serialize A+ blocks — skip rows with no meaningful content so
        // the array stays clean.
        aplusBlocks.forEach((block, i) => {
            const meaningful =
                (block.heading || '').trim() ||
                (block.body || '').trim() ||
                (block.image || '').trim() ||
                (block.caption || '').trim()
            if (!meaningful) return
            fd.append(`aplus_blocks[${i}][type]`, block.type)
            if (block.heading) fd.append(`aplus_blocks[${i}][heading]`, block.heading)
            if (block.body) fd.append(`aplus_blocks[${i}][body]`, block.body)
            if (block.image) fd.append(`aplus_blocks[${i}][image]`, block.image)
            if (block.caption) fd.append(`aplus_blocks[${i}][caption]`, block.caption)
        })

        try {
            if (isEdit) {
                await updateProduct(product.id, fd)
                toast.success("Product updated")
            } else {
                await createProduct(fd)
                toast.success("Product created")
            }
            onSuccess?.()
        } catch (err) {
            toast.error(isEdit ? "Update failed" : "Create failed")
            console.error(err)
        } finally {
            setBusy(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1.5" htmlFor="name">Name</label>
                    <input id="name" required value={form.name} onChange={set("name")} className="form-input" />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1.5" htmlFor="description">Description</label>
                    <textarea id="description" required rows={5} value={form.description} onChange={set("description")} className="form-input" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1.5" htmlFor="price">Price (USD)</label>
                    <input id="price" type="number" step="0.01" min="0" required value={form.price} onChange={set("price")} className="form-input" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5" htmlFor="mrp">Compare-at price (MRP)</label>
                    <input id="mrp" type="number" step="0.01" min="0" value={form.mrp} onChange={set("mrp")} className="form-input"
                        placeholder="Leave blank if not on sale" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1.5" htmlFor="stock">Stock</label>
                    <input id="stock" type="number" min="0" required value={form.stock} onChange={set("stock")} className="form-input" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5" htmlFor="sku">SKU</label>
                    <input id="sku" value={form.sku} onChange={set("sku")} className="form-input" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1.5" htmlFor="category">Category</label>
                    <select id="category" value={form.category} onChange={set("category")} className="form-input">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5" htmlFor="brand">Brand</label>
                    <select id="brand" value={form.brand} onChange={set("brand")} className="form-input">
                        {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>

                <div className="md:col-span-2 flex items-center gap-2">
                    <input id="shipping" type="checkbox" checked={form.shipping} onChange={set("shipping")} />
                    <label htmlFor="shipping" className="text-sm">Eligible for free shipping over $50</label>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1.5" htmlFor="video_url">
                        Product video URL
                    </label>
                    <input
                        id="video_url"
                        type="url"
                        value={form.video_url}
                        onChange={set("video_url")}
                        placeholder="https://youtu.be/… or https://vimeo.com/… or direct .mp4 URL"
                        className="form-input"
                    />
                    <p className="text-xs text-[color:var(--color-text-3)] mt-1">
                        YouTube, Vimeo, or any direct MP4/WebM URL. Shown as a "Video" tab on the product page.
                    </p>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1.5" htmlFor="view_360">
                        360&deg; frame URLs
                    </label>
                    <textarea
                        id="view_360"
                        rows={6}
                        value={view360Text}
                        onChange={(e) => setView360Text(e.target.value)}
                        placeholder={"One URL per line, in rotation order.\nhttps://res.cloudinary.com/.../frame-01.jpg\nhttps://res.cloudinary.com/.../frame-02.jpg\nhttps://res.cloudinary.com/.../frame-03.jpg\n…"}
                        className="form-input font-mono text-xs"
                    />
                    <p className="text-xs text-[color:var(--color-text-3)] mt-1">
                        Upload 24-72 sequential frames to Cloudinary (or any host), paste their URLs here in rotation order. The PDP will show a 360&deg; toggle when at least 2 frames are present.
                    </p>
                </div>
            </div>

            {/* A+ content blocks — Amazon-style enhanced PDP sections */}
            <div className="border-t border-[color:var(--color-border)] pt-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg">A+ content blocks</h2>
                        <p className="text-xs text-[color:var(--color-text-3)] mt-0.5">
                            Rich sections shown under the Description tab. Pick a block type, fill the fields, drag-order with the arrows.
                        </p>
                    </div>
                </div>

                {aplusBlocks.length > 0 && (
                    <ul className="space-y-3 mb-4">
                        {aplusBlocks.map((block, idx) => (
                            <li key={idx} className="bg-white border border-[color:var(--color-border)] rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs uppercase tracking-[0.1em] px-2 py-0.5 rounded-full bg-[color:var(--color-surface-2)] text-[color:var(--color-brand)] font-medium">
                                            {block.type}
                                        </span>
                                        <span className="text-xs text-[color:var(--color-text-3)]">Block {idx + 1}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button type="button" onClick={() => moveAplusBlock(idx, -1)} disabled={idx === 0}
                                            aria-label="Move up"
                                            className="p-1.5 rounded text-[color:var(--color-text-3)] hover:text-[color:var(--color-text-1)] disabled:opacity-30">
                                            <ArrowUp size={14} />
                                        </button>
                                        <button type="button" onClick={() => moveAplusBlock(idx, 1)} disabled={idx === aplusBlocks.length - 1}
                                            aria-label="Move down"
                                            className="p-1.5 rounded text-[color:var(--color-text-3)] hover:text-[color:var(--color-text-1)] disabled:opacity-30">
                                            <ArrowDown size={14} />
                                        </button>
                                        <button type="button" onClick={() => removeAplusBlock(idx)}
                                            aria-label="Remove block"
                                            className="p-1.5 rounded text-[color:var(--color-text-3)] hover:text-[color:var(--color-accent)]">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {block.type !== 'image' && (
                                        <input
                                            type="text"
                                            placeholder="Heading"
                                            value={block.heading || ''}
                                            onChange={(e) => updateAplusBlock(idx, 'heading', e.target.value)}
                                            className="form-input sm:col-span-2"
                                        />
                                    )}
                                    {block.type !== 'image' && block.type !== 'callout' && (
                                        <input
                                            type="url"
                                            placeholder="Image URL (optional for hero/feature)"
                                            value={block.image || ''}
                                            onChange={(e) => updateAplusBlock(idx, 'image', e.target.value)}
                                            className="form-input sm:col-span-2 text-xs font-mono"
                                        />
                                    )}
                                    {block.type === 'image' && (
                                        <>
                                            <input
                                                type="url"
                                                placeholder="Image URL"
                                                value={block.image || ''}
                                                onChange={(e) => updateAplusBlock(idx, 'image', e.target.value)}
                                                className="form-input sm:col-span-2 text-xs font-mono"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Caption"
                                                value={block.caption || ''}
                                                onChange={(e) => updateAplusBlock(idx, 'caption', e.target.value)}
                                                className="form-input sm:col-span-2"
                                            />
                                        </>
                                    )}
                                    {block.type !== 'image' && (
                                        <textarea
                                            placeholder="Body copy"
                                            rows={3}
                                            value={block.body || ''}
                                            onChange={(e) => updateAplusBlock(idx, 'body', e.target.value)}
                                            className="form-input sm:col-span-2"
                                        />
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="flex flex-wrap gap-2">
                    {[
                        { type: 'hero', label: 'Hero (image background + headline)' },
                        { type: 'feature', label: 'Feature (image + text side-by-side)' },
                        { type: 'callout', label: 'Callout (text only, centered)' },
                        { type: 'image', label: 'Image (full-width with caption)' },
                    ].map(opt => (
                        <button
                            key={opt.type}
                            type="button"
                            onClick={() => addAplusBlock(opt.type)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-[color:var(--color-border)] rounded-md hover:border-[color:var(--color-brand)] hover:text-[color:var(--color-brand)] transition"
                        >
                            <Plus size={12} />
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="border-t border-[color:var(--color-border)] pt-6">
                <h2 className="text-lg mb-4">Images</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm font-medium mb-2">Thumbnail (main image)</p>
                        <label className="block cursor-pointer group">
                            <div className="aspect-square bg-[color:var(--color-surface-2)] border-2 border-dashed border-[color:var(--color-border)] rounded-lg flex items-center justify-center overflow-hidden hover:border-[color:var(--color-brand)] transition">
                                {thumbPreview ? (
                                    <Image src={thumbPreview} alt="" width={300} height={300} className="object-contain w-full h-full p-4" />
                                ) : (
                                    <div className="text-center text-[color:var(--color-text-3)] p-6">
                                        <Upload size={24} className="mx-auto mb-2" />
                                        <p className="text-xs">Click to upload</p>
                                        <p className="text-xs mt-1">PNG or JPG, up to 5 MB</p>
                                    </div>
                                )}
                            </div>
                            <input type="file" accept="image/*" onChange={onThumbnail} className="sr-only" />
                        </label>
                    </div>

                    <div>
                        <p className="text-sm font-medium mb-2">Additional gallery images</p>
                        <label className="block cursor-pointer">
                            <div className="aspect-square bg-[color:var(--color-surface-2)] border-2 border-dashed border-[color:var(--color-border)] rounded-lg flex flex-col items-center justify-center text-center text-[color:var(--color-text-3)] p-6 hover:border-[color:var(--color-brand)] transition">
                                <Upload size={24} className="mb-2" />
                                <p className="text-xs">
                                    {images.length > 0 ? `${images.length} file${images.length > 1 ? "s" : ""} selected` : "Click to add images"}
                                </p>
                                <p className="text-xs mt-1">Up to 5 MB each</p>
                            </div>
                            <input type="file" accept="image/*" multiple onChange={onImages} className="sr-only" />
                        </label>
                    </div>
                </div>
                {isEdit && (
                    <p className="text-xs text-[color:var(--color-text-3)] mt-3">
                        New uploads are added to the gallery. Existing images are not affected.
                    </p>
                )}
            </div>

            <div className="flex items-center gap-3 pt-2">
                <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
                    {busy ? "Saving…" : (isEdit ? "Save changes" : "Create product")}
                </button>
            </div>
        </form>
    )
}
