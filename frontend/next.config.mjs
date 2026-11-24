/** @type {import('next').NextConfig} */
// Adresse interne du backend Laravel (à définir en production)
const API_ORIGIN = process.env.INTERNAL_API_ORIGIN || "http://127.0.0.1:8000";

const nextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "roaming-washstand-ribcage.ngrok-free.dev" },
    ],
  },
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.0.137",
    "roaming-washstand-ribcage.ngrok-free.dev",
  ],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_ORIGIN}/api/:path*`,
      },
      {
        source: "/storage/:path*",
        destination: `${API_ORIGIN}/storage/:path*`,
      },
    ];
  },
};

export default nextConfig;