import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages configuration
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Base path for GitHub Pages (update this to your repository name)
  basePath: process.env.NODE_ENV === 'production' ? '/recipe-finder' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/recipe-finder' : '',
  
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
