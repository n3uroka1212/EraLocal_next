import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    authInterrupts: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/public/index.html",
        destination: "/dashboard",
        permanent: true,
      },
      {
        source: "/public-client/index.html",
        destination: "/",
        permanent: true,
      },
      {
        source: "/api/public/:path*",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
