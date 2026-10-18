/**
 * Plano alimentar da nutricionista (18/10/2026).
 *
 * São três refeições — café da manhã, almoço e lanche da tarde, que é a última
 * do dia — e cada uma tem duas opções. Os textos dos itens são os da
 * prescrição, palavra por palavra: não se reescreve dose de comida. As regras
 * em volta (metas, jejum, o que evitar e o que mudou) moram em
 * data/alimentacao.ts; a lista de compras (data/shopping.ts) e o preparo
 * (data/prep.ts) saem daqui.
 *
 * Até 17/10 o app seguia um cardápio de 7 dias com quatro refeições. Os ids das
 * refeições continuam os de sempre — o histórico de refeições marcadas depende
 * deles —, e "jantar" fica só para mostrar os dias antigos: era o id da quarta
 * refeição, a que fechava a janela.
 */

export type RefeicaoId = "cafe" | "almoco" | "lanche" | "jantar";

/** As refeições do plano atual: "jantar" não entra mais. */
export type RefeicaoPlanoId = Exclude<RefeicaoId, "jantar">;

/**
 * Dia em que o plano da nutricionista entrou. Daqui em diante o dia tem três
 * refeições; antes, quatro — e os dias antigos continuam contando as quatro,
 * para o histórico não mudar de nota.
 */
export const PLANO_ATUAL_DESDE = "2026-10-18";

/** As refeições do plano atual, na ordem do dia. */
export const REFEICOES_ORDEM: RefeicaoPlanoId[] = ["cafe", "almoco", "lanche"];

/** As quatro refeições do cardápio de 29/09 a 17/10. */
const REFEICOES_ANTES_DO_PLANO: RefeicaoId[] = ["cafe", "almoco", "lanche", "jantar"];

/**
 * Quais refeições valem numa data "AAAA-MM-DD". Comparar o texto basta: nesse
 * formato, a ordem alfabética é a ordem do calendário. Sai uma cópia, para
 * quem usa não mexer na lista de todo mundo.
 */
export function refeicoesDaData(data: string): RefeicaoId[] {
  return data >= PLANO_ATUAL_DESDE ? [...REFEICOES_ORDEM] : [...REFEICOES_ANTES_DO_PLANO];
}

/**
 * Nome de cada refeição. O horário não mora aqui: vem de horariosDaJanela()
 * (lib/janela.ts), porque ela pode mudar a janela em /ajustes.
 */
export const REFEICOES_META: Record<RefeicaoId, { nome: string }> = {
  cafe: { nome: "Café da manhã" },
  almoco: { nome: "Almoço" },
  // A última refeição do dia desde 18/10.
  lanche: { nome: "Lanche da tarde" },
  // Só nos dias antigos: a refeição que fechava a janela até 17/10.
  jantar: { nome: "Fecha a janela" },
};

/* -------------------------------------------------------------------------- */
/* Tipos do plano                                                             */
/* -------------------------------------------------------------------------- */

export type OpcaoId = "cafe-1" | "cafe-2" | "almoco-1" | "almoco-2" | "lanche-1" | "lanche-2";

/**
 * Ingrediente de um item, por porção, na unidade do catálogo de compras
 * (data/shopping.ts): `un`, `g` ou `ml`. Quando a prescrição diz "X ou Y", vai
 * para a compra o X, e a nota do item da lista lembra o Y.
 */
export type Ingrediente = { id: string; qtd: number };

export type ItemPlano = {
  /** Como está na prescrição — não reescrever. */
  texto: string;
  ingredientes: Ingrediente[];
};

export type OpcaoRefeicao = {
  id: OpcaoId;
  numero: 1 | 2;
  /** Nome curto, para o botão e o título da opção. */
  nome: string;
  itens: ItemPlano[];
  /**
   * Proteína da opção, em gramas — estimativa do app a partir de tabelas de
   * alimentos comuns, não um número da prescrição. Na tela sempre vem com
   * "(estimativa)".
   */
  proteina: number;
  nota?: string;
};

export type RefeicaoPlano = {
  id: RefeicaoPlanoId;
  nome: string;
  nota?: string;
  opcoes: [OpcaoRefeicao, OpcaoRefeicao];
};

/* -------------------------------------------------------------------------- */
/* O plano                                                                    */
/* -------------------------------------------------------------------------- */

/*
 * Como as porções viraram ingredientes (para a lista de compras):
 * - ovos: as claras contam como ovo inteiro, porque é assim que se compra;
 * - faixa de peso (25–30 g, 200–250 g): vale o maior, para não faltar;
 * - salada: "mix de folhas e legumes crus (200–250 g)" virou 100 g de folhas,
 *   ½ tomate, ¼ de pepino e ¼ de cenoura (uns 240 g);
 * - quinoa: os 60 g contam como o grão cru, que é como se compra;
 * - "1 fio de azeite" conta 5 ml, e a colher de sopa, 10.
 * A proteína é estimativa, de tabelas de alimentos comuns, arredondada: ovo
 * ~6,5 g, clara ~3,5 g, 50 g de atum ou sardinha ~12 g, 50 g de queijo branco
 * ~8 g, 30 g de whey isolado ~25 g, 150 g de frango grelhado ~45 g, 140 g de
 * peixe ~28 g, 150 g de grão-de-bico cozido ~13 g, 60 g de quinoa crua ~8 g,
 * 150 g de kefir ou iogurte natural ~5 g. Varia com a marca e o preparo.
 */

export const PLANO_ALIMENTAR: RefeicaoPlano[] = [
  {
    id: "cafe",
    nome: REFEICOES_META.cafe.nome,
    opcoes: [
      {
        id: "cafe-1",
        numero: 1,
        nome: "Omelete com proteína",
        proteina: 40,
        itens: [
          {
            texto: "Omelete: 2 ovos inteiros + 2 claras (total ~160 g preparado)",
            ingredientes: [{ id: "pr-ovos", qtd: 4 }],
          },
          {
            texto: "50 g de sardinha ou atum ou 80 g de peito de frango desfiado",
            ingredientes: [{ id: "pr-sardinha-atum", qtd: 50 }],
          },
          {
            texto: "1 colher de sopa de azeite de oliva (10 g)",
            ingredientes: [{ id: "go-azeite", qtd: 10 }],
          },
          {
            texto: "1 porção de queijo branco sem lactose 50 g",
            ingredientes: [{ id: "la-queijo-branco", qtd: 50 }],
          },
          {
            texto: "Chá verde sem açúcar",
            ingredientes: [{ id: "be-chas", qtd: 1 }],
          },
        ],
      },
      {
        id: "cafe-2",
        numero: 2,
        nome: "Shake com fruta",
        proteina: 30,
        itens: [
          {
            texto:
              "Shake (pré/pós-treino opcional): 30 g de whey protein isolado sem lactose + 200 ml de bebida vegetal sem açúcar",
            ingredientes: [
              { id: "la-whey-isolado", qtd: 30 },
              { id: "la-bebida-vegetal", qtd: 200 },
            ],
          },
          {
            texto: "1 colher de sopa de linhaça moída (10 g)",
            ingredientes: [{ id: "se-linhaca", qtd: 10 }],
          },
          {
            texto: "10 g de pasta de amendoim natural (sem açúcar)",
            ingredientes: [{ id: "se-pasta-amendoim", qtd: 10 }],
          },
          {
            texto: "1 maçã pequena (80–100 g)",
            ingredientes: [{ id: "fr-maca", qtd: 1 }],
          },
        ],
      },
    ],
  },
  {
    id: "almoco",
    nome: REFEICOES_META.almoco.nome,
    opcoes: [
      {
        id: "almoco-1",
        numero: 1,
        nome: "Frango com salada",
        proteina: 50,
        itens: [
          {
            texto: "Peito de frango grelhado 150 g",
            ingredientes: [{ id: "pr-frango-peito", qtd: 150 }],
          },
          {
            texto:
              "Mix de folhas e legumes crus (200–250 g) — alface, tomate, pepino, cenoura ralada",
            ingredientes: [
              { id: "fo-alface", qtd: 100 },
              { id: "le-tomate", qtd: 0.5 },
              { id: "le-pepino", qtd: 0.25 },
              { id: "le-cenoura", qtd: 0.25 },
            ],
          },
          {
            texto:
              "Quinoa cozida 60 g (peso cozido ≈ 120 g) OU 100 g de batata-doce assada (se preferir mais carboidrato)",
            ingredientes: [{ id: "ca-quinoa", qtd: 60 }],
          },
          {
            texto: "Molho: 1 colher de sopa de azeite de oliva + limão",
            ingredientes: [
              { id: "go-azeite", qtd: 10 },
              { id: "fr-limao", qtd: 0.5 },
            ],
          },
          {
            texto: "1 porção de legumes cozidos 100 g",
            ingredientes: [{ id: "le-cozidos", qtd: 100 }],
          },
        ],
      },
      {
        id: "almoco-2",
        numero: 2,
        nome: "Peixe com grão-de-bico",
        proteina: 40,
        itens: [
          {
            texto: "Peixe grelhado ou assado 140 g",
            ingredientes: [{ id: "pr-peixe", qtd: 140 }],
          },
          {
            texto: "Salada de folhas (200 g) com 1 colher de sopa de azeite",
            ingredientes: [
              { id: "fo-alface", qtd: 200 },
              { id: "go-azeite", qtd: 10 },
            ],
          },
          {
            texto:
              "150 g de grão-de-bico cozido (opção moderada de carboidrato) OU 60 g de arroz integral",
            ingredientes: [{ id: "ca-grao-de-bico", qtd: 150 }],
          },
          {
            texto: "1 colher de sopa de sementes (linhaça) 10 g",
            ingredientes: [{ id: "se-linhaca", qtd: 10 }],
          },
        ],
      },
    ],
  },
  {
    id: "lanche",
    nome: REFEICOES_META.lanche.nome,
    nota: "Última refeição do dia, até as 17h–18h.",
    opcoes: [
      {
        id: "lanche-1",
        numero: 1,
        nome: "Whey com ovos",
        proteina: 36,
        itens: [
          {
            texto:
              "Whey protein isolado sem lactose 25–30 g, shake em água (logo após o treino, se houver)",
            ingredientes: [{ id: "la-whey-isolado", qtd: 30 }],
          },
          {
            texto: "5 amêndoas ou 5 castanhas-do-pará",
            ingredientes: [{ id: "se-castanhas", qtd: 5 }],
          },
          {
            texto: "2 ovos mexidos ou cozidos + 1 fio de azeite",
            ingredientes: [
              { id: "pr-ovos", qtd: 2 },
              { id: "go-azeite", qtd: 5 },
            ],
          },
        ],
      },
      {
        id: "lanche-2",
        numero: 2,
        nome: "Kefir com frutas vermelhas",
        proteina: 23,
        itens: [
          {
            texto: "Iogurte tipo kefir ou iogurte natural sem lactose 150 g",
            ingredientes: [{ id: "la-kefir-iogurte", qtd: 150 }],
          },
          {
            texto:
              "30 g de frutas vermelhas (morangos, mirtilo ou uvas roxas) e 1 colher de sopa de chia (10 g)",
            ingredientes: [
              { id: "fr-vermelhas", qtd: 30 },
              { id: "se-chia", qtd: 10 },
            ],
          },
          {
            texto: "1 omelete com 2 ovos inteiros + 1 clara + 1 fio de azeite",
            ingredientes: [
              { id: "pr-ovos", qtd: 3 },
              { id: "go-azeite", qtd: 5 },
            ],
          },
        ],
      },
    ],
  },
];

/** As observações que vieram com o plano, como a nutricionista escreveu. */
export const OBSERVACOES_NUTRI: string[] = [
  "Plano com leve déficit calórico (cerca de 10–12% abaixo da manutenção) para perder peso e recompor o corpo, com proteína alta (cerca de 1,6 a 1,9 g por kg do peso ideal) para preservar a massa magra.",
  "Prioridade para as fibras (psyllium), o ômega-3 e o treino de força — eles cuidam das gorduras e do açúcar do sangue.",
  "Pode acrescentar até 1 litro por dia, no máximo, de chá verde, gengibre, canela, hibisco, cavalinha ou dente-de-leão.",
];

/* -------------------------------------------------------------------------- */
/* A opção escolhida no dia                                                   */
/* -------------------------------------------------------------------------- */

/**
 * A opção que ela comeu fica gravada como texto do dia (setTextoDoDia em
 * lib/storage.ts), com este id: "opcao-cafe", "opcao-almoco", "opcao-lanche".
 * Texto, e não um campo novo, para não precisar mexer no banco.
 */
export function chaveOpcao(id: RefeicaoPlanoId): string {
  return `opcao-${id}`;
}

/** Lê o que está gravado: "1" ou "2" valem; qualquer outra coisa é "sem opção". */
export function lerOpcao(valor: string | undefined): 1 | 2 | null {
  return valor === "1" ? 1 : valor === "2" ? 2 : null;
}

export function refeicaoDoPlano(id: RefeicaoPlanoId): RefeicaoPlano {
  // O plano tem as três refeições: o find nunca volta vazio.
  return PLANO_ALIMENTAR.find((r) => r.id === id)!;
}

/**
 * Proteína de uma refeição marcada. Sem opção escolhida, conta a menor das
 * duas: melhor a estimativa ficar curta do que prometer o que não entrou.
 */
export function proteinaDaRefeicao(id: RefeicaoPlanoId, opcao: 1 | 2 | null): number {
  const { opcoes } = refeicaoDoPlano(id);
  if (opcao) return opcoes[opcao - 1].proteina;
  return Math.min(opcoes[0].proteina, opcoes[1].proteina);
}

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
    "Salada como entrada em todas as refeições principais — bate com a ordem do prato.",
    "Diminuir a quantidade de carboidrato, e quase nunca à noite — com o jejum, à noite não entra comida.",
    "Pouca comida no prato.",
    "Cortar o açúcar refinado.",
    "Atividade física: chegar a 5–6 h por semana.",
    "Por menor que seja a perda, ela melhora saúde e autoestima.",
  ],
  /** Onde ele e o plano atual não dizem a mesma coisa — e o que vale. */
  emConflito: [
    // O mesmo que MUDANCAS → lanchinho (data/alimentacao.ts): o plano de 18/10
    // tem as quantidades contadas, e lanche a mais passa pela nutricionista.
    "Ele sugeria um lanchinho a cada 2–3 h se batesse fome. O plano da nutricionista tem três refeições, com as quantidades contadas: se a fome apertar entre elas, pergunte a ela o que pode entrar. Depois que a janela fecha, é jejum.",
    "Ele falava em começar com 3 h de atividade física por semana e chegar a 5–6 h. O volume do treino agora fica com você e com quem acompanha o seu treino — vale mostrar a ele na próxima consulta.",
  ],
};
