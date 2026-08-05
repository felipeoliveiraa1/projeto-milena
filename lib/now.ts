"use client";

import { useMemo, useSyncExternalStore } from "react";

const semInscricao = () => () => {};

/**
 * `false` no servidor e no primeiro render, `true` depois de hidratar.
 * Serve para ler coisas que só existem no navegador (hora atual, localStorage)
 * sem quebrar a hidratação e sem setState dentro de efeito.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    semInscricao,
    () => true,
    () => false,
  );
}

/** Momento atual, fixado na montagem. `null` enquanto renderiza no servidor. */
export function useAgora(): Date | null {
  const isClient = useIsClient();
  return useMemo(() => (isClient ? new Date() : null), [isClient]);
}
