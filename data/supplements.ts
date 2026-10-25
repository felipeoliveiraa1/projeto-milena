/**
 * Remédios e suplementos — a lista do médico que a Milena mandou em
 * 29/09/2026 e o protocolo da nutricionista de 18/10/2026.
 *
 * A dose de cada item está escrita do jeito que veio na receita. O app não
 * inventa quantidade, não escolhe horário que não foi dado e não promete
 * efeito do que não conhece. Mudar dose, horário ou tirar um item é sempre
 * com quem receitou.
 *
 * O protocolo de 18/10 (status "nutricionista"):
 * - entraram probiótico, mio-inositol (manhã e tarde), psyllium (almoço e
 *   tarde), curcumina e magnésio glicinato; o ômega-3 voltou, com a dose
 *   nova e o mesmo id de antes, para o histórico continuar junto;
 * - a creatina ganhou dose (5 g) e horário (depois do treino; sem treino, ao
 *   acordar), e a fórmula continua a mesma, agora com a composição escrita;
 * - a receita põe o mio-inositol e o psyllium da tarde "antes do jantar".
 *   Como a última refeição do plano é o lanche da tarde, eles ficaram antes
 *   dele — com o aviso para confirmar com a nutricionista;
 * - ômega-3 e curcumina param 30 dias antes da cirurgia
 *   (pausaAntesDaCirurgiaDias) e só voltam com a liberação do médico.
 *
 * De 22/10 a 24/10, a fórmula, a curcumina e o mio-inositol da tarde ficaram
 * de 1 a 2 h longe do psyllium. Em 24/10 os horários voltaram aos da receita
 * (fórmula e curcumina depois do almoço, mio-inositol 20 min antes do lanche),
 * e o psyllium entrou em pausa: ela retoma pela Farmácia, com o botão
 * "Retomar o psyllium" (pausavel, abaixo). Nenhuma dose mudou.
 *
 * Cada item tem um horário relativo (acordar, café, almoço, lanche, deitar):
 * os lembretes do celular e as telas calculam a hora a partir dos horários
 * dela e da janela de comer — ver lib/lembretes.ts. Ela pode trocar o horário
 * de qualquer item em Ajustes → Horários dos remédios; aí vale o dela
 * (Preferencias.horariosRemedios).
 *
 * A lista de 29/09, em relação à antiga (a do Desinflama-se):
 * - entraram testosterona, fórmula e Mounjaro;
 * - a B12 passou da manhã para a noite, a vitamina D da segunda para o
 *   domingo, e o colágeno virou comprimido;
 * - NAC, glutamina, ômega 3 e Pró Magnésio não vieram nela e foram para
 *   FORA_DA_LISTA, visíveis na tela, para nada sumir sem explicação. O
 *   ômega-3 saiu de lá em 18/10, quando a nutricionista o passou de novo;
 * - o whey, suspenso no protocolo antigo, voltou. Hoje é o whey isolado sem
 *   lactose do plano alimentar e mora na aba Dieta.
 *
 * Os avisos do Mounjaro foram conferidos na bula brasileira e no guia do
 * paciente da FDA; os da testosterona, nas bulas do gel (a do Androgel no
 * Brasil e o guia da FDA). As dicas para o enjoo vêm do material do fabricante
 * para pacientes. O que não estava nessas fontes ficou de fora.
 *
 * Nos ajustes de 12/10, a testosterona ganhou os sinais de coágulo que a bula
 * pede para vigiar — com as mesmas condutas de data/alarmes.ts, para nunca
 * haver duas ordens para o mesmo sinal — e a pergunta ao médico
 * antes de cirurgia, internação ou dias de cama, quando ficar parada favorece
 * o coágulo em qualquer pessoa. No Mounjaro, a falta de ar ganhou duas
 * condutas (piorando aos poucos: médico; de repente: 192), e o aviso do
 * anticoncepcional passou a começar pelo principal: testosterona e Mounjaro
 * não combinam com gravidez, e o método se escolhe com o ginecologista.
 *
 * Os ids são gravados no Supabase (daily_checks.supplements) e o histórico
 * depende deles: um id nunca muda, mesmo quando o nome ou a dose mudam.
 */

import type { RotinaBloco } from "./protocol";

/** Períodos da rotina: manhã (até 12h), dia (12h–18h) e noite (depois das 18h). */
export type PeriodoRotina = RotinaBloco["periodo"];

export type BlocoSuplemento = "manha" | "almoco" | "tarde" | "noite" | "semanal";

/**
 * medicamento = remédio com bula e receita — só o médico mexe;
 * prescricao = passado pelo médico, na dose da receita;
 * nutricionista = do protocolo da nutricionista (18/10), na dose que ela passou;
 * suplemento = de venda livre, parte da rotina.
 */
export type StatusSuplemento = "medicamento" | "prescricao" | "nutricionista" | "suplemento";

/**
 * De que momento do dia o horário de um item é contado. acordar e deitar são
 * os horários dela (Ajustes → Seus horários); café, almoço e lanche saem da
 * janela de comer (lib/janela.ts → horariosDaJanela).
 */
export type Ancora = "acordar" | "cafe" | "almoco" | "lanche" | "deitar";

export type Supplement = {
  id: string;
  /** Nome como veio na lista, com marca e concentração. */
  nome: string;
  /** Nome curto, para o histórico. */
  curto: string;
  /** Dose e frequência como vieram na lista. */
  dose: string;
  /**
   * Bloco da receita. Na Farmácia, o item de todo dia aparece no bloco da hora
   * em que cai (lib/lembretes.ts → blocoDoSuplemento): com os horários de
   * fábrica, é este; com um horário escolhido por ela, pode ser outro.
   */
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
  /**
   * Hora do lembrete: `minutos` antes (negativo) ou depois do momento da
   * âncora — { ancora: "cafe", minutos: -20 } = 20 min antes do café. Sem
   * isto, o item não tem lembrete.
   */
  horario?: { ancora: Ancora; minutos: number };
  /**
   * Quantos dias antes da cirurgia o item para. Só vale quando a data da
   * contagem regressiva é a da cirurgia; a pausa continua depois dela, até o
   * médico liberar (ver lib/lembretes.ts → suplementoEmPausa).
   */
  pausaAntesDaCirurgiaDias?: number;
  /**
   * A linha do lembrete no celular, quando não é "nome curto — dose" (a dose
   * longa demais para a tela bloqueada, ou o aviso que só lembra o dia). Com
   * ela, as telas mostram "Lembrete às HH:MM": a hora é a do aviso, e quem
   * manda no horário de tomar é a receita.
   */
  lembrete?: string;
  /**
   * A linha do lembrete quando o horário foi ela que escolheu (Ajustes →
   * Horários dos remédios). O aviso de fábrica do Mounjaro chega cedo e só
   * lembra o dia; na hora que ela pôs, ele vira a hora da aplicação.
   */
  lembreteNoHorario?: string;
  /**
   * Ela pode pausar e retomar o item pela Farmácia (Preferencias.remediosPausados).
   * Só o que foi combinado assim — hoje, o psyllium. Remédio do médico nunca:
   * esse só para com quem receitou, por isso nenhum outro item tem o campo.
   */
  pausavel?: boolean;
  /**
   * Itens que pausam e voltam juntos: o botão de um mexe no grupo inteiro (o
   * psyllium do almoço e o da tarde são uma coisa só para ela).
   */
  grupoPausa?: string;
};

export const ROTULO_STATUS: Record<StatusSuplemento, string> = {
  medicamento: "Medicamento",
  prescricao: "Prescrição médica",
  nutricionista: "Nutricionista",
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
    detalhe: "Ao acordar e no café da manhã.",
    periodo: "manha",
  },
  {
    id: "almoco",
    titulo: "No almoço",
    detalhe: "Antes, junto e depois da refeição do meio do dia — cada um na sua hora.",
    periodo: "dia",
  },
  {
    id: "tarde",
    titulo: "Antes do lanche da tarde",
    detalhe: "20 min antes da última refeição do dia.",
    periodo: "dia",
  },
  {
    id: "noite",
    titulo: "À noite",
    detalhe: "30 min antes de deitar, com a janela de comer já fechada.",
    periodo: "noite",
  },
  {
    id: "semanal",
    titulo: "Uma vez por semana",
    detalhe: "Cada um no seu dia. No dia, ele fica na tela inicial até você marcar.",
    periodo: "dia-todo",
  },
];

// Os dois psyllium e os dois que param antes da cirurgia levam o mesmo aviso.
// Entalou é emergência (192); intestino preso com a barriga dura é atendimento
// no mesmo dia — e a próxima dose espera.
const ALERTA_PSYLLIUM =
  "Sempre com bastante água: seco ou com pouca água, ele pode entalar ou prender o intestino. Sentiu que entalou — dor ou aperto no peito, não consegue engolir nem a saliva, ou falta de ar: ligue 192 (SAMU). Barriga muito dura e estufada: não tome a próxima dose, procure atendimento no mesmo dia e avise a nutricionista.";

// Orientação que ela recebeu para a cirurgia plástica (18/10): testosterona e
// Mounjaro param 30 dias antes, e os exames pré-operatórios começam 45 dias
// antes (lib/lembretes.ts). A pausa é a mesma do ômega-3 e da curcumina.
const ALERTA_PAUSA_CIRURGIA_MEDICO =
  "Cirurgia: parar 30 dias antes, como foi orientado para a cirurgia, e só voltar quando o médico liberar. Com a data em Ajustes → Contagem regressiva e “É a data da cirurgia” marcada, o app avisa e pausa sozinho.";

const ALERTA_PAUSA_CIRURGIA =
  "Pausar 30 dias antes da cirurgia e só voltar quando o médico liberar. Ponha a data em Ajustes → Contagem regressiva e marque “É a data da cirurgia”: o app avisa e pausa sozinho.";

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
      "O lembrete chega na hora de acordar, só para lembrar: passe no horário de sempre, depois do banho.",
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
      // Ajustes de 12/10. Perna, 192 e "sem ir dirigindo" são as mesmas
      // condutas de data/alarmes.ts. O pronto-socorro raramente
      // pergunta a uma mulher se ela usa testosterona — e isso muda o que ele
      // investiga. "Antes da próxima dose" segue o alerta da gravidez: quem
      // decide é um médico, nunca ela sozinha.
      "A bula da testosterona pede atenção a sinais de coágulo: uma perna só inchada, doída, quente ou vermelha — pronto-socorro no mesmo dia; falta de ar de repente, dor no peito, tosse com sangue ou desmaio — 192 (SAMU), sem ir dirigindo. No atendimento, conte que usa testosterona em gel e não passe a próxima dose antes de falar com um médico. Avise também o médico que receitou.",
      // Cirurgia e dias de cama são a hora clássica do coágulo, para qualquer
      // pessoa. Para a cirurgia plástica, a orientação que ela recebeu (18/10)
      // é parar 30 dias antes; fora disso, a decisão é do médico, com tempo.
      ALERTA_PAUSA_CIRURGIA_MEDICO,
      "Internação ou dias de cama por outro motivo: pergunte ao médico que receitou se a testosterona continua. Nunca pare por conta própria.",
      "Menstruação atrasada, suspeita de gravidez ou planos de engravidar: fale com o médico antes da próxima dose. Testosterona não pode ser usada na gravidez.",
      "Espinhas, pelos novos, queda de cabelo ou voz mais grossa: avise o médico logo — a mudança na voz pode não voltar.",
    ],
    status: "medicamento",
    horario: { ancora: "acordar", minutos: 0 },
    lembrete: "Testosterona — 1 pump, no horário que o médico indicou",
    pausaAntesDaCirurgiaDias: 30,
  },
  {
    id: "creatina",
    nome: "Creatina",
    curto: "Creatina",
    dose: "5 g — logo depois do treino; nos dias sem treino, ao acordar",
    bloco: "manha",
    funcao:
      "Mais força e recuperação no treino. Treino que rende é o que protege o músculo enquanto a gordura sai.",
    comoUsar: [
      "5 g por dose, como a nutricionista passou.",
      "Todo dia, inclusive sem treino: o efeito vem de manter o músculo abastecido. Não precisa ciclar.",
      "Dia de treino: logo depois dele. Dia sem treino: ao acordar. O lembrete vem na hora de acordar — se for treinar, deixe para depois do treino.",
      "Beba água ao longo do dia.",
    ],
    antes: "Era a dose habitual, de manhã. Em 18/10 a nutricionista passou 5 g, depois do treino.",
    status: "nutricionista",
    horario: { ancora: "acordar", minutos: 0 },
  },
  {
    id: "probiotico",
    nome: "Probiótico multi-cepas",
    curto: "Probiótico",
    dose: "10 bilhões UFC, em jejum ao acordar",
    bloco: "manha",
    funcao: "Ajuda o intestino a funcionar e cuida da flora intestinal.",
    comoUsar: ["Em jejum, logo ao acordar, com água."],
    status: "nutricionista",
    horario: { ancora: "acordar", minutos: 0 },
  },
  {
    id: "mio-cafe",
    nome: "Mio-inositol",
    curto: "Mio-inositol (manhã)",
    dose: "2 g — 20 min antes do café da manhã",
    bloco: "manha",
    funcao: "Ajuda o corpo a usar melhor o açúcar do sangue.",
    comoUsar: ["Misture o pó em um pouco de água."],
    status: "nutricionista",
    horario: { ancora: "cafe", minutos: -20 },
  },
  {
    // 22/10, a pedido dela: saiu da noite para o café da manhã. O horário não
    // muda o efeito do Verisol (o que conta é tomar todo dia); assim o jejum
    // da noite fica sem nada, e o psyllium (12:10 e 17:10) fica longe.
    id: "colageno",
    nome: "Colágeno Verisol ProFit",
    curto: "Colágeno",
    dose: "4 comprimidos, junto do café da manhã",
    bloco: "manha",
    funcao: "Para a pele: o Verisol é um colágeno estudado para firmeza e elasticidade.",
    comoUsar: [
      "Junto do café da manhã: dentro da janela, o jejum da noite fica sem nada — e longe do psyllium, que pode atrasar a absorção do que for tomado junto.",
      "O horário não muda o efeito: o que conta é tomar todo dia.",
    ],
    observacao:
      "Não entra na conta da proteína do dia: é pouca e de um tipo incompleto. A proteína vem das refeições do plano alimentar.",
    antes: "Até 22/10 era à noite, como na lista de 29/09. Desde 23/10 vai junto do café da manhã, para o jejum da noite ficar sem nada.",
    status: "suplemento",
    horario: { ancora: "cafe", minutos: 0 },
  },

  /* ------------------------------ almoço --------------------------------- */
  {
    id: "psyllium-almoco",
    nome: "Psyllium (casca) em pó",
    curto: "Psyllium (almoço)",
    dose: "10 g (1 colher de sopa) em 200–300 ml de água, 15–20 min antes do almoço",
    bloco: "almoco",
    funcao:
      "Fibra que ajuda o intestino e o controle do açúcar e do colesterol depois das refeições.",
    comoUsar: [
      "Misture em 200–300 ml de água e beba logo, antes de engrossar.",
      "15 a 20 minutos antes da refeição.",
    ],
    alertas: [ALERTA_PSYLLIUM],
    status: "nutricionista",
    horario: { ancora: "almoco", minutos: -20 },
    // Em pausa desde 24/10 (o padrão de Preferencias.remediosPausados); o
    // botão da Farmácia pausa e retoma os dois psyllium juntos.
    pausavel: true,
    grupoPausa: "psyllium",
  },
  {
    // O mesmo id do ômega 3 da lista antiga: o histórico de antes de 29/09
    // continua junto do item de agora.
    id: "omega3",
    nome: "Ômega-3 (EPA/DHA) em óleo",
    curto: "Ômega-3",
    dose: "EPA 1.600 mg + DHA 800 mg (2,4 g no total), junto do almoço",
    bloco: "almoco",
    funcao: "Gordura boa para o coração e para as gorduras do sangue.",
    comoUsar: ["Junto do almoço — com comida que tem gordura, o corpo aproveita melhor."],
    alertas: [ALERTA_PAUSA_CIRURGIA],
    antes: "Tinha saído na lista de 29/09. Voltou em 18/10, no protocolo da nutricionista.",
    status: "nutricionista",
    horario: { ancora: "almoco", minutos: 0 },
    pausaAntesDaCirurgiaDias: 30,
  },
  {
    id: "formula",
    nome: "Fórmula",
    curto: "Fórmula",
    dose: "1 dose após o almoço (a nutricionista pediu para manter a fórmula atual)",
    bloco: "almoco",
    funcao: "Vitaminas e minerais da fórmula de sempre.",
    comoUsar: [
      "Na fórmula: metilfolato 1 mg, piridoxal-5-fosfato (vitamina B6) 25 mg, biotina 5 mg, niacina (B3) 50 mg, cobre 1 mg, selênio 50 mcg e zinco quelato 10 mg.",
    ],
    status: "prescricao",
    horario: { ancora: "almoco", minutos: 30 },
    lembrete: "Fórmula — 1 dose após o almoço",
  },
  {
    id: "curcumina",
    nome: "Curcumina (extrato padronizado)",
    curto: "Curcumina",
    dose: "500 mg, depois do almoço",
    bloco: "almoco",
    funcao: "Antioxidante e anti-inflamatório.",
    comoUsar: ["Depois do almoço, que tem gordura."],
    alertas: [ALERTA_PAUSA_CIRURGIA],
    status: "nutricionista",
    horario: { ancora: "almoco", minutos: 30 },
    pausaAntesDaCirurgiaDias: 30,
  },

  /* ----------------------- antes do lanche da tarde ----------------------- */
  {
    id: "mio-lanche",
    nome: "Mio-inositol",
    curto: "Mio-inositol (tarde)",
    dose: "2 g — 20 min antes do lanche da tarde",
    bloco: "tarde",
    funcao: "Ajuda o corpo a usar melhor o açúcar do sangue.",
    comoUsar: ["Misture o pó em um pouco de água."],
    observacao:
      "Na receita está 'antes do jantar'. Como no seu plano a última refeição é o lanche da tarde, o app pôs antes dele — confirme com a nutricionista.",
    status: "nutricionista",
    horario: { ancora: "lanche", minutos: -20 },
  },
  {
    id: "psyllium-lanche",
    nome: "Psyllium (casca) em pó",
    curto: "Psyllium (tarde)",
    dose: "10 g em 200–300 ml de água, 15–20 min antes do lanche da tarde",
    bloco: "tarde",
    funcao:
      "Fibra que ajuda o intestino e o controle do açúcar e do colesterol depois das refeições.",
    comoUsar: [
      "Misture em 200–300 ml de água e beba logo, antes de engrossar.",
      "15 a 20 minutos antes da refeição.",
    ],
    observacao:
      "Na receita está 'antes do jantar'. Como no seu plano a última refeição é o lanche da tarde, o app pôs antes dele — confirme com a nutricionista.",
    alertas: [ALERTA_PSYLLIUM],
    status: "nutricionista",
    horario: { ancora: "lanche", minutos: -20 },
    // O mesmo grupo do psyllium do almoço: pausam e voltam juntos.
    pausavel: true,
    grupoPausa: "psyllium",
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
    horario: { ancora: "deitar", minutos: -30 },
  },
  {
    id: "magnesio-glicinato",
    nome: "Magnésio glicinato",
    curto: "Magnésio",
    dose: "300 mg — 30 min antes de deitar",
    bloco: "noite",
    funcao: "Ajuda o intestino, relaxa os músculos e ajuda no sono.",
    status: "nutricionista",
    horario: { ancora: "deitar", minutos: -30 },
  },

  /* -------------------------- uma vez por semana -------------------------- */
  {
    id: "mounjaro",
    nome: "Mounjaro 2,5 mg",
    curto: "Mounjaro",
    dose: "1 aplicação por semana, na quinta",
    bloco: "semanal",
    dias: [4], // quinta-feira
    // A bula deixa a qualquer hora do dia: o lembrete chega cedo e só avisa
    // que é o dia — a hora continua a de costume.
    horario: { ancora: "acordar", minutos: 0 },
    lembrete: "Dia do Mounjaro: aplique hoje, no horário de costume.",
    // Com a hora que ela escolheu em Ajustes, o aviso já é o da aplicação.
    lembreteNoHorario: "Mounjaro — hora da aplicação de hoje.",
    pausaAntesDaCirurgiaDias: 30,
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
      // junta as duas sem suspender o remédio por conta própria. Garganta
      // fechando, falta de ar, tontura forte ou desmaio são 192 — a mesma ordem
      // de data/alarmes.ts: quem está assim não chega sozinha ao atendimento.
      "Sinais de alergia forte — inchaço na boca ou na garganta, dificuldade para respirar ou engolir, tontura forte, coração muito acelerado ou desmaio: ligue 192 (SAMU), sem ir dirigindo. Inchaço no rosto ou vermelhidão e coceira fortes pelo corpo, sem esses sinais: procure atendimento na hora. Vergões ou coceira leves: avise o médico. Em todos os casos, não aplique de novo antes de falar com ele.",
      "Vômito ou diarreia que não param, ou sinais de desidratação (boca seca, pouco xixi, tontura): procure atendimento. Desidratação pesa nos rins.",
      "Dor no alto da barriga, febre, pele ou olhos amarelados ou fezes claras: avise o médico logo — pode ser a vesícula.",
      // A bula fala de caroço no pescoço: falta de ar que vem aos poucos é
      // conversa com o médico. A de repente é emergência — a mesma ordem de
      // data/alarmes.ts.
      "Caroço ou inchaço no pescoço, rouquidão que não passa, dificuldade para engolir ou falta de ar que vem piorando aos poucos: avise o médico. Falta de ar de repente é outra coisa: 192 (SAMU).",
      // A bula brasileira pede falar com o médico imediatamente em piora do
      // humor ou pensamentos suicidas com remédios para perder peso — e ela
      // está a poucos meses do parto.
      "Tristeza ou desânimo que não passam, mudança fora do comum no humor ou no comportamento, ou pensamentos de se machucar ou de morrer: fale com o médico na hora, como pede a bula. Em crise, ligue 188 (CVV, 24 h, grátis) ou 192 (SAMU).",
      "Menstruação atrasada ou suspeita de gravidez: fale com o médico antes da próxima aplicação. Planeja engravidar? A bula pede parar o Mounjaro pelo menos 1 mês antes — combine com o médico.",
      // Ajustes de 12/10. A bula: o comprimido pode perder efeito nas 4 semanas
      // do começo e de cada aumento de dose. A escolha do método fica com o
      // ginecologista, que vê a lista de remédios e os exames.
      "Testosterona e Mounjaro não combinam com gravidez: se houver chance de engravidar, combine com o médico como evitar. O método se escolhe com o ginecologista, levando a lista de remédios e os seus exames. Anticoncepcional em comprimido pode perder efeito nas 4 semanas depois de começar o Mounjaro e depois de cada aumento de dose: nesse período, camisinha junto — trocar de método, só com o ginecologista.",
      ALERTA_PAUSA_CIRURGIA_MEDICO,
      "Qualquer outra anestesia: avise o cirurgião e o anestesista que usa Mounjaro — ele faz o estômago esvaziar mais devagar, e isso importa na anestesia.",
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
    horario: { ancora: "cafe", minutos: 20 },
    funcao: "Ajuda o corpo a aproveitar o cálcio e a cuidar dos ossos. A dose é a que o médico passou.",
    observacao:
      "Vitamina D se dissolve em gordura: depois do café da manhã, que tem ovo, azeite ou pasta de amendoim, o corpo aproveita melhor.",
    antes: "Era na segunda. A lista de 29/09 passou para o domingo.",
    status: "prescricao",
  },
];

/* -------------------------------------------------------------------------- */
/* O que saiu e o que voltou                                                  */
/* -------------------------------------------------------------------------- */

const NAO_ESTA_NA_LISTA =
  "Não estão na lista do médico de 29/09 nem no protocolo da nutricionista de 18/10. Se ainda toma algum deles, avise para voltar ao app.";

/**
 * Estavam na lista antiga e não vieram na de 29/09. Os ids são os do
 * histórico. O ômega 3 saiu daqui em 18/10: voltou com a nutricionista, com o
 * mesmo id.
 */
export const FORA_DA_LISTA: { id: string; nome: string; porque: string }[] = [
  { id: "nac", nome: "NAC", porque: NAO_ESTA_NA_LISTA },
  { id: "glutamina", nome: "Glutamina", porque: NAO_ESTA_NA_LISTA },
  {
    id: "magnesio",
    nome: "Pró Magnésio",
    porque:
      "Não está na lista do médico de 29/09. O magnésio de agora é outro: o magnésio glicinato, do protocolo da nutricionista, no bloco da noite. Ainda toma o Pró Magnésio? Pergunte a ela antes de tomar os dois.",
  },
];

/** Estava suspenso no protocolo antigo e voltou com o plano novo. */
export const VOLTOU_NA_DIETA = {
  nome: "Whey protein",
  texto:
    "Whey protein isolado sem lactose — 25–30 g, depois do treino ou como lanche da tarde. Está no plano alimentar (aba Dieta).",
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

/**
 * Tudo o que entra num dia da semana: os diários e os semanais daquele dia. O
 * período de cada um na tela inicial sai da hora em que ele cai — ver
 * lib/lembretes.ts → periodoDoSuplemento.
 */
export function suplementosDoDia(diaSemana: number): Supplement[] {
  return SUPPLEMENTS.filter((s) => entraNoDia(s, diaSemana));
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
