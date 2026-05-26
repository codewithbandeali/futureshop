'use client'
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import { apiGet } from "@/lib/api"
import ProductForm from "../../ProductForm"

export default function EditProduct() {
    const router = useRouter()
    const { id } = useParams()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        apiGet(`/api/products/${id}`)
            .then(res => setProduct(res?.data ?? res))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return <Loading />
    if (!product) {
        return (
            <div className="pb-16">
                <h1 className="text-2xl">Product not found</h1>
                <Link href="/admin/products" className="btn-primary mt-6 inline-flex">Back to products</Link>
            </div>
        )
    }

    return (
        <div className="pb-16 max-w-3xl">
            <div className="mb-6">
                <Link href="/admin/products" className="text-sm text-[color:var(--color-text-2)] hover:text-[color:var(--color-brand)]">
                    ← Back to products
                </Link>
                <h1 className="text-2xl mt-2">Edit · {product.name}</h1>
            </div>
            <ProductForm
                product={product}
                onSuccess={() => router.push("/admin/products")}
            />
        </div>
    )
}
