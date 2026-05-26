import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

const siteName = "FutureShop";
const siteDescription = "Business-grade computers, printers and peripherals from Dell, HP, Apple and Samsung. Next-business-day shipping, manufacturer warranty.";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: siteName,
        template: `%s | ${siteName}`,
    },
    description: siteDescription,
    openGraph: {
        type: "website",
        url: siteUrl,
        siteName,
        title: siteName,
        description: siteDescription,
    },
    twitter: {
        card: "summary_large_image",
        title: siteName,
        description: siteDescription,
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${outfit.className} antialiased`}>
                <StoreProvider>
                    <Toaster />
                    {children}
                </StoreProvider>
            </body>
        </html>
    );
}
