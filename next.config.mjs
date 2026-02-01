import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // So Next and Turbopack use this folder as project root (env and lockfile)
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig
