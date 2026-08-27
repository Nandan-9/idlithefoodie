import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack doesn't walk up to /home/das/pro/idli
  // and resolve modules (e.g. tailwindcss) from the wrong node_modules.
  turbopack: {
    root: __dirname,
  },
  devIndicators: false,
  allowedDevOrigins: ["192.168.1.2", "192.168.1.3"],
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "http", hostname: "192.168.1.2", port: "8000" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
