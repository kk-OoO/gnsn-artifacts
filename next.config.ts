import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload-os-bbs.mihoyo.com',
      },
      {
        protocol: 'https',
        hostname: 'webstatic.hoyoverse.com',
      },
      {
        protocol: 'https',
        hostname: 'upload-static.hoyoverse.com',
      },
      {
        protocol: 'https',
        hostname: 'enka.network',
      },
    ],
  },
};

export default nextConfig;
