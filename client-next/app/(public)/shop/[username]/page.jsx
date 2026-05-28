import { redirect } from "next/navigation"

// FutureShop is now single-vendor. Storefront URLs from the old multi-store
// fork should land shoppers on the main catalog instead of calling a removed
// `/api/stores/...` backend endpoint.
export default function StoreShopRedirect() {
    redirect("/shop")
}
