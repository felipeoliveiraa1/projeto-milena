export type MealMacros = {
  kcal: number;
  proteina: number;
  carbo: number;
  gordura: number;
};

export type Componente = {
  id: string;
  label: string;
  ingredientes: string[];
  /** se for um item alternativo (ex: pão OU aveia) */
  alternativa?: boolean;
  /** macros do componente isolado (opcional) */
  macros?: MealMacros;
};

export type Substituicao = {
  id: string;
  trocar: string;
  por: string;
  quantidade: string;
  macros: MealMacros;
  ingredientes: string[];
};

export type Meal = {
  id: string;
  nome: string;
  hora: string;
  componentes: Componente[];
  macros: MealMacros;
  porQue: string;
  substituicoes?: Substituicao[];
  obrigatoria: boolean;
};

export const MEALS: Meal[] = [
  {
    id: "cafe",
    nome: "Café da manhã",
    hora: "07:00",
    componentes: [
      {
        id: "cafe-ovos",
        label: "2 ovos mexidos no azeite (sem manteiga)",
        ingredientes: ["pr-ovos", "go-azeite"],
      },
      {
        id: "cafe-pao",
        label: "1 fatia de pão integral (50 g)",
        ingredientes: ["ca-pao-integral"],
        alternativa: true,
      },
      {
        id: "cafe-aveia",
        label: "2 col. sopa de aveia (20 g) — alternativa ao pão",
        ingredientes: ["ca-aveia-fina"],
        alternativa: true,
      },
      {
        id: "cafe-frutas",
        label: "1 xícara de frutas vermelhas (150 g — morango, mirtilo)",
        ingredientes: ["fr-morango", "fr-mirtilo"],
      },
      {
        id: "cafe-cafe",
        label: "Café preto sem açúcar (pode adoçar com canela)",
        ingredientes: ["be-cafe-po", "be-canela-po"],
      },
    ],
    macros: { kcal: 320, proteina: 18, carbo: 32, gordura: 14 },
    porQue:
      "Proteína dos ovos sustenta a saciedade até o almoço e evita pico de glicose. Frutas vermelhas têm baixo índice glicêmico, ótimas para o seu histórico de diabetes gestacional e fígado.",
    substituicoes: [
      {
        id: "cafe-sub-whey",
        trocar: "Ovos",
        por: "Whey + aveia",
        quantidade: "1 scoop (30 g) + 2 col. sopa aveia (20 g)",
        macros: { kcal: 196, proteina: 27, carbo: 16, gordura: 4 },
        ingredientes: ["su-whey", "ca-aveia-fina"],
      },
      {
        id: "cafe-sub-tapioca",
        trocar: "Pão integral",
        por: "Tapioca pequena",
        quantidade: "2 col. sopa de goma (40 g)",
        macros: { kcal: 96, proteina: 0, carbo: 22, gordura: 0 },
        ingredientes: ["ca-tapioca"],
      },
      {
        id: "cafe-sub-maca",
        trocar: "Frutas vermelhas",
        por: "Maçã pequena",
        quantidade: "1 unidade (130 g)",
        macros: { kcal: 67, proteina: 0.5, carbo: 18, gordura: 0.4 },
        ingredientes: ["fr-maca-gala"],
      },
      {
        id: "cafe-sub-pera",
        trocar: "Frutas vermelhas",
        por: "Pera",
        quantidade: "1 unidade (180 g)",
        macros: { kcal: 100, proteina: 0.6, carbo: 25, gordura: 0.3 },
        ingredientes: ["fr-pera"],
      },
    ],
    obrigatoria: true,
  },
  {
    id: "lanche-manha",
    nome: "Lanche da manhã",
    hora: "10:00",
    componentes: [
      {
        id: "lanche-iogurte",
        label: "1 iogurte natural desnatado (170 g)",
        ingredientes: ["la-iog-natural"],
      },
      {
        id: "lanche-chia",
        label: "1 col. sopa de chia (10 g)",
        ingredientes: ["go-chia"],
      },
      {
        id: "lanche-aveia",
        label: "1 col. sopa de aveia em flocos (15 g)",
        ingredientes: ["ca-aveia-fina"],
      },
      {
        id: "lanche-fruta-morango",
        label: "Fruta: 1 xícara de frutas vermelhas (150 g)",
        ingredientes: ["fr-morango", "fr-mirtilo"],
      },
    ],
    macros: { kcal: 245, proteina: 14, carbo: 40, gordura: 5 },
    porQue:
      "Probióticos do iogurte ajudam intestino e imunidade no pós-parto. Chia + aveia dão fibras que regulam glicemia. A fruta acrescenta vitaminas e mantém saciedade até o almoço.",
    substituicoes: [
      {
        id: "lanche-sub-maca",
        trocar: "Fruta",
        por: "Maçã pequena",
        quantidade: "1 unidade (130 g)",
        macros: { kcal: 67, proteina: 0.5, carbo: 18, gordura: 0.4 },
        ingredientes: ["fr-maca-gala"],
      },
      {
        id: "lanche-sub-mamao",
        trocar: "Fruta",
        por: "Mamão papaya",
        quantidade: "1/2 unidade (150 g)",
        macros: { kcal: 70, proteina: 1, carbo: 17, gordura: 0.4 },
        ingredientes: ["fr-mamao"],
      },
      {
        id: "lanche-sub-kiwi",
        trocar: "Fruta",
        por: "Kiwi",
        quantidade: "2 unidades (140 g)",
        macros: { kcal: 85, proteina: 1.6, carbo: 21, gordura: 0.7 },
        ingredientes: ["fr-kiwi"],
      },
      {
        id: "lanche-sub-coalhada",
        trocar: "Iogurte natural",
        por: "Coalhada seca natural",
        quantidade: "170 g",
        macros: { kcal: 90, proteina: 9, carbo: 6, gordura: 3 },
        ingredientes: ["la-coalhada"],
      },
      {
        id: "lanche-sub-linhaca",
        trocar: "Chia",
        por: "Linhaça moída",
        quantidade: "1 col. sopa (10 g)",
        macros: { kcal: 53, proteina: 1.8, carbo: 3, gordura: 4.2 },
        ingredientes: ["go-linhaca-d"],
      },
      {
        id: "lanche-sub-granola",
        trocar: "Aveia",
        por: "Granola sem açúcar",
        quantidade: "1 col. sopa (15 g)",
        macros: { kcal: 70, proteina: 2, carbo: 11, gordura: 2 },
        ingredientes: ["ca-granola"],
      },
    ],
    obrigatoria: true,
  },
  {
    id: "almoco",
    nome: "Almoço",
    hora: "13:00",
    componentes: [
      {
        id: "almoco-salada",
        label: "🥗 ENTRADA OBRIGATÓRIA: prato cheio de salada (alface, rúcula, agrião, tomate, pepino)",
        ingredientes: [
          "fo-alface-crespa",
          "fo-rucula",
          "fo-agriao",
          "le-tomate",
          "le-pepino",
        ],
      },
      {
        id: "almoco-molho-iogurte",
        label: "Molho de iogurte com hortelã (recomendação do médico)",
        ingredientes: ["la-iog-natural", "te-hortela", "fr-limao-tahiti"],
        alternativa: true,
      },
      {
        id: "almoco-molho-azeite",
        label: "Tempero simples: azeite + limão",
        ingredientes: ["go-azeite", "fr-limao-tahiti"],
        alternativa: true,
      },
      {
        id: "almoco-frango",
        label: "130 g de frango grelhado",
        ingredientes: ["pr-frango-peito"],
      },
      {
        id: "almoco-arroz",
        label: "4 col. sopa de arroz integral (100 g)",
        ingredientes: ["ca-arroz-integral"],
        alternativa: true,
      },
      {
        id: "almoco-batata-doce",
        label: "1 batata-doce média (150 g) — alternativa ao arroz",
        ingredientes: ["ca-batata-doce"],
        alternativa: true,
      },
      {
        id: "almoco-legumes",
        label: "Legumes refogados (abobrinha, brócolis, cenoura, berinjela)",
        ingredientes: ["le-abobrinha", "le-brocolis", "le-cenoura", "le-berinjela"],
      },
    ],
    macros: { kcal: 480, proteina: 38, carbo: 45, gordura: 15 },
    porQue:
      "Salada antes preenche o estômago com fibra e reduz a fome — orientação do médico. Proteína magra é o tijolo da massa magra. Carbo de baixo IG sustenta energia sem pico de glicose. Azeite é gordura boa essencial pro fígado.",
    substituicoes: [
      {
        id: "almoco-sub-quinoa",
        trocar: "Arroz integral",
        por: "Quinoa cozida",
        quantidade: "4 col. sopa (100 g)",
        macros: { kcal: 120, proteina: 4.4, carbo: 21, gordura: 1.9 },
        ingredientes: ["ca-quinoa"],
      },
      {
        id: "almoco-sub-inhame",
        trocar: "Arroz integral",
        por: "Inhame cozido",
        quantidade: "100 g",
        macros: { kcal: 116, proteina: 1.5, carbo: 27, gordura: 0.2 },
        ingredientes: ["ca-inhame"],
      },
      {
        id: "almoco-sub-baroa",
        trocar: "Arroz integral",
        por: "Mandioquinha cozida",
        quantidade: "100 g",
        macros: { kcal: 80, proteina: 1.5, carbo: 18, gordura: 0.2 },
        ingredientes: ["ca-baroa"],
      },
      {
        id: "almoco-sub-tilapia",
        trocar: "Frango",
        por: "Tilápia grelhada",
        quantidade: "130 g",
        macros: { kcal: 165, proteina: 33, carbo: 0, gordura: 3 },
        ingredientes: ["pr-tilapia"],
      },
      {
        id: "almoco-sub-salmao",
        trocar: "Frango",
        por: "Salmão (2x/sem)",
        quantidade: "130 g",
        macros: { kcal: 270, proteina: 30, carbo: 0, gordura: 16 },
        ingredientes: ["pr-salmao"],
      },
      {
        id: "almoco-sub-patinho",
        trocar: "Frango",
        por: "Patinho moído",
        quantidade: "130 g",
        macros: { kcal: 200, proteina: 32, carbo: 0, gordura: 8 },
        ingredientes: ["pr-patinho"],
      },
      {
        id: "almoco-sub-lombo",
        trocar: "Frango",
        por: "Lombo de porco (médico)",
        quantidade: "130 g",
        macros: { kcal: 195, proteina: 31, carbo: 0, gordura: 7 },
        ingredientes: ["pr-lombo"],
      },
      {
        id: "almoco-sub-peru",
        trocar: "Frango",
        por: "Peito de peru fresco",
        quantidade: "130 g",
        macros: { kcal: 170, proteina: 28, carbo: 2, gordura: 5 },
        ingredientes: ["pr-peru-fresco"],
      },
    ],
    obrigatoria: true,
  },
  {
    id: "pre-treino",
    nome: "Pré-treino",
    hora: "1h antes do treino",
    componentes: [
      {
        id: "pre-banana",
        label: "1 banana média (120 g)",
        ingredientes: ["fr-banana"],
      },
      {
        id: "pre-amendoim",
        label: "1 col. chá de pasta de amendoim integral (5 g)",
        ingredientes: ["go-amendoim-pasta"],
      },
    ],
    macros: { kcal: 135, proteina: 2.6, carbo: 28, gordura: 3 },
    porQue:
      "Carbo rápido da banana dá energia para o treino. Amendoim segura a glicemia e evita queda de energia no meio da série.",
    substituicoes: [
      {
        id: "pre-sub-maca-caju",
        trocar: "Banana",
        por: "Maçã + castanhas-de-caju",
        quantidade: "1 maçã (130 g) + 5 castanhas (10 g)",
        macros: { kcal: 122, proteina: 2, carbo: 21, gordura: 5 },
        ingredientes: ["fr-maca-gala", "go-caju"],
      },
      {
        id: "pre-sub-mel",
        trocar: "Pasta de amendoim",
        por: "Mel puro",
        quantidade: "1 col. chá (7 g)",
        macros: { kcal: 21, proteina: 0, carbo: 6, gordura: 0 },
        ingredientes: ["be-mel"],
      },
    ],
    obrigatoria: false,
  },
  {
    id: "pos-treino",
    nome: "Pós-treino",
    hora: "logo após",
    componentes: [
      {
        id: "pos-whey",
        label: "30 g de Whey Protein (1 scoop) batido com água ou leite desnatado",
        ingredientes: ["su-whey", "la-leite-desnatado"],
      },
      {
        id: "pos-creatina",
        label: "3–5 g de Creatina (pode misturar no Whey)",
        ingredientes: ["su-creatina"],
      },
      {
        id: "pos-fruta-banana",
        label: "1 banana média",
        ingredientes: ["fr-banana"],
        alternativa: true,
      },
      {
        id: "pos-fruta-maca",
        label: "1 maçã pequena — alternativa à banana",
        ingredientes: ["fr-maca-gala"],
        alternativa: true,
      },
      {
        id: "pos-fruta-vermelhas",
        label: "1 xícara de frutas vermelhas — alternativa",
        ingredientes: ["fr-morango", "fr-mirtilo"],
        alternativa: true,
      },
    ],
    macros: { kcal: 220, proteina: 25, carbo: 22, gordura: 2 },
    porQue:
      "Janela de recuperação muscular: proteína de absorção rápida + carbo reabastecem o músculo. Creatina pós-treino ajuda força e recuperação.",
    substituicoes: [
      {
        id: "pos-sub-ovos",
        trocar: "Whey",
        por: "3 claras + 1 ovo inteiro mexidos",
        quantidade: "3 claras + 1 ovo",
        macros: { kcal: 120, proteina: 17, carbo: 1, gordura: 5 },
        ingredientes: ["pr-ovos", "pr-claras"],
      },
      {
        id: "pos-sub-mamao",
        trocar: "Fruta",
        por: "Mamão papaya",
        quantidade: "1 fatia (150 g)",
        macros: { kcal: 65, proteina: 1, carbo: 16, gordura: 0.4 },
        ingredientes: ["fr-mamao"],
      },
    ],
    obrigatoria: true,
  },
  {
    id: "jantar",
    nome: "Jantar",
    hora: "20:00",
    componentes: [
      {
        id: "jantar-salada",
        label: "🥗 ENTRADA OBRIGATÓRIA: prato cheio de salada (alface, rúcula, agrião)",
        ingredientes: ["fo-alface-crespa", "fo-rucula", "fo-agriao"],
      },
      {
        id: "jantar-tempero",
        label: "Azeite + limão pra temperar",
        ingredientes: ["go-azeite", "fr-limao-tahiti"],
      },
      {
        id: "jantar-peixe",
        label: "130 g de peixe (tilápia, salmão)",
        ingredientes: ["pr-tilapia"],
        alternativa: true,
      },
      {
        id: "jantar-frango",
        label: "130 g de frango — alternativa",
        ingredientes: ["pr-frango-peito"],
        alternativa: true,
      },
      {
        id: "jantar-lombo",
        label: "130 g de lombo de porco — alternativa (médico)",
        ingredientes: ["pr-lombo"],
        alternativa: true,
      },
      {
        id: "jantar-ovos",
        label: "3 ovos — alternativa",
        ingredientes: ["pr-ovos"],
        alternativa: true,
      },
      {
        id: "jantar-couve-flor",
        label: "'Arroz' de couve-flor (médico recomenda evitar carbo à noite)",
        ingredientes: ["ca-couve-flor"],
      },
      {
        id: "jantar-legumes",
        label: "Legumes refogados ou no vapor (abobrinha, brócolis, abóbora)",
        ingredientes: ["le-abobrinha", "le-brocolis", "le-abobora-cabotia"],
      },
    ],
    macros: { kcal: 380, proteina: 32, carbo: 28, gordura: 14 },
    porQue:
      "Médico recomenda: 'quase nunca coma carbo à noite'. Salada como entrada preenche e diminui fome. Jantar leve respeita o metabolismo noturno e ajuda no fígado gorduroso. Proteína à noite = recuperação muscular durante o sono.",
    substituicoes: [
      {
        id: "jantar-sub-abobora",
        trocar: "Couve-flor",
        por: "Abóbora cabotiá assada",
        quantidade: "150 g",
        macros: { kcal: 60, proteina: 2, carbo: 14, gordura: 0.2 },
        ingredientes: ["le-abobora-cabotia"],
      },
      {
        id: "jantar-sub-sopa",
        trocar: "Proteína + carbo",
        por: "Sopa de legumes batidos com frango desfiado",
        quantidade: "1 prato fundo (350 g)",
        macros: { kcal: 280, proteina: 28, carbo: 18, gordura: 8 },
        ingredientes: ["pr-frango-peito", "le-abobrinha", "le-cenoura", "le-abobora-cabotia"],
      },
    ],
    obrigatoria: true,
  },
  {
    id: "ceia",
    nome: "Ceia (opcional)",
    hora: "22:00",
    componentes: [
      {
        id: "ceia-iogurte",
        label: "1 iogurte natural desnatado (170 g)",
        ingredientes: ["la-iog-natural"],
      },
      {
        id: "ceia-canela",
        label: "Canela em pó a gosto",
        ingredientes: ["be-canela-po"],
      },
      {
        id: "ceia-fruta-morango",
        label: "Fruta opcional: 1/2 xícara de frutas vermelhas",
        ingredientes: ["fr-morango"],
        alternativa: true,
      },
      {
        id: "ceia-fruta-maca",
        label: "Fruta opcional: 1/2 maçã pequena",
        ingredientes: ["fr-maca-gala"],
        alternativa: true,
      },
      {
        id: "ceia-fruta-mamao",
        label: "Fruta opcional: 1/2 xícara de mamão picado",
        ingredientes: ["fr-mamao"],
        alternativa: true,
      },
      {
        id: "ceia-fruta-kiwi",
        label: "Fruta opcional: 1 kiwi",
        ingredientes: ["fr-kiwi"],
        alternativa: true,
      },
    ],
    macros: { kcal: 110, proteina: 10, carbo: 17, gordura: 2 },
    porQue:
      "Caseína do iogurte libera proteína lentamente durante a noite, protegendo a massa magra. Canela ajuda a regular glicemia. A fruta acrescenta fibra sem pesar.",
    substituicoes: [
      {
        id: "ceia-sub-claras",
        trocar: "Iogurte",
        por: "Claras mexidas com ervas",
        quantidade: "2 claras",
        macros: { kcal: 35, proteina: 7, carbo: 0.5, gordura: 0.1 },
        ingredientes: ["pr-claras", "te-salsinha"],
      },
    ],
    obrigatoria: false,
  },
];

export const TOTAL_MACROS = MEALS.reduce(
  (acc, m) => ({
    kcal: acc.kcal + m.macros.kcal,
    proteina: acc.proteina + m.macros.proteina,
    carbo: acc.carbo + m.macros.carbo,
    gordura: acc.gordura + m.macros.gordura,
  }),
  { kcal: 0, proteina: 0, carbo: 0, gordura: 0 },
);

export type OpcaoSubstituicao = {
  nome: string;
  quantidade: string;
  macros: MealMacros;
};

export const SUBSTITUICOES_GERAIS: Array<{
  grupo: string;
  nota?: string;
  opcoes: OpcaoSubstituicao[];
}> = [
  {
    grupo: "Carboidratos (escolha 1 por refeição principal)",
    nota: "Trocas equivalentes ao arroz integral / batata-doce do plano",
    opcoes: [
      { nome: "Arroz integral cozido", quantidade: "4 col. sopa (100 g)", macros: { kcal: 124, proteina: 2.5, carbo: 26, gordura: 1 } },
      { nome: "Batata-doce cozida", quantidade: "1 média (150 g)", macros: { kcal: 130, proteina: 2.4, carbo: 30, gordura: 0.2 } },
      { nome: "Inhame cozido", quantidade: "100 g", macros: { kcal: 116, proteina: 1.5, carbo: 27, gordura: 0.2 } },
      { nome: "Mandioquinha cozida", quantidade: "100 g", macros: { kcal: 80, proteina: 1.5, carbo: 18, gordura: 0.2 } },
      { nome: "Quinoa cozida", quantidade: "4 col. sopa (100 g)", macros: { kcal: 120, proteina: 4.4, carbo: 21, gordura: 1.9 } },
      { nome: "Pão integral", quantidade: "1 fatia (50 g)", macros: { kcal: 130, proteina: 5, carbo: 22, gordura: 2 } },
      { nome: "Tapioca", quantidade: "2 col. sopa goma (40 g)", macros: { kcal: 96, proteina: 0, carbo: 22, gordura: 0 } },
    ],
  },
  {
    grupo: "Proteínas magras (escolha 1)",
    nota: "Porção de referência: 130 g cru ≈ 100 g cozido",
    opcoes: [
      { nome: "Frango (peito) grelhado", quantidade: "130 g", macros: { kcal: 215, proteina: 40, carbo: 0, gordura: 5 } },
      { nome: "Tilápia grelhada", quantidade: "130 g", macros: { kcal: 165, proteina: 33, carbo: 0, gordura: 3 } },
      { nome: "Salmão (2x/sem)", quantidade: "130 g", macros: { kcal: 270, proteina: 30, carbo: 0, gordura: 16 } },
      { nome: "Patinho moído", quantidade: "130 g", macros: { kcal: 200, proteina: 32, carbo: 0, gordura: 8 } },
      { nome: "Lombo de porco grelhado", quantidade: "130 g", macros: { kcal: 195, proteina: 31, carbo: 0, gordura: 7 } },
      { nome: "Peito de peru defumado", quantidade: "130 g", macros: { kcal: 170, proteina: 28, carbo: 2, gordura: 5 } },
      { nome: "Ovos", quantidade: "3 unidades", macros: { kcal: 210, proteina: 18, carbo: 1, gordura: 15 } },
      { nome: "Iogurte grego natural", quantidade: "200 g", macros: { kcal: 130, proteina: 18, carbo: 6, gordura: 4 } },
    ],
  },
  {
    grupo: "Frutas (baixo IG)",
    nota: "Porção média: 1 unidade pequena ou 1 xícara",
    opcoes: [
      { nome: "Maçã pequena", quantidade: "1 unidade (130 g)", macros: { kcal: 67, proteina: 0.5, carbo: 18, gordura: 0.4 } },
      { nome: "Pera", quantidade: "1 unidade (180 g)", macros: { kcal: 100, proteina: 0.6, carbo: 25, gordura: 0.3 } },
      { nome: "Frutas vermelhas", quantidade: "1 xícara (150 g)", macros: { kcal: 65, proteina: 1, carbo: 15, gordura: 0.4 } },
      { nome: "Kiwi", quantidade: "2 unidades (140 g)", macros: { kcal: 85, proteina: 1.6, carbo: 21, gordura: 0.7 } },
      { nome: "Mexerica", quantidade: "1 unidade (100 g)", macros: { kcal: 45, proteina: 0.8, carbo: 11, gordura: 0.3 } },
      { nome: "Mamão papaya", quantidade: "1 fatia (150 g)", macros: { kcal: 65, proteina: 1, carbo: 16, gordura: 0.4 } },
      { nome: "Banana (só pré-treino)", quantidade: "1 média (120 g)", macros: { kcal: 105, proteina: 1.3, carbo: 27, gordura: 0.4 } },
    ],
  },
  {
    grupo: "Gorduras boas (1 porção/refeição principal)",
    nota: "Apoiam fígado e absorção de vitaminas",
    opcoes: [
      { nome: "Azeite extravirgem", quantidade: "1 col. sopa (10 g)", macros: { kcal: 90, proteina: 0, carbo: 0, gordura: 10 } },
      { nome: "Castanhas-de-caju", quantidade: "5 unidades (10 g)", macros: { kcal: 55, proteina: 1.5, carbo: 3, gordura: 4.5 } },
      { nome: "Castanha-do-pará", quantidade: "2 unidades (8 g)", macros: { kcal: 53, proteina: 1.2, carbo: 1, gordura: 5.4 } },
      { nome: "Pasta de amendoim integral", quantidade: "1 col. chá (5 g)", macros: { kcal: 30, proteina: 1.3, carbo: 1.1, gordura: 2.5 } },
      { nome: "Chia", quantidade: "1 col. sopa (10 g)", macros: { kcal: 49, proteina: 1.7, carbo: 4.2, gordura: 3.1 } },
      { nome: "Linhaça moída", quantidade: "1 col. sopa (10 g)", macros: { kcal: 53, proteina: 1.8, carbo: 3, gordura: 4.2 } },
    ],
  },
];

export const ORIENTACOES_MEDICO = {
  medico: "Dr. Henry Adur Gebenlian — CRM/SP 70202",
  especialidade: "Endocrinologia e Metabologia (SBEM)",
  pontos: [
    "Disciplina em 90% das situações — 100% poucos alcançam. Estilo de vida, não dieta passageira.",
    "Priorizar alimentos in natura: folhas verdes, legumes, frutas, peixes, frango e lombo de porco. Diminuir carnes vermelhas e cortar embutidos.",
    "Compra na feira/sacolão > supermercado/delivery (refeições prontas costumam ter mais calorias).",
    "🥗 Salada como ENTRADA obrigatória em TODAS as refeições principais — mesmo no jantar e em dias frios. Tempere com azeite, limão ou molho de iogurte com hortelã. Sem molhos industrializados.",
    "Diminua sempre a quantidade de carboidratos (arroz, massas, batatas, pães). Quase nunca à noite.",
    "Pouca comida no prato. Se ficar com fome, a cada 2–3h faça lanchinho saudável (fruta, iogurte diet, 2 torradas integrais, barra de cereais, castanhas, amêndoas).",
    "Frente a um doce/bolo/frito, pense em quantos minutos de academia precisaria pra queimar — se não der pra resistir, saia do ambiente.",
    "Cortar as duas farinhas brancas: açúcar refinado e farinha de trigo (e tudo que vem delas — bolos, doces, pizzas, salgadinhos, biscoitos, refrigerantes, sucos industrializados).",
    "Atividade física: começar com 3h/semana e ir até 5–6h. Caminhada inclinada, bike, natação, dança, luta, crossfit — qualquer coisa que dê prazer. Subir escada vale também.",
    "Por menor que seja a perda, ela melhora saúde, autoestima e mostra que dá pra manter.",
  ],
};

export const ALIMENTOS_EVITAR = [
  "Feijão, lentilha, grão-de-bico (preferência sua)",
  "Abacate (preferência sua)",
  "Embutidos (presunto, salame, salsicha) — sódio alto",
  "Frituras e gordura trans — agravam fígado gorduroso",
  "Açúcar refinado, refrigerantes, sucos industrializados",
  "Doces, bolos, biscoitos recheados",
  "Temperos prontos em pó/cubo (sódio altíssimo)",
];
