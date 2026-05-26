/**
 * Admin API helpers — small wrappers around lib/api.js. Centralized so we
 * can swap to a real "admin namespace" later (e.g. /api/admin/products) by
 * editing one file instead of every page.
 */
import { apiGet, apiDelete } from "@/lib/api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/backend"

const tokenHeaders = () => {
    const h = { Accept: "application/json" }
    if (typeof window !== "undefined") {
        const t = window.localStorage.getItem("auth_token")
        if (t) h.Authorization = `Bearer ${t}`
    }
    return h
}

const unwrap = (res) => (res && Array.isArray(res.data) ? res.data : res?.data ?? res)

export async function listProducts() {
    const res = await apiGet("/api/products")
    return unwrap(res) || []
}

export async function deleteProduct(id) {
    return apiDelete(`/api/products/${id}`)
}

export async function listOrders() {
    // Admin uses /api/admin/orders for shop-wide view; falls back to /api/orders
    // for the customer-scoped flow if the admin endpoint is denied.
    try {
        const res = await apiGet("/api/admin/orders")
        return unwrap(res) || []
    } catch {
        const res = await apiGet("/api/orders")
        return unwrap(res) || []
    }
}

export async function updateOrderStatus(orderId, status) {
    const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
            ...tokenHeaders(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
    })
    if (!res.ok) throw new Error(`updateOrderStatus ${res.status}`)
    return res.json()
}

export async function listCustomers() {
    const res = await apiGet("/api/admin/customers")
    return unwrap(res) || []
}

/**
 * Multipart upload — fetch directly (not the JSON helper) because we send
 * FormData with files. Token still flows via Authorization header.
 */
export async function createProduct(formData) {
    const res = await fetch(`${API_BASE}/api/products`, {
        method: "POST",
        headers: tokenHeaders(),
        body: formData,
    })
    if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(`createProduct ${res.status}: ${body}`)
    }
    return res.json()
}

export async function updateProduct(id, formData) {
    // Laravel needs _method=PUT for multipart updates.
    formData.append("_method", "PUT")
    const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: "POST",
        headers: tokenHeaders(),
        body: formData,
    })
    if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(`updateProduct ${res.status}: ${body}`)
    }
    return res.json()
}
