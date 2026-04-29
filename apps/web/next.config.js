/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const isGitHubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@tastebuddy/shared'],
  
  // GitHub Pages için static export
  output: isGitHubPages ? 'export' : undefined,
  basePath: isGitHubPages ? '/TasteBuddy' : '',
  assetPrefix: isGitHubPages ? '/TasteBuddy/' : '',
  trailingSlash: true,
  
  images: {
    unoptimized: isGitHubPages, // GitHub Pages için image optimization kapalı
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

module.exports = nextConfig;
