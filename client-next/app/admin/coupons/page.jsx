import { redirect } from "next/navigation"

// Coupons aren't part of the current feature set; revisit when discount
// codes get prioritized. Redirect to the dashboard for now.
export default function CouponsPage() {
    redirect("/admin")
}
