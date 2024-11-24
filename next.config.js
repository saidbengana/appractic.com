/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    domains: ['appractic.com'],
  },
  experimental: {
    serverActions: true,
  }
};

module.exports = nextConfig;
