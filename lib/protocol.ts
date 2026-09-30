"use client";

import { useMemo, useSyncExternalStore } from "react";
import { PLANO } from "@/data/protocol";
import { HORA_VIRADA_DO_DIA, hojeKey, todayKey } from "./date";
import { useAgoraVivo } from "./now";

// A chave ainda leva o nome do protocolo antigo de propósito: é ela que guarda
// a data de início no aparelho, e trocar o nome perderia o valor já salvo.
const CHAVE_INICIO = "desinflama-inicio";

function paraData(iso: string): Date {
  // "AAAA-MM-DD" precisa do horário, senão o JS interpreta como UTC e o dia vira o anterior.
  return new Date(`${iso}T00:00:00`);
}

/** Data em que a jornada começou. Ela pode ajustar pelo app (/rotina). */
export function getInicio(): string {
  if (typeof window === "undefined") return PLANO.inicioPadrao;
  const salvo = window.localStorage.getItem(CHAVE_INICIO);
  return salvo && /^\d{4}-\d{2}-\d{2}$/.test(salvo) ? salvo : PLANO.inicioPadrao;
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

/** Data de início da jornada, reagindo a mudanças feitas na tela /rotina. */
export function useInicio(): string {
  return useSyncExternalStore(inscrever, getInicio, () => PLANO.inicioPadrao);
}

/**
 * Em que ponto da jornada ela está hoje — o "hoje" do app, que vira às 05:00
 * e anda com o relógio (o PWA pode ficar aberto de um dia para o outro).
 * `null` enquanto renderiza no servidor — quem usa mostra um placeholder.
 */
export function usePlano(): StatusPlano | null {
  const inicio = useInicio();
  const agora = useAgoraVivo();
  const hoje = agora ? hojeKey(agora) : null;
  return useMemo(() => (hoje ? statusPlano(inicio, hoje) : null), [hoje, inicio]);
}

/** Bloco da rotina que corresponde à hora atual, andando com o relógio. `null` no servidor. */
export function usePeriodoAgora(): "manha" | "dia" | "noite" | null {
  const agora = useAgoraVivo();
  return agora ? periodoAgora(agora) : null;
}

/**
 * A recomposição não tem data para acabar — diferente do ciclo de 15 dias do
 * Desinflama-se. Por isso aqui só existe "quanto tempo já foi", sem total.
 */
export type StatusPlano = {
  /** Dia da jornada: o próprio dia de início é o dia 1. Antes do início, 0. */
  dia: number;
  /** Semana da jornada: os dias 1 a 7 são a semana 1. Antes do início, 0. */
  semana: number;
  naoComecou: boolean;
  inicio: string;
};

/**
 * `quando` pode ser a data em AAAA-MM-DD (o "hoje" do app, ou um dia que ela
 * está lançando) ou um Date, que vale pelo dia do calendário.
 */
export function statusPlano(inicio: string, quando: string | Date = hojeKey()): StatusPlano {
  const msPorDia = 24 * 60 * 60 * 1000;
  const chave = typeof quando === "string" ? quando : todayKey(quando);
  const diff = Math.round((paraData(chave).getTime() - paraData(inicio).getTime()) / msPorDia);
  const dia = diff + 1;
  const naoComecou = dia < 1;
  return {
    dia: naoComecou ? 0 : dia,
    semana: naoComecou ? 0 : Math.floor((dia - 1) / 7) + 1,
    naoComecou,
    inicio,
  };
}

/**
 * Bloco da rotina que faz sentido mostrar agora, pela hora do dia. A madrugada
 * ainda é noite: até a virada do dia (05:00), valem a rotina e os remédios da
 * noite, não os da manhã.
 */
export function periodoAgora(hoje: Date = new Date()): "manha" | "dia" | "noite" {
  const h = hoje.getHours();
  if (h < HORA_VIRADA_DO_DIA) return "noite";
  if (h < 12) return "manha";
  if (h < 18) return "dia";
  return "noite";
}
