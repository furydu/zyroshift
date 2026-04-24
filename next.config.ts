import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.1.188"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sideshift.ai",
        pathname: "/api/v2/coins/icon/**",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        pathname: "/gh/spothq/cryptocurrency-icons@master/**",
      },
    ],
  },
};

export default nextConfig;
