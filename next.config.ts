import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jantrasoft.online",
      },
      {
        protocol: "https",
        hostname: "jontro-backend.onrender.com",
      },
      {
        protocol: "https",
        hostname: "zhfmyrumuagbkwxoyryc.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ["**/.git/**", "**/.next/**", "**/node_modules/**"],
      };
    }

    return config;
  },
};

export default nextConfig;
// deployed Thu Apr  9 12:52:10 AM +06 2026
