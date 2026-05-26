'use client'
import { Upload } from "lucide-react"
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
    })
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
