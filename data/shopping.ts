/**
 * Catálogo de compras do protocolo Desinflama-se.
 *
 * Só entra aqui o que é permitido no protocolo e o que a Milena come.
 * Os ids são referenciados pelo cardápio (data/meals.ts) — mexer em um id
 * quebra a lista automática, então mantenha-os estáveis.
 */

export type ShoppingItem = {
  id: string;
  nome: string;
  quantidade: string;
  /** Aviso de rótulo ou de preparo que importa na hora de comprar. */
  nota?: string;
  /** Itens de despensa que entram na lista mesmo sem estar no cardápio do dia. */
  essencial?: boolean;
};

export type ShoppingCategory = {
  id: string;
  nome: string;
  icone: string;
  itens: ShoppingItem[];
};

export const SHOPPING_LIST: ShoppingCategory[] = [
  {
    id: "proteinas",
    nome: "Proteínas",
    icone: "🍗",
    itens: [
      { id: "pr-frango-peito", nome: "Peito de frango", quantidade: "1,5 kg" },
      { id: "pr-frango-moido", nome: "Frango moído (para hambúrguer caseiro)", quantidade: "500 g" },
      { id: "pr-tilapia", nome: "Filé de tilápia", quantidade: "600 g" },
      { id: "pr-merluza", nome: "Filé de merluza", quantidade: "600 g" },
      { id: "pr-ovos", nome: "Ovos caipiras", quantidade: "3 dúzias" },
      { id: "pr-tofu", nome: "Tofu firme", quantidade: "400 g" },
      {
        id: "pr-atum-lata",
        nome: "Atum em lata (em óleo)",
        quantidade: "3 latas",
        nota: "Escorra o óleo por completo. Não compre atum ao molho de tomate.",
      },
    ],
  },
  {
    id: "carbos",
    nome: "Carboidratos",
    icone: "🍠",
    itens: [
      { id: "ca-arroz-integral", nome: "Arroz integral", quantidade: "1 kg" },
      { id: "ca-batata-doce", nome: "Batata-doce", quantidade: "1,5 kg" },
      { id: "ca-batata", nome: "Batata inglesa", quantidade: "1 kg" },
      { id: "ca-mandioca", nome: "Mandioca (aipim)", quantidade: "1 kg", nota: "Mandioca mesmo — mandioquinha não entra." },
      { id: "ca-quinoa", nome: "Quinoa em grãos", quantidade: "250 g" },
      { id: "ca-tapioca", nome: "Goma de tapioca", quantidade: "500 g" },
      { id: "ca-cuscuz", nome: "Flocão de milho para cuscuz", quantidade: "500 g" },
      { id: "ca-macarrao-sg", nome: "Macarrão sem glúten (arroz ou milho)", quantidade: "500 g" },
      {
        id: "ca-aveia-farelo",
        nome: "Farelo de aveia",
        quantidade: "250 g",
        nota: "Procure o selo sem glúten — aveia comum costuma vir contaminada com trigo.",
      },
      {
        id: "ca-aveia-flocos",
        nome: "Aveia em flocos (para o pãozinho)",
        quantidade: "250 g",
        nota: "Também com selo sem glúten.",
      },
      { id: "ca-farinha-milho", nome: "Farinha de milho para farofa", quantidade: "500 g" },
    ],
  },
  {
    id: "leguminosa",
    nome: "Leguminosa",
    icone: "🫘",
    itens: [
      {
        id: "lg-grao-bico",
        nome: "Grão-de-bico seco",
        quantidade: "500 g",
        nota: "Sua única leguminosa. Deixe de molho na véspera, cozinhe e congele em porções pequenas.",
      },
    ],
  },
  {
    id: "folhas",
    nome: "Folhas",
    icone: "🥬",
    itens: [
      { id: "fo-alface", nome: "Alface (crespa ou americana)", quantidade: "2 pés" },
      { id: "fo-rucula", nome: "Rúcula", quantidade: "2 maços" },
      { id: "fo-agriao", nome: "Agrião", quantidade: "1 maço" },
      { id: "fo-couve", nome: "Couve-manteiga", quantidade: "2 maços", nota: "O protocolo pede couve com frequência — compre com folga." },
      { id: "fo-repolho", nome: "Repolho", quantidade: "1 cabeça" },
    ],
  },
  {
    id: "legumes",
    nome: "Legumes",
    icone: "🥦",
    itens: [
      { id: "le-abobrinha", nome: "Abobrinha italiana", quantidade: "4 unidades" },
      { id: "le-brocolis", nome: "Brócolis", quantidade: "2 maços" },
      { id: "le-couve-flor", nome: "Couve-flor", quantidade: "1 cabeça" },
      { id: "le-cenoura", nome: "Cenoura", quantidade: "8 unidades" },
      { id: "le-beterraba", nome: "Beterraba", quantidade: "3 unidades" },
      { id: "le-berinjela", nome: "Berinjela", quantidade: "2 unidades" },
      { id: "le-abobora-cabotia", nome: "Abóbora cabotiá", quantidade: "1 unidade" },
      { id: "le-chuchu", nome: "Chuchu", quantidade: "3 unidades" },
      { id: "le-vagem", nome: "Vagem", quantidade: "300 g" },
      { id: "le-tomate", nome: "Tomate", quantidade: "8 unidades" },
      { id: "le-pepino", nome: "Pepino", quantidade: "6 unidades" },
      { id: "le-pimentao", nome: "Pimentão", quantidade: "2 unidades" },
    ],
  },
  {
    id: "frutas",
    nome: "Frutas",
    icone: "🍎",
    itens: [
      { id: "fr-banana", nome: "Banana", quantidade: "1 dúzia" },
      { id: "fr-mamao", nome: "Mamão papaya", quantidade: "2 unidades" },
      { id: "fr-morango", nome: "Morango", quantidade: "2 caixas" },
      { id: "fr-kiwi", nome: "Kiwi", quantidade: "5 unidades" },
      { id: "fr-maca", nome: "Maçã", quantidade: "6 unidades" },
      { id: "fr-pera", nome: "Pera", quantidade: "4 unidades" },
      { id: "fr-melao", nome: "Melão", quantidade: "1 unidade" },
      { id: "fr-abacaxi", nome: "Abacaxi", quantidade: "1 unidade" },
      { id: "fr-uva", nome: "Uva", quantidade: "500 g" },
      { id: "fr-limao", nome: "Limão", quantidade: "10 unidades", nota: "Para a água da manhã, a salada e o peixe.", essencial: true },
    ],
  },
  {
    id: "gorduras",
    nome: "Gorduras boas e sementes",
    icone: "🌰",
    itens: [
      { id: "go-azeite", nome: "Azeite extravirgem", quantidade: "500 ml", essencial: true },
      { id: "go-chia", nome: "Chia", quantidade: "200 g", essencial: true },
      { id: "go-linhaca", nome: "Linhaça dourada", quantidade: "200 g", essencial: true },
      { id: "go-nozes", nome: "Nozes", quantidade: "200 g" },
      { id: "go-castanha-para", nome: "Castanha-do-pará", quantidade: "100 g" },
      { id: "go-amendoas", nome: "Amêndoas (para o leite caseiro)", quantidade: "300 g" },
      { id: "go-coco-oleo", nome: "Óleo de coco extravirgem", quantidade: "200 ml" },
    ],
  },
  {
    id: "temperos",
    nome: "Temperos e ervas",
    icone: "🌿",
    itens: [
      { id: "te-alho", nome: "Alho", quantidade: "2 cabeças", essencial: true },
      { id: "te-cebola", nome: "Cebola", quantidade: "6 unidades", essencial: true },
      { id: "te-cheiro-verde", nome: "Cheiro-verde (salsinha e cebolinha)", quantidade: "2 maços" },
      { id: "te-hortela", nome: "Hortelã", quantidade: "1 maço" },
      { id: "te-manjericao", nome: "Manjericão", quantidade: "1 maço" },
      { id: "te-gengibre", nome: "Gengibre fresco", quantidade: "1 pedaço" },
      { id: "te-curcuma", nome: "Cúrcuma (açafrão-da-terra)", quantidade: "1 pote", essencial: true },
      { id: "te-paprica", nome: "Páprica doce", quantidade: "1 pote", essencial: true },
      { id: "te-cominho", nome: "Cominho", quantidade: "1 pote" },
      { id: "te-oregano", nome: "Orégano", quantidade: "1 pote" },
      { id: "te-canela", nome: "Canela em pó", quantidade: "1 pote", essencial: true, nota: "É o que adoça no protocolo — não entra açúcar nem adoçante." },
      { id: "te-pimenta-reino", nome: "Pimenta-do-reino", quantidade: "1 moedor" },
      { id: "te-sal", nome: "Sal", quantidade: "1 pacote", essencial: true },
      { id: "te-vinagre-maca", nome: "Vinagre de maçã", quantidade: "500 ml", essencial: true },
    ],
  },
  {
    id: "despensa",
    nome: "Despensa — industrializados aprovados",
    icone: "🏷️",
    itens: [
      {
        id: "in-leite-amendoas",
        nome: "Leite de amêndoas sem açúcar",
        quantidade: "1 L",
        nota: "Caseiro é melhor. Comprado: rótulo curto, sem açúcar e sem adoçante.",
      },
      {
        id: "in-molho-tomate",
        nome: "Molho de tomate",
        quantidade: "2 vidros",
        nota: "Só tomate, sal e temperos. Sem açúcar, sem realçador de sabor.",
      },
      {
        id: "in-mostarda",
        nome: "Mostarda",
        quantidade: "1 vidro",
        nota: "Lista de ingredientes simples — quanto menos, melhor.",
      },
      { id: "in-tahine", nome: "Tahine (pasta de gergelim)", quantidade: "1 pote", nota: "Para o homus. Deve ser 100% gergelim." },
    ],
  },
  {
    id: "bebidas",
    nome: "Bebidas e rituais",
    icone: "☕",
    itens: [
      { id: "be-cafe", nome: "Café em pó", quantidade: "500 g", essencial: true },
      { id: "be-cha-verde", nome: "Chá verde", quantidade: "1 caixa" },
      { id: "be-cha-camomila", nome: "Chá de camomila ou cidreira", quantidade: "1 caixa", nota: "Para a rotina da noite." },
      { id: "be-cha-hortela", nome: "Chá de hortelã", quantidade: "1 caixa" },
      {
        id: "be-propolis",
        nome: "Própolis",
        quantidade: "1 frasco",
        nota: "Ritual da manhã, junto com o limão — só se cair bem.",
      },
    ],
  },
  {
    id: "farmacia",
    nome: "Farmácia",
    icone: "💊",
    itens: [
      { id: "su-omega3", nome: "Ômega 3 (mín. 500 mg de EPA+DHA por cápsula)", quantidade: "60 caps" },
      { id: "su-vitafer", nome: "Vitafer", quantidade: "conforme receita", nota: "Prescrição médica — não suspender." },
      { id: "su-vitd", nome: "Vitamina D3", quantidade: "conforme exame" },
    ],
  },
];

export const CATALOGO = new Map(
  SHOPPING_LIST.flatMap((c) =>
    c.itens.map((i) => [i.id, { ...i, categoriaId: c.id, categoria: c.nome, icone: c.icone }] as const),
  ),
);

export const ESSENCIAIS = SHOPPING_LIST.flatMap((c) => c.itens.filter((i) => i.essencial).map((i) => i.id));

export const TOTAL_ITENS = SHOPPING_LIST.reduce((s, c) => s + c.itens.length, 0);
