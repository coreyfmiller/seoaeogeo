/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["@sparticuz/chromium", "playwright-core"],
    outputFileTracingIncludes: {
      "/api/**/*": ["./node_modules/@sparticuz/chromium/bin/**/*"]
    }
  },
  // Force new build ID to bust CDN cache
  generateBuildId: async () => {
    return `build-${Date.now()}`
  }
}

export default nextConfig
