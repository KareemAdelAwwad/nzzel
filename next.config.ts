import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "yt3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i1.ytimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i2.ytimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i3.ytimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i4.ytimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
