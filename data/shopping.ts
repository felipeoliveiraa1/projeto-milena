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
      { id: "pr-frango-peito", nome: "Peito de frango", quantidade: "1 a 1,5 kg" },
      { id: "pr-frango-coxa", nome: "Coxa de frango sem pele", quantidade: "500 g" },
      { id: "pr-frango-sobrecoxa", nome: "Sobrecoxa de frango sem pele", quantidade: "500 g" },
      { id: "pr-frango-mignon", nome: "Filé mignon de frango", quantidade: "500 g" },
      { id: "pr-tilapia", nome: "Filé de tilápia", quantidade: "500 g" },
      { id: "pr-salmao", nome: "Salmão fresco em postas (2x/sem)", quantidade: "300 g" },
      { id: "pr-saint-peter", nome: "Saint Peter", quantidade: "500 g" },
      { id: "pr-merluza", nome: "Filé de merluza", quantidade: "500 g" },
      { id: "pr-sardinha", nome: "Sardinha fresca (opcional)", quantidade: "500 g" },
      { id: "pr-atum", nome: "Atum fresco em postas (raro)", quantidade: "300 g" },
      { id: "pr-camarao", nome: "Camarão limpo (1x/sem, opcional)", quantidade: "300 g" },
      { id: "pr-lombo", nome: "Lombo de porco magro (recomendado pelo médico)", quantidade: "500 g" },
      { id: "pr-lombinho", nome: "Lombinho de porco em medalhões", quantidade: "500 g" },
      { id: "pr-patinho", nome: "Patinho moído (carne magra)", quantidade: "500 g" },
      { id: "pr-coxao", nome: "Coxão mole moído", quantidade: "500 g" },
      { id: "pr-peru-fresco", nome: "Peito de peru fresco", quantidade: "500 g" },
      { id: "pr-peru-fatiado", nome: "Peito de peru fatiado SEM nitrito", quantidade: "200 g" },
      { id: "pr-ovos", nome: "Ovos caipiras", quantidade: "2 dúzias" },
      { id: "pr-claras", nome: "Claras pasteurizadas (opcional)", quantidade: "500 ml" },
    ],
  },
  {
    id: "laticinios",
    nome: "Laticínios",
    icone: "🥛",
    cor: "from-sky-50 to-sky-100 border-sky-200",
    itens: [
      { id: "la-iog-natural", nome: "Iogurte natural desnatado", quantidade: "8 unidades" },
      { id: "la-iog-grego", nome: "Iogurte grego natural (zero açúcar)", quantidade: "1 pote grande" },
      { id: "la-iog-diet", nome: "Iogurte diet (médico aprovou pra lanche)", quantidade: "4 unidades" },
      { id: "la-coalhada", nome: "Coalhada seca natural", quantidade: "1 pote" },
      { id: "la-cottage", nome: "Queijo cottage", quantidade: "200 g" },
      { id: "la-ricota", nome: "Ricota fresca", quantidade: "200 g" },
      { id: "la-minas", nome: "Queijo minas frescal magro/light", quantidade: "200 g" },
      { id: "la-mussarela-bufala", nome: "Mussarela de búfala light (opcional)", quantidade: "200 g" },
      { id: "la-leite-desnatado", nome: "Leite desnatado", quantidade: "2 L" },
      { id: "la-leite-amendoas", nome: "Leite de amêndoas sem açúcar", quantidade: "1 L" },
      { id: "la-ghee", nome: "Manteiga ghee (opcional)", quantidade: "1 pote pequeno" },
    ],
  },
  {
    id: "carbos",
    nome: "Carboidratos integrais",
    icone: "🍠",
    cor: "from-amber-50 to-amber-100 border-amber-200",
    itens: [
      { id: "ca-arroz-integral", nome: "Arroz integral", quantidade: "1 kg" },
      { id: "ca-arroz-parboilizado", nome: "Arroz parboilizado", quantidade: "1 kg" },
      { id: "ca-arroz-cateto", nome: "Arroz cateto (opcional)", quantidade: "500 g" },
      { id: "ca-batata-doce", nome: "Batata-doce comum", quantidade: "1,5 kg" },
      { id: "ca-batata-roxa", nome: "Batata-doce roxa (opcional)", quantidade: "500 g" },
      { id: "ca-baroa", nome: "Batata baroa / mandioquinha", quantidade: "500 g" },
      { id: "ca-inhame", nome: "Inhame", quantidade: "500 g" },
      { id: "ca-cara", nome: "Cará (opcional)", quantidade: "500 g" },
      { id: "ca-macarrao-integral", nome: "Macarrão integral (raro)", quantidade: "500 g" },
      { id: "ca-pao-integral", nome: "Pão integral 100% (rótulo curto)", quantidade: "1 forma" },
      { id: "ca-tapioca", nome: "Goma de tapioca", quantidade: "500 g" },
      { id: "ca-aveia-fina", nome: "Aveia em flocos finos", quantidade: "500 g" },
      { id: "ca-aveia-grossa", nome: "Aveia em flocos grossos", quantidade: "500 g" },
      { id: "ca-quinoa", nome: "Quinoa em grãos", quantidade: "250 g" },
      { id: "ca-granola", nome: "Granola SEM açúcar", quantidade: "500 g" },
      { id: "ca-couve-flor", nome: "Couve-flor (pra 'arroz' de couve-flor)", quantidade: "1 cabeça" },
      { id: "ca-cogumelos", nome: "Cogumelos paris/shitake", quantidade: "200 g" },
    ],
  },
  {
    id: "folhas",
    nome: "Folhas verdes — salada ENTRADA obrigatória",
    icone: "🥗",
    cor: "from-emerald-50 to-emerald-100 border-emerald-200",
    itens: [
      { id: "fo-alface-crespa", nome: "Alface crespa", quantidade: "2 pés" },
      { id: "fo-alface-americana", nome: "Alface americana", quantidade: "1 pé" },
      { id: "fo-rucula", nome: "Rúcula", quantidade: "2 maços" },
      { id: "fo-agriao", nome: "Agrião", quantidade: "1 maço" },
      { id: "fo-espinafre", nome: "Espinafre", quantidade: "1 maço" },
      { id: "fo-acelga", nome: "Acelga", quantidade: "1 unidade" },
      { id: "fo-couve", nome: "Couve manteiga", quantidade: "1 maço" },
      { id: "fo-almeirao", nome: "Almeirão", quantidade: "1 maço" },
      { id: "fo-endivia", nome: "Endívia (opcional)", quantidade: "1 unidade" },
      { id: "fo-repolho", nome: "Repolho roxo ou branco", quantidade: "1/2 cabeça" },
      { id: "fo-radicchio", nome: "Radicchio (opcional)", quantidade: "1 pé" },
    ],
  },
  {
    id: "legumes",
    nome: "Legumes",
    icone: "🥦",
    cor: "from-emerald-50 to-emerald-100 border-emerald-200",
    itens: [
      { id: "le-abobrinha", nome: "Abobrinha verde", quantidade: "4 unidades" },
      { id: "le-abobrinha-italiana", nome: "Abobrinha italiana", quantidade: "2 unidades" },
      { id: "le-brocolis", nome: "Brócolis comum", quantidade: "1 maço" },
      { id: "le-brocolis-ninja", nome: "Brócolis ninja", quantidade: "1 maço" },
      { id: "le-couve-flor", nome: "Couve-flor", quantidade: "1 cabeça" },
      { id: "le-cenoura", nome: "Cenoura", quantidade: "6 unidades" },
      { id: "le-beterraba", nome: "Beterraba", quantidade: "3 unidades" },
      { id: "le-berinjela", nome: "Berinjela", quantidade: "2 unidades" },
      { id: "le-abobora-cabotia", nome: "Abóbora cabotiá", quantidade: "1 pequena" },
      { id: "le-abobora-moranga", nome: "Abóbora moranga (raro)", quantidade: "1 pedaço" },
      { id: "le-chuchu", nome: "Chuchu", quantidade: "3 unidades" },
      { id: "le-pepino", nome: "Pepino japonês ou comum", quantidade: "4 unidades" },
      { id: "le-tomate", nome: "Tomate italiano", quantidade: "6 unidades" },
      { id: "le-tomate-cereja", nome: "Tomate cereja", quantidade: "1 bandeja" },
      { id: "le-pimentao", nome: "Pimentão (verde, vermelho e amarelo)", quantidade: "3 unidades" },
      { id: "le-vagem", nome: "Vagem", quantidade: "300 g" },
      { id: "le-quiabo", nome: "Quiabo (opcional)", quantidade: "300 g" },
      { id: "le-aspargos", nome: "Aspargos (raro)", quantidade: "1 maço" },
    ],
  },
  {
    id: "frutas",
    nome: "Frutas (baixo índice glicêmico)",
    icone: "🍎",
    cor: "from-rose-50 to-rose-100 border-rose-200",
    itens: [
      { id: "fr-maca-gala", nome: "Maçã gala", quantidade: "6 unidades" },
      { id: "fr-maca-fuji", nome: "Maçã fuji", quantidade: "4 unidades" },
      { id: "fr-pera", nome: "Pera", quantidade: "4 unidades" },
      { id: "fr-morango", nome: "Morango", quantidade: "2 caixas" },
      { id: "fr-mirtilo", nome: "Mirtilo / blueberry", quantidade: "1 caixa" },
      { id: "fr-framboesa", nome: "Framboesa (quando tiver)", quantidade: "1 caixa" },
      { id: "fr-amora", nome: "Amora (opcional)", quantidade: "1 caixa" },
      { id: "fr-kiwi", nome: "Kiwi", quantidade: "5 unidades" },
      { id: "fr-mexerica", nome: "Mexerica / tangerina", quantidade: "1 kg" },
      { id: "fr-mamao", nome: "Mamão papaya", quantidade: "2 unidades" },
      { id: "fr-mamao-formosa", nome: "Mamão formosa pequeno (opcional)", quantidade: "1 unidade" },
      { id: "fr-banana", nome: "Banana prata (só pré-treino)", quantidade: "1 dúzia" },
      { id: "fr-goiaba", nome: "Goiaba vermelha (opcional)", quantidade: "3 unidades" },
      { id: "fr-pessego", nome: "Pêssego (opcional)", quantidade: "4 unidades" },
      { id: "fr-ameixa", nome: "Ameixa preta fresca (opcional)", quantidade: "300 g" },
      { id: "fr-limao-tahiti", nome: "Limão tahiti (pra salada e água)", quantidade: "6 unidades" },
      { id: "fr-limao-siciliano", nome: "Limão siciliano (opcional)", quantidade: "3 unidades" },
      { id: "fr-coco", nome: "Coco fresco em pedaços (opcional)", quantidade: "1 unidade" },
    ],
  },
  {
    id: "gorduras",
    nome: "Gorduras boas, sementes e pastas",
    icone: "🌰",
    cor: "from-amber-50 to-amber-100 border-amber-200",
    itens: [
      { id: "go-azeite", nome: "Azeite extravirgem (acidez ≤ 0,5%)", quantidade: "500 ml" },
      { id: "go-azeite-tempero", nome: "Azeite tempero (opcional)", quantidade: "250 ml" },
      { id: "go-caju", nome: "Castanha-de-caju", quantidade: "200 g" },
      { id: "go-para", nome: "Castanha-do-pará", quantidade: "100 g" },
      { id: "go-amendoas", nome: "Amêndoas", quantidade: "200 g" },
      { id: "go-nozes", nome: "Nozes", quantidade: "200 g" },
      { id: "go-pistache", nome: "Pistache (opcional)", quantidade: "100 g" },
      { id: "go-macadamia", nome: "Macadâmia (opcional)", quantidade: "100 g" },
      { id: "go-chia", nome: "Chia em grãos", quantidade: "200 g" },
      { id: "go-linhaca-d", nome: "Linhaça dourada moída", quantidade: "200 g" },
      { id: "go-linhaca-m", nome: "Linhaça marrom moída (opcional)", quantidade: "200 g" },
      { id: "go-girassol", nome: "Sementes de girassol", quantidade: "100 g" },
      { id: "go-abobora", nome: "Sementes de abóbora", quantidade: "100 g" },
      { id: "go-gergelim", nome: "Gergelim branco/preto", quantidade: "100 g" },
      { id: "go-amendoim-pasta", nome: "Pasta de amendoim integral (sem açúcar)", quantidade: "1 pote" },
      { id: "go-caju-pasta", nome: "Pasta de castanha-de-caju (opcional)", quantidade: "1 pote" },
      { id: "go-amendoa-pasta", nome: "Pasta de amêndoa (opcional)", quantidade: "1 pote" },
      { id: "go-coco-oleo", nome: "Óleo de coco extravirgem (opcional)", quantidade: "200 ml" },
    ],
  },
  {
    id: "temperos",
    nome: "Temperos e ervas frescas",
    icone: "🌿",
    cor: "from-emerald-50 to-emerald-100 border-emerald-200",
    itens: [
      { id: "te-alho", nome: "Alho", quantidade: "2 cabeças" },
      { id: "te-cebola", nome: "Cebola comum", quantidade: "5 unidades" },
      { id: "te-cebola-roxa", nome: "Cebola roxa", quantidade: "2 unidades" },
      { id: "te-gengibre", nome: "Gengibre fresco", quantidade: "1 pedaço" },
      { id: "te-hortela", nome: "Hortelã (pro molho de iogurte do médico)", quantidade: "1 maço" },
      { id: "te-manjericao", nome: "Manjericão fresco", quantidade: "1 maço" },
      { id: "te-salsinha", nome: "Salsinha e cebolinha", quantidade: "1 maço" },
      { id: "te-coentro", nome: "Coentro (opcional)", quantidade: "1 maço" },
      { id: "te-alecrim", nome: "Alecrim fresco", quantidade: "1 maço" },
      { id: "te-tomilho", nome: "Tomilho fresco", quantidade: "1 maço" },
      { id: "te-salvia", nome: "Sálvia (opcional)", quantidade: "1 maço" },
      { id: "te-oregano", nome: "Orégano fresco/seco", quantidade: "1 maço ou 1 pote" },
      { id: "te-louro", nome: "Folhas de louro secas", quantidade: "1 pacote" },
      { id: "te-acafrao", nome: "Açafrão da terra (cúrcuma)", quantidade: "100 g" },
      { id: "te-paprica-doce", nome: "Páprica doce", quantidade: "1 pote" },
      { id: "te-paprica-defumada", nome: "Páprica defumada", quantidade: "1 pote" },
      { id: "te-cominho", nome: "Cominho em pó", quantidade: "1 pote" },
      { id: "te-noz-moscada", nome: "Noz-moscada inteira", quantidade: "1 unidade" },
      { id: "te-pimenta-reino", nome: "Pimenta-do-reino em grãos (moedor)", quantidade: "1 moedor" },
      { id: "te-pimenta-calabresa", nome: "Pimenta calabresa (moderação)", quantidade: "1 pote" },
      { id: "te-sal-rosa", nome: "Sal rosa do Himalaia", quantidade: "1 pote" },
      { id: "te-mostarda-po", nome: "Mostarda em pó (opcional)", quantidade: "1 pote" },
      { id: "te-vinagre-maca", nome: "Vinagre de maçã", quantidade: "500 ml" },
      { id: "te-vinagre-balsamico", nome: "Vinagre balsâmico", quantidade: "250 ml" },
      { id: "te-shoyu", nome: "Shoyu light (raro)", quantidade: "1 vidro pequeno" },
    ],
  },
  {
    id: "lanchinhos",
    nome: "Lanchinhos saudáveis (sugestão do médico)",
    icone: "🥨",
    cor: "from-orange-50 to-orange-100 border-orange-200",
    itens: [
      { id: "la-torrada", nome: "Torradas integrais (rótulo curto, sem açúcar)", quantidade: "1 pacote" },
      { id: "la-barra-cereal", nome: "Barra de cereais integral SEM açúcar", quantidade: "1 caixa" },
      { id: "la-cookie", nome: "Cookies integrais sem açúcar (opcional)", quantidade: "1 pacote" },
      { id: "la-bolacha-agua", nome: "Bolacha de água e sal integral (raro)", quantidade: "1 pacote" },
      { id: "la-frutas-secas", nome: "Frutas secas mix (uvas-passa, damasco — moderação)", quantidade: "200 g" },
      { id: "la-tamaras", nome: "Tâmaras (moderação)", quantidade: "200 g" },
      { id: "la-choco-amargo", nome: "Chocolate amargo 70%+ (1-2 quadrados/dia)", quantidade: "1 tablete" },
      { id: "la-cacau", nome: "Cacau em pó 100%", quantidade: "100 g" },
    ],
  },
  {
    id: "bebidas",
    nome: "Bebidas",
    icone: "☕",
    cor: "from-orange-50 to-orange-100 border-orange-200",
    itens: [
      { id: "be-cafe-po", nome: "Café em pó tradicional", quantidade: "500 g" },
      { id: "be-cafe-graos", nome: "Café em grãos (se tiver moedor)", quantidade: "500 g" },
      { id: "be-cha-verde", nome: "Chá verde (saquinhos ou folhas)", quantidade: "1 caixa" },
      { id: "be-cha-camomila", nome: "Chá camomila ou cidreira", quantidade: "1 caixa" },
      { id: "be-cha-hortela", nome: "Chá de hortelã", quantidade: "1 caixa" },
      { id: "be-cha-mate", nome: "Chá mate (sem açúcar)", quantidade: "1 pacote" },
      { id: "be-canela-po", nome: "Canela em pó", quantidade: "1 pote" },
      { id: "be-canela-pau", nome: "Canela em pau", quantidade: "1 pacote" },
      { id: "be-agua-gas", nome: "Água com gás (variar)", quantidade: "6 garrafas" },
      { id: "be-agua-coco", nome: "Água de coco natural (moderação)", quantidade: "1 L" },
      { id: "be-mel", nome: "Mel puro (pré-treino, com moderação)", quantidade: "250 g" },
    ],
  },
  {
    id: "suplementos",
    nome: "Suplementos (farmácia / loja)",
    icone: "💊",
    cor: "from-rose-50 to-rose-100 border-rose-200",
    itens: [
      { id: "su-whey", nome: "Whey Protein (concentrado ou isolado)", quantidade: "900 g" },
      { id: "su-creatina", nome: "Creatina monohidratada (Creapure se possível)", quantidade: "300 g" },
      { id: "su-omega", nome: "Ômega 3 (mín. 500 mg de EPA+DHA por cápsula)", quantidade: "60 caps" },
      { id: "su-vitafer", nome: "Vitafer", quantidade: "conforme receita" },
      { id: "su-magnesio", nome: "Magnésio dimalato (consultar médico)", quantidade: "60 caps" },
      { id: "su-vitd", nome: "Vitamina D3 (conforme exame)", quantidade: "60 caps" },
      { id: "su-colageno", nome: "Colágeno hidrolisado (opcional)", quantidade: "300 g" },
    ],
  },
];

export const TOTAL_ITENS = SHOPPING_LIST.reduce((s, c) => s + c.itens.length, 0);

export function buildShareText(checked: Record<string, boolean>): string {
  const lines: string[] = ["🛒 *Lista de compras*", ""];
  let total = 0;
  for (const cat of SHOPPING_LIST) {
    const items = cat.itens.filter((i) => checked[i.id]);
    if (items.length === 0) continue;
    lines.push(`${cat.icone} *${cat.nome}*`);
    for (const it of items) {
      lines.push(`• ${it.nome} — ${it.quantidade}`);
      total++;
    }
    lines.push("");
  }
  lines.push(`_Total: ${total} ${total === 1 ? "item" : "itens"}_`);
  return lines.join("\n");
}
