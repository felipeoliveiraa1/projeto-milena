/**
 * Remédios e suplementos — a lista que a Milena mandou em 29/09/2026.
 *
 * A dose de cada item está escrita do jeito que veio na lista. O app não
 * inventa quantidade, não escolhe horário que não foi dado e não promete
 * efeito do que não conhece: o que vai na fórmula, por exemplo, está na
 * receita, não aqui.
 *
 * O que mudou em relação à lista antiga (a do Desinflama-se):
 * - entraram testosterona, fórmula e Mounjaro;
 * - a B12 passou da manhã para a noite, a vitamina D da segunda para o
 *   domingo, e o colágeno virou comprimido;
 * - NAC, glutamina, ômega 3 e Pró Magnésio não estão na lista nova. Ficam em
 *   FORA_DA_LISTA, visíveis na tela, para nada sumir sem explicação;
 * - o whey, suspenso no protocolo antigo por ser derivado do leite, voltou no
 *   lanche da tarde e mora na aba Dieta.
 *
 * Os avisos do Mounjaro foram conferidos na bula brasileira e no guia do
 * paciente da FDA; os da testosterona, nas bulas do gel (a do Androgel no
 * Brasil e o guia da FDA). As dicas para o enjoo vêm do material do fabricante
 * para pacientes. O que não estava nessas fontes ficou de fora.
 *
 * Os ids são gravados no Supabase (daily_checks.supplements) e o histórico
 * depende deles: um id nunca muda, mesmo quando o nome ou a dose mudam.
 */

import type { RotinaBloco } from "./protocol";

/** Períodos da rotina: manhã (até 12h), dia (12h–18h) e noite (depois das 18h). */
export type PeriodoRotina = RotinaBloco["periodo"];

export type BlocoSuplemento = "manha" | "almoco" | "noite" | "semanal";

/**
 * medicamento = remédio com bula e receita — só o médico mexe;
 * prescricao = passado pelo médico, na dose da receita;
 * suplemento = de venda livre, parte da rotina.
 */
export type StatusSuplemento = "medicamento" | "prescricao" | "suplemento";

export type Supplement = {
  id: string;
  /** Nome como veio na lista, com marca e concentração. */
  nome: string;
  /** Nome curto, para o histórico. */
  curto: string;
  /** Dose e frequência como vieram na lista. */
  dose: string;
  bloco: BlocoSuplemento;
  /** Dias da semana em que ele entra (0 = domingo). Sem isto, é todo dia. */
  dias?: number[];
  funcao: string;
  /** Como tomar ou aplicar, um passo por linha. */
  comoUsar?: string[];
  observacao?: string;
  /** Sinais que pedem médico ou atendimento. Aparecem em destaque. */
  alertas?: string[];
  /** O que mudou em relação à lista antiga — a troca não passa em silêncio. */
  antes?: string;
  status: StatusSuplemento;
};

export const ROTULO_STATUS: Record<StatusSuplemento, string> = {
  medicamento: "Medicamento",
  prescricao: "Prescrição médica",
  suplemento: "Suplemento",
};

export const BLOCOS_SUPLEMENTOS: {
  id: BlocoSuplemento;
  titulo: string;
  detalhe: string;
  /**
   * Em que período da rotina o bloco aparece na tela inicial. "dia-todo" é o
   * do semanal: no dia dele, aparece a qualquer hora até ser marcado —
   * esquecer o semanal é perder a semana inteira.
   */
  periodo: PeriodoRotina | "dia-todo";
}[] = [
  {
    id: "manha",
    titulo: "De manhã",
    detalhe: "No começo do dia.",
    periodo: "manha",
  },
  {
    id: "almoco",
    titulo: "Depois do almoço",
    detalhe: "Logo depois da refeição do meio do dia.",
    periodo: "dia",
  },
  {
    id: "noite",
    titulo: "À noite",
    detalhe: "Antes de dormir, com a janela de comer já fechada.",
    periodo: "noite",
  },
  {
    id: "semanal",
    titulo: "Uma vez por semana",
    detalhe: "Cada um no seu dia. No dia, ele fica na tela inicial até você marcar.",
    periodo: "dia-todo",
  },
];

export const SUPPLEMENTS: Supplement[] = [
  /* ----------------------------- manhã ----------------------------------- */
  {
    id: "testosterona",
    nome: "Testosterona",
    curto: "Testosterona",
    dose: "1 pump ao dia, no horário que o médico indicou",
    bloco: "manha",
    funcao: "Hormônio receitado pelo médico. O app só lembra — dose e ajuste são com ele.",
    comoUsar: [
      "Sempre no mesmo horário. A lista não diz qual, então aqui ela fica de manhã — vale o que o médico indicou.",
      // Banho logo depois de passar leva parte da dose embora.
      "Passe depois do banho, na pele limpa e seca. Se o banho do treino cair dentro das horas sem molhar, treine antes, tome banho e passe depois dele — e mantenha esse horário nos outros dias.",
      "Lave as mãos com água e sabão logo depois de passar.",
      "Espere secar e deixe o local coberto pela roupa.",
      // Bulas do Androgel: 2 h no gel de 16,2 mg/g e 6 h no de 1%. A dela pode
      // ser outra apresentação (ou manipulada), por isso o app não crava o tempo.
      "Não molhe o local por algumas horas depois de passar — nas bulas do gel, de 2 a 6 h, conforme a apresentação. Confirme o tempo da sua com o médico ou a farmácia.",
    ],
    alertas: [
      "O bebê não pode encostar no local: o hormônio que fica na pele passa para quem toca ali. Vai pegá-lo no colo pele com pele? Lave o local com água e sabão antes. Se ele tocar sem querer, lave com água e sabão a pele dele.",
      "Pelos na região íntima ou aumento do pênis ou do clitóris no bebê podem ser sinal de que o hormônio passou para ele: avise o pediatra e o seu médico logo.",
      "Menstruação atrasada, suspeita de gravidez ou planos de engravidar: fale com o médico antes da próxima dose. Testosterona não pode ser usada na gravidez.",
      "Espinhas, pelos novos, queda de cabelo ou voz mais grossa: avise o médico logo — a mudança na voz pode não voltar.",
    ],
    status: "medicamento",
  },
  {
    id: "creatina",
    nome: "Creatina",
    curto: "Creatina",
    dose: "Dose habitual, todo dia",
    bloco: "manha",
    funcao:
      "Mais força e recuperação no treino. Treino que rende é o que protege o músculo enquanto a gordura sai.",
    comoUsar: [
      "A dose habitual costuma ser de 3 a 5 g — siga a que você já usa.",
      "Todo dia, inclusive sem treino: o efeito vem de manter o músculo abastecido. Não precisa ciclar.",
      "O horário importa pouco; o que conta é não pular. Ficou de manhã, como já estava.",
      "Beba água ao longo do dia.",
    ],
    status: "suplemento",
  },

  /* -------------------------- depois do almoço ---------------------------- */
  {
    id: "formula",
    nome: "Fórmula",
    curto: "Fórmula",
    dose: "1 dose após o almoço",
    bloco: "almoco",
    funcao:
      "A fórmula que o médico prescreveu. O que vai nela está na receita — por isso o app não promete efeito.",
    status: "prescricao",
  },

  /* ----------------------------- noite ----------------------------------- */
  {
    id: "b12",
    nome: "Vitamina B12 Dozi 1.000 mcg",
    curto: "B12",
    dose: "1 comprimido sublingual à noite",
    bloco: "noite",
    funcao:
      "Ajuda a formar o sangue e a manter os nervos funcionando — falta de B12 dá cansaço.",
    comoUsar: ["Deixe dissolver embaixo da língua, sem engolir inteiro nem mastigar."],
    antes: "Estava de manhã. A lista de 29/09 diz à noite — vale a lista.",
    status: "prescricao",
  },
  {
    id: "colageno",
    nome: "Colágeno Verisol ProFit",
    curto: "Colágeno",
    dose: "4 comprimidos à noite",
    bloco: "noite",
    funcao: "Para a pele: o Verisol é um colágeno estudado para firmeza e elasticidade.",
    comoUsar: [
      "Colágeno é proteína, então tem um pouco de caloria. Se quiser o jejum da noite sem nada, pergunte ao médico se os comprimidos podem ir para a última refeição da janela. Até lá, vale a lista: à noite.",
    ],
    observacao:
      "Não entra na conta da proteína do dia: é pouca e de um tipo incompleto. Os 90–100 g vêm da comida e do whey.",
    antes: "O app mandava dissolver na água ou no chá da noite. Agora são 4 comprimidos.",
    status: "suplemento",
  },

  /* -------------------------- uma vez por semana -------------------------- */
  {
    id: "mounjaro",
    nome: "Mounjaro 2,5 mg",
    curto: "Mounjaro",
    dose: "1 aplicação por semana, na quinta",
    bloco: "semanal",
    dias: [4], // quinta-feira
    funcao:
      "Tirzepatida: diminui a fome e deixa a digestão mais lenta — é por causa dele que comer à noite pesa. Na bula, 2,5 mg é a dose de início; se e quando sobe, quem decide é o médico.",
    comoUsar: [
      "Na quinta, a qualquer hora do dia, com ou sem comida.",
      "Troque o local a cada semana: barriga, coxa ou — se outra pessoa aplicar — a parte de trás do braço.",
      "Esqueceu? Aplique assim que lembrar, em até 4 dias (96 h) depois da quinta. Passou disso, pule essa dose e siga na quinta seguinte. Nunca duas doses com menos de 3 dias entre elas.",
      "Enjoo, diarreia, intestino preso e pouca fome são os efeitos mais comuns. Aparecem mais no começo e a cada aumento de dose, e diminuem com o tempo. Para o enjoo, o fabricante sugere refeições menores, parar quando estiver satisfeita e evitar comida gordurosa.",
    ],
    // Do mais urgente para o que é só conversa com o médico.
    alertas: [
      "Dor forte na barriga que não passa, com ou sem vômito, às vezes indo para as costas: procure atendimento na hora e fale com o médico antes da próxima aplicação.",
      // Alergia: a bula manda interromper e avisar o médico; o guia da FDA,
      // procurar ajuda na hora. "Não aplique de novo antes de falar com ele"
      // junta as duas sem suspender o remédio por conta própria.
      "Sinais de alergia forte — inchaço no rosto, na boca ou na garganta, dificuldade para respirar ou engolir, vermelhidão ou coceira forte pelo corpo, tontura forte, coração muito acelerado ou desmaio: procure atendimento na hora. Vergões ou coceira leves: avise o médico. Nos dois casos, não aplique de novo antes de falar com ele.",
      "Vômito ou diarreia que não param, ou sinais de desidratação (boca seca, pouco xixi, tontura): procure atendimento. Desidratação pesa nos rins.",
      "Dor no alto da barriga, febre, pele ou olhos amarelados ou fezes claras: avise o médico logo — pode ser a vesícula.",
      "Caroço ou inchaço no pescoço, rouquidão que não passa, dificuldade para engolir ou falta de ar: avise o médico.",
      // A bula brasileira pede falar com o médico imediatamente em piora do
      // humor ou pensamentos suicidas com remédios para perder peso — e ela
      // está a poucos meses do parto.
      "Tristeza ou desânimo que não passam, mudança fora do comum no humor ou no comportamento, ou pensamentos de se machucar ou de morrer: fale com o médico na hora, como pede a bula. Em crise, ligue 188 (CVV, 24 h, grátis) ou 192 (SAMU).",
      "Menstruação atrasada ou suspeita de gravidez: fale com o médico antes da próxima aplicação. Planeja engravidar? A bula pede parar o Mounjaro pelo menos 1 mês antes — combine com o médico.",
      "Anticoncepcional em comprimido pode perder efeito nas 4 semanas depois de começar e depois de cada aumento de dose. Nesse período, a bula pede camisinha junto ou um método que não seja comprimido — confirme com o médico.",
      "Antes da cirurgia plástica ou de qualquer anestesia, avise o cirurgião e o anestesista: o Mounjaro faz o estômago esvaziar mais devagar, e isso importa na anestesia.",
    ],
    status: "medicamento",
  },
  {
    id: "vitd",
    nome: "Vitamina D3 Doss 50.000 UI",
    curto: "Vitamina D3",
    dose: "1 cápsula por semana, no domingo, depois do café da manhã",
    bloco: "semanal",
    dias: [0], // domingo
    funcao: "Ajuda o corpo a aproveitar o cálcio e a cuidar dos ossos. A dose é a que o médico passou.",
    observacao:
      "Vitamina D se dissolve em gordura: depois do café, que tem ovo e queijo, o corpo aproveita melhor.",
    antes: "Era na segunda. A lista de 29/09 passou para o domingo.",
    status: "prescricao",
  },
];

/* -------------------------------------------------------------------------- */
/* O que saiu e o que voltou                                                  */
/* -------------------------------------------------------------------------- */

const NAO_ESTA_NA_LISTA =
  "Não está na lista que você mandou em 29/09. Se ainda toma, avise para voltar ao app.";

/** Estavam na lista antiga e não vieram na de 29/09. Os ids são os do histórico. */
export const FORA_DA_LISTA: { id: string; nome: string; porque: string }[] = [
  { id: "nac", nome: "NAC", porque: NAO_ESTA_NA_LISTA },
  { id: "glutamina", nome: "Glutamina", porque: NAO_ESTA_NA_LISTA },
  { id: "omega3", nome: "Ômega 3", porque: NAO_ESTA_NA_LISTA },
  { id: "magnesio", nome: "Pró Magnésio", porque: NAO_ESTA_NA_LISTA },
];

/** Estava suspenso no protocolo antigo e voltou com o plano novo. */
export const VOLTOU_NA_DIETA = {
  nome: "Whey protein",
  texto:
    "Estava suspenso no protocolo antigo, por ser derivado do leite. No plano novo ele voltou, no lanche da tarde — e fica na aba Dieta, junto das refeições.",
};

/* -------------------------------------------------------------------------- */
/* Ajudantes                                                                  */
/* -------------------------------------------------------------------------- */

export const NOMES_DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

/** Semanal é o que tem dia marcado: entra em alguns dias, não em todos. */
export function ehSemanal(s: Supplement): boolean {
  return !!s.dias && s.dias.length > 0 && s.dias.length < 7;
}

/** Entra nesse dia da semana (0 = domingo)? Sem `dias`, entra todo dia. */
export function entraNoDia(s: Supplement, diaSemana: number): boolean {
  return !s.dias || s.dias.length === 0 || s.dias.includes(diaSemana);
}

/** "1x por semana · quinta". `null` para o que é de todo dia. */
export function frequencia(s: Supplement): string | null {
  if (!ehSemanal(s) || !s.dias) return null;
  return `${s.dias.length}x por semana · ${s.dias.map((d) => NOMES_DIAS[d]).join(" e ")}`;
}

/** Quantos dias faltam, a partir de um dia da semana, para a próxima vez do item. 0 = hoje. */
export function diasAteProxima(s: Supplement, diaSemana: number): number {
  for (let k = 0; k < 7; k++) {
    if (entraNoDia(s, (diaSemana + k) % 7)) return k;
  }
  return 0;
}

/** Tudo o que entra num dia da semana: os diários e os semanais daquele dia. */
export function suplementosDoDia(diaSemana: number): Supplement[] {
  return SUPPLEMENTS.filter((s) => entraNoDia(s, diaSemana));
}

/**
 * O que cabe num período da rotina: os diários do bloco daquele período e,
 * se for o dia deles, os semanais — que valem o dia todo.
 */
export function suplementosDoPeriodo(periodo: PeriodoRotina, diaSemana: number): Supplement[] {
  const blocos = new Set(
    BLOCOS_SUPLEMENTOS.filter((b) => b.periodo === periodo || b.periodo === "dia-todo").map(
      (b) => b.id,
    ),
  );
  return suplementosDoDia(diaSemana).filter((s) => blocos.has(s.bloco));
}

/**
 * O que foi marcado num dia, com nome: primeiro a lista atual, depois os que
 * saíram dela — assim o histórico de antes de 29/09 continua mostrando tudo.
 */
export function suplementosTomados(
  marcas: Record<string, boolean | string>,
): { id: string; nome: string; foraDaLista: boolean }[] {
  const atuais = SUPPLEMENTS.filter((s) => marcas[s.id] === true).map((s) => ({
    id: s.id,
    nome: s.curto,
    foraDaLista: false,
  }));
  const antigos = FORA_DA_LISTA.filter((f) => marcas[f.id] === true).map((f) => ({
    id: f.id,
    nome: f.nome,
    foraDaLista: true,
  }));
  return [...atuais, ...antigos];
}
