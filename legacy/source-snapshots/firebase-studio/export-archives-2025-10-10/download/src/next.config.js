
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@opentelemetry/instrumentation'],
  },
};

module.exports = nextConfig;
