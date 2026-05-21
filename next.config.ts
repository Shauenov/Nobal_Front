import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker standalone build
  output: "standalone",
  // Types are validated separately via `tsc --noEmit` before deploy.
  // Skipping the in-build tsc pass keeps the production build fast and
  // memory-light (it's the heaviest phase and OOMs on small 2GB servers).
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      // MinIO (local development)
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/**",
      },
      // MinIO via Docker internal network (e.g. minio:9000)
      {
        protocol: "http",
        hostname: "minio",
        port: "9000",
        pathname: "/**",
      },
      // Production S3-compatible storage (any https host)
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
