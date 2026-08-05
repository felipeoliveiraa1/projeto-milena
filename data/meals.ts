/**
 * Cardápio dos 15 dias do protocolo Desinflama-se, adaptado às preferências
 * da Milena (ver data/protocol.ts).
 *
 * Regras que valem para todos os dias:
 * - proteína em todas as refeições;
 * - ordem do prato: folhas → legumes → proteína → carboidrato;
 * - ½ prato de vegetais, ¼ de proteína, ¼ de carboidrato nas refeições principais;
 * - sem açúcar, adoçante, mel, glúten, leite e derivados, fritura ou álcool.
 *
 * As quatro refeições do dia são OPÇÕES, não obrigação: coma com fome e pare na
 * saciedade. Os ids das refeições (cafe/almoco/lanche/jantar) são estáveis entre
 * os dias — é o conteúdo que muda.
 */

export type TipoItem = "proteina" | "carbo" | "vegetal" | "fruta" | "gordura" | "bebida";

export type ItemRefeicao = {
  id: string;
  label: string;
  /** ids do catálogo em data/shopping.ts */
  ingredientes: string[];
  tipo: TipoItem;
};

export type RefeicaoId = "cafe" | "almoco" | "lanche" | "jantar";

export type Refeicao = {
  id: RefeicaoId;
  nome: string;
  hora: string;
  itens: ItemRefeicao[];
  nota?: string;
};

export type DiaCardapio = {
  dia: number;
  refeicoes: Refeicao[];
};

export const REFEICOES_META: Record<RefeicaoId, { nome: string; hora: string }> = {
  cafe: { nome: "Café da manhã", hora: "07:00" },
  almoco: { nome: "Almoço", hora: "12:30" },
  lanche: { nome: "Lanche da tarde", hora: "16:00" },
  jantar: { nome: "Jantar", hora: "19:30" },
};

const item = (
  id: string,
  label: string,
  ingredientes: string[],
  tipo: TipoItem,
): ItemRefeicao => ({ id, label, ingredientes, tipo });

/* -------------------------------------------------------------------------- */
/* Cafés da manhã                                                             */
/* -------------------------------------------------------------------------- */

const CAFES = {
  crepioca: (d: number): Refeicao => ({
    id: "cafe",
    nome: "Café da manhã",
    hora: "07:00",
    itens: [
      item(`d${d}-cafe-crepioca`, "Crepioca: 2 ovos + 1 col. sopa de goma de tapioca", ["pr-ovos", "ca-tapioca"], "proteina"),
      item(`d${d}-cafe-mamao`, "1 fatia de mamão", ["fr-mamao"], "fruta"),
      item(`d${d}-cafe-cafe`, "Café preto sem açúcar", ["be-cafe"], "bebida"),
    ],
    nota: "Sem recheio proteico, a crepioca leva 2 ovos. Com frango dentro, 1 ovo já basta.",
  }),
  panqueca: (d: number): Refeicao => ({
    id: "cafe",
    nome: "Café da manhã",
    hora: "07:00",
    itens: [
      item(`d${d}-cafe-panqueca`, "Panqueca: 1 banana + 2 ovos + 1 col. sopa de farelo de aveia + canela", ["fr-banana", "pr-ovos", "ca-aveia-farelo", "te-canela"], "proteina"),
      item(`d${d}-cafe-cha`, "Chá ou café sem açúcar", ["be-cha-verde", "be-cafe"], "bebida"),
    ],
    nota: "É a receita oficial corrigida: 2 ovos, não 1 — senão falta proteína.",
  }),
  tapiocaBanana: (d: number): Refeicao => ({
    id: "cafe",
    nome: "Café da manhã",
    hora: "07:00",
    itens: [
      item(`d${d}-cafe-tapioca`, "Tapioca pequena com banana e canela", ["ca-tapioca", "fr-banana", "te-canela"], "carbo"),
      item(`d${d}-cafe-ovos`, "2 ovos mexidos no azeite", ["pr-ovos", "go-azeite"], "proteina"),
    ],
    nota: "Tapioca com banana sozinha não fecha: os 2 ovos são o que dá proteína à refeição.",
  }),
  omeleteCouve: (d: number): Refeicao => ({
    id: "cafe",
    nome: "Café da manhã",
    hora: "07:00",
    itens: [
      item(`d${d}-cafe-omelete`, "Omelete de 2 ovos com couve e tomate", ["pr-ovos", "fo-couve", "le-tomate", "go-azeite"], "proteina"),
      item(`d${d}-cafe-fruta`, "1 fatia de mamão ou 1 kiwi", ["fr-mamao", "fr-kiwi"], "fruta"),
    ],
  }),
  bananovo: (d: number): Refeicao => ({
    id: "cafe",
    nome: "Café da manhã",
    hora: "07:00",
    itens: [
      item(`d${d}-cafe-bananovo`, "Bananovo: 1 banana amassada + 2 ovos, na frigideira", ["fr-banana", "pr-ovos"], "proteina"),
      item(`d${d}-cafe-canela`, "Canela por cima", ["te-canela"], "bebida"),
      item(`d${d}-cafe-cafe2`, "Café preto sem açúcar", ["be-cafe"], "bebida"),
    ],
  }),
  ovosBatataDoce: (d: number): Refeicao => ({
    id: "cafe",
    nome: "Café da manhã",
    hora: "07:00",
    itens: [
      item(`d${d}-cafe-ovos-mex`, "2 ovos mexidos com cheiro-verde", ["pr-ovos", "te-cheiro-verde", "go-azeite"], "proteina"),
      item(`d${d}-cafe-batata-doce`, "1 pedaço pequeno de batata-doce cozida", ["ca-batata-doce"], "carbo"),
      item(`d${d}-cafe-cafe3`, "Café preto sem açúcar", ["be-cafe"], "bebida"),
    ],
  }),
  saladaFrutas: (d: number): Refeicao => ({
    id: "cafe",
    nome: "Café da manhã",
    hora: "07:00",
    itens: [
      item(`d${d}-cafe-ovos-coz`, "2 ovos cozidos — comer ANTES da fruta", ["pr-ovos"], "proteina"),
      item(`d${d}-cafe-salada-frutas`, "Salada de 2–3 frutas (mamão, morango e kiwi) com canela", ["fr-mamao", "fr-morango", "fr-kiwi", "te-canela"], "fruta"),
      item(`d${d}-cafe-chia`, "1 col. chá de chia ou linhaça", ["go-chia", "go-linhaca"], "gordura"),
    ],
    nota: "Ovos primeiro, fruta depois. Sem açúcar, mel ou adoçante na salada de frutas.",
  }),
  paozinhoPate: (d: number): Refeicao => ({
    id: "cafe",
    nome: "Café da manhã",
    hora: "07:00",
    itens: [
      item(`d${d}-cafe-paozinho`, "Pãozinho de aveia e cenoura (receita do protocolo)", ["ca-aveia-flocos", "le-cenoura", "pr-ovos"], "carbo"),
      item(`d${d}-cafe-pate`, "Patê de atum/frango", ["pr-atum-lata", "pr-frango-peito", "in-mostarda"], "proteina"),
      item(`d${d}-cafe-tomate`, "Tomate e pepino em rodelas", ["le-tomate", "le-pepino"], "vegetal"),
    ],
    nota: "Atum em óleo, com o óleo escorrido por completo. Nada de atum ao molho de tomate.",
  }),
  cuscuz: (d: number): Refeicao => ({
    id: "cafe",
    nome: "Café da manhã",
    hora: "07:00",
    itens: [
      item(`d${d}-cafe-cuscuz`, "Cuscuz de milho pequeno", ["ca-cuscuz"], "carbo"),
      item(`d${d}-cafe-ovos-cuscuz`, "2 ovos mexidos", ["pr-ovos", "go-azeite"], "proteina"),
      item(`d${d}-cafe-tomate-cuscuz`, "Tomate picado com cheiro-verde", ["le-tomate", "te-cheiro-verde"], "vegetal"),
    ],
  }),
};

/* -------------------------------------------------------------------------- */
/* Almoços — ½ prato vegetal, ¼ proteína, ¼ carboidrato                       */
/* -------------------------------------------------------------------------- */

const salada = (d: number, sufixo: string, label: string, ing: string[]): ItemRefeicao =>
  item(`d${d}-${sufixo}-salada`, label, ing, "vegetal");

const ALMOCOS = {
  frangoArrozCouve: (d: number): Refeicao => ({
    id: "almoco",
    nome: "Almoço",
    hora: "12:30",
    itens: [
      salada(d, "almoco", "Salada de alface, rúcula, tomate e pepino (½ prato)", ["fo-alface", "fo-rucula", "le-tomate", "le-pepino"]),
      item(`d${d}-almoco-couve`, "Couve refogada no alho", ["fo-couve", "te-alho", "go-azeite"], "vegetal"),
      item(`d${d}-almoco-frango`, "Frango grelhado (¼ do prato)", ["pr-frango-peito"], "proteina"),
      item(`d${d}-almoco-arroz`, "Arroz integral (¼ do prato)", ["ca-arroz-integral"], "carbo"),
      item(`d${d}-almoco-azeite`, "Fio de azeite e limão para temperar", ["go-azeite", "fr-limao"], "gordura"),
    ],
  }),
  merluzaArroz: (d: number): Refeicao => ({
    id: "almoco",
    nome: "Almoço",
    hora: "12:30",
    itens: [
      salada(d, "almoco", "Salada de folhas com tomate (½ prato)", ["fo-alface", "fo-agriao", "le-tomate"]),
      item(`d${d}-almoco-abobrinha`, "Abobrinha refogada", ["le-abobrinha", "te-alho", "go-azeite"], "vegetal"),
      item(`d${d}-almoco-merluza`, "Filé de merluza com tomate", ["pr-merluza", "le-tomate", "fr-limao"], "proteina"),
      item(`d${d}-almoco-arroz-farofa`, "Arroz integral + 1 col. sopa de farofa de milho", ["ca-arroz-integral", "ca-farinha-milho"], "carbo"),
    ],
    nota: "Arroz e farofa são dois carboidratos: porção pequena dos dois e aumente o vegetal.",
  }),
  frangoMandioca: (d: number): Refeicao => ({
    id: "almoco",
    nome: "Almoço",
    hora: "12:30",
    itens: [
      salada(d, "almoco", "Salada de folhas, cenoura ralada e pepino (½ prato)", ["fo-alface", "le-cenoura", "le-pepino"]),
      item(`d${d}-almoco-brocolis`, "Brócolis no vapor", ["le-brocolis"], "vegetal"),
      item(`d${d}-almoco-frango-desf`, "Frango desfiado refogado com tomate", ["pr-frango-peito", "le-tomate", "te-cebola", "te-alho"], "proteina"),
      item(`d${d}-almoco-mandioca`, "Mandioca cozida", ["ca-mandioca"], "carbo"),
    ],
  }),
  tilapiaQuinoa: (d: number): Refeicao => ({
    id: "almoco",
    nome: "Almoço",
    hora: "12:30",
    itens: [
      salada(d, "almoco", "Salada de folhas com beterraba ralada (½ prato)", ["fo-alface", "fo-rucula", "le-beterraba"]),
      item(`d${d}-almoco-legumes-ref`, "Cenoura e abobrinha refogadas", ["le-cenoura", "le-abobrinha", "go-azeite"], "vegetal"),
      item(`d${d}-almoco-tilapia`, "Filé de tilápia grelhado com limão", ["pr-tilapia", "fr-limao"], "proteina"),
      item(`d${d}-almoco-quinoa`, "Quinoa cozida", ["ca-quinoa"], "carbo"),
    ],
  }),
  hamburguerBatataDoce: (d: number): Refeicao => ({
    id: "almoco",
    nome: "Almoço",
    hora: "12:30",
    itens: [
      salada(d, "almoco", "Salada de repolho, cenoura e limão (½ prato)", ["fo-repolho", "le-cenoura", "fr-limao"]),
      item(`d${d}-almoco-vagem`, "Vagem no vapor", ["le-vagem"], "vegetal"),
      item(`d${d}-almoco-hamburguer`, "Hambúrguer caseiro de frango", ["pr-frango-moido", "te-cebola", "te-alho", "te-paprica"], "proteina"),
      item(`d${d}-almoco-batata-doce`, "Batata-doce assada", ["ca-batata-doce"], "carbo"),
    ],
  }),
  tofuArroz: (d: number): Refeicao => ({
    id: "almoco",
    nome: "Almoço",
    hora: "12:30",
    itens: [
      salada(d, "almoco", "Salada de folhas com tomate-cereja (½ prato)", ["fo-alface", "fo-rucula", "le-tomate"]),
      item(`d${d}-almoco-couve-flor`, "Couve-flor no vapor", ["le-couve-flor"], "vegetal"),
      item(`d${d}-almoco-tofu`, "Tofu grelhado com cúrcuma e páprica", ["pr-tofu", "te-curcuma", "te-paprica", "go-azeite"], "proteina"),
      item(`d${d}-almoco-arroz-tofu`, "Arroz integral", ["ca-arroz-integral"], "carbo"),
    ],
  }),
  escondidinho: (d: number): Refeicao => ({
    id: "almoco",
    nome: "Almoço",
    hora: "12:30",
    itens: [
      salada(d, "almoco", "Salada de folhas, tomate e pepino (½ prato)", ["fo-alface", "le-tomate", "le-pepino"]),
      item(`d${d}-almoco-escondidinho`, "Escondidinho de mandioca com frango desfiado", ["ca-mandioca", "in-leite-amendoas", "pr-frango-peito", "te-cebola", "te-alho", "le-tomate", "te-curcuma"], "proteina"),
      item(`d${d}-almoco-couve-esc`, "Couve refogada ao lado", ["fo-couve", "go-azeite"], "vegetal"),
    ],
    nota: "Purê de mandioca com um pouco de leite de amêndoas — mandioca, não mandioquinha.",
  }),
  frangoMacarrao: (d: number): Refeicao => ({
    id: "almoco",
    nome: "Almoço",
    hora: "12:30",
    itens: [
      salada(d, "almoco", "Salada de folhas com pepino (½ prato)", ["fo-alface", "fo-agriao", "le-pepino"]),
      item(`d${d}-almoco-abobrinha-mac`, "Abobrinha em tiras refogada", ["le-abobrinha", "go-azeite"], "vegetal"),
      item(`d${d}-almoco-frango-mac`, "Frango em cubos ao molho de tomate caseiro", ["pr-frango-peito", "in-molho-tomate", "te-manjericao"], "proteina"),
      item(`d${d}-almoco-macarrao`, "Macarrão sem glúten", ["ca-macarrao-sg"], "carbo"),
    ],
  }),
  peixeBatata: (d: number): Refeicao => ({
    id: "almoco",
    nome: "Almoço",
    hora: "12:30",
    itens: [
      salada(d, "almoco", "Salada de folhas, tomate e cenoura (½ prato)", ["fo-alface", "le-tomate", "le-cenoura"]),
      item(`d${d}-almoco-vagem-peixe`, "Vagem e brócolis no vapor", ["le-vagem", "le-brocolis"], "vegetal"),
      item(`d${d}-almoco-peixe`, "Filé de peixe grelhado", ["pr-tilapia", "pr-merluza", "fr-limao"], "proteina"),
      item(`d${d}-almoco-batata`, "Batata inglesa cozida", ["ca-batata"], "carbo"),
    ],
  }),
  frangoGraoBico: (d: number): Refeicao => ({
    id: "almoco",
    nome: "Almoço",
    hora: "12:30",
    itens: [
      salada(d, "almoco", "Salada de folhas com pepino e limão (½ prato)", ["fo-alface", "fo-rucula", "le-pepino", "fr-limao"]),
      item(`d${d}-almoco-abobora`, "Abóbora cabotiá assada", ["le-abobora-cabotia"], "vegetal"),
      item(`d${d}-almoco-frango-gb`, "Frango grelhado", ["pr-frango-peito"], "proteina"),
      item(`d${d}-almoco-grao`, "2 col. sopa de grão-de-bico cozido", ["lg-grao-bico"], "carbo"),
      item(`d${d}-almoco-arroz-gb`, "Arroz integral (porção menor, por causa do grão)", ["ca-arroz-integral"], "carbo"),
    ],
    nota: "Grão-de-bico é a sua única leguminosa: porção pequena e só se cair bem.",
  }),
  tilapiaMandioca: (d: number): Refeicao => ({
    id: "almoco",
    nome: "Almoço",
    hora: "12:30",
    itens: [
      salada(d, "almoco", "Salada de folhas com tomate (½ prato)", ["fo-alface", "le-tomate"]),
      item(`d${d}-almoco-couve-til`, "Couve refogada", ["fo-couve", "te-alho", "go-azeite"], "vegetal"),
      item(`d${d}-almoco-tilapia-mand`, "Tilápia grelhada", ["pr-tilapia", "fr-limao"], "proteina"),
      item(`d${d}-almoco-mandioca-til`, "Mandioca cozida", ["ca-mandioca"], "carbo"),
    ],
  }),
  frangoQuinoaBerinjela: (d: number): Refeicao => ({
    id: "almoco",
    nome: "Almoço",
    hora: "12:30",
    itens: [
      salada(d, "almoco", "Salada de folhas com cenoura ralada (½ prato)", ["fo-alface", "le-cenoura"]),
      item(`d${d}-almoco-berinjela`, "Berinjela e abobrinha assadas", ["le-berinjela", "le-abobrinha", "go-azeite"], "vegetal"),
      item(`d${d}-almoco-frango-quinoa`, "Frango grelhado em tiras", ["pr-frango-peito", "te-paprica"], "proteina"),
      item(`d${d}-almoco-quinoa-2`, "Quinoa cozida", ["ca-quinoa"], "carbo"),
    ],
  }),
  peixeArrozCouve: (d: number): Refeicao => ({
    id: "almoco",
    nome: "Almoço",
    hora: "12:30",
    itens: [
      salada(d, "almoco", "Salada completa de folhas, tomate e pepino (½ prato)", ["fo-alface", "fo-rucula", "le-tomate", "le-pepino"]),
      item(`d${d}-almoco-couve-peixe`, "Couve refogada", ["fo-couve", "go-azeite"], "vegetal"),
      item(`d${d}-almoco-peixe-arroz`, "Filé de peixe grelhado", ["pr-merluza", "fr-limao"], "proteina"),
      item(`d${d}-almoco-arroz-peixe`, "Arroz integral", ["ca-arroz-integral"], "carbo"),
    ],
  }),
  hamburguerBrocolis: (d: number): Refeicao => ({
    id: "almoco",
    nome: "Almoço",
    hora: "12:30",
    itens: [
      salada(d, "almoco", "Salada de folhas com beterraba (½ prato)", ["fo-alface", "le-beterraba"]),
      item(`d${d}-almoco-brocolis-ham`, "Brócolis no vapor", ["le-brocolis"], "vegetal"),
      item(`d${d}-almoco-hamburguer-2`, "Hambúrguer caseiro de frango", ["pr-frango-moido", "te-cebola", "te-alho"], "proteina"),
      item(`d${d}-almoco-batata-doce-2`, "Batata-doce assada", ["ca-batata-doce"], "carbo"),
    ],
  }),
  frangoMandiocaFinal: (d: number): Refeicao => ({
    id: "almoco",
    nome: "Almoço",
    hora: "12:30",
    itens: [
      salada(d, "almoco", "Salada completa: folhas, tomate, pepino e cenoura (½ prato)", ["fo-alface", "fo-rucula", "le-tomate", "le-pepino", "le-cenoura"]),
      item(`d${d}-almoco-abobora-final`, "Abóbora refogada", ["le-abobora-cabotia", "go-azeite"], "vegetal"),
      item(`d${d}-almoco-frango-final`, "Frango grelhado", ["pr-frango-peito"], "proteina"),
      item(`d${d}-almoco-mandioca-final`, "Mandioca cozida", ["ca-mandioca"], "carbo"),
    ],
  }),
};

/* -------------------------------------------------------------------------- */
/* Lanches                                                                    */
/* -------------------------------------------------------------------------- */

const LANCHES = {
  patePalitos: (d: number): Refeicao => ({
    id: "lanche",
    nome: "Lanche da tarde",
    hora: "16:00",
    itens: [
      item(`d${d}-lanche-pate`, "Patê de atum/frango", ["pr-atum-lata", "pr-frango-peito", "in-mostarda"], "proteina"),
      item(`d${d}-lanche-palitos`, "Palitos de cenoura e pepino", ["le-cenoura", "le-pepino"], "vegetal"),
    ],
    nota: "Faça patê para no máximo 2 dias e guarde na geladeira. Patê pronto não vai ao congelador.",
  }),
  frutaOvos: (d: number): Refeicao => ({
    id: "lanche",
    nome: "Lanche da tarde",
    hora: "16:00",
    itens: [
      item(`d${d}-lanche-ovos`, "2 ovos cozidos", ["pr-ovos"], "proteina"),
      item(`d${d}-lanche-fruta`, "1 fruta (maçã, pera ou melão)", ["fr-maca", "fr-pera", "fr-melao"], "fruta"),
    ],
  }),
  homus: (d: number): Refeicao => ({
    id: "lanche",
    nome: "Lanche da tarde",
    hora: "16:00",
    itens: [
      item(`d${d}-lanche-homus`, "Homus de grão-de-bico com limão e tahine", ["lg-grao-bico", "fr-limao", "in-tahine", "go-azeite"], "proteina"),
      item(`d${d}-lanche-palitos-homus`, "Palitos de cenoura, pepino e tomate", ["le-cenoura", "le-pepino", "le-tomate"], "vegetal"),
    ],
  }),
  crepiocaPate: (d: number): Refeicao => ({
    id: "lanche",
    nome: "Lanche da tarde",
    hora: "16:00",
    itens: [
      item(`d${d}-lanche-crepioca`, "Crepioca (1 ovo + 1 col. sopa de tapioca)", ["pr-ovos", "ca-tapioca"], "carbo"),
      item(`d${d}-lanche-pate-crep`, "Recheio: patê de atum/frango", ["pr-atum-lata", "pr-frango-peito"], "proteina"),
      item(`d${d}-lanche-alface`, "Alface e tomate dentro", ["fo-alface", "le-tomate"], "vegetal"),
    ],
    nota: "Recheada com frango, 1 ovo na massa já resolve a proteína.",
  }),
  tapiocaPate: (d: number): Refeicao => ({
    id: "lanche",
    nome: "Lanche da tarde",
    hora: "16:00",
    itens: [
      item(`d${d}-lanche-tapioca`, "Tapioca pequena", ["ca-tapioca"], "carbo"),
      item(`d${d}-lanche-pate-tap`, "Patê de atum/frango", ["pr-atum-lata", "pr-frango-peito"], "proteina"),
      item(`d${d}-lanche-folhas-tap`, "Alface, rúcula e pepino", ["fo-alface", "fo-rucula", "le-pepino"], "vegetal"),
    ],
  }),
  saladaFrutasChia: (d: number): Refeicao => ({
    id: "lanche",
    nome: "Lanche da tarde",
    hora: "16:00",
    itens: [
      item(`d${d}-lanche-ovos-sf`, "2 ovos cozidos — antes da fruta", ["pr-ovos"], "proteina"),
      item(`d${d}-lanche-salada-frutas`, "Salada de melão, abacaxi e uva com hortelã", ["fr-melao", "fr-abacaxi", "fr-uva", "te-hortela"], "fruta"),
      item(`d${d}-lanche-chia-sf`, "1 col. chá de chia", ["go-chia"], "gordura"),
    ],
  }),
  tofuCubos: (d: number): Refeicao => ({
    id: "lanche",
    nome: "Lanche da tarde",
    hora: "16:00",
    itens: [
      item(`d${d}-lanche-tofu`, "Tofu grelhado em cubos com ervas", ["pr-tofu", "te-oregano", "go-azeite"], "proteina"),
      item(`d${d}-lanche-tomate-tofu`, "Tomate e pepino", ["le-tomate", "le-pepino"], "vegetal"),
    ],
  }),
  paozinhoPateLanche: (d: number): Refeicao => ({
    id: "lanche",
    nome: "Lanche da tarde",
    hora: "16:00",
    itens: [
      item(`d${d}-lanche-paozinho`, "Pãozinho de aveia e cenoura", ["ca-aveia-flocos", "le-cenoura", "pr-ovos"], "carbo"),
      item(`d${d}-lanche-pate-pao`, "Patê de atum/frango", ["pr-atum-lata", "pr-frango-peito"], "proteina"),
      item(`d${d}-lanche-pepino-pao`, "Pepino em rodelas", ["le-pepino"], "vegetal"),
    ],
  }),
};

/* -------------------------------------------------------------------------- */
/* Jantares — mais leves                                                      */
/* -------------------------------------------------------------------------- */

const JANTARES = {
  sopaFrango: (d: number): Refeicao => ({
    id: "jantar",
    nome: "Jantar",
    hora: "19:30",
    itens: [
      item(`d${d}-jantar-sopa`, "Sopa de legumes com frango desfiado", ["pr-frango-peito", "le-abobrinha", "le-cenoura", "le-abobora-cabotia", "te-cebola", "te-alho"], "proteina"),
      item(`d${d}-jantar-salada-sopa`, "Salada de folhas antes da sopa", ["fo-alface", "fo-rucula"], "vegetal"),
    ],
    nota: "Bata só uma parte da sopa: parte lisa, parte com pedaços.",
  }),
  omeleteLegumes: (d: number): Refeicao => ({
    id: "jantar",
    nome: "Jantar",
    hora: "19:30",
    itens: [
      item(`d${d}-jantar-salada-om`, "Salada de folhas com tomate", ["fo-alface", "fo-agriao", "le-tomate"], "vegetal"),
      item(`d${d}-jantar-omelete`, "Omelete de 2 ovos com abobrinha e cheiro-verde", ["pr-ovos", "le-abobrinha", "te-cheiro-verde", "go-azeite"], "proteina"),
    ],
  }),
  peixeLegumes: (d: number): Refeicao => ({
    id: "jantar",
    nome: "Jantar",
    hora: "19:30",
    itens: [
      item(`d${d}-jantar-salada-peixe`, "Salada de folhas com pepino", ["fo-alface", "le-pepino"], "vegetal"),
      item(`d${d}-jantar-legumes-vapor`, "Brócolis e cenoura no vapor", ["le-brocolis", "le-cenoura"], "vegetal"),
      item(`d${d}-jantar-peixe`, "Filé de peixe grelhado com limão", ["pr-merluza", "pr-tilapia", "fr-limao"], "proteina"),
    ],
  }),
  tofuQuinoa: (d: number): Refeicao => ({
    id: "jantar",
    nome: "Jantar",
    hora: "19:30",
    itens: [
      item(`d${d}-jantar-salada-tofu`, "Salada de folhas", ["fo-alface", "fo-rucula"], "vegetal"),
      item(`d${d}-jantar-tofu`, "Tofu refogado com legumes", ["pr-tofu", "le-abobrinha", "le-pimentao", "te-alho", "go-azeite"], "proteina"),
      item(`d${d}-jantar-quinoa`, "2 col. sopa de quinoa", ["ca-quinoa"], "carbo"),
    ],
  }),
  frangoAbobora: (d: number): Refeicao => ({
    id: "jantar",
    nome: "Jantar",
    hora: "19:30",
    itens: [
      item(`d${d}-jantar-salada-fa`, "Salada de folhas com tomate", ["fo-alface", "le-tomate"], "vegetal"),
      item(`d${d}-jantar-frango-abobora`, "Frango desfiado com abóbora cabotiá", ["pr-frango-peito", "le-abobora-cabotia", "te-curcuma"], "proteina"),
    ],
  }),
  caldoOvos: (d: number): Refeicao => ({
    id: "jantar",
    nome: "Jantar",
    hora: "19:30",
    itens: [
      item(`d${d}-jantar-caldo`, "Caldo de legumes batido (abóbora, cenoura e chuchu)", ["le-abobora-cabotia", "le-cenoura", "le-chuchu", "te-cebola"], "vegetal"),
      item(`d${d}-jantar-ovos-caldo`, "2 ovos cozidos", ["pr-ovos"], "proteina"),
    ],
  }),
  peixePureMandioca: (d: number): Refeicao => ({
    id: "jantar",
    nome: "Jantar",
    hora: "19:30",
    itens: [
      item(`d${d}-jantar-salada-pm`, "Salada de folhas com pepino e limão", ["fo-alface", "le-pepino", "fr-limao"], "vegetal"),
      item(`d${d}-jantar-peixe-pm`, "Filé de peixe grelhado", ["pr-tilapia", "fr-limao"], "proteina"),
      item(`d${d}-jantar-pure`, "Purê de mandioca com leite de amêndoas (porção pequena)", ["ca-mandioca", "in-leite-amendoas"], "carbo"),
    ],
  }),
  sopaAbobora: (d: number): Refeicao => ({
    id: "jantar",
    nome: "Jantar",
    hora: "19:30",
    itens: [
      item(`d${d}-jantar-sopa-abobora`, "Sopa de abóbora com frango desfiado", ["le-abobora-cabotia", "pr-frango-peito", "te-cebola", "te-curcuma"], "proteina"),
      item(`d${d}-jantar-couve-sopa`, "Couve refogada por cima", ["fo-couve", "go-azeite"], "vegetal"),
    ],
  }),
  omeleteCouveJantar: (d: number): Refeicao => ({
    id: "jantar",
    nome: "Jantar",
    hora: "19:30",
    itens: [
      item(`d${d}-jantar-salada-oc`, "Salada de folhas com tomate e pepino", ["fo-alface", "le-tomate", "le-pepino"], "vegetal"),
      item(`d${d}-jantar-omelete-couve`, "Omelete de 2 ovos com couve", ["pr-ovos", "fo-couve", "go-azeite"], "proteina"),
    ],
  }),
  tofuLegumesFinal: (d: number): Refeicao => ({
    id: "jantar",
    nome: "Jantar",
    hora: "19:30",
    itens: [
      item(`d${d}-jantar-salada-tf`, "Salada de folhas", ["fo-alface", "fo-rucula"], "vegetal"),
      item(`d${d}-jantar-tofu-final`, "Tofu refogado com brócolis e cenoura", ["pr-tofu", "le-brocolis", "le-cenoura", "go-azeite"], "proteina"),
      item(`d${d}-jantar-quinoa-final`, "2 col. sopa de quinoa", ["ca-quinoa"], "carbo"),
    ],
  }),
};

/* -------------------------------------------------------------------------- */
/* Os 15 dias                                                                 */
/* -------------------------------------------------------------------------- */

const MONTAGEM: Array<[keyof typeof CAFES, keyof typeof ALMOCOS, keyof typeof LANCHES, keyof typeof JANTARES]> = [
  ["crepioca", "frangoArrozCouve", "patePalitos", "sopaFrango"],
  ["panqueca", "merluzaArroz", "frutaOvos", "omeleteLegumes"],
  ["tapiocaBanana", "frangoMandioca", "homus", "peixeLegumes"],
  ["omeleteCouve", "tilapiaQuinoa", "crepiocaPate", "tofuQuinoa"],
  ["ovosBatataDoce", "hamburguerBatataDoce", "saladaFrutasChia", "frangoAbobora"],
  ["saladaFrutas", "tofuArroz", "tapiocaPate", "peixePureMandioca"],
  ["paozinhoPate", "escondidinho", "frutaOvos", "omeleteCouveJantar"],
  ["crepioca", "frangoMacarrao", "homus", "sopaAbobora"],
  ["cuscuz", "peixeBatata", "patePalitos", "tofuQuinoa"],
  ["bananovo", "frangoGraoBico", "saladaFrutasChia", "peixeLegumes"],
  ["panqueca", "tilapiaMandioca", "crepiocaPate", "caldoOvos"],
  ["omeleteCouve", "frangoQuinoaBerinjela", "frutaOvos", "peixePureMandioca"],
  ["tapiocaBanana", "hamburguerBrocolis", "homus", "sopaFrango"],
  ["ovosBatataDoce", "peixeArrozCouve", "paozinhoPateLanche", "omeleteLegumes"],
  ["saladaFrutas", "frangoMandiocaFinal", "tofuCubos", "tofuLegumesFinal"],
];

export const CARDAPIO: DiaCardapio[] = MONTAGEM.map(([c, a, l, j], i) => {
  const dia = i + 1;
  return {
    dia,
    refeicoes: [CAFES[c](dia), ALMOCOS[a](dia), LANCHES[l](dia), JANTARES[j](dia)],
  };
});

export function cardapioDoDia(dia: number): DiaCardapio {
  const total = CARDAPIO.length;
  // Depois do dia 15 o cardápio recomeça, para o app continuar útil num novo ciclo.
  const idx = ((dia - 1) % total + total) % total;
  return CARDAPIO[idx];
}

export const TOTAL_ITENS_CARDAPIO = CARDAPIO.reduce(
  (s, d) => s + d.refeicoes.reduce((t, r) => t + r.itens.length, 0),
  0,
);

/* -------------------------------------------------------------------------- */
/* Orientações do médico que seguem valendo dentro do protocolo               */
/* -------------------------------------------------------------------------- */

export const ORIENTACOES_MEDICO = {
  medico: "Dr. Henry Adur Gebenlian — CRM/SP 70202",
  especialidade: "Endocrinologia e Metabologia (SBEM)",
  pontos: [
    "Disciplina em 90% das situações — 100% poucos alcançam. É estilo de vida, não dieta passageira.",
    "Priorizar alimentos in natura: folhas verdes, legumes, frutas, peixe e frango.",
    "Compra na feira ou sacolão em vez de supermercado e delivery.",
    "Salada como entrada em todas as refeições principais — combina com a ordem do protocolo.",
    "Diminuir a quantidade de carboidrato, e quase nunca à noite.",
    "Pouca comida no prato.",
    "Cortar as duas farinhas brancas: açúcar refinado e farinha de trigo.",
    "Atividade física: começar com 3h por semana e chegar a 5–6h.",
    "Por menor que seja a perda, ela melhora saúde e autoestima.",
  ],
  emConflito:
    "O médico sugeria lanchinho a cada 2–3h se batesse fome (fruta, iogurte diet, torrada, barra de cereal). O protocolo pede o contrário: não beliscar, comer nas refeições e parar na saciedade. Durante os 15 dias vale o protocolo — e os lanches dele que tinham leite, glúten ou açúcar saíram de qualquer forma.",
};
