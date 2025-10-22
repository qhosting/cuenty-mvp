/** @type {import('next').NextConfig} */
const nextConfig = {
  // Modo standalone: optimizado para Docker y producción
  // Genera un servidor Node.js mínimo con todas las dependencias
  output: 'standalone',
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
