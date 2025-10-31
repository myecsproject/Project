/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to enable custom server

int: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
