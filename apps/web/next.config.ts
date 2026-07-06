import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Monorepo: bao next trace cac deps (next/react/...) nam o root node_modules vao standalone bundle
  outputFileTracingRoot: path.resolve(__dirname, '../..'),
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
};

export default nextConfig;
