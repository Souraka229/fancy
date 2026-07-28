/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  },
  // set turbopack root to avoid workspace inference issues
  turbopack: {
    root: './'
  }
}

module.exports = nextConfig
