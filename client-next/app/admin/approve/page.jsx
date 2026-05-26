import { redirect } from "next/navigation"

// Vendor-approval workflow does not apply to a single-vendor shop.
export default function ApprovePage() {
    redirect("/admin")
}
