/**
 * Cardápio da semana da recomposição corporal.
 *
 * Sai do "Resumo da Alimentação – Recomposição Corporal" (29/09/2026): cada
 * dia tem as quatro refeições da estrutura do resumo, variando as opções que
 * ele mesmo lista. As regras (metas, jejum, sugestões e o que mudou em relação
 * ao Desinflama-se) moram em data/alimentacao.ts.
 *
 * O cardápio vai pelo dia da semana, não por um ciclo: a recomposição não tem
 * data para acabar, e a semana é o ritmo da compra e da aplicação de quinta.
 *
 * Os ids das refeições (cafe/almoco/lanche/jantar) são os mesmos de sempre —
 * o histórico de refeições marcadas depende deles. "jantar" é o id histórico
 * da quarta refeição, que agora fecha a janela antes do jejum.
 *
 * Os ids dos itens seguem "s{dia da semana}-{refeição}-{nome}" (s1 = segunda,
 * s0 = domingo). Eles ficam gravados na seleção da lista de compras, então não
 * mudam quando o texto muda — e o formato antigo "d1-…" não volta.
 */

export type TipoItem = "proteina" | "carbo" | "vegetal" | "fruta" | "bebida" | "extra";

export type ItemRefeicao = {
  id: string;
  label: string;
  /** ids do catálogo em data/shopping.ts */
  ingredientes: string[];
  tipo: TipoItem;
  /**
   * Proteína estimada do item, em gramas. Verdura, legume, fruta, café e os
   * carboidratos do almoço entram como 0: têm tão pouca que não mudam a conta
   * — e o resumo também não conta.
   */
  proteina: number;
};

export type RefeicaoId = "cafe" | "almoco" | "lanche" | "jantar";

export const REFEICOES_ORDEM: RefeicaoId[] = ["cafe", "almoco", "lanche", "jantar"];

/**
 * Nome e horário de cada refeição na janela padrão (08:00–18:00). Na tela, o
 * horário vem de horariosDaJanela() (lib/jejum.ts), porque ela pode mudar a
 * janela em /ajustes.
 */
export const REFEICOES_META: Record<RefeicaoId, { nome: string; hora: string }> = {
  cafe: { nome: "Café da manhã", hora: "08:00" },
  almoco: { nome: "Almoço", hora: "12:30" },
  lanche: { nome: "Lanche da tarde", hora: "15:30" },
  jantar: { nome: "Fecha a janela", hora: "17:30" },
};

export type Refeicao = {
  id: RefeicaoId;
  nome: string;
  /** Horário na janela padrão — ver REFEICOES_META. */
  hora: string;
  /** Uma linha para a refeição fechada na tela inicial. */
  resumo: string;
  itens: ItemRefeicao[];
  /** Proteína estimada da refeição, em gramas: a soma dos itens. */
  proteina: number;
  nota?: string;
};

export type DiaCardapio = {
  /** 0 = domingo … 6 = sábado, como em Date.getDay(). */
  diaSemana: number;
  nome: string;
  curto: string;
  refeicoes: Refeicao[];
  /** Proteína estimada do dia, em gramas. */
  proteina: number;
  /** Aviso do dia — aplicação do Mounjaro, vitamina D. */
  destaque?: string;
};

const item = (
  id: string,
  label: string,
  ingredientes: string[],
  tipo: TipoItem,
  proteina = 0,
): ItemRefeicao => ({ id, label, ingredientes, tipo, proteina });

function refeicao(
  id: RefeicaoId,
  resumo: string,
  itens: ItemRefeicao[],
  nota?: string,
): Refeicao {
  return {
    id,
    ...REFEICOES_META[id],
    resumo,
    itens,
    proteina: itens.reduce((s, i) => s + i.proteina, 0),
    ...(nota ? { nota } : {}),
  };
}

/*
 * Como a proteína foi estimada, para a conta bater com o resumo:
 * ovo ~7 g · clara ~3,5 g · 50–60 g de queijo minas ~9 g · 50–60 g de ricota
 * ~6 g · pão sem miolo ~2 g · 120 g de frango ou patinho ~30 g · 120 g de
 * peixe ~28 g · 70 g de frango ~18 g · 150 g de ricota/cottage ~17 g ·
 * iogurte proteico 15 g (o resumo diz 15–17) · 40 g de whey 32 g.
 */

/* -------------------------------------------------------------------------- */
/* Café da manhã — quebra o jejum · 15–20 g                                   */
/* -------------------------------------------------------------------------- */

const CAFE_BEBIDA = (d: number) =>
  item(`s${d}-cafe-cafe`, "Café sem açúcar", ["be-cafe"], "bebida");

const CAFES = {
  paoOvoQueijo: (d: number, nota?: string): Refeicao =>
    refeicao(
      "cafe",
      "Pão sem miolo, ovo e queijo minas",
      [
        item(
          `s${d}-cafe-pao-ovo-queijo`,
          "Pão sem miolo + 1 ovo + 50–60 g de queijo minas",
          ["ca-pao", "pr-ovos", "la-queijo-minas"],
          "proteina",
          18,
        ),
        CAFE_BEBIDA(d),
      ],
      nota,
    ),
  paoOvoClaras: (d: number): Refeicao =>
    refeicao("cafe", "Pão sem miolo, ovo e claras", [
      item(
        `s${d}-cafe-pao-ovo-claras`,
        "Pão sem miolo + 1 ovo + 2 claras, mexidos juntos",
        ["ca-pao", "pr-ovos"],
        "proteina",
        16,
      ),
      item(
        `s${d}-cafe-creme-ricota`,
        "Creme de ricota light no pão, se quiser — é sabor, não fonte principal de proteína",
        ["la-creme-ricota"],
        "extra",
      ),
      CAFE_BEBIDA(d),
    ]),
  paoOvoRicota: (d: number, nota?: string): Refeicao =>
    refeicao(
      "cafe",
      "Pão sem miolo, ovo e ricota",
      [
        item(
          `s${d}-cafe-pao-ovo-ricota`,
          "Pão sem miolo + 1 ovo + 50–60 g de ricota sólida, no lugar do queijo",
          ["ca-pao", "pr-ovos", "la-ricota"],
          "proteina",
          15,
        ),
        CAFE_BEBIDA(d),
      ],
      nota,
    ),
};

/* -------------------------------------------------------------------------- */
/* Almoço — salada/legumes → 120 g de carne → pouco carboidrato · 28–35 g     */
/* -------------------------------------------------------------------------- */

const salada = (d: number, label: string, ingredientes: string[]) =>
  item(`s${d}-almoco-salada`, label, ingredientes, "vegetal");

const legumes = (d: number, label: string, ingredientes: string[]) =>
  item(`s${d}-almoco-legumes`, label, ingredientes, "vegetal");

const ALMOCOS = {
  frangoArroz: (d: number): Refeicao =>
    refeicao("almoco", "Frango grelhado, legumes e um pouco de arroz", [
      salada(d, "Salada de alface, tomate e pepino, com limão e um fio de azeite", [
        "fo-alface",
        "le-tomate",
        "le-pepino",
        "fr-limao",
        "go-azeite",
      ]),
      legumes(d, "Brócolis e cenoura no vapor", ["le-brocolis", "le-cenoura"]),
      item(`s${d}-almoco-frango`, "120 g de frango grelhado", ["pr-frango-peito", "te-alho"], "proteina", 30),
      item(`s${d}-almoco-arroz`, "Um pouco de arroz", ["ca-arroz"], "carbo"),
    ]),
  patinhoBatata: (d: number): Refeicao =>
    refeicao("almoco", "Patinho acebolado, abobrinha e batata", [
      salada(d, "Salada de rúcula e tomate", ["fo-rucula", "le-tomate", "go-azeite"]),
      legumes(d, "Abobrinha refogada no alho", ["le-abobrinha", "te-alho", "go-azeite"]),
      item(`s${d}-almoco-patinho`, "120 g de patinho em iscas, acebolado", ["pr-patinho", "te-cebola"], "proteina", 30),
      item(`s${d}-almoco-batata`, "Batata cozida, no lugar do arroz", ["ca-batata"], "carbo"),
    ]),
  frangoMacarrao: (d: number): Refeicao =>
    refeicao("almoco", "Frango ao molho, vagem e macarrão sem glúten", [
      salada(d, "Salada de alface e pepino, com limão", ["fo-alface", "le-pepino", "fr-limao", "go-azeite"]),
      legumes(d, "Vagem no vapor", ["le-vagem"]),
      item(
        `s${d}-almoco-frango-molho`,
        "120 g de frango em cubos ao molho de tomate caseiro",
        ["pr-frango-peito", "le-tomate", "te-cebola", "te-alho"],
        "proteina",
        30,
      ),
      item(`s${d}-almoco-macarrao`, "Um pouco de macarrão integral sem glúten", ["ca-macarrao"], "carbo"),
    ]),
  peixeMandioquinha: (d: number): Refeicao =>
    refeicao(
      "almoco",
      "Peixe assado, legumes cozidos e purê de mandioquinha",
      [
        salada(d, "Salada pequena de alface e tomate", ["fo-alface", "le-tomate"]),
        legumes(d, "Cenoura e chuchu cozidos", ["le-cenoura", "le-chuchu"]),
        item(`s${d}-almoco-peixe`, "120 g de peixe assado com limão", ["pr-peixe", "fr-limao"], "proteina", 28),
        item(
          `s${d}-almoco-mandioquinha`,
          "Purê de mandioquinha com um fio de azeite, no lugar do arroz",
          ["ca-mandioquinha", "go-azeite"],
          "carbo",
        ),
      ],
      "Tudo macio, para o dia de pouca fome. Na ordem de sempre: salada e legumes, depois o peixe e, por último, o purê — se o prato não descer inteiro, o que sobra é ele. Não gosta de mandioquinha? Troque por mandioca ou batata.",
    ),
  frangoDesfiadoArroz: (d: number): Refeicao =>
    refeicao(
      "almoco",
      "Frango desfiado, abóbora e um pouco de arroz",
      [
        salada(d, "Salada de alface e tomate", ["fo-alface", "le-tomate", "go-azeite"]),
        legumes(d, "Abóbora cozida", ["le-abobora-cabotia"]),
        item(
          `s${d}-almoco-frango-desfiado`,
          "120 g de frango desfiado com cheiro-verde",
          ["pr-frango-peito", "te-cebola", "te-alho", "te-cheiro-verde"],
          "proteina",
          30,
        ),
        item(`s${d}-almoco-arroz`, "Um pouco de arroz", ["ca-arroz"], "carbo"),
      ],
      "Desfiado desce mais fácil que em bife — bom para o dia seguinte à aplicação.",
    ),
  patinhoMandioca: (d: number): Refeicao =>
    refeicao("almoco", "Patinho moído, couve e mandioca", [
      salada(d, "Salada de rúcula, tomate e pepino", ["fo-rucula", "le-tomate", "le-pepino", "go-azeite"]),
      legumes(d, "Couve refogada no alho", ["fo-couve", "te-alho", "go-azeite"]),
      item(
        `s${d}-almoco-patinho-moido`,
        "120 g de patinho moído refogado com tomate",
        ["pr-patinho", "te-cebola", "te-alho", "le-tomate"],
        "proteina",
        30,
      ),
      item(`s${d}-almoco-mandioca`, "Mandioca cozida, no lugar do arroz", ["ca-mandioca"], "carbo"),
    ]),
  peixeBatata: (d: number): Refeicao =>
    refeicao("almoco", "Peixe assado, brócolis e batata", [
      salada(d, "Salada de alface, tomate e cenoura ralada", [
        "fo-alface",
        "le-tomate",
        "le-cenoura",
        "go-azeite",
      ]),
      legumes(d, "Brócolis no vapor", ["le-brocolis"]),
      item(
        `s${d}-almoco-peixe`,
        "120 g de peixe assado com ervas e limão",
        ["pr-peixe", "te-cheiro-verde", "fr-limao"],
        "proteina",
        28,
      ),
      item(`s${d}-almoco-batata`, "Batata assada, no lugar do arroz", ["ca-batata", "go-azeite"], "carbo"),
    ]),
};

/* -------------------------------------------------------------------------- */
/* Lanche da tarde — whey + fruta · 32 g                                      */
/* -------------------------------------------------------------------------- */

const WHEY = (d: number) =>
  item(`s${d}-lanche-whey`, "40 g de Whey Chef Zero", ["la-whey"], "proteina", 32);

const LANCHES = {
  banana: (d: number, nota?: string): Refeicao =>
    refeicao(
      "lanche",
      "Whey + banana",
      [WHEY(d), item(`s${d}-lanche-banana`, "1 banana", ["fr-banana"], "fruta")],
      nota,
    ),
  morango: (d: number): Refeicao =>
    refeicao("lanche", "Whey + morangos", [
      WHEY(d),
      item(`s${d}-lanche-morango`, "Morangos, no lugar da banana", ["fr-morango"], "fruta"),
    ]),
  maca: (d: number): Refeicao =>
    refeicao("lanche", "Whey + maçã pequena", [
      WHEY(d),
      item(`s${d}-lanche-maca`, "1 maçã pequena", ["fr-maca"], "fruta"),
    ]),
};

/* -------------------------------------------------------------------------- */
/* Fecha a janela — a "Noite" do resumo, antes do jejum · 15–20 g             */
/* -------------------------------------------------------------------------- */

const FECHAMENTOS = {
  iogurte: (d: number): Refeicao =>
    refeicao("jantar", "Iogurte proteico", [
      item(
        `s${d}-jantar-iogurte`,
        "Iogurte proteico (15–17 g de proteína no pote)",
        ["la-iogurte-proteico"],
        "proteina",
        15,
      ),
      item(`s${d}-jantar-chia`, "1 colher de chia no iogurte, se quiser", ["go-chia"], "extra"),
    ]),
  ovosQueijo: (d: number): Refeicao =>
    refeicao(
      "jantar",
      "2 ovos cozidos e queijo minas",
      [
        item(`s${d}-jantar-ovos`, "2 ovos cozidos", ["pr-ovos"], "proteina", 14),
        item(`s${d}-jantar-queijo`, "1 fatia de queijo minas", ["la-queijo-minas"], "proteina", 5),
      ],
      "Só os 2 ovos ficam um pouco abaixo de 15 g — a fatia de queijo completa.",
    ),
  frango: (d: number): Refeicao =>
    refeicao(
      "jantar",
      "Frango desfiado",
      [item(`s${d}-jantar-frango`, "70 g de frango desfiado", ["pr-frango-peito"], "proteina", 18)],
      "Separe os 70 g quando preparar o frango da semana.",
    ),
  omelete: (d: number): Refeicao =>
    refeicao("jantar", "Omelete pequena", [
      item(
        `s${d}-jantar-omelete`,
        "Omelete pequena: 2 ovos + 1 clara, com cheiro-verde",
        ["pr-ovos", "te-cheiro-verde"],
        "proteina",
        17,
      ),
    ]),
  ricota: (d: number): Refeicao =>
    refeicao(
      "jantar",
      "Ricota ou cottage",
      [item(`s${d}-jantar-ricota`, "Ricota ou cottage — uns 150 g", ["la-ricota"], "proteina", 17)],
      "Sobrou ricota do café de sexta? É ela.",
    ),
};

/* -------------------------------------------------------------------------- */
/* A semana                                                                   */
/* -------------------------------------------------------------------------- */

function dia(
  diaSemana: number,
  nome: string,
  curto: string,
  refeicoes: Refeicao[],
  destaque?: string,
): DiaCardapio {
  return {
    diaSemana,
    nome,
    curto,
    refeicoes,
    proteina: refeicoes.reduce((s, r) => s + r.proteina, 0),
    ...(destaque ? { destaque } : {}),
  };
}

/**
 * Na ordem em que aparece na tela: de segunda a domingo.
 *
 * Quinta é o dia da aplicação do Mounjaro e sexta vem logo depois — são os
 * dias em que a fome costuma cair mais. Por isso o almoço e o fechamento dos
 * dois vêm nas formas de proteína que descem mais fácil (peixe, desfiado,
 * iogurte, omelete). O café e o lanche de quinta seguem o resumo, com o pão e
 * a banana inteira: sem pão e com ½ banana de padrão, o dia ficava leve demais.
 * Para quando a fome não vier, a nota diz o que dá para tirar — nunca a
 * proteína.
 */
export const CARDAPIO: DiaCardapio[] = [
  dia(1, "Segunda", "Seg", [
    CAFES.paoOvoQueijo(
      1,
      "Queijo: o minas do pote preto, o melhor dos avaliados no resumo para o dia a dia.",
    ),
    ALMOCOS.frangoArroz(1),
    LANCHES.banana(1, "Pese o whey uma vez na balança para saber quantas medidas dão 40 g."),
    FECHAMENTOS.iogurte(1),
  ]),
  dia(2, "Terça", "Ter", [
    CAFES.paoOvoClaras(2),
    ALMOCOS.patinhoBatata(2),
    LANCHES.morango(2),
    FECHAMENTOS.ovosQueijo(2),
  ]),
  dia(3, "Quarta", "Qua", [
    CAFES.paoOvoQueijo(3),
    ALMOCOS.frangoMacarrao(3),
    LANCHES.banana(3),
    FECHAMENTOS.frango(3),
  ]),
  dia(
    4,
    "Quinta",
    "Qui",
    [
      CAFES.paoOvoQueijo(
        4,
        "Sem fome? Tire o pão — o ovo e o queijo são a proteína, e mexidos juntos descem fácil.",
      ),
      ALMOCOS.peixeMandioquinha(4),
      LANCHES.banana(
        4,
        "Muito cheia? Fique com ½ banana — diminua a fruta, não o whey: é ele que segura a proteína do dia.",
      ),
      FECHAMENTOS.iogurte(4),
    ],
    "Dia da aplicação do Mounjaro. A fome costuma cair: coma devagar e pare na saciedade. Se algo tiver que sobrar, que seja o pão ou a fruta — não a proteína.",
  ),
  dia(
    5,
    "Sexta",
    "Sex",
    [
      CAFES.paoOvoRicota(5),
      ALMOCOS.frangoDesfiadoArroz(5),
      LANCHES.morango(5),
      FECHAMENTOS.omelete(5),
    ],
    "Dia seguinte à aplicação: a fome ainda costuma estar baixa. Coma devagar e pare na saciedade.",
  ),
  dia(6, "Sábado", "Sáb", [
    CAFES.paoOvoClaras(6),
    ALMOCOS.patinhoMandioca(6),
    LANCHES.maca(6),
    FECHAMENTOS.ricota(6),
  ]),
  dia(
    0,
    "Domingo",
    "Dom",
    [
      CAFES.paoOvoQueijo(0),
      ALMOCOS.peixeBatata(0),
      LANCHES.banana(0),
      FECHAMENTOS.frango(0),
    ],
    "Domingo é dia da vitamina D3: ela vai logo depois do café da manhã, como está na sua lista de remédios.",
  ),
];

/** Cardápio de um dia da semana (0 = domingo). Aceita qualquer inteiro: volta ao intervalo 0–6. */
export function cardapioDoDia(diaSemana: number): DiaCardapio {
  const d = Number.isFinite(diaSemana) ? ((Math.trunc(diaSemana) % 7) + 7) % 7 : 1;
  return CARDAPIO.find((c) => c.diaSemana === d) ?? CARDAPIO[0];
}

/** Cardápio de uma data "AAAA-MM-DD", pelo dia da semana dela. */
export function cardapioDaData(iso: string): DiaCardapio {
  // Com o horário junto, o JS lê a data no fuso do aparelho — sem ele, lê em
  // UTC e o dia da semana pode voltar um.
  const data = new Date(`${iso}T00:00:00`);
  return cardapioDoDia(Number.isNaN(data.getTime()) ? 1 : data.getDay());
}

export const TOTAL_ITENS_CARDAPIO = CARDAPIO.reduce(
  (s, d) => s + d.refeicoes.reduce((t, r) => t + r.itens.length, 0),
  0,
);

/* -------------------------------------------------------------------------- */
/* Orientações do médico que seguem valendo                                   */
/* -------------------------------------------------------------------------- */

export const ORIENTACOES_MEDICO = {
  medico: "Dr. Henry Adur Gebenlian — CRM/SP 70202",
  especialidade: "Endocrinologia e Metabologia (SBEM)",
  pontos: [
    "Disciplina em 90% das situações — 100% poucos alcançam. É estilo de vida, não dieta passageira.",
    "Priorizar alimentos in natura: folhas verdes, legumes, frutas, peixe e frango.",
    "Compra na feira ou sacolão em vez de supermercado e delivery.",
    "Salada como entrada em todas as refeições principais — bate com a ordem do resumo.",
    "Diminuir a quantidade de carboidrato, e quase nunca à noite — com o jejum, à noite não entra comida.",
    "Pouca comida no prato.",
    "Cortar o açúcar refinado.",
    "Atividade física: começar com 3h por semana e chegar a 5–6h.",
    "Por menor que seja a perda, ela melhora saúde e autoestima.",
  ],
  /** Onde ele e o plano novo não dizem a mesma coisa — e o que vale. */
  emConflito: [
    "Ele sugeria um lanchinho a cada 2–3 h se batesse fome. Dentro da janela, cabe — de preferência com proteína, como o iogurte proteico. Depois que a janela fecha, é jejum.",
    "Ele pedia para cortar também a farinha de trigo, e o resumo põe pão sem miolo no café. Sem o miolo sobra pouco pão, e ele vem com ovo e queijo. Se quiser seguir o Dr. Henry à risca, a omelete com queijo (sem pão) é uma das opções do próprio resumo.",
  ],
};
