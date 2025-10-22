const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // Modo standalone: optimizado para Docker y producción
  // Genera un servidor Node.js mínimo con todas las dependencias
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../'),
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { unoptimized: true },
  // Asegurar que las rutas API se incluyan en el build
  // El modo standalone las incluye automáticamente
};

module.exports = nextConfig;
