/**
 * Bioimpedância — o exame de composição corporal da Milena.
 *
 * O exame de 12/08/2026 é o ponto de partida da recomposição: mora aqui no
 * código e não se apaga. Os próximos ela registra pelo app (lib/bioimpedancia.ts).
 *
 * O laudo tem o formato das balanças Omron (músculo esquelético em %, gordura
 * visceral em nível, idade estimada). As faixas abaixo foram conferidas no
 * manual da Omron (modelo HBF-514C): gordura corporal pela tabela de Gallagher
 * et al. (Am J Clin Nutr, 2000), músculo esquelético e gordura visceral pela
 * própria Omron, IMC pela OMS. São referências da balança, não diagnóstico —
 * outro aparelho pode usar outras faixas, e é por isso que o exame se repete
 * sempre no mesmo.
 */

import { PERFIL, PLANO } from "./protocol";

export type Bioimpedancia = {
  /** Dia do exame, AAAA-MM-DD. É a chave: um exame por dia. */
  date: string;
  /** Peso na balança do exame, em kg. */
  peso: number | null;
  /** Gordura corporal, em % do peso. */
  gordura: number | null;
  /** Músculo esquelético, em % do peso. */
  musculo: number | null;
  /** Gordura visceral, em nível (de 1 a 30 na escala da Omron). */
  visceral: number | null;
  /** Metabolismo em repouso, em kcal por dia. */
  metabolismo: number | null;
  /**
   * Idade estimada pela balança, em anos. O laudo dela diz "idade biológica
   * estimada" — daí o "Idade biológica" da tela; a Omron chama de idade
   * corporal, de onde vêm a chave e a coluna idade_corporal.
   */
  idadeCorporal: number | null;
  /**
   * Idade dela no dia do exame. As faixas de gordura e de músculo mudam aos
   * 40, então cada exame guarda a sua. Vazio = PERFIL.idade.
   */
  idade: number | null;
  /** Anotação livre: horário, aparelho, fase do ciclo. */
  obs: string | null;
};

/**
 * Bioimpedância de 12/08/2026, que ela mandou em 29/09. O laudo também trazia
 * altura 1,61 m e IMC 33,0 — o IMC o app calcula (peso ÷ altura²) e dá o mesmo.
 *
 * Em quilos, que o laudo não traz: ≈ 40,5 kg de gordura, 45,0 de massa magra e
 * 19,8 de músculo esquelético. A proteína do plano (90–100 g por dia) dá cerca
 * de 2 g por kg dessa massa magra.
 */
export const EXAME_BASE = {
  date: "2026-08-12",
  peso: 85.5,
  gordura: 47.4,
  musculo: 23.2,
  visceral: 10,
  metabolismo: 1554.4,
  idadeCorporal: 61,
  // Em 12/08 ela tinha 38 ou 39 — as duas idades caem na mesma faixa.
  idade: 39,
  obs: null,
} satisfies Bioimpedancia;

/* -------------------------------------------------------------------------- */
/* Números                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * 47.4 → "47,4"; 1554.4 → "1.554,4". Sempre sem sinal: quem mostra variação
 * decide o sinal. Feito à mão para sair igual em qualquer aparelho.
 */
export function formatarNumero(valor: number, casas = 1): string {
  const [inteiro, decimal] = Math.abs(valor).toFixed(casas).split(".");
  const comMilhar = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return decimal ? `${comMilhar},${decimal}` : comMilhar;
}

/** Peso ÷ altura², com uma casa — o mesmo arredondamento do laudo. */
export function imcDe(pesoKg: number, alturaM: number = PERFIL.alturaM): number {
  return Math.round((pesoKg / (alturaM * alturaM)) * 10) / 10;
}

/* -------------------------------------------------------------------------- */
/* Faixas de referência                                                       */
/* -------------------------------------------------------------------------- */

/** Como a faixa soa no selo: verde, dourado ou terracota. */
export type Tom = "bom" | "atencao" | "alerta";

export type Faixa = {
  rotulo: string;
  tom: Tom;
  /** A faixa normal, para o selo vir com a régua junto. */
  normal: string;
};

type Degrau = { abaixoDe: number; rotulo: string; tom: Tom };

function naEscada(valor: number, degraus: Degrau[], normal: string): Faixa {
  const degrau = degraus.find((d) => valor < d.abaixoDe) ?? degraus[degraus.length - 1];
  return { rotulo: degrau.rotulo, tom: degrau.tom, normal };
}

type CortesPorIdade = { ateIdade: number; cortes: [number, number, number] }[];

function cortesPara(tabela: CortesPorIdade, idade: number): [number, number, number] {
  return (tabela.find((t) => idade <= t.ateIdade) ?? tabela[tabela.length - 1]).cortes;
}

/** IMC pela OMS. */
export function faixaImc(imc: number): Faixa {
  return naEscada(
    imc,
    [
      { abaixoDe: 18.5, rotulo: "abaixo do peso", tom: "atencao" },
      { abaixoDe: 25, rotulo: "normal", tom: "bom" },
      { abaixoDe: 30, rotulo: "sobrepeso", tom: "atencao" },
      { abaixoDe: 35, rotulo: "obesidade grau I", tom: "alerta" },
      { abaixoDe: 40, rotulo: "obesidade grau II", tom: "alerta" },
      { abaixoDe: Infinity, rotulo: "obesidade grau III", tom: "alerta" },
    ],
    "18,5 a 24,9",
  );
}

/**
 * Gordura corporal de mulher (Gallagher et al., 2000, como no manual da Omron).
 * Abaixo do 1º corte é baixa, até o 2º é normal, até o 3º é alta, e dali para
 * cima é muito alta.
 */
const CORTES_GORDURA: CortesPorIdade = [
  { ateIdade: 39, cortes: [21, 33, 39] }, // 20 a 39 anos
  { ateIdade: 59, cortes: [23, 34, 40] }, // 40 a 59
  { ateIdade: Infinity, cortes: [24, 36, 42] }, // 60 a 79
];

export function faixaGordura(pct: number, idade: number): Faixa {
  const [normal, alta, muitoAlta] = cortesPara(CORTES_GORDURA, idade);
  return naEscada(
    pct,
    [
      { abaixoDe: normal, rotulo: "baixa", tom: "atencao" },
      { abaixoDe: alta, rotulo: "normal", tom: "bom" },
      { abaixoDe: muitoAlta, rotulo: "alta", tom: "atencao" },
      { abaixoDe: Infinity, rotulo: "muito alta", tom: "alerta" },
    ],
    `${formatarNumero(normal, 0)} a ${formatarNumero(alta - 0.1)}%`,
  );
}

/** Músculo esquelético de mulher, pela Omron. Mesma lógica de cortes. */
const CORTES_MUSCULO: CortesPorIdade = [
  { ateIdade: 39, cortes: [24.3, 30.4, 35.4] }, // 18 a 39 anos
  { ateIdade: 59, cortes: [24.1, 30.2, 35.2] }, // 40 a 59
  { ateIdade: Infinity, cortes: [23.9, 30, 35] }, // 60 a 80
];

export function faixaMusculo(pct: number, idade: number): Faixa {
  const [normal, alto, muitoAlto] = cortesPara(CORTES_MUSCULO, idade);
  return naEscada(
    pct,
    [
      { abaixoDe: normal, rotulo: "baixo", tom: "atencao" },
      { abaixoDe: alto, rotulo: "normal", tom: "bom" },
      // Músculo acima do normal não é problema: o selo continua verde.
      { abaixoDe: muitoAlto, rotulo: "alto", tom: "bom" },
      { abaixoDe: Infinity, rotulo: "muito alto", tom: "bom" },
    ],
    `${formatarNumero(normal)} a ${formatarNumero(alto - 0.1)}%`,
  );
}

/**
 * Gordura visceral, pela Omron: até 9 é normal, de 10 a 14 é alta, de 15 para
 * cima é muito alta. Vale para homem e mulher, em qualquer idade. O "abaixo de
 * 10" cobre também os aparelhos que marcam meio nível (9,5 ainda é normal).
 */
export function faixaVisceral(nivel: number): Faixa {
  return naEscada(
    nivel,
    [
      { abaixoDe: 10, rotulo: "normal", tom: "bom" },
      { abaixoDe: 15, rotulo: "alta", tom: "atencao" },
      { abaixoDe: Infinity, rotulo: "muito alta", tom: "alerta" },
    ],
    "até 9",
  );
}

/* -------------------------------------------------------------------------- */
/* Métricas do laudo                                                          */
/* -------------------------------------------------------------------------- */

export type ChaveMetrica =
  | "peso"
  | "imc"
  | "gordura"
  | "musculo"
  | "visceral"
  | "metabolismo"
  | "idadeCorporal";

/** Para que lado a mudança é boa. */
export type Sentido = "descer" | "subir" | "neutro";

export type Metrica = {
  chave: ChaveMetrica;
  rotulo: string;
  unidade: string;
  /** Casas decimais. Sem valor: inteiro quando o laudo traz inteiro. */
  casas?: number;
  sentido: Sentido;
  /** Mudança menor que isto conta como estável: a própria balança oscila. */
  tolerancia: number;
  /** O que o número quer dizer, em uma linha. */
  significado: string;
};

export const METRICAS: Metrica[] = [
  {
    chave: "peso",
    rotulo: "Peso",
    unidade: "kg",
    casas: 1,
    sentido: "descer",
    tolerancia: 0.2,
    significado: "Tudo junto: gordura, músculo, água e osso. Sozinho, não conta a história.",
  },
  {
    chave: "imc",
    rotulo: "IMC",
    unidade: "",
    casas: 1,
    sentido: "descer",
    tolerancia: 0.1,
    significado: "Peso ÷ altura². Não separa gordura de músculo, por isso a composição conta mais.",
  },
  {
    chave: "gordura",
    rotulo: "Gordura corporal",
    unidade: "%",
    casas: 1,
    sentido: "descer",
    tolerancia: 0.3,
    significado: "Quanto do seu peso é gordura. É o número que a recomposição quer ver descer.",
  },
  {
    chave: "musculo",
    rotulo: "Músculo esquelético",
    unidade: "%",
    casas: 1,
    sentido: "subir",
    tolerancia: 0.3,
    significado:
      "O músculo que você treina. A % sobe sozinha quando a gordura cai — por isso vale olhar os quilos, logo abaixo.",
  },
  {
    chave: "visceral",
    rotulo: "Gordura visceral",
    unidade: "",
    sentido: "descer",
    tolerancia: 0.1,
    significado:
      "A gordura de dentro da barriga, em volta dos órgãos — ligada a diabetes, colesterol e gordura no fígado.",
  },
  {
    chave: "metabolismo",
    rotulo: "Metabolismo em repouso",
    unidade: "kcal",
    // Neutro de propósito: ele cai um pouco quando o peso cai, e pintar isso de
    // "piorou" puniria justamente a perda de peso.
    sentido: "neutro",
    tolerancia: 0,
    significado:
      "O que o corpo gasta por dia parado, só para funcionar. Cai um pouco quando o peso cai; o músculo ajuda a segurar.",
  },
  {
    chave: "idadeCorporal",
    // O nome do laudo dela, para ela achar o campo ao copiar o próximo exame.
    rotulo: "Idade biológica",
    unidade: "anos",
    sentido: "descer",
    tolerancia: 0.5,
    significado:
      "Estimativa da balança feita a partir do metabolismo em repouso. Serve de termômetro, não de diagnóstico.",
  },
];

const METRICA_POR_CHAVE = Object.fromEntries(METRICAS.map((m) => [m.chave, m])) as Record<
  ChaveMetrica,
  Metrica
>;

/** Valor de uma métrica no exame. O IMC sai do peso. */
export function valorDe(exame: Bioimpedancia, chave: ChaveMetrica): number | null {
  if (chave === "imc") return exame.peso === null ? null : imcDe(exame.peso);
  return exame[chave];
}

/** Idade que vale para as faixas daquele exame. */
export function idadeNoExame(exame: Bioimpedancia): number {
  return exame.idade ?? PERFIL.idade;
}

/** Faixa de referência, quando a métrica tem. Peso, metabolismo e idade biológica não têm. */
export function faixaDe(chave: ChaveMetrica, valor: number, idade: number): Faixa | null {
  switch (chave) {
    case "imc":
      return faixaImc(valor);
    case "gordura":
      return faixaGordura(valor, idade);
    case "musculo":
      return faixaMusculo(valor, idade);
    case "visceral":
      return faixaVisceral(valor);
    default:
      return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Em quilos                                                                  */
/* -------------------------------------------------------------------------- */

export type ChaveKg = "gorduraKg" | "massaMagraKg" | "musculoKg";

/** Mesma oscilação da balança: 0,3 ponto em ~85 kg dá uns 0,3 kg. */
const TOLERANCIA_KG = 0.3;

export const METRICAS_KG: { chave: ChaveKg; rotulo: string; sentido: Sentido; tolerancia: number }[] =
  [
    { chave: "gorduraKg", rotulo: "Gordura", sentido: "descer", tolerancia: TOLERANCIA_KG },
    { chave: "massaMagraKg", rotulo: "Massa magra", sentido: "subir", tolerancia: TOLERANCIA_KG },
    { chave: "musculoKg", rotulo: "Músculo", sentido: "subir", tolerancia: TOLERANCIA_KG },
  ];

/** O laudo dá porcentagens; a conta do app é peso × porcentagem. */
export function emQuilos(exame: Bioimpedancia): Record<ChaveKg, number | null> {
  const { peso, gordura, musculo } = exame;
  const gorduraKg = peso !== null && gordura !== null ? (peso * gordura) / 100 : null;
  return {
    gorduraKg,
    // Massa magra é tudo o que não é gordura: músculo, água, osso e órgãos.
    massaMagraKg: peso !== null && gorduraKg !== null ? peso - gorduraKg : null,
    musculoKg: peso !== null && musculo !== null ? (peso * musculo) / 100 : null,
  };
}

/* -------------------------------------------------------------------------- */
/* Comparação                                                                 */
/* -------------------------------------------------------------------------- */

export type Avaliacao = "melhorou" | "piorou" | "estavel" | "neutro";

/** Diz se a mudança de um exame para o outro foi para o lado certo. */
export function avaliar(sentido: Sentido, tolerancia: number, de: number, para: number): Avaliacao {
  if (sentido === "neutro") return "neutro";
  // Arredonda antes de comparar: 47,1 − 47,4 dá −0,29999… no JavaScript.
  const delta = Math.round((para - de) * 100) / 100;
  if (Math.abs(delta) < tolerancia) return "estavel";
  return delta < 0 === (sentido === "descer") ? "melhorou" : "piorou";
}

/* -------------------------------------------------------------------------- */
/* Metas para o próximo exame                                                 */
/* -------------------------------------------------------------------------- */

export type ConferenciaMeta = {
  atingida: boolean;
  /** Os números da conferência, dizendo com qual exame comparou. */
  detalhe: string;
};

export type MetaExame = {
  id: string;
  titulo: string;
  /** O porquê, lido no exame de partida. */
  porque: string;
  /**
   * Confere a meta no último exame da lista (em ordem de data). `null` quando o
   * exame não responde: falta o número, ou a meta depende da fita e do treino.
   */
  confere: (exames: Bioimpedancia[], partida: Bioimpedancia) => ConferenciaMeta | null;
};

const MUSCULO_KG_BASE = emQuilos(EXAME_BASE).musculoKg ?? 0;

function diaMes(iso: string): string {
  const [, mes, dia] = iso.split("-");
  return `${dia}/${mes}`;
}

function comparadoCom(exame: Bioimpedancia, partida: Bioimpedancia): string {
  return exame.date === partida.date ? "no ponto de partida" : `no exame de ${diaMes(exame.date)}`;
}

/**
 * Metas de tendência ("descendo") comparam com o exame anterior que tenha o
 * número: comparar sempre com a partida deixaria a meta "cumprida" para sempre,
 * mesmo se ela voltasse a subir de um exame para o outro.
 */
function contraAnterior(
  chave: ChaveMetrica,
  exames: Bioimpedancia[],
  partida: Bioimpedancia,
): ConferenciaMeta | null {
  const ultimo = exames[exames.length - 1];
  const para = ultimo ? valorDe(ultimo, chave) : null;
  const anterior = exames
    .slice(0, -1)
    .reverse()
    .find((e) => valorDe(e, chave) !== null);
  const de = anterior ? valorDe(anterior, chave) : null;
  if (!anterior || de === null || para === null) return null;
  const m = METRICA_POR_CHAVE[chave];
  const casas = m.casas ?? (Number.isInteger(de) && Number.isInteger(para) ? 0 : 1);
  const unidade = m.unidade === "%" ? "%" : "";
  return {
    atingida: avaliar(m.sentido, m.tolerancia, de, para) === "melhorou",
    detalhe: `${formatarNumero(para, casas)}${unidade} contra ${formatarNumero(de, casas)}${unidade} ${comparadoCom(anterior, partida)}.`,
  };
}

export const METAS_PROXIMO_EXAME: MetaExame[] = [
  {
    id: "visceral",
    titulo: "Gordura visceral de volta ao normal (até 9)",
    // Revisões de estudos: com perda de peso moderada, a visceral cai
    // proporcionalmente mais que a gordura de baixo da pele (Chaston e Dixon,
    // 2008), e o exercício a reduz mesmo com pouca mudança no peso (Verheggen
    // et al., 2016).
    porque:
      "Em 12/08 deu 10: acabou de entrar na faixa alta, então voltar para 9 é a primeira meta. É a gordura que costuma responder primeiro quando o peso começa a cair — e o treino ajuda a baixar mesmo quando a balança anda devagar.",
    confere: (exames) => {
      const ultimo = exames[exames.length - 1];
      if (!ultimo || ultimo.visceral === null) return null;
      const nivel = formatarNumero(ultimo.visceral, Number.isInteger(ultimo.visceral) ? 0 : 1);
      return {
        atingida: ultimo.visceral < 10,
        // Minúscula: a tela mostra "Chegou lá — deu 9 no exame de 25/09."
        detalhe: `deu ${nivel} no exame de ${diaMes(ultimo.date)}.`,
      };
    },
  },
  {
    id: "gordura",
    titulo: "Gordura corporal descendo",
    porque: `Em 12/08 deu ${formatarNumero(EXAME_BASE.gordura)}%, na faixa muito alta. Não precisa ser rápido: cada exame um pouco abaixo do anterior já é o caminho.`,
    confere: (exames, partida) => contraAnterior("gordura", exames, partida),
  },
  {
    id: "musculo",
    titulo: "Músculo em quilos parado ou subindo",
    porque: `${formatarNumero(EXAME_BASE.musculo)}% (cerca de ${formatarNumero(MUSCULO_KG_BASE)} kg) está um pouco abaixo do normal, que começa em 24,3%. Vigie os quilos: a porcentagem sobe sozinha quando a gordura cai, mesmo sem ganhar músculo.`,
    // Contra a partida, e não contra o exame anterior: uma perda pequena por
    // exame passaria sempre como "estável", mas somada vira músculo perdido.
    confere: (exames, partida) => {
      const ultimo = exames[exames.length - 1];
      const de = emQuilos(partida).musculoKg;
      const para = ultimo ? emQuilos(ultimo).musculoKg : null;
      if (de === null || para === null) return null;
      const r = avaliar("subir", TOLERANCIA_KG, de, para);
      return {
        atingida: r === "melhorou" || r === "estavel",
        detalhe: `${formatarNumero(para)} kg contra ${formatarNumero(de)} kg no ponto de partida.`,
      };
    },
  },
  {
    id: "idade",
    titulo: "Idade biológica descendo",
    porque: `Deu ${EXAME_BASE.idadeCorporal} para os seus ${EXAME_BASE.idade}. A balança chega nela pelo metabolismo em repouso, e o número desce quando o músculo sobe e a gordura desce.`,
    confere: (exames, partida) => contraAnterior("idadeCorporal", exames, partida),
  },
  {
    id: "sinal",
    titulo: PLANO.objetivo.replace(/\.$/, ""),
    porque:
      "É o melhor sinal de recomposição, nas palavras do resumo da alimentação. O peso sai daqui e da balança; a cintura, da aba Medidas; e, para a força, compare as cargas que você anota em cada exercício do treino.",
    confere: () => null,
  },
];

/* -------------------------------------------------------------------------- */
/* Como repetir o exame                                                       */
/* -------------------------------------------------------------------------- */

/** De 4 a 6 semanas entre um exame e outro. */
export const INTERVALO_EXAME = { minDias: 28, maxDias: 42 };

/**
 * Condições para a comparação valer. Conferidas no manual da Omron (horário,
 * refeição, água, exercício, banho, álcool) e nas diretrizes de bioimpedância
 * da ESPEN, Kyle et al. 2004 (jejum, álcool, bexiga, exercício, mesmo horário,
 * ciclo menstrual).
 */
export const DICAS_EXAME = [
  "Mesmo aparelho, de preferência na mesma clínica. Cada aparelho faz a conta do seu jeito, e trocar muda o número sem o corpo mudar.",
  "Mesmo horário do exame anterior — anote no registro para lembrar da próxima vez.",
  "Sem comer nas 4 horas antes e sem virar muita água logo antes. De manhã, antes do café, é o mais fácil de repetir.",
  "Sem treino, sauna ou banho quente logo antes: marque para antes do treino ou para um dia de descanso.",
  "Sem álcool nos dois dias anteriores.",
  "Bexiga vazia: faça xixi antes de subir no aparelho.",
  "Se a menstruação já voltou, anote a fase do ciclo — a retenção de líquido desses dias pode mexer no resultado.",
  "Repita a cada 4 a 6 semanas. Antes disso, a mudança costuma ser menor que a oscilação do próprio aparelho.",
];
