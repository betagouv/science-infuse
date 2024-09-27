/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Recommended for the `pages` directory, default in `app`.
  swcMinify: false,
  // swcMinify: true,
  experimental: {
    swcPlugins: [["@preact-signals/safe-react/swc", { mode: "auto" }]],
    // appDir: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'development' ? false : true,
  },
  // output: 'standalone',
  env: {
    NEXT_PUBLIC_S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
    NEXT_PUBLIC_S3_SECRET_KEY: process.env.S3_SECRET_KEY,
    NEXT_PUBLIC_S3_ENDPOINT: process.env.S3_ENDPOINT,
    NEXT_PUBLIC_S3_REGION: process.env.S3_REGION,
    NEXT_PUBLIC_S3_BUCKET: process.env.S3_BUCKET,
    NEXT_PUBLIC_ENVIRONMENT: process.env.ENVIRONMENT
  },
  webpack: config => {
    // https://github.com/wojtekmaj/react-pdf?tab=readme-ov-file#nextjs
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false


    config.module.rules.push({
      test: /\.woff2$/,
      type: "asset/resource"
    });

    return config;
  }
};

export default nextConfig;