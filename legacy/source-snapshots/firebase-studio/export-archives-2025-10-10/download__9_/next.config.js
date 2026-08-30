
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: [
      '@opentelemetry/instrumentation',
      '@genkit-ai/core',
      'dotprompt',
      'playwright-extra',
      'puppeteer-extra-plugin-stealth'
    ],
  },
};

module.exports = nextConfig;
