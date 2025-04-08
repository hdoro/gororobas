import { paraglideWebpackPlugin } from '@inlang/paraglide-js'

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '40mb',
    },
  },
  webpack: (config) => {
    config.plugins.push(
      paraglideWebpackPlugin({
        outdir: './src/paraglide',
        project: './project.inlang',
        strategy: ['cookie', 'url', 'preferredLanguage', 'baseLocale'],
        cookieName: 'gororobas--locale',
        outputStructure: 'message-modules',
        urlPatterns: [
          {
            pattern: '/notas/nova',
            localized: [
              ['es', '/es/notas/nueva'],
              ['pt', '/notas/nova'],
            ],
          },
          {
            pattern: '/vegetais/novo',
            localized: [
              ['es', '/es/vegetales/nuevo'],
              ['pt', '/vegetais/novo'],
            ],
          },
          {
            pattern: '/biblioteca/novo-material',
            localized: [
              ['es', '/es/biblioteca/nuevo-material'],
              ['pt', '/biblioteca/novo-material'],
            ],
          },
          {
            pattern: '/vegetais/:handle(.*)?',
            localized: [
              ['es', '/es/vegetales/:handle(.*)?'],
              ['pt', '/vegetais/:handle(.*)?'],
            ],
          },
          {
            pattern: '/pessoas/:handle/contribuicoes',
            localized: [
              ['es', '/es/personas/:handle/contribuciones'],
              ['pt', '/vegetais/:handle/contribuicoes'],
            ],
          },
          {
            pattern: '/pessoas/:handle(.*)?',
            localized: [
              ['es', '/es/personas/:handle(.*)?'],
              ['pt', '/vegetais/:handle(.*)?'],
            ],
          },
          {
            pattern: '/sugestoes/:handle(.*)?',
            localized: [
              ['es', '/es/sugerencias/:handle(.*)?'],
              ['pt', '/vegetais/:handle(.*)?'],
            ],
          },
          {
            pattern: '/:path(.*)?',
            localized: [
              ['es', '/es/:path(.*)?'],
              ['pt', '/:path(.*)?'],
            ],
          },
        ],
      }),
    )

    return config
  },
}

export default nextConfig
