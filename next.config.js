/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["api.silv.app"],
  },
  // Performance optimizations
  experimental: {
    // Enable optimizations
    optimizeCss: true,
    // Reduce the size of the JavaScript bundles
    optimizePackageImports: ["lucide-react", "@heroicons/react"],
  },
  // Improve build performance
  compiler: {
    // Remove console.log in production
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
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

    // Add optimization for production builds
    if (!isServer && process.env.NODE_ENV === "production") {
      // Enable granular chunks
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          default: false,
          vendors: false,
          // Create a commons chunk for code shared between pages
          commons: {
            name: "commons",
            chunks: "all",
            minChunks: 2,
            reuseExistingChunk: true,
          },
          // Create a chunk for each npm package
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )[1];
              return `npm.${packageName.replace("@", "")}`;
            },
            priority: 10,
            chunks: "all",
            reuseExistingChunk: true,
          },
        },
      };
    }

    return config;
  },
  // Enable static HTML export for faster page loads
  output: "standalone",
};

module.exports = nextConfig;
