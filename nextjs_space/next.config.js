const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: process.env.NEXT_OUTPUT_MODE,
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
  
  // Configuración crítica para evitar pre-renderizado de rutas API
  // Esto previene el error "Failed to collect page data for /api/auth/[...nextauth]"
  generateBuildId: async () => {
    // ID de build estático para evitar problemas
    return 'cuenty-build'
  },
  
  // Excluir rutas API del output estático
  exportPathMap: async function (
    defaultPathMap,
    { dev, dir, outDir, distDir, buildId }
  ) {
    return {
      '/': { page: '/' },
    }
  },
  
  // Configuración para webpack
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignorar módulos opcionales de Prisma que pueden causar problemas
      config.externals.push({
        '@prisma/client': 'commonjs @prisma/client',
      })
    }
    return config
  },
};

module.exports = nextConfig;
