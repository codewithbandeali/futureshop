'use client'

import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { apiGet } from "@/lib/api"
import { setProduct } from "@/lib/features/product/productSlice"
import { setAddresses } from "@/lib/features/address/addressSlice"

// Laravel API Resources wrap collection responses in { data: [...] }.
// Unwrap once here so slices stay shape-agnostic.
const unwrap = (res) => (res && Array.isArray(res.data) ? res.data : res)

export default function DataInitializer() {
    const dispatch = useDispatch()

    useEffect(() => {
        const load = async () => {
            // Products are public; addresses require auth — call separately
            // so an unauthenticated visitor still sees the catalog.
            const products = await apiGet("/api/products").catch(() => [])
            dispatch(setProduct(unwrap(products) || []))

            if (typeof window !== "undefined" && window.localStorage.getItem("auth_token")) {
                const addresses = await apiGet("/api/address").catch(() => [])
                dispatch(setAddresses(unwrap(addresses) || []))
            }
        }
        load()
    }, [dispatch])

    return null
}
