import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: '*' },
      { protocol: 'https', hostname: '*' },
    ],
  },
}

export default nextConfig
