/// <reference types="vitest" />
import { defineConfig, mergeConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { UserConfig } from 'vite'
import type { InlineConfig } from 'vitest'

interface VitestConfigExport extends UserConfig {
  test: InlineConfig
}

// Get version from package.json
const appVersion = process.env.npm_package_version;

// https://vite.dev/config/
export default defineConfig(mergeConfig(
  {
    plugins: [react()],
    // Define global constant replacements
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion)
    },
    optimizeDeps: {
      include: ['react-icons/fa'],
    },
    server: {
      port: 3000,
    },
  },
  {
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      css: true, // if you have component tests that rely on CSS
      exclude: ['**/node_modules/**', '**/e2e/**'], // Exclude e2e tests from Vitest
    },
  } as VitestConfigExport
))
