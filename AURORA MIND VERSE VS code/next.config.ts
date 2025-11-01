import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    // ✅ This disables ESLint errors during the Vercel build
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
