/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["firebasestorage.googleapis.com"],
  },
  webpack: (config, { isServer }) => {
    // avoid bundling 'undici' into the server bundle (prevents parse errors)
    if (isServer) {
      // ensure externals exists and push undici
      if (!config.externals) config.externals = [];
      config.externals.push("undici");
    }
    return config;
  },
};

module.exports = nextConfig;
