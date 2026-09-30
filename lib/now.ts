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

/* -------------------------------------------------------------------------- */
/* Relógio que anda                                                           */
/* -------------------------------------------------------------------------- */

// Um relógio só para o app inteiro: todos os componentes que precisam da hora
// viva leem o mesmo valor, e o intervalo existe só enquanto alguém escuta.
let agoraMs = 0;
let timer: ReturnType<typeof setInterval> | null = null;
const ouvintesRelogio = new Set<() => void>();

function tique() {
  agoraMs = Date.now();
  ouvintesRelogio.forEach((l) => l());
}

// No PWA o intervalo congela com o app em segundo plano; ao voltar, a hora
// precisa ser corrigida na hora, e não 30 segundos depois.
function aoVoltar() {
  if (document.visibilityState === "visible") tique();
}

function assinarRelogio(callback: () => void): () => void {
  ouvintesRelogio.add(callback);
  if (!timer) {
    agoraMs = Date.now();
    timer = setInterval(tique, 30_000);
    document.addEventListener("visibilitychange", aoVoltar);
  }
  return () => {
    ouvintesRelogio.delete(callback);
    if (ouvintesRelogio.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
      document.removeEventListener("visibilitychange", aoVoltar);
    }
  };
}

function lerRelogio(): number {
  if (!agoraMs) agoraMs = Date.now();
  return agoraMs;
}

/**
 * Momento atual que se atualiza sozinho (a cada 30 s e ao voltar para o app).
 * Para contagens na tela, como quanto falta para a janela fechar.
 * `null` enquanto renderiza no servidor.
 */
export function useAgoraVivo(): Date | null {
  const ms = useSyncExternalStore(assinarRelogio, lerRelogio, () => 0);
  return useMemo(() => (ms ? new Date(ms) : null), [ms]);
}
