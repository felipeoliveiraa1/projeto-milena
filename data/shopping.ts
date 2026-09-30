/**
 * Catálogo de compras do cardápio da recomposição corporal.
 *
 * Só entra aqui o que o cardápio da semana usa (data/meals.ts) e o que é de
 * despensa. As quantidades são de uma semana inteira — marcar os sete dias na
 * dieta dá exatamente esta compra.
 *
 * Os ids são referenciados pelo cardápio — mexer em um id quebra a lista
 * automática, então mantenha-os estáveis. Os que já existiam no Desinflama-se
 * (ovos, frango, legumes, frutas, temperos) continuam com o mesmo id.
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
    nome: "Carnes e ovos",
    icone: "🍗",
    itens: [
      {
        id: "pr-frango-peito",
        nome: "Peito de frango",
        quantidade: "800 g",
        nota: "Dá 3 almoços de 120 g e 2 fechamentos de 70 g. Compre com folga: cru, ele encolhe no preparo.",
      },
      {
        id: "pr-patinho",
        nome: "Patinho",
        quantidade: "400 g",
        nota: "Metade em iscas, metade moído. Peça para moer na hora, sem a capa de gordura.",
      },
      {
        id: "pr-peixe",
        nome: "Filé de peixe (tilápia, merluza ou pescada)",
        quantidade: "400 g",
        nota: "Qualquer peixe de que você goste — frutos do mar e sardinha, não.",
      },
      {
        id: "pr-ovos",
        nome: "Ovos",
        quantidade: "2 dúzias",
        nota: "Sobra um pouco de propósito: para as claras a mais nos dias sem fechamento e para um lanche com proteína, se precisar.",
      },
    ],
  },
  {
    id: "laticinios",
    nome: "Laticínios e whey",
    icone: "🧀",
    itens: [
      {
        id: "la-queijo-minas",
        nome: "Queijo minas frescal — o do pote preto",
        quantidade: "300 g",
        nota: "Foi o melhor dos avaliados no resumo: equilíbrio entre proteína, calorias, gordura saturada e sódio.",
      },
      {
        id: "la-ricota",
        nome: "Ricota fresca (ou cottage)",
        quantidade: "250 g",
        nota: "Sólida, para o café de sexta; o resto fecha a janela no sábado.",
      },
      {
        id: "la-iogurte-proteico",
        nome: "Iogurte proteico",
        quantidade: "3 potes",
        // O socorro do jejum é açúcar rápido e sozinho; o iogurte é o lanche
        // que vem depois dele, nunca o socorro em si.
        nota: "Confira no rótulo: 15–17 g de proteína por pote. O terceiro é de reserva — para um lanchinho na janela ou para o lanche depois do socorro do jejum.",
      },
      {
        id: "la-whey",
        nome: "Whey Chef Zero",
        quantidade: "280 g",
        nota: "São 40 g por dia. Olhe quanto ainda tem no pote antes de comprar outro.",
      },
      {
        id: "la-creme-ricota",
        nome: "Creme de ricota light",
        quantidade: "1 pote",
        nota: "Opcional, pelo sabor. Não é fonte principal de proteína.",
      },
    ],
  },
  {
    id: "carbos",
    nome: "Pão e carboidratos",
    icone: "🥖",
    itens: [
      {
        id: "ca-pao",
        nome: "Pão francês (para tirar o miolo)",
        // Um por café: os sete dias levam pão desde que a quinta voltou a ter.
        quantidade: "7 unidades",
        nota: "Congela bem: tire o miolo, congele e esquente na hora.",
      },
      {
        id: "ca-arroz",
        nome: "Arroz",
        quantidade: "1 pacote pequeno",
        nota: "É 'um pouco' em dois almoços — um pacote dura semanas.",
      },
      { id: "ca-batata", nome: "Batata", quantidade: "500 g" },
      { id: "ca-mandioca", nome: "Mandioca (aipim)", quantidade: "300 g" },
      {
        id: "ca-mandioquinha",
        nome: "Mandioquinha (batata-baroa)",
        quantidade: "300 g",
        nota: "Se não gostar, troque por mandioca ou batata.",
      },
      {
        id: "ca-macarrao",
        nome: "Macarrão integral sem glúten",
        quantidade: "1 pacote",
        nota: "Integral e sem glúten, como o resumo pede. Um pacote dura mais de uma semana.",
      },
    ],
  },
  {
    id: "folhas",
    nome: "Folhas",
    icone: "🥬",
    itens: [
      { id: "fo-alface", nome: "Alface", quantidade: "2 pés" },
      { id: "fo-rucula", nome: "Rúcula", quantidade: "1 maço" },
      { id: "fo-couve", nome: "Couve-manteiga", quantidade: "1 maço" },
    ],
  },
  {
    id: "legumes",
    nome: "Legumes",
    icone: "🥦",
    itens: [
      { id: "le-tomate", nome: "Tomate", quantidade: "8 unidades" },
      { id: "le-pepino", nome: "Pepino", quantidade: "3 unidades" },
      { id: "le-cenoura", nome: "Cenoura", quantidade: "4 unidades" },
      { id: "le-brocolis", nome: "Brócolis", quantidade: "1 maço" },
      { id: "le-abobrinha", nome: "Abobrinha", quantidade: "2 unidades" },
      { id: "le-vagem", nome: "Vagem", quantidade: "250 g" },
      { id: "le-chuchu", nome: "Chuchu", quantidade: "2 unidades" },
      { id: "le-abobora-cabotia", nome: "Abóbora cabotiá", quantidade: "1 pedaço" },
    ],
  },
  {
    id: "frutas",
    nome: "Frutas",
    icone: "🍌",
    itens: [
      {
        id: "fr-banana",
        nome: "Banana",
        quantidade: "5 unidades",
        nota: "Madura demais? Congele em rodelas para bater com o whey.",
      },
      { id: "fr-morango", nome: "Morango", quantidade: "2 caixas" },
      { id: "fr-maca", nome: "Maçã pequena", quantidade: "1 unidade" },
      {
        id: "fr-limao",
        nome: "Limão",
        quantidade: "6 unidades",
        nota: "Para a água da manhã, a salada e o peixe.",
        essencial: true,
      },
    ],
  },
  {
    id: "extras",
    nome: "Fibra e azeite",
    icone: "🫒",
    itens: [
      {
        id: "go-chia",
        nome: "Chia (ou linhaça)",
        quantidade: "1 pacote pequeno",
        nota: "Opcional: 1 colher no iogurte ajuda o intestino — com água ao longo do dia.",
      },
      { id: "go-azeite", nome: "Azeite extravirgem", quantidade: "1 garrafa", essencial: true },
    ],
  },
  {
    id: "temperos",
    nome: "Temperos",
    icone: "🌿",
    itens: [
      { id: "te-alho", nome: "Alho", quantidade: "1 cabeça", essencial: true },
      { id: "te-cebola", nome: "Cebola", quantidade: "4 unidades", essencial: true },
      { id: "te-cheiro-verde", nome: "Cheiro-verde (salsinha e cebolinha)", quantidade: "1 maço" },
      { id: "te-sal", nome: "Sal", quantidade: "1 pacote", essencial: true },
    ],
  },
  {
    id: "bebidas",
    nome: "Bebidas e rituais",
    icone: "☕",
    itens: [
      { id: "be-cafe", nome: "Café em pó", quantidade: "500 g", essencial: true },
      {
        id: "be-cha",
        nome: "Chá sem cafeína (camomila ou cidreira)",
        quantidade: "1 caixa",
        // Hortelã piora o refluxo, e azia é efeito comum do Mounjaro.
        nota: "Para o jejum da noite, sem açúcar. Hortelã, só se não tiver azia.",
        essencial: true,
      },
      {
        id: "be-propolis",
        nome: "Própolis",
        quantidade: "1 frasco",
        nota: "Ritual da manhã, junto com o limão — só se cair bem. Compre quando estiver acabando.",
        essencial: true,
      },
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
