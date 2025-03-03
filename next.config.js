/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["api.silv.app"],
  },
  // Include data directory in the build
  webpack: (config, { isServer }) => {
    // Copy data files to the build
    if (isServer) {
      const {
        readdirSync,
        copyFileSync,
        existsSync,
        mkdirSync,
      } = require("fs");
      const { join } = require("path");

      const dataDir = join(process.cwd(), "data");
      const buildDataDir = join(process.cwd(), ".next/server/data");

      if (!existsSync(buildDataDir)) {
        mkdirSync(buildDataDir, { recursive: true });
      }

      try {
        const files = readdirSync(dataDir);
        files.forEach((file) => {
          if (file.endsWith(".json")) {
            copyFileSync(join(dataDir, file), join(buildDataDir, file));
          }
        });
        console.log("Successfully copied data files to build directory");
      } catch (error) {
        console.error("Error copying data files:", error);
      }
    }

    return config;
  },
};

module.exports = nextConfig;
