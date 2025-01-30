import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // <-- Critical for Docker deployment
};

export default nextConfig;
