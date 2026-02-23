import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Externalize from Turbopack bundler so they run via native Node.js require
  serverExternalPackages: ['pdfjs-dist', 'pdf-parse', 'canvas'],
};

export default nextConfig;
