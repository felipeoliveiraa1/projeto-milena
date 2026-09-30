"use client";

import { usePlano } from "@/lib/protocol";

/** Selo no cabeçalho — em que semana da jornada ela está. */
export function HeaderStatus() {
  const status = usePlano();
  if (!status) {
    return <span className="h-8 w-24 rounded-full bg-line-soft" aria-hidden />;
  }

  return (
    <span className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1.5 backdrop-blur">
      <span className="h-1.5 w-1.5 rounded-full bg-brand-mid" />
      <span className="whitespace-nowrap text-xs font-semibold text-ink-soft tabular">
        {status.naoComecou ? "a começar" : `semana ${status.semana}`}
      </span>
    </span>
  );
}
