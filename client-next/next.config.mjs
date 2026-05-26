/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true,
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
