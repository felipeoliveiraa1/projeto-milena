/**
 * Janela alimentar e jejum noturno — só a conta de relógio, sem React, para
 * servir também ao servidor dos lembretes. O hook useJanela fica em lib/jejum.ts.
 *
 * A medicação tira a fome à noite, então a comida do dia cabe numa janela (o
 * padrão é 08:00 às 18:00) e o resto é jejum. A janela sempre abre e fecha no
 * mesmo dia (lib/preferencias.ts garante), então o jejum é que atravessa a
 * meia-noite.
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
 * (08:00–18:00) dá café 08:00, almoço 12:30 e lanche da tarde 17:30.
 *
 * Desde 18/10 o plano da nutricionista tem três refeições, e a última é o
 * lanche da tarde, meia hora antes de a janela fechar. "jantar" é o id
 * histórico da quarta refeição (o "fecha a janela" até 17/10) e fica só para
 * mostrar os dias antigos.
 */
export function horariosDaJanela(
  janela: Janela,
): Record<"cafe" | "almoco" | "lanche" | "jantar", string> {
  const abre = paraMinutos(janela.inicio);
  const fecha = paraMinutos(janela.fim);
  const { comendo } = duracaoJanela(janela);
  // Arredonda para o quarto de hora mais próximo: ninguém almoça às 12:07.
  const quarto = (min: number) => Math.round(min / 15) * 15;
  const ultima = paraHHMM(fecha - 30);
  return {
    cafe: janela.inicio,
    almoco: paraHHMM(quarto(abre + comendo * 0.45)),
    lanche: ultima,
    jantar: ultima,
  };
}

/**
 * "45 min", "2 h", "2h10". O espaço é o que não quebra ( ): numa tela
 * estreita, "14 h" nunca fica com o número numa linha e o "h" na outra.
 */
export function formatarDuracao(minutos: number): string {
  const total = Math.max(0, Math.round(minutos));
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m === 0 ? `${h} h` : `${h}h${String(m).padStart(2, "0")}`;
}
