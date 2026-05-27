/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        // In dev: unoptimized to avoid `next/image` loader complaining about
        // remote URLs while we iterate. Flip to false in production and the
        // `remotePatterns` list below kicks in.
        unoptimized: process.env.NODE_ENV !== "production",
        remotePatterns: [
            // Cloudinary — all product images flow through here in production
            { protocol: "https", hostname: "res.cloudinary.com" },
            // Unsplash — seeded fallbacks before brand-specific uploads
            { protocol: "https", hostname: "images.unsplash.com" },
            // Branded text placeholders used by older seeder runs
            { protocol: "https", hostname: "placehold.co" },
        ],
    },
    async rewrites() {
        const apiUrl = process.env.API_URL || "http://localhost:8000";
        return [
            {
                source: "/backend/:path*",
                destination: `${apiUrl}/:path*`,
            },
        ];
    },
};

export default nextConfig;
