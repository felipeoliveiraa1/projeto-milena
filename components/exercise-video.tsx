"use client";

import { useState } from "react";
import { ExternalLink, Play, X } from "lucide-react";

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
        className="mt-3 inline-flex items-center gap-2 rounded-full bg-ink px-3.5 py-2 text-xs font-bold text-bone transition hover:bg-ink/90"
      >
        <Play className="h-3.5 w-3.5 fill-bone" /> Buscar tutorial
      </a>
    );
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full bg-ink px-3.5 py-2 text-xs font-bold text-bone transition hover:bg-ink/90 active:scale-[0.98]"
      >
        {open ? (
          <>
            <X className="h-3.5 w-3.5" /> Fechar vídeo
          </>
        ) : (
          <>
            <Play className="h-3.5 w-3.5 fill-bone" /> Como fazer
          </>
        )}
      </button>

      {open && (
        <div className="animate-rise mt-3 space-y-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl2 bg-ink">
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
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted transition hover:text-ink"
          >
            <ExternalLink className="h-3 w-3" /> Abrir no YouTube
          </a>
        </div>
      )}
    </div>
  );
}
