import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root to THIS project. Without this, Next.js 16 / Turbopack
  // detects the stray package-lock.json at the Projects root and picks the wrong
  // root directory, which breaks module/asset resolution and causes site-wide 404s.
  turbopack: {
    root: __dirname,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["@sparticuz/chromium", "playwright-core"],
  outputFileTracingIncludes: {
    "/api/**/*": ["./node_modules/@sparticuz/chromium/bin/**/*"]
  },
  // Force new build ID to bust CDN cache
  generateBuildId: async () => {
    return `build-${Date.now()}`
  }
}

export default nextConfig
