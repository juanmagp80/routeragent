import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    turbo: {
      resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
    },
  },
  // Configuración para reducir interferencia con redirecciones
  webpack: (config, { dev }) => {
    if (dev) {
      // Configurar HMR para ser menos agresivo
      config.watchOptions = {
        ...config.watchOptions,
        aggregateTimeout: 300,
        poll: 1000,
      };
    }
    return config;
  },
};

export default nextConfig;
