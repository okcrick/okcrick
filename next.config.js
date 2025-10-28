/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["firebasestorage.googleapis.com"],
  },
  experimental: {
    appDir: true, // ✅ because you’re using the `/app` folder structure
  },
};

module.exports = nextConfig;
