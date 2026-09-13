import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Disable the client-side router cache for dynamic pages so stock,
    // inventory, and other live data are always fresh on every navigation.
    staleTimes: {
      dynamic: 0, // force-dynamic pages are never served from router cache
      static: 300, // static pages can cache for 5 minutes
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
