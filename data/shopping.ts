export type ShoppingItem = {
  id: string;
  nome: string;
  quantidade: string;
};

export type ShoppingCategory = {
  id: string;
  nome: string;
  icone: string;
  cor: string;
  itens: ShoppingItem[];
};

export const SHOPPING_LIST: ShoppingCategory[] = [
  {
    id: "proteinas",
    nome: "Proteínas (açougue / peixaria)",
    icone: "🥩",
    cor: "from-rose-50 to-rose-100 border-rose-200",
    itens: [
      { id: "pr-frango", nome: "Peito de frango", quantidade: "1 kg" },
      { id: "pr-tilapia", nome: "Filé de tilápia", quantidade: "500 g" },
      { id: "pr-salmao", nome: "Salmão (2x/sem)", quantidade: "300 g" },
      { id: "pr-patinho", nome: "Patinho moído", quantidade: "500 g" },
      { id: "pr-lombo", nome: "Lombo de porco (recomendado pelo médico)", quantidade: "500 g" },
      { id: "pr-peru", nome: "Peito de peru fatiado (sem nitrito)", quantidade: "200 g" },
      { id: "pr-ovos", nome: "Ovos caipiras", quantidade: "1 dúzia" },
    ],
  },
  {
    id: "laticinios",
    nome: "Laticínios",
    icone: "🥛",
    cor: "from-sky-50 to-sky-100 border-sky-200",
    itens: [
      { id: "la-iog-natural", nome: "Iogurte natural desnatado", quantidade: "6 unidades" },
      { id: "la-iog-grego", nome: "Iogurte grego natural (opcional)", quantidade: "1 pote" },
      { id: "la-coalhada", nome: "Coalhada seca natural", quantidade: "1 pote (opcional)" },
      { id: "la-queijo", nome: "Queijo branco / cottage (opcional)", quantidade: "200 g" },
    ],
  },
  {
    id: "carbos",
    nome: "Carboidratos integrais",
    icone: "🍠",
    cor: "from-amber-50 to-amber-100 border-amber-200",
    itens: [
      { id: "ca-arroz", nome: "Arroz integral", quantidade: "1 kg" },
      { id: "ca-batata-doce", nome: "Batata-doce", quantidade: "1 kg" },
      { id: "ca-inhame", nome: "Inhame (opcional)", quantidade: "500 g" },
      { id: "ca-mandioquinha", nome: "Mandioquinha (opcional)", quantidade: "500 g" },
      { id: "ca-quinoa", nome: "Quinoa em grãos", quantidade: "250 g" },
      { id: "ca-pao", nome: "Pão integral sem açúcar (rótulo curto)", quantidade: "1 forma" },
      { id: "ca-tapioca", nome: "Goma de tapioca", quantidade: "500 g" },
      { id: "ca-aveia", nome: "Aveia em flocos finos", quantidade: "500 g" },
      { id: "ca-couve-flor", nome: "Couve-flor (pra 'arroz' de couve-flor)", quantidade: "1 cabeça" },
    ],
  },
  {
    id: "folhas",
    nome: "Folhas verdes (salada como ENTRADA obrigatória)",
    icone: "🥗",
    cor: "from-emerald-50 to-emerald-100 border-emerald-200",
    itens: [
      { id: "fo-alface", nome: "Alface americana ou crespa", quantidade: "2 pés" },
      { id: "fo-rucula", nome: "Rúcula", quantidade: "1 maço" },
      { id: "fo-agriao", nome: "Agrião", quantidade: "1 maço" },
      { id: "fo-espinafre", nome: "Espinafre", quantidade: "1 maço" },
      { id: "fo-couve", nome: "Couve manteiga", quantidade: "1 maço" },
    ],
  },
  {
    id: "legumes",
    nome: "Legumes",
    icone: "🥦",
    cor: "from-emerald-50 to-emerald-100 border-emerald-200",
    itens: [
      { id: "le-abobrinha", nome: "Abobrinha", quantidade: "3 unidades" },
      { id: "le-brocolis", nome: "Brócolis", quantidade: "1 maço" },
      { id: "le-cenoura", nome: "Cenoura", quantidade: "5 unidades" },
      { id: "le-berinjela", nome: "Berinjela", quantidade: "2 unidades" },
      { id: "le-tomate", nome: "Tomate", quantidade: "6 unidades" },
      { id: "le-pepino", nome: "Pepino", quantidade: "3 unidades" },
      { id: "le-pimentao", nome: "Pimentão (verde/vermelho)", quantidade: "2 unidades" },
      { id: "le-abobora", nome: "Abóbora cabotiá", quantidade: "1 pequena" },
    ],
  },
  {
    id: "frutas",
    nome: "Frutas (baixo índice glicêmico)",
    icone: "🍎",
    cor: "from-rose-50 to-rose-100 border-rose-200",
    itens: [
      { id: "fr-maca", nome: "Maçã", quantidade: "6 unidades" },
      { id: "fr-pera", nome: "Pera", quantidade: "3 unidades" },
      { id: "fr-morango", nome: "Morango", quantidade: "1 caixa (250 g)" },
      { id: "fr-mirtilo", nome: "Mirtilo / blueberry", quantidade: "1 caixa (125 g)" },
      { id: "fr-kiwi", nome: "Kiwi", quantidade: "4 unidades" },
      { id: "fr-mexerica", nome: "Mexerica/tangerina", quantidade: "1 kg" },
      { id: "fr-mamao", nome: "Mamão papaya", quantidade: "1 unidade" },
      { id: "fr-banana", nome: "Banana (só pré-treino)", quantidade: "6 unidades" },
      { id: "fr-limao", nome: "Limão (pra salada e água)", quantidade: "6 unidades" },
    ],
  },
  {
    id: "gorduras",
    nome: "Gorduras boas e sementes",
    icone: "🌰",
    cor: "from-amber-50 to-amber-100 border-amber-200",
    itens: [
      { id: "go-azeite", nome: "Azeite extravirgem (acidez ≤ 0,5%)", quantidade: "500 ml" },
      { id: "go-caju", nome: "Castanha-de-caju", quantidade: "100 g" },
      { id: "go-para", nome: "Castanha-do-pará", quantidade: "50 g" },
      { id: "go-amendoas", nome: "Amêndoas (opcional)", quantidade: "100 g" },
      { id: "go-chia", nome: "Chia em grãos", quantidade: "200 g" },
      { id: "go-linhaca", nome: "Linhaça dourada moída", quantidade: "200 g" },
      { id: "go-amendoim", nome: "Pasta de amendoim integral (sem açúcar)", quantidade: "1 pote" },
    ],
  },
  {
    id: "temperos",
    nome: "Temperos e ervas frescas",
    icone: "🌿",
    cor: "from-emerald-50 to-emerald-100 border-emerald-200",
    itens: [
      { id: "te-alho", nome: "Alho", quantidade: "1 cabeça" },
      { id: "te-cebola", nome: "Cebola", quantidade: "3 unidades" },
      { id: "te-hortela", nome: "Hortelã (pro molho de iogurte sugerido pelo médico)", quantidade: "1 maço" },
      { id: "te-manjericao", nome: "Manjericão fresco", quantidade: "1 maço" },
      { id: "te-salsinha", nome: "Salsinha e cebolinha", quantidade: "1 maço" },
      { id: "te-acafrao", nome: "Açafrão da terra (cúrcuma)", quantidade: "50 g" },
      { id: "te-sal", nome: "Sal rosa do Himalaia", quantidade: "1 pote" },
      { id: "te-pimenta", nome: "Pimenta-do-reino moída na hora", quantidade: "1 moedor" },
    ],
  },
  {
    id: "bebidas",
    nome: "Bebidas e outros",
    icone: "☕",
    cor: "from-orange-50 to-orange-100 border-orange-200",
    itens: [
      { id: "be-cafe", nome: "Café em pó (preferência sem açúcar)", quantidade: "500 g" },
      { id: "be-canela", nome: "Canela em pó", quantidade: "1 pote" },
      { id: "be-cha", nome: "Chá camomila/cidreira (saquinhos)", quantidade: "1 caixa" },
      { id: "be-mel", nome: "Mel puro (pré-treino)", quantidade: "250 g" },
    ],
  },
  {
    id: "suplementos",
    nome: "Suplementos (farmácia / loja)",
    icone: "💊",
    cor: "from-rose-50 to-rose-100 border-rose-200",
    itens: [
      { id: "su-whey", nome: "Whey Protein (concentrado ou isolado)", quantidade: "900 g" },
      { id: "su-creatina", nome: "Creatina monohidratada", quantidade: "300 g" },
      { id: "su-omega", nome: "Ômega 3 (mín. 500 mg de EPA+DHA por cápsula)", quantidade: "60 caps" },
      { id: "su-vitafer", nome: "Vitafer", quantidade: "conforme receita" },
    ],
  },
];

export const TOTAL_ITENS = SHOPPING_LIST.reduce((s, c) => s + c.itens.length, 0);
