"use client";

import { useMemo, useSyncExternalStore } from "react";
import { PROTOCOLO } from "@/data/protocol";
import { todayKey } from "./date";
import { useAgora, useIsClient } from "./now";
import { usePreferencias } from "./settings";

const CHAVE_INICIO = "desinflama-inicio";

function paraData(iso: string): Date {
  // "AAAA-MM-DD" precisa do horário, senão o JS interpreta como UTC e o dia vira o anterior.
  return new Date(`${iso}T00:00:00`);
}

/** Data em que o ciclo de 15 dias começou. Ela pode ajustar pelo app (/rotina). */
export function getInicio(): string {
  if (typeof window === "undefined") return PROTOCOLO.inicioPadrao;
  const salvo = window.localStorage.getItem(CHAVE_INICIO);
  return salvo && /^\d{4}-\d{2}-\d{2}$/.test(salvo) ? salvo : PROTOCOLO.inicioPadrao;
}

const ouvintes = new Set<() => void>();

export function setInicio(iso: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAVE_INICIO, iso);
  ouvintes.forEach((l) => l());
}

function inscrever(callback: () => void): () => void {
  ouvintes.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    ouvintes.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

/** Data de início do ciclo, reagindo a mudanças feitas na tela /rotina. */
export function useInicio(): string {
  return useSyncExternalStore(inscrever, getInicio, () => PROTOCOLO.inicioPadrao);
}

/**
 * Status do protocolo já calculado para hoje.
 * `null` enquanto renderiza no servidor — quem usa mostra um placeholder.
 */
export function useProtocolo(): StatusProtocolo | null {
  const inicio = useInicio();
  const agora = useAgora();
  const isClient = useIsClient();
  const { prefs } = usePreferencias();
  return useMemo(
    () => (isClient && agora ? statusProtocolo(inicio, agora, prefs.cicloDias) : null),
    [isClient, agora, inicio, prefs.cicloDias],
  );
}

/** Bloco da rotina que corresponde à hora atual. `null` no servidor. */
export function usePeriodoAgora(): "manha" | "dia" | "noite" | null {
  const agora = useAgora();
  return useMemo(() => (agora ? periodoAgora(agora) : null), [agora]);
}

export type StatusProtocolo = {
  /** Dia do ciclo (1 a 15). Antes do início, 0. */
  dia: number;
  total: number;
  /** Dia usado para escolher o cardápio — sempre entre 1 e 15. */
  diaCardapio: number;
  pct: number;
  naoComecou: boolean;
  concluido: boolean;
  inicio: string;
  /** Quantos dias passaram desde o fim do ciclo (0 se ainda está rolando). */
  diasDepoisDoFim: number;
};

export function statusProtocolo(
  inicio: string,
  hoje: Date = new Date(),
  duracao: number = PROTOCOLO.duracaoDias,
): StatusProtocolo {
  const total = Math.max(1, Math.round(duracao));
  const inicioData = paraData(inicio);
  const hojeData = paraData(todayKey(hoje));
  const msPorDia = 24 * 60 * 60 * 1000;
  const diff = Math.round((hojeData.getTime() - inicioData.getTime()) / msPorDia);

  const dia = diff + 1; // dia 1 é o próprio dia de início
  const naoComecou = dia < 1;
  const concluido = dia > total;

  const diaCardapio = naoComecou ? 1 : concluido ? ((dia - 1) % total) + 1 : dia;

  return {
    dia: naoComecou ? 0 : dia,
    total,
    diaCardapio,
    pct: naoComecou ? 0 : Math.min(100, Math.round((Math.min(dia, total) / total) * 100)),
    naoComecou,
    concluido,
    inicio,
    diasDepoisDoFim: concluido ? dia - total : 0,
  };
}

/** Bloco da rotina que faz sentido mostrar agora, pela hora do dia. */
export function periodoAgora(hoje: Date = new Date()): "manha" | "dia" | "noite" {
  const h = hoje.getHours();
  if (h < 12) return "manha";
  if (h < 18) return "dia";
  return "noite";
}
