import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Treino & Dieta · Milena",
    short_name: "Treino Milena",
    description: "Plano alimentar, treino e check-in diário",
    start_url: "/",
    display: "standalone",
    background_color: "#fff7f9",
    theme_color: "#fff7f9",
    orientation: "portrait",
    lang: "pt-BR",
    icons: [
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
