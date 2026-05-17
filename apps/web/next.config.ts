import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@fieldapp/shared'],
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;
