/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  env:{
    BACKEND_URL: process.env.BACKEND_URL,
  }
}

module.exports = nextConfig
