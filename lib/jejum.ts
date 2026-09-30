"use client";

import { useMemo } from "react";
import { useAgoraVivo } from "./now";
import { usePreferencias } from "./settings";

/**
 * Janela alimentar e jejum noturno.
 *
 * A medicação tira a fome à noite, então a comida do dia cabe numa janela (o
 * padrão é 08:00 às 18:00) e o resto é jejum. A janela é uma preferência —
 * ela ajusta em /ajustes — e tudo aqui é conta de relógio, sem banco.
 *
 * A janela sempre abre e fecha no mesmo dia (lib/settings.ts garante), então o
 * jejum é que atravessa a meia-noite.
 */

/** Horários da janela, em "HH:MM". */
export type Janela = { inicio: string; fim: string };

export type StatusJanela = {
  /** `true` dentro da janela (hora de comer); `false` em jejum. */
  aberta: boolean;
  /** Há quanto tempo está no estado atual, em minutos. */
  minutosNoEstado: number;
  /** Quanto falta para virar — fechar a janela ou acabar o jejum —, em minutos. */
  minutosParaVirar: number;
  /** Progresso do estado atual, de 0 a 100. */
  pct: number;
  /** Horário da próxima virada, "HH:MM". */
  proximaVirada: string;
};

const DIA = 24 * 60;

export function paraMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function paraHHMM(minutos: number): string {
  const total = ((Math.round(minutos) % DIA) + DIA) % DIA;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Quantos minutos ela passa comendo e quantos em jejum. */
export function duracaoJanela(janela: Janela): { comendo: number; jejum: number } {
  const comendo = paraMinutos(janela.fim) - paraMinutos(janela.inicio);
  return { comendo, jejum: DIA - comendo };
}

export function statusJanela(janela: Janela, agora: Date): StatusJanela {
  const m = agora.getHours() * 60 + agora.getMinutes();
  const abre = paraMinutos(janela.inicio);
  const fecha = paraMinutos(janela.fim);
  const { comendo, jejum } = duracaoJanela(janela);

  if (m >= abre && m < fecha) {
    const passou = m - abre;
    return {
      aberta: true,
      minutosNoEstado: passou,
      minutosParaVirar: fecha - m,
      pct: Math.round((passou / comendo) * 100),
      proximaVirada: janela.fim,
    };
  }

  // Em jejum: ou já passou do fechamento hoje, ou ainda é madrugada antes de abrir.
  const passou = m >= fecha ? m - fecha : m + DIA - fecha;
  return {
    aberta: false,
    minutosNoEstado: passou,
    minutosParaVirar: jejum - passou,
    pct: Math.round((passou / jejum) * 100),
    proximaVirada: janela.inicio,
  };
}

/**
 * Horário sugerido de cada refeição dentro da janela. Na janela padrão
 * (08:00–18:00) dá 08:00, 12:30, 15:30 e 17:30 — a última fecha a janela.
 *
 * As chaves são os ids das refeições de data/meals.ts. "jantar" é o id
 * histórico da quarta refeição; no plano novo ela é o lanche que fecha a
 * janela, meia hora antes do jejum começar.
 */
export function horariosDaJanela(
  janela: Janela,
): Record<"cafe" | "almoco" | "lanche" | "jantar", string> {
  const abre = paraMinutos(janela.inicio);
  const fecha = paraMinutos(janela.fim);
  const { comendo } = duracaoJanela(janela);
  // Arredonda para o quarto de hora mais próximo: ninguém almoça às 12:07.
  const quarto = (min: number) => Math.round(min / 15) * 15;
  return {
    cafe: janela.inicio,
    almoco: paraHHMM(quarto(abre + comendo * 0.45)),
    lanche: paraHHMM(quarto(abre + comendo * 0.75)),
    jantar: paraHHMM(fecha - 30),
  };
}

/**
 * "45 min", "2 h", "2h10". O espaço é o que não quebra (\u00a0): numa tela
 * estreita, "14 h" nunca fica com o número numa linha e o "h" na outra.
 */
export function formatarDuracao(minutos: number): string {
  const total = Math.max(0, Math.round(minutos));
  if (total < 60) return `${total}\u00a0min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m === 0 ? `${h}\u00a0h` : `${h}h${String(m).padStart(2, "0")}`;
}

/**
 * Janela configurada e o estado dela agora, andando com o relógio.
 * `status` é `null` no servidor, no primeiro render e enquanto as preferências
 * carregam — até lá `janela` ainda é a de fábrica, e mostrar "fecha às 18:00"
 * para quem mudou para as 17:00 seria errado. `carregando` avisa quem mostra
 * horários derivados da janela.
 */
export function useJanela(): { janela: Janela; status: StatusJanela | null; carregando: boolean } {
  const { prefs, carregando } = usePreferencias();
  const agora = useAgoraVivo();
  const janela = useMemo(
    () => ({ inicio: prefs.janelaInicio, fim: prefs.janelaFim }),
    [prefs.janelaInicio, prefs.janelaFim],
  );
  const status = useMemo(
    () => (agora && !carregando ? statusJanela(janela, agora) : null),
    [agora, janela, carregando],
  );
  return { janela, status, carregando };
}
