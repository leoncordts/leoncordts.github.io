import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["cheerio"],
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
