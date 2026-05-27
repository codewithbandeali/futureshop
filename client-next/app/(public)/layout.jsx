'use client'
import Banner from "@/components/Banner"
import Footer from "@/components/Footer"
import MiniCart from "@/components/MiniCart"
import Navbar from "@/components/Navbar"

export default function PublicLayout({ children }) {
    return (
        <>
            <Banner />
            <Navbar />
            {children}
            <Footer />
            <MiniCart />
        </>
    )
}
