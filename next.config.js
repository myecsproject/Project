/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to enable custom server
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
