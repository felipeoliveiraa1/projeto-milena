import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // __dirname não existe no escopo ESM do config compilado; o dev/build
    // sempre roda a partir da raiz do projeto.
    root: process.cwd(),
  },
  experimental: {
    // Habilita o <ViewTransition> do React usado na troca de telas.
    viewTransition: true,
  },
  async headers() {
    return [
      {
        // Service worker dos lembretes (public/sw.js): sem cache, para o
        // celular sempre pegar a versão nova, e só com script do próprio app.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
