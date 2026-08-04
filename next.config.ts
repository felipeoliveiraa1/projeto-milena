import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // __dirname não existe no escopo ESM do config compilado; o dev/build
    // sempre roda a partir da raiz do projeto.
    root: process.cwd(),
  },
};

export default nextConfig;
