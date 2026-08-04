"use client";

import { useState } from "react";
import { ExternalLink, PlayCircle, X } from "lucide-react";

/**
 * Player embutido do tutorial do exercício. O iframe só é montado depois do
 * clique — assim a página do treino não carrega 5 players de uma vez no celular.
 */
export function ExerciseVideo({ nome, videoId }: { nome: string; videoId?: string }) {
  const [open, setOpen] = useState(false);

  const buscaUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${nome} como fazer execução correta`,
  )}`;

  if (!videoId) {
    return (
      <a
        href={buscaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
      >
        <PlayCircle className="h-3.5 w-3.5" /> Buscar tutorial no YouTube
      </a>
    );
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
      >
        {open ? (
          <>
            <X className="h-3.5 w-3.5" /> Fechar vídeo
          </>
        ) : (
          <>
            <PlayCircle className="h-3.5 w-3.5" /> Como fazer (vídeo)
          </>
        )}
      </button>

      {open && (
        <div className="mt-2 space-y-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&playsinline=1&modestbranding=1`}
              title={`Como fazer: ${nome}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-rose-600"
          >
            <ExternalLink className="h-3 w-3" /> Abrir no YouTube
          </a>
        </div>
      )}
    </div>
  );
}
