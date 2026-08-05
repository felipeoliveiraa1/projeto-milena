"use client";

import { PROTOCOLO } from "@/data/protocol";
import { useProtocolo } from "@/lib/protocol";

/** Selo do ciclo no cabeçalho — mostra em que dia do protocolo ela está. */
export function HeaderStatus() {
  const status = useProtocolo();
  if (!status) {
    return <span className="h-8 w-24 rounded-full bg-line-soft" aria-hidden />;
  }

  const texto = status.naoComecou
    ? "a começar"
    : status.concluido
      ? "ciclo feito"
      : `dia ${status.dia}`;

  return (
    <span className="flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1.5 backdrop-blur">
      <span className="h-1.5 w-1.5 rounded-full bg-brand-mid" />
      <span className="text-xs font-semibold text-ink-soft tabular">
        {texto}
        {!status.naoComecou && !status.concluido && (
          <span className="text-ink-muted">/{PROTOCOLO.duracaoDias}</span>
        )}
      </span>
    </span>
  );
}
