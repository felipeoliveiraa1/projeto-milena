export type MealMacros = {
  kcal: number;
  proteina: number;
  carbo: number;
  gordura: number;
};

export type Substituicao = {
  trocar: string;
  por: string;
  quantidade: string;
  macros: MealMacros;
};

export type Meal = {
  id: string;
  nome: string;
  hora: string;
  alimentos: string[];
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
    alimentos: [
      "2 ovos mexidos no azeite (sem manteiga)",
      "1 fatia de pão integral (50 g) OU 2 col. sopa de aveia (20 g)",
      "1 xícara de frutas vermelhas (150 g — morango, mirtilo, framboesa)",
      "Café preto sem açúcar (pode adoçar com canela)",
    ],
    macros: { kcal: 320, proteina: 18, carbo: 32, gordura: 14 },
    porQue:
      "Proteína dos ovos sustenta a saciedade até o almoço e evita pico de glicose. Frutas vermelhas têm baixo índice glicêmico, ótimas para o seu histórico de diabetes gestacional e fígado.",
    substituicoes: [
      {
        trocar: "Ovos",
        por: "Whey + aveia",
        quantidade: "1 scoop (30 g) + 2 col. sopa aveia (20 g)",
        macros: { kcal: 196, proteina: 27, carbo: 16, gordura: 4 },
      },
      {
        trocar: "Pão integral",
        por: "Tapioca pequena",
        quantidade: "2 col. sopa de goma (40 g)",
        macros: { kcal: 96, proteina: 0, carbo: 22, gordura: 0 },
      },
      {
        trocar: "Frutas vermelhas",
        por: "Maçã pequena",
        quantidade: "1 unidade (130 g)",
        macros: { kcal: 67, proteina: 0.5, carbo: 18, gordura: 0.4 },
      },
      {
        trocar: "Frutas vermelhas",
        por: "Pera",
        quantidade: "1 unidade (180 g)",
        macros: { kcal: 100, proteina: 0.6, carbo: 25, gordura: 0.3 },
      },
    ],
    obrigatoria: true,
  },
  {
    id: "lanche-manha",
    nome: "Lanche da manhã",
    hora: "10:00",
    alimentos: [
      "1 iogurte natural desnatado (170 g)",
      "1 col. sopa de chia (10 g)",
      "1 col. sopa de aveia em flocos (15 g)",
      "1 fruta pequena (escolha entre as opções abaixo)",
    ],
    macros: { kcal: 245, proteina: 14, carbo: 40, gordura: 5 },
    porQue:
      "Probióticos do iogurte ajudam intestino e imunidade no pós-parto. Chia + aveia dão fibras que regulam glicemia. A fruta acrescenta vitaminas e mantém saciedade até o almoço.",
    substituicoes: [
      {
        trocar: "Fruta",
        por: "Maçã pequena",
        quantidade: "1 unidade (130 g)",
        macros: { kcal: 67, proteina: 0.5, carbo: 18, gordura: 0.4 },
      },
      {
        trocar: "Fruta",
        por: "Mamão papaya",
        quantidade: "1/2 unidade (150 g)",
        macros: { kcal: 70, proteina: 1, carbo: 17, gordura: 0.4 },
      },
      {
        trocar: "Fruta",
        por: "Frutas vermelhas",
        quantidade: "1 xícara (150 g)",
        macros: { kcal: 65, proteina: 1, carbo: 15, gordura: 0.4 },
      },
      {
        trocar: "Fruta",
        por: "Kiwi",
        quantidade: "2 unidades (140 g)",
        macros: { kcal: 85, proteina: 1.6, carbo: 21, gordura: 0.7 },
      },
      {
        trocar: "Iogurte natural",
        por: "Coalhada seca natural",
        quantidade: "170 g",
        macros: { kcal: 90, proteina: 9, carbo: 6, gordura: 3 },
      },
      {
        trocar: "Chia",
        por: "Linhaça moída",
        quantidade: "1 col. sopa (10 g)",
        macros: { kcal: 53, proteina: 1.8, carbo: 3, gordura: 4.2 },
      },
      {
        trocar: "Aveia",
        por: "Granola sem açúcar",
        quantidade: "1 col. sopa (15 g)",
        macros: { kcal: 70, proteina: 2, carbo: 11, gordura: 2 },
      },
    ],
    obrigatoria: true,
  },
  {
    id: "almoco",
    nome: "Almoço",
    hora: "13:00",
    alimentos: [
      "130 g de proteína magra (frango, tilápia, patinho ou peito de peru)",
      "4 col. sopa de arroz integral (100 g) OU 1 batata-doce média (150 g)",
      "Salada verde à vontade (alface, rúcula, agrião)",
      "Legumes refogados (abobrinha, brócolis, cenoura, berinjela)",
      "1 col. sopa de azeite extravirgem (10 g)",
    ],
    macros: { kcal: 480, proteina: 38, carbo: 45, gordura: 15 },
    porQue:
      "Proteína magra é o tijolo da massa magra que você quer ganhar. Carbo de baixo IG (integral/batata-doce) sustenta energia sem pico. Azeite é gordura boa essencial pro fígado.",
    substituicoes: [
      {
        trocar: "Arroz integral",
        por: "Batata-doce cozida",
        quantidade: "1 média (150 g)",
        macros: { kcal: 130, proteina: 2.4, carbo: 30, gordura: 0.2 },
      },
      {
        trocar: "Arroz integral",
        por: "Quinoa cozida",
        quantidade: "4 col. sopa (100 g)",
        macros: { kcal: 120, proteina: 4.4, carbo: 21, gordura: 1.9 },
      },
      {
        trocar: "Arroz integral",
        por: "Inhame cozido",
        quantidade: "100 g",
        macros: { kcal: 116, proteina: 1.5, carbo: 27, gordura: 0.2 },
      },
      {
        trocar: "Arroz integral",
        por: "Mandioquinha cozida",
        quantidade: "100 g",
        macros: { kcal: 80, proteina: 1.5, carbo: 18, gordura: 0.2 },
      },
      {
        trocar: "Frango",
        por: "Tilápia grelhada",
        quantidade: "130 g",
        macros: { kcal: 165, proteina: 33, carbo: 0, gordura: 3 },
      },
      {
        trocar: "Frango",
        por: "Salmão (2x/sem)",
        quantidade: "130 g",
        macros: { kcal: 270, proteina: 30, carbo: 0, gordura: 16 },
      },
      {
        trocar: "Frango",
        por: "Patinho moído",
        quantidade: "130 g",
        macros: { kcal: 200, proteina: 32, carbo: 0, gordura: 8 },
      },
    ],
    obrigatoria: true,
  },
  {
    id: "pre-treino",
    nome: "Pré-treino",
    hora: "1h antes do treino",
    alimentos: [
      "1 banana média (120 g)",
      "1 col. chá de pasta de amendoim integral (5 g, sem açúcar)",
    ],
    macros: { kcal: 135, proteina: 2.6, carbo: 28, gordura: 3 },
    porQue:
      "Carbo rápido da banana dá energia para o treino. Amendoim segura a glicemia e evita queda de energia no meio da série.",
    substituicoes: [
      {
        trocar: "Banana",
        por: "Maçã + castanhas-de-caju",
        quantidade: "1 maçã (130 g) + 5 castanhas (10 g)",
        macros: { kcal: 122, proteina: 2, carbo: 21, gordura: 5 },
      },
      {
        trocar: "Pasta de amendoim",
        por: "Mel puro",
        quantidade: "1 col. chá (7 g)",
        macros: { kcal: 21, proteina: 0, carbo: 6, gordura: 0 },
      },
    ],
    obrigatoria: false,
  },
  {
    id: "pos-treino",
    nome: "Pós-treino",
    hora: "logo após",
    alimentos: [
      "30 g de Whey Protein (1 scoop) batido com água ou leite desnatado",
      "1 fruta (banana, maçã ou frutas vermelhas)",
      "3–5 g de Creatina (pode misturar no Whey)",
    ],
    macros: { kcal: 220, proteina: 25, carbo: 22, gordura: 2 },
    porQue:
      "Janela de recuperação muscular: proteína de absorção rápida + carbo reabastecem o músculo. Creatina pós-treino ajuda força e recuperação.",
    substituicoes: [
      {
        trocar: "Whey",
        por: "3 claras + 1 ovo inteiro mexidos",
        quantidade: "3 claras + 1 ovo",
        macros: { kcal: 120, proteina: 17, carbo: 1, gordura: 5 },
      },
      {
        trocar: "Fruta",
        por: "Mamão papaya",
        quantidade: "1 fatia (150 g)",
        macros: { kcal: 65, proteina: 1, carbo: 16, gordura: 0.4 },
      },
      {
        trocar: "Fruta",
        por: "Banana",
        quantidade: "1 média (120 g)",
        macros: { kcal: 105, proteina: 1.3, carbo: 27, gordura: 0.4 },
      },
    ],
    obrigatoria: true,
  },
  {
    id: "jantar",
    nome: "Jantar",
    hora: "20:00",
    alimentos: [
      "130 g de proteína (peixe, frango, ovos — 3 unidades)",
      "100 g de batata-doce OU 'arroz' de couve-flor",
      "Legumes no vapor ou refogados (à vontade)",
      "Folhas verdes",
      "1 col. sopa de azeite (10 g)",
    ],
    macros: { kcal: 380, proteina: 32, carbo: 28, gordura: 14 },
    porQue:
      "Jantar mais leve no carbo respeita o ritmo metabólico noturno e ajuda no fígado gorduroso. Proteína à noite = recuperação muscular durante o sono.",
    substituicoes: [
      {
        trocar: "Batata-doce",
        por: "'Arroz' de couve-flor",
        quantidade: "1 prato pequeno (150 g)",
        macros: { kcal: 38, proteina: 3, carbo: 7, gordura: 0.5 },
      },
      {
        trocar: "Batata-doce",
        por: "Abóbora cabotiá assada",
        quantidade: "150 g",
        macros: { kcal: 60, proteina: 2, carbo: 14, gordura: 0.2 },
      },
      {
        trocar: "Proteína",
        por: "Sopa de legumes batidos com frango desfiado",
        quantidade: "1 prato fundo (350 g, com 100 g de frango)",
        macros: { kcal: 280, proteina: 28, carbo: 18, gordura: 8 },
      },
    ],
    obrigatoria: true,
  },
  {
    id: "ceia",
    nome: "Ceia (opcional)",
    hora: "22:00",
    alimentos: [
      "1 iogurte natural desnatado (170 g)",
      "1 fruta pequena (opcional)",
      "Canela a gosto",
    ],
    macros: { kcal: 110, proteina: 10, carbo: 17, gordura: 2 },
    porQue:
      "Caseína do iogurte libera proteína lentamente durante a noite, protegendo a massa magra. Canela ajuda a regular glicemia. A fruta acrescenta fibra sem pesar.",
    substituicoes: [
      {
        trocar: "Fruta",
        por: "Frutas vermelhas",
        quantidade: "1/2 xícara (75 g)",
        macros: { kcal: 32, proteina: 0.5, carbo: 7, gordura: 0.2 },
      },
      {
        trocar: "Fruta",
        por: "Maçã pequena",
        quantidade: "1/2 unidade (65 g)",
        macros: { kcal: 33, proteina: 0.2, carbo: 9, gordura: 0.2 },
      },
      {
        trocar: "Fruta",
        por: "Mamão picado",
        quantidade: "1/2 xícara (75 g)",
        macros: { kcal: 32, proteina: 0.5, carbo: 8, gordura: 0.2 },
      },
      {
        trocar: "Fruta",
        por: "Kiwi",
        quantidade: "1 unidade (70 g)",
        macros: { kcal: 42, proteina: 0.8, carbo: 10, gordura: 0.4 },
      },
      {
        trocar: "Iogurte",
        por: "Claras mexidas com ervas",
        quantidade: "2 claras",
        macros: { kcal: 35, proteina: 7, carbo: 0.5, gordura: 0.1 },
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

export const ALIMENTOS_EVITAR = [
  "Feijão, lentilha, grão-de-bico (preferência sua)",
  "Abacate (preferência sua)",
  "Embutidos (presunto, salame, salsicha) — sódio alto",
  "Frituras e gordura trans — agravam fígado gorduroso",
  "Açúcar refinado, refrigerantes, sucos industrializados",
  "Doces, bolos, biscoitos recheados",
  "Temperos prontos em pó/cubo (sódio altíssimo)",
];
