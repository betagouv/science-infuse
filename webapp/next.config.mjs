/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Recommended for the `pages` directory, default in `app`.
  swcMinify: true,
  experimental: {
    swcPlugins: [["@preact-signals/safe-react/swc", { mode: "auto" }]]
  },
  webpack: config => {
    // https://github.com/wojtekmaj/react-pdf?tab=readme-ov-file#nextjs
    config.resolve.alias.canvas = false;

    config.module.rules.push({
      test: /\.woff2$/,
      type: "asset/resource"
    });

    return config;
  }
};

export default nextConfig;