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
};

export default nextConfig;
