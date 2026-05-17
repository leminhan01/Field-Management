import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@fieldapp/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;
