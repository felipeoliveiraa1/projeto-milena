/**
 * Preferências que a Milena ajusta pelo próprio app, sem depender de deploy.
 *
 * Este arquivo é só conta e validação — sem React, sem banco, sem "use client" —
 * porque o servidor dos lembretes (app/api/lembretes) também precisa ler as
 * preferências gravadas em app_config para saber a que horas avisar. A leitura
 * e a gravação ficam em lib/settings.ts.
 */

import { HORA_VIRADA_DO_DIA } from "./date";

/** Data que ela escolhe para a contagem regressiva da tela inicial. */
export type Contagem = {
  /** AAAA-MM-DD, ou null enquanto ela não escolheu. */
  data: string | null;
  /** Do que é a contagem, em poucas palavras ("a cirurgia"). Pode ficar vazio. */
  titulo: string;
  /**
   * A data é a da cirurgia: liga as pausas que vêm antes dela (ômega-3 e
   * curcumina, 30 dias antes — ver data/supplements.ts).
   */
  cirurgia: boolean;
};

export type Preferencias = {
  /** Meta diária de água, em mililitros. */
  aguaMetaMl: number;
  /** Botões de registro rápido de água, em mililitros. */
  aguaPorcoes: number[];
  /** Tamanho de cada copo dos lembretes de água, em mililitros. */
  aguaCopoMl: number;
  /** Entre que horas a água do dia é dividida, em "HH:MM". */
  aguaInicio: string;
  aguaFim: string;
  /** Peso do começo da jornada, usado como referência das comparações. */
  pesoInicial: number;
  pesoMeta: number;
  /**
   * Janela alimentar, em "HH:MM": a primeira refeição abre, a última fecha. O
   * resto das 24 horas é jejum — ver lib/janela.ts.
   */
  janelaInicio: string;
  janelaFim: string;
  /** Horários do dia dela, "HH:MM": os remédios de acordar e de deitar contam a partir deles. */
  horaAcordar: string;
  horaDormir: string;
  contagem: Contagem;
  /** Lembretes no celular, por tipo. Valem para todos os aparelhos ativados. */
  lembretesRemedios: boolean;
  lembretesAgua: boolean;
};

export const PREFERENCIAS_PADRAO: Preferencias = {
  aguaMetaMl: 3200,
  // Pedido dela em 18/10: a meta do dia dividida em copos de 300 ml, das 9h às 21h.
  aguaPorcoes: [300],
  aguaCopoMl: 300,
  aguaInicio: "09:00",
  aguaFim: "21:00",
  // Peso da bioimpedância de 12/08, o ponto de partida da recomposição.
  pesoInicial: 85.5,
  pesoMeta: 70,
  // 10 horas comendo e 14 de jejum. A última refeição do plano da nutricionista
  // é o lanche da tarde, até as 17h–18h.
  janelaInicio: "08:00",
  janelaFim: "18:00",
  horaAcordar: "07:00",
  horaDormir: "22:00",
  contagem: { data: null, titulo: "", cirurgia: false },
  lembretesRemedios: true,
  lembretesAgua: true,
};

/**
 * Versão do formato salvo.
 * - 2 (29/09/2026): plano de recomposição — água, peso de partida, janela.
 * - 3 (18/10/2026): copos de 300 ml, horários do dia, contagem e lembretes; o
 *   treino deixou de ter fase.
 */
export const VERSAO_PREFERENCIAS = 3;

/**
 * Leva o que foi gravado numa versão antiga à de hoje. Só troca o que ainda é
 * igual ao padrão de fábrica daquela época — o que ela mudou à mão fica.
 */
export function migrarPreferencias(valor: unknown): { valor: unknown; migrou: boolean } {
  if (!valor || typeof valor !== "object") return { valor, migrou: false };
  let p = valor as Record<string, unknown>;
  const versao = typeof p.versao === "number" ? p.versao : 1;
  if (versao >= VERSAO_PREFERENCIAS) return { valor, migrou: false };
  if (versao < 2) {
    // A versão 1 gravava o objeto inteiro a cada troca de fase do treino:
    // "3,4 L" salvo quase sempre era o padrão antigo, não uma escolha dela.
    p = {
      ...p,
      aguaMetaMl: p.aguaMetaMl === 3400 ? 3200 : p.aguaMetaMl,
      aguaPorcoes: JSON.stringify(p.aguaPorcoes) === "[300,600]" ? [200, 400] : p.aguaPorcoes,
      pesoInicial: p.pesoInicial === 84 ? 85.5 : p.pesoInicial,
    };
  }
  if (versao < 3) {
    // Os botões de 200 e 400 ml eram o "um copo por hora" antigo; agora o copo é de 300.
    p = {
      ...p,
      aguaPorcoes: JSON.stringify(p.aguaPorcoes) === "[200,400]" ? [300] : p.aguaPorcoes,
    };
  }
  return { valor: p, migrou: true };
}

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATA = /^\d{4}-\d{2}-\d{2}$/;

/** "HH:MM" em minutos desde a meia-noite, ou null se não for um horário. */
function minutos(v: unknown): number | null {
  if (typeof v !== "string" || !HORA.test(v)) return null;
  const [h, m] = v.split(":").map(Number);
  return h * 60 + m;
}

/**
 * O dia do app vira às 05:00 (lib/date.ts): o que acontece antes disso ainda
 * é gravado no dia anterior. Por isso nada do dia — acordar, primeiro copo de
 * água, primeira refeição — pode começar antes das 05:00: a marca iria para a
 * véspera, e o servidor dos lembretes não saberia se ela já fez.
 */
const INICIO_DO_DIA = HORA_VIRADA_DO_DIA * 60;

/**
 * A janela abre a partir das 05:00, fecha no mesmo dia e tem entre 4 e 18
 * horas — senão o app calcularia jejum negativo ou de um dia inteiro.
 */
export function ehJanelaValida(inicio: unknown, fim: unknown): boolean {
  const de = minutos(inicio);
  const ate = minutos(fim);
  if (de === null || ate === null || de < INICIO_DO_DIA) return false;
  const duracao = ate - de;
  return duracao >= 4 * 60 && duracao <= 18 * 60;
}

/**
 * A água é dividida dentro do mesmo dia, do primeiro copo (a partir das
 * 05:00) ao último, com pelo menos uma hora entre eles.
 */
export function ehJanelaAguaValida(inicio: unknown, fim: unknown): boolean {
  const de = minutos(inicio);
  const ate = minutos(fim);
  return de !== null && ate !== null && de >= INICIO_DO_DIA && ate - de >= 60;
}

/**
 * Acordar entre 05:00 e 11:59 e dormir entre 18:00 e 23:59: os lembretes de
 * deitar saem 30 minutos antes, e um horário depois da meia-noite cairia no
 * dia seguinte.
 */
export function ehHoraAcordarValida(v: unknown): boolean {
  const m = minutos(v);
  return m !== null && m >= INICIO_DO_DIA && m < 12 * 60;
}

export function ehHoraDormirValida(v: unknown): boolean {
  const m = minutos(v);
  return m !== null && m >= 18 * 60;
}

/** AAAA-MM-DD de uma data que existe no calendário. */
export function ehDataValida(v: unknown): v is string {
  if (typeof v !== "string" || !DATA.test(v)) return false;
  const d = new Date(`${v}T12:00:00`);
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

function numeroValido(valor: unknown, min: number, max: number, padrao: number): number {
  const n = typeof valor === "number" ? valor : Number(valor);
  if (!isFinite(n) || n < min || n > max) return padrao;
  return n;
}

function contagemValida(valor: unknown): Contagem {
  if (!valor || typeof valor !== "object") return { ...PREFERENCIAS_PADRAO.contagem };
  const c = valor as Partial<Contagem>;
  return {
    data: ehDataValida(c.data) ? c.data : null,
    titulo: typeof c.titulo === "string" ? c.titulo.trim().slice(0, 40) : "",
    cirurgia: c.cirurgia === true,
  };
}

/**
 * Monta as preferências campo a campo: o que estiver torto volta ao padrão, e
 * campo que não existe mais (como a antiga fase do treino) cai fora.
 */
export function normalizaPreferencias(valor: unknown): Preferencias | null {
  if (!valor || typeof valor !== "object") return null;
  const p = valor as Partial<Record<keyof Preferencias, unknown>>;
  const P = PREFERENCIAS_PADRAO;
  const porcoes = Array.isArray(p.aguaPorcoes)
    ? p.aguaPorcoes.filter((n): n is number => typeof n === "number" && n > 0).slice(0, 4)
    : [];
  const janelaOk = ehJanelaValida(p.janelaInicio, p.janelaFim);
  const aguaOk = ehJanelaAguaValida(p.aguaInicio, p.aguaFim);
  return {
    aguaMetaMl: numeroValido(p.aguaMetaMl, 300, 8000, P.aguaMetaMl),
    aguaPorcoes: porcoes.length > 0 ? porcoes : [...P.aguaPorcoes],
    aguaCopoMl: numeroValido(p.aguaCopoMl, 100, 1000, P.aguaCopoMl),
    aguaInicio: aguaOk ? (p.aguaInicio as string) : P.aguaInicio,
    aguaFim: aguaOk ? (p.aguaFim as string) : P.aguaFim,
    pesoInicial: numeroValido(p.pesoInicial, 30, 250, P.pesoInicial),
    pesoMeta: numeroValido(p.pesoMeta, 30, 250, P.pesoMeta),
    janelaInicio: janelaOk ? (p.janelaInicio as string) : P.janelaInicio,
    janelaFim: janelaOk ? (p.janelaFim as string) : P.janelaFim,
    horaAcordar: ehHoraAcordarValida(p.horaAcordar) ? (p.horaAcordar as string) : P.horaAcordar,
    horaDormir: ehHoraDormirValida(p.horaDormir) ? (p.horaDormir as string) : P.horaDormir,
    contagem: contagemValida(p.contagem),
    lembretesRemedios: typeof p.lembretesRemedios === "boolean" ? p.lembretesRemedios : P.lembretesRemedios,
    lembretesAgua: typeof p.lembretesAgua === "boolean" ? p.lembretesAgua : P.lembretesAgua,
  };
}

/** O que vai para o banco e para o aparelho: as preferências com a versão. */
export function paraGravar(prefs: Preferencias): Preferencias & { versao: number } {
  return { ...prefs, versao: VERSAO_PREFERENCIAS };
}

/**
 * Do jeito que veio do banco (ou do aparelho) às preferências de hoje: migra,
 * normaliza e, se nada servir, devolve o padrão. Usado também pelo servidor.
 */
export function lerPreferencias(valor: unknown): Preferencias {
  return normalizaPreferencias(migrarPreferencias(valor).valor) ?? clonarPadrao();
}

/** Cópia do padrão — ninguém deve mexer no objeto de fábrica. */
export function clonarPadrao(): Preferencias {
  return {
    ...PREFERENCIAS_PADRAO,
    aguaPorcoes: [...PREFERENCIAS_PADRAO.aguaPorcoes],
    contagem: { ...PREFERENCIAS_PADRAO.contagem },
  };
}
