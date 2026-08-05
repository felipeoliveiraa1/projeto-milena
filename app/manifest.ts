import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Milena · mais leve, mais forte",
    short_name: "Milena",
    description: "Protocolo Desinflama-se, treino e check-in diário",
    start_url: "/",
    display: "standalone",
    // Verde profundo: a abertura nativa do PWA fica igual à splash do app.
    background_color: "#0d3a2d",
    theme_color: "#fbf7f2",
    orientation: "portrait",
    lang: "pt-BR",
    icons: [
      { src: "/icon", sizes: "192x192", type: "image/png" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
