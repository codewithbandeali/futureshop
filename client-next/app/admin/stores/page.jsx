import { redirect } from "next/navigation"

// FutureShop is single-vendor; the "stores" page belonged to the GoCart fork.
// Anyone landing here gets bounced to the real admin home.
export default function StoresPage() {
    redirect("/admin")
}
