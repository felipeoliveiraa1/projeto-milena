import type { DayCheck } from "./storage";
import { PLANO_ATUAL_DESDE, refeicoesDaData } from "@/data/meals";

/**
 * Como o "plano do dia" é calculado. Fica isolado aqui porque a tela inicial e
 * o histórico precisam chegar ao mesmo número — se cada uma tivesse a própria
 * conta, um dia apareceria com 70% num lugar e 65% no outro.
 */
export const PESOS = { refeicoes: 0.3, agua: 0.15, treino: 0.2, rotina: 0.35 };

/** Quantas refeições o dia tem: 3 desde o plano da nutricionista (18/10), 4 antes. */
export function totalRefeicoes(data: string): number {
  return refeicoesDaData(data).length;
}

export type ResumoDoDia = {
  pct: number;
  refeicoes: number;
  agua: number;
  treino: boolean;
  rotina: number;
  rotinaTotal: number;
  /** true quando ela fez alguma coisa no dia. */
  temRegistro: boolean;
};

/**
 * Refeições feitas no dia. Do plano da nutricionista em diante, contam só as
 * três do plano. Antes, a conta é a de sempre — todas as marcadas —, para o
 * histórico não mudar de nota nem de número: nos primeiros cardápios havia
 * refeições com outros ids, e elas contavam.
 */
function refeicoesFeitas(dia: DayCheck, data: string): number {
  if (data < PLANO_ATUAL_DESDE) return Object.values(dia.meals).filter(Boolean).length;
  return refeicoesDaData(data).filter((id) => dia.meals[id] === true).length;
}

export function resumoDoDia(
  dia: DayCheck | undefined,
  opcoes: { metaAgua: number; idsRotina: string[]; data: string },
): ResumoDoDia {
  const vazio: ResumoDoDia = {
    pct: 0,
    refeicoes: 0,
    agua: 0,
    treino: false,
    rotina: 0,
    rotinaTotal: opcoes.idsRotina.length,
    temRegistro: false,
  };
  if (!dia) return vazio;

  const refeicoes = refeicoesFeitas(dia, opcoes.data);
  const total = totalRefeicoes(opcoes.data);
  const rotina = opcoes.idsRotina.filter((id) => dia.supplements[id] === true).length;
  const pontos =
    PESOS.refeicoes * Math.min(refeicoes / total, 1) +
    PESOS.agua * Math.min(dia.water / Math.max(1, opcoes.metaAgua), 1) +
    PESOS.treino * (dia.workout ? 1 : 0) +
    PESOS.rotina * (opcoes.idsRotina.length > 0 ? Math.min(rotina / opcoes.idsRotina.length, 1) : 0);

  return {
    pct: Math.round(pontos * 100),
    refeicoes,
    agua: dia.water,
    treino: dia.workout,
    rotina,
    rotinaTotal: opcoes.idsRotina.length,
    temRegistro: refeicoes > 0 || dia.water > 0 || dia.workout || rotina > 0,
  };
}

export function formatarAgua(ml: number): string {
  if (ml <= 0) return "0";
  if (ml < 1000) return `${ml} ml`;
  return `${(ml / 1000).toFixed(1).replace(".", ",")} L`;
}
