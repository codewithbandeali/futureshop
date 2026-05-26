import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "Admin · FutureShop",
    description: "FutureShop admin — manage products, orders, customers.",
    robots: { index: false, follow: false },
};

export default function RootAdminLayout({ children }) {
    return (
        <AdminLayout>
            {children}
        </AdminLayout>
    );
}
