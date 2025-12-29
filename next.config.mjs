/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Configure for Vercel deployment
  output: 'standalone',

  // Optimize images
  images: {
    domains: [],
  },
};

export default nextConfig;
