/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  },
  experimental: {
    turbopack: {
      // set workspace root for Turbopack to avoid root inference issues
      root: './'
    }
  }
}

module.exports = nextConfig
