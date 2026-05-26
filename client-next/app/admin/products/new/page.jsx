'use client'
import Link from "next/link"
import { useRouter } from "next/navigation"
import ProductForm from "../ProductForm"

export default function NewProduct() {
    const router = useRouter()
    return (
        <div className="pb-16 max-w-3xl">
            <div className="mb-6">
                <Link href="/admin/products" className="text-sm text-[color:var(--color-text-2)] hover:text-[color:var(--color-brand)]">
                    ← Back to products
                </Link>
                <h1 className="text-2xl mt-2">New product</h1>
            </div>
            <ProductForm
                onSuccess={() => router.push("/admin/products")}
            />
        </div>
    )
}
