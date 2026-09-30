/**
 * Alimentação da recomposição corporal — as regras da comida.
 *
 * Fonte: o "Resumo da Alimentação – Recomposição Corporal" que a Milena mandou
 * em 29/09/2026, e o pedido que veio junto: à noite a medicação tira a fome,
 * então entra um jejum — e, se precisar ajustar algo na alimentação, sugerir.
 *
 * O que é do resumo está aqui como ele escreveu. Onde o app vai além (o jejum
 * e as sugestões de ajuste), está escrito o porquê. O cardápio da semana
 * (data/meals.ts), a lista de compras (data/shopping.ts) e o preparo
 * (data/prep.ts) derivam daqui.
 */

import type { RefeicaoId } from "./meals";

/** A primeira linha do resumo. */
export const FOCO =
  "Reduzir a gordura corporal, preservar e ganhar massa magra e manter boa tolerância ao Mounjaro.";

/* -------------------------------------------------------------------------- */
/* Bioimpedância — só o que a conta da comida usa                             */
/* -------------------------------------------------------------------------- */

// O exame completo aparece na tela de progresso. Aqui entram só os números que
// sustentam a meta de proteína e o "não precisa contar caloria".
const BIOIMPEDANCIA = { pesoKg: 85.5, gorduraPct: 47.4 };

/** Tudo que não é gordura: 85,5 kg × 52,6% ≈ 45 kg. */
export const MASSA_MAGRA_KG = Math.round(
  BIOIMPEDANCIA.pesoKg * (1 - BIOIMPEDANCIA.gorduraPct / 100),
);

/* -------------------------------------------------------------------------- */
/* Metas do dia                                                               */
/* -------------------------------------------------------------------------- */

export type Meta = {
  id: "proteina" | "agua" | "ordem";
  titulo: string;
  valor: string;
  detalhe: string;
};

export const METAS: Meta[] = [
  {
    id: "proteina",
    titulo: "Proteína",
    valor: "90–100 g por dia",
    detalhe: "Somando as quatro refeições. É o que protege o músculo enquanto a gordura vai embora.",
  },
  {
    id: "agua",
    titulo: "Água",
    valor: "200 ml por hora",
    detalhe: "Conforme orientação médica: um copo a cada hora acordada — no jejum também.",
  },
  {
    id: "ordem",
    titulo: "Ordem das refeições",
    valor: "Verdura e proteína primeiro",
    detalhe: "Legumes, verduras e proteína primeiro; o carboidrato vem depois.",
  },
];

/** A ordem do prato, nas palavras do resumo: salada/legumes → proteína → carboidrato. */
export const ORDEM_CONSUMO = [
  {
    passo: 1,
    o: "Verduras e legumes",
    porque: "Fibra e volume primeiro: ajudam a segurar o açúcar no sangue depois da refeição.",
  },
  {
    passo: 2,
    o: "Proteína",
    porque: "Ainda com fome, entra a parte que protege o músculo.",
  },
  {
    passo: 3,
    o: "Carboidrato",
    porque: "Por último e pouco. Se a fome acabar antes, é ele que sobra no prato.",
  },
];

/* -------------------------------------------------------------------------- */
/* Jejum noturno                                                              */
/* -------------------------------------------------------------------------- */

/**
 * O resumo não fala em jejum — é o pedido dela: à noite não dá para comer.
 * Os horários de verdade vêm da janela configurada (lib/jejum.ts); os textos
 * daqui não citam hora para continuarem certos se ela mudar a janela.
 */
export const JEJUM = {
  resumo:
    "A comida do dia cabe numa janela. Depois da última refeição, é jejum até o café da manhã.",
  porQue:
    "À noite a medicação tira a fome, e o jantar completo causa desconforto. Em vez de forçar, a noite vira jejum — e a proteína do dia inteiro cabe dentro da janela.",
  /** Vale para qualquer janela: no card, só o título muda quando o jejum não é de 14 h. */
  porQueNaoEncurtar:
    "Com o Mounjaro a fome já é pouca. Numa janela mais curta, fica difícil fazer caber os 90–100 g de proteína — e aí sai músculo junto com a gordura.",
  metabolismo:
    "Com honestidade: jejum não acelera o metabolismo. O que ele faz é dar tempo para o corpo usar gordura como combustível durante a noite. Quem mantém o metabolismo alto enquanto o peso cai é o músculo — musculação e proteína.",
  pode: [
    { item: "Água", detalhe: "No mesmo ritmo de 200 ml por hora, até dormir." },
    {
      item: "Chá e café sem açúcar",
      // Hortelã piora o refluxo, e azia é efeito comum do Mounjaro.
      detalhe:
        "Café preto. À noite, prefira os chás sem cafeína: camomila ou cidreira. Hortelã, só se não tiver azia.",
    },
    {
      item: "Os comprimidos da noite",
      detalhe:
        "No horário de sempre: a B12 derrete embaixo da língua e o colágeno vai com água. Mudar o horário de qualquer um, só com o médico.",
    },
  ],
  /**
   * Quando o jejum faz mal. Tremor e suor frio podem ser açúcar baixo, e a
   * regra é açúcar rápido e sozinho (ADA e SBD): proteína, gordura e fibra
   * atrasam a subida — e o Mounjaro já deixa o estômago mais lento. É o mesmo
   * socorro de SEGURANCA (data/protocol.ts), em passo a passo: mudou um, mude
   * o outro.
   */
  socorro: {
    quando: "Tremor, suor frio, fraqueza ou tontura podem ser açúcar baixo:",
    passos: [
      "15 g de açúcar rápido e sozinho: 1 colher de sopa de açúcar (uns 3 sachês) num pouco de água, ou 150 ml de suco ou refrigerante comum — zero não serve. Fruta inteira é lenta.",
      "Espere 15 minutos. Não passou? Repita uma vez.",
      "Passou? Aí sim um lanche com proteína — o iogurte proteico ou um ovo.",
    ],
    atendimento:
      "Não melhorou, confusão ou desmaio: procure atendimento. E, em qualquer caso, avise o médico.",
    dicas: [
      "Tem glicosímetro? Abaixo de 70 mg/dL é baixa.",
      "Só tontura, sem tremor nem suor: sente ou deite e beba água. Não passou? Siga os passos acima.",
      "Dor de cabeça forte: meça a pressão, se tiver aparelho, e passe o número ao médico.",
    ],
    // Fica à mão, não na compra da semana: é socorro, não comida do cardápio.
    aMao: "Deixe à mão sachês de açúcar ou uma caixinha de suco comum. É o socorro — não é para o dia a dia.",
  },
  // O mesmo "quando treinar" da tela de treino (app/treino/page.tsx).
  treino:
    "Academia dentro da janela: depois do café ou entre o almoço e o lanche. Em jejum, só caminhada leve.",
};

/* -------------------------------------------------------------------------- */
/* Estrutura base do dia — a tabela do resumo                                 */
/* -------------------------------------------------------------------------- */

export type LinhaEstrutura = {
  id: RefeicaoId;
  nome: string;
  /** O papel da refeição na janela. */
  papel?: string;
  /** Como o resumo chama a refeição, quando o app mudou o nome. */
  noResumo?: string;
  base: string;
  trocas: string[];
  /** Proteína aproximada, como na tabela. */
  proteina: string;
  nota?: string;
};

/**
 * A tabela do resumo, linha por linha. A única troca é a última: a "Noite"
 * virou "Fecha a janela" e veio para antes do jejum, com a mesma lista.
 */
export const ESTRUTURA_DIA: LinhaEstrutura[] = [
  {
    id: "cafe",
    nome: "Café da manhã",
    papel: "Quebra o jejum",
    base: "Pão sem miolo + 1 ovo + 50–60 g de queijo branco/minas + café",
    trocas: [
      "1 ovo + 2 claras",
      "Ricota sólida",
      "Omelete pequena",
      "Queijo minas com mais proteína e menos gordura saturada",
    ],
    proteina: "15–20 g",
    nota: "Entre os queijos avaliados, o minas do pote preto foi o melhor para o dia a dia: equilíbrio entre proteína, calorias, gordura saturada e sódio. O creme de ricota light pode entrar pelo sabor, mas não deve ser contado como fonte principal de proteína.",
  },
  {
    id: "almoco",
    nome: "Almoço",
    base: "120 g de frango/carne + salada/legumes + pouco arroz",
    trocas: [
      "Arroz por batata, mandioquinha, mandioca ou macarrão integral sem glúten",
      "Variar frango, patinho e peixe",
      "Ovos, de vez em quando",
    ],
    proteina: "28–35 g",
    // No resumo, "proteína" aqui é o peso da carne. O app escreve o alimento,
    // para os 120 g não se confundirem com os 28–35 g de proteína do selo.
    nota: "Na ordem: salada/legumes → 120 g de frango, carne ou peixe → um pouco de arroz ou outro carboidrato.",
  },
  {
    id: "lanche",
    nome: "Lanche da tarde",
    base: "40 g de Whey Chef Zero + banana",
    trocas: ["½ banana se estiver muito cheia", "Morango", "Maçã pequena"],
    proteina: "32 g",
    nota: "A porção de 40 g do whey dá 32 g de proteína — um terço do dia num copo.",
  },
  {
    id: "jantar",
    nome: "Fecha a janela",
    papel: "Antes do jejum",
    noResumo: "Noite",
    base: "Algo pequeno e proteico — o jantar completo causa desconforto",
    trocas: [
      "Iogurte proteico (15–17 g)",
      "2 ovos",
      "70–100 g de frango desfiado",
      "Ricota ou cottage",
      "Omelete pequena",
    ],
    proteina: "15–20 g",
    nota: "No resumo esta é a refeição da noite. Com o jejum, ela vem meia hora antes de a janela fechar — e continua pequena. Sem ela, a proteína do dia cai para uns 80 g.",
  },
];

/* -------------------------------------------------------------------------- */
/* Exemplo de total de proteína — do resumo                                   */
/* -------------------------------------------------------------------------- */

export type ParteProteina = {
  id: RefeicaoId;
  /** Rótulo curto, para caber embaixo da barra. */
  rotulo: string;
  nome: string;
  /** Como o resumo escreve. */
  texto: string;
  min: number;
  max: number;
};

export const EXEMPLO_PROTEINA: ParteProteina[] = [
  { id: "cafe", rotulo: "Café", nome: "Café da manhã", texto: "~18 g", min: 18, max: 18 },
  { id: "almoco", rotulo: "Almoço", nome: "Almoço", texto: "~30 g", min: 30, max: 30 },
  { id: "lanche", rotulo: "Whey", nome: "Lanche (whey)", texto: "32 g", min: 32, max: 32 },
  { id: "jantar", rotulo: "Fecha", nome: "Fecha a janela", texto: "~15–17 g", min: 15, max: 17 },
];

/* -------------------------------------------------------------------------- */
/* Sugestões de ajuste                                                        */
/* -------------------------------------------------------------------------- */

export type Sugestao = {
  id: string;
  titulo: string;
  texto: string;
  porque: string;
  /** "resumo" quando a sugestão já estava lá; "app" quando é ajuste para o caso dela. */
  origem: "resumo" | "app";
};

/**
 * Ela pediu: "caso seja necessário ajustar algo na alimentação, por favor
 * sugerir". Cada sugestão traz o porquê em uma linha, e nenhuma mexe em
 * remédio — isso é só com o médico.
 */
export const SUGESTOES: Sugestao[] = [
  {
    id: "fecha-janela",
    titulo: "A “Noite” vira “Fecha a janela”",
    texto: "A mesma lista do resumo — iogurte proteico, 2 ovos, frango desfiado, ricota/cottage ou omelete pequena —, meia hora antes de a janela fechar.",
    porque: "Sem ela, a proteína do dia cai para uns 80 g, abaixo da meta.",
    origem: "app",
  },
  {
    id: "cheia",
    titulo: "O lanche segura até a noite?",
    texto: "Se na hora de fechar você costuma estar cheia, pule o fechamento e leve a proteína dele para mais cedo: 2 claras a mais no café e 150 g de frango, carne ou peixe no almoço, em vez de 120 g.",
    porque: "As 2 claras e os 30 g a mais de frango, carne ou peixe devolvem uns 15 g de proteína — e a meta de 90–100 g é o que protege o músculo.",
    origem: "app",
  },
  {
    id: "whey",
    titulo: "Whey não se pula",
    texto: "Nem nos dias sem fome. Muito cheia? Diminua a fruta (½ banana), não o whey.",
    porque: "É o jeito mais fácil de bater proteína com o estômago pequeno: 32 g num copo.",
    origem: "app",
  },
  {
    id: "devagar",
    titulo: "Devagar e porções menores",
    texto: "Coma devagar e pare no primeiro sinal de saciedade. Se sobrar comida no prato, que seja o carboidrato.",
    porque: "O Mounjaro esvazia o estômago mais devagar — comer demais dá enjoo.",
    origem: "app",
  },
  {
    id: "fritura",
    titulo: "Nada de fritura nem gordura pesada",
    texto: "Grelhado, assado, cozido ou refogado com pouco óleo.",
    porque: "Fritura e gordura pesada pioram o enjoo e o refluxo no Mounjaro.",
    origem: "app",
  },
  {
    id: "fibra",
    titulo: "Fibra e água todo dia",
    texto: "Legumes no almoço, fruta no lanche e, se quiser, 1 colher de chia ou linhaça no iogurte.",
    porque: "Intestino preso é comum com o Mounjaro, e a fibra só funciona com água junto.",
    origem: "app",
  },
  {
    id: "quinta-sexta",
    titulo: "Quinta e sexta: comida que desce fácil",
    texto: "No dia da aplicação e no seguinte, a fome costuma cair mais. O cardápio desses dois dias traz a proteína em formas macias — peixe, frango desfiado, iogurte proteico, omelete. Sem fome? Tire o pão do café ou diminua a fruta do lanche; a proteína fica.",
    porque: "Comida macia desce melhor quando o estômago esvazia devagar. Se algo tiver que sobrar, que seja o pão ou a fruta — nunca a proteína.",
    origem: "app",
  },
  {
    id: "queijo",
    titulo: "Queijo minas do pote preto como padrão",
    texto: "O creme de ricota light pode entrar pelo sabor, mas não deve ser contado como fonte principal de proteína.",
    porque: "Entre os queijos avaliados, foi o melhor equilíbrio entre proteína, calorias, gordura saturada e sódio.",
    origem: "resumo",
  },
  {
    id: "conta-proteina",
    titulo: "A conta da proteína fecha",
    texto: `Pela bioimpedância de 12/08, sua massa magra é de uns ${MASSA_MAGRA_KG} kg (85,5 kg com 47,4% de gordura). Os 90–100 g do resumo dão cerca de 2 g por quilo dela.`,
    porque: "A meta não é chute: bate com o seu corpo.",
    origem: "app",
  },
  {
    id: "caloria",
    titulo: "Sem contar caloria",
    texto: "Seu metabolismo em repouso é de umas 1.550 kcal por dia, pela mesma bioimpedância. Com o Mounjaro, o risco é comer pouco demais — não demais.",
    // A proteína protege parte do músculo, mas não garante energia nem
    // vitaminas. A bula lista desnutrição, queda de cabelo e tontura: são
    // esses os sinais que ela precisa saber levar adiante.
    porque: "A proteína ajuda a proteger o músculo, mas não garante que você comeu o suficiente. Tontura ao levantar, fraqueza, queda de cabelo ou o peso caindo rápido demais semana após semana: leve à nutricionista ou ao médico.",
    origem: "app",
  },
];

/* -------------------------------------------------------------------------- */
/* O que entra e o que não entra                                              */
/* -------------------------------------------------------------------------- */

export const PREFERENCIAS: { titulo: string; sim: string[]; nao: string[] }[] = [
  {
    titulo: "Proteínas",
    sim: [
      "Frango",
      "Patinho e carne magra",
      "Peixe",
      "Ovos e claras",
      "Queijo minas/branco",
      "Ricota",
      "Cottage",
      "Iogurte proteico",
      "Whey Chef Zero",
    ],
    nao: ["Frutos do mar", "Fígado", "Sardinha"],
  },
  {
    titulo: "Carboidratos",
    sim: [
      "Pão sem miolo",
      "Arroz",
      "Batata",
      "Mandioca",
      "Mandioquinha",
      "Macarrão integral sem glúten",
    ],
    nao: [],
  },
  {
    titulo: "Frutas",
    sim: ["Banana", "Morango", "Maçã pequena"],
    nao: ["Abacate"],
  },
  {
    titulo: "Leguminosas",
    sim: [],
    nao: ["Feijão", "Lentilha", "Ervilha"],
  },
];

/* -------------------------------------------------------------------------- */
/* O que evitar                                                               */
/* -------------------------------------------------------------------------- */

export const EVITAR = [
  {
    item: "Fritura e gordura pesada",
    detalhe: "Pioram o enjoo e o refluxo no Mounjaro. Grelhado, assado, cozido ou refogado com pouco óleo.",
  },
  {
    item: "Prato cheio",
    detalhe: "Com o Mounjaro o estômago esvazia mais devagar, e comer demais dá enjoo. Coma devagar e pare no primeiro sinal de saciedade.",
  },
  {
    item: "Comer depois que a janela fecha",
    // Os comprimidos da noite (B12 e colágeno) entram no jejum: sem essa
    // ressalva, o texto ao pé da letra manda pular o que o médico passou.
    detalhe: "Da última refeição até o café da manhã, só água, chá e café sem açúcar — e os comprimidos da noite, no horário de sempre. Passou mal? Aí o jejum se quebra: o passo a passo está no card do jejum.",
  },
  {
    item: "Açúcar e doces",
    detalhe: "O Dr. Henry já pedia para cortar, e com o histórico de diabetes gestacional e a gordura no fígado segue valendo. O doce do dia é a fruta do lanche.",
  },
  {
    item: "Álcool",
    detalhe: "Quem paga a conta é o fígado, que já tem gordura.",
  },
];

export const CRITERIOS_ROTULO = [
  "Queijo: compare proteína, gordura saturada e sódio na tabela — o minas do pote preto foi o melhor dos avaliados.",
  "Iogurte proteico: 15–17 g de proteína por pote, que é o que o resumo conta, e sem açúcar adicionado.",
  "“Light” e “creme” não querem dizer proteína: o creme de ricota light entra pelo sabor, não como fonte principal de proteína.",
  "Macarrão: integral e sem glúten, como o resumo pede.",
  "Lista de ingredientes curta: quanto menos coisa escrita, melhor.",
];

/* -------------------------------------------------------------------------- */
/* O que mudou em relação ao Desinflama-se                                    */
/* -------------------------------------------------------------------------- */

export type Mudanca = {
  id: string;
  tema: string;
  /** "seguranca" aparece primeiro e em vermelho. */
  tipo: "seguranca" | "plano" | "preferencia" | "medico";
  antes: string;
  agora: string;
  porque: string;
};

/**
 * Até setembro o app seguia o Desinflama-se. O plano novo muda muita coisa, e
 * nada foi trocado em silêncio: cada mudança está aqui com o antes, o agora e
 * o porquê — e aparece na tela /dieta.
 */
export const MUDANCAS: Mudanca[] = [
  {
    id: "remedios",
    tema: "Remédios",
    tipo: "seguranca",
    antes:
      "A apostila do Desinflama-se chegava a sugerir suspender remédio conforme a pressão ou a glicemia — o app já seguia o trecho seguro.",
    agora:
      "Mounjaro, testosterona, fórmula e vitaminas: dose, dia e horário são do médico. O jejum e o cardápio se encaixam neles, nunca o contrário.",
    porque:
      "Com Mounjaro e histórico de pressão alta e diabetes gestacional, mexer por conta própria é arriscado. Nenhum remédio é ajustado sem o médico.",
  },
  {
    id: "laticinios",
    tema: "Leite e derivados voltam",
    tipo: "plano",
    antes: "Fora nos 15 dias: nada de queijo, iogurte, requeijão ou coalhada.",
    agora: "Queijo minas, ricota, cottage e iogurte proteico entram todos os dias.",
    porque:
      "São proteínas que cabem em pouca comida — e com o Mounjaro o estômago é pequeno. O resumo conta com elas para chegar a 90–100 g.",
  },
  {
    id: "whey",
    tema: "Whey volta",
    tipo: "plano",
    antes: "Suspenso por ser derivado do leite; a proteína do pós-treino vinha de ovo ou frango.",
    agora: "40 g de Whey Chef Zero no lanche da tarde, todo dia: 32 g de proteína.",
    porque: "É um terço da proteína do dia num copo, sem precisar de fome.",
  },
  {
    id: "pao",
    tema: "Pão sem miolo entra",
    tipo: "plano",
    antes: "Sem glúten: no lugar do pão, tapioca, crepioca, cuscuz e pãozinho de aveia.",
    agora: "Pão sem miolo no café da manhã, com ovo e queijo.",
    porque: "Sem o miolo sobra pouco pão: ele vira apoio, e a proteína é o centro do café.",
  },
  {
    id: "gluten-adocante",
    tema: "Glúten e adoçante deixam de ser proibidos",
    tipo: "plano",
    antes: "Proibidos nos 15 dias, junto com o açúcar.",
    agora:
      "O pão sem miolo tem glúten, e o whey é “zero” — sem açúcar, e produto zero costuma levar adoçante. O macarrão segue integral e sem glúten, como o resumo pede.",
    porque:
      "O Desinflama-se era um ciclo curto de restrição; a recomposição é para durar, e o resumo usa os dois. O açúcar continua fora.",
  },
  {
    id: "patinho",
    tema: "Patinho volta",
    tipo: "preferencia",
    antes: "Tinha saído: você fechou as proteínas em frango, peixe, ovos e tofu.",
    agora: "Patinho e carne magra no almoço, alternando com frango e peixe.",
    porque: "Estão no resumo e variam o prato sem perder proteína.",
  },
  {
    id: "mandioquinha",
    tema: "Mandioquinha volta",
    tipo: "preferencia",
    antes:
      "Tinha saído por não estar na sua lista de carboidratos — e mandioquinha não é a mesma coisa que mandioca.",
    agora: "É uma das trocas do arroz no resumo e aparece no almoço de quinta.",
    porque:
      "Se não gostar, é só trocar por mandioca ou batata — fazem o mesmo papel no prato.",
  },
  {
    id: "jantar",
    tema: "O jantar vira jejum",
    tipo: "plano",
    antes: "Jantar mais leve por volta das 19:30: sopa, omelete, peixe com legumes.",
    agora:
      "A última refeição é pequena e proteica e fecha a janela, meia hora antes do jejum. Depois, só água, chá e café sem açúcar — e os comprimidos da noite, no horário de sempre.",
    porque:
      "A medicação tira a fome à noite, e o jantar completo causa desconforto. No resumo essa refeição se chama Noite — o app só antecipou.",
  },
  {
    id: "semana",
    tema: "O cardápio de 15 dias vira semanal",
    tipo: "plano",
    antes: "15 dias numerados, que recomeçavam no dia 16.",
    agora: "7 dias, de segunda a domingo, com as quatro refeições do resumo.",
    porque:
      "A recomposição não tem data para acabar. A semana é o ritmo da compra, da aplicação de quinta e do treino.",
  },
  {
    id: "saiu",
    tema: "O que saiu do cardápio",
    tipo: "plano",
    antes:
      "Tofu, tapioca, crepioca, cuscuz, quinoa, batata-doce, grão-de-bico, patê de atum/frango e leite de amêndoas.",
    agora:
      "O cardápio usa o que está no resumo — a chia opcional no iogurte é sugestão do app, para o intestino.",
    porque:
      "Eram as trocas para 15 dias sem leite e sem glúten. Não viraram proibidos — só deixaram de ser necessários.",
  },
  {
    id: "ordem",
    tema: "Ordem do prato",
    tipo: "plano",
    antes: "Folhas → legumes → proteína → carboidrato, com metade do prato de vegetais.",
    agora:
      "Verduras e legumes + proteína primeiro; carboidrato depois. E a proteína tem medida: 120 g de frango, carne ou peixe no almoço.",
    porque:
      "O começo é o mesmo. A diferença é que a proteína não pode ficar para trás: com a fome curta, é ela que precisa entrar.",
  },
  {
    id: "agua",
    tema: "Água",
    tipo: "plano",
    antes: "3,4 L por dia.",
    agora: "200 ml por hora, conforme orientação médica — uns 3,2 L em 16 horas acordada.",
    porque: "É a orientação médica que está no resumo. Um copo por hora vale também durante o jejum, até dormir.",
  },
  {
    id: "lanchinho",
    tema: "O lanchinho do Dr. Henry",
    tipo: "medico",
    antes:
      "Ele sugeria um lanchinho a cada 2–3 h se batesse fome; no Desinflama-se valia o contrário: não beliscar.",
    agora:
      "Dentro da janela, cabe — de preferência com proteína, como o iogurte proteico. Fora dela, é jejum.",
    porque: "A janela tem espaço para comer de tempos em tempos; a noite fica para o jejum.",
  },
  {
    id: "farinha",
    tema: "Farinha de trigo × pão sem miolo",
    tipo: "medico",
    antes: "O Dr. Henry pedia para cortar as duas farinhas brancas: açúcar refinado e farinha de trigo.",
    agora: "O resumo põe pão sem miolo no café da manhã. O açúcar refinado continua fora.",
    porque:
      "Sem o miolo sobra pouco pão, e ele vem com ovo e queijo. Se quiser seguir o Dr. Henry à risca, a omelete com queijo (sem pão) é uma das opções do próprio resumo.",
  },
];

/* -------------------------------------------------------------------------- */
/* Acompanhamento                                                             */
/* -------------------------------------------------------------------------- */

/**
 * O sinal de que está funcionando fica em PLANO.objetivo (data/protocol.ts).
 * Aqui, onde o app guarda cada parte dele: o peso na balança, a cintura na aba
 * Medidas do progresso e a força na carga que ela anota em cada exercício do
 * treino. O link leva direto para o lugar do registro.
 */
export const ACOMPANHAMENTO = {
  frase: "O objetivo não é apenas baixar o peso.",
  sinais: [
    { id: "peso", rotulo: "Peso", direcao: "descendo", onde: "Balança", href: "/progresso" },
    {
      id: "cintura",
      rotulo: "Cintura",
      direcao: "descendo",
      onde: "Medidas",
      href: "/progresso?aba=medidas",
    },
    {
      id: "forca",
      rotulo: "Força",
      direcao: "igual ou subindo",
      // Curto: a célula tem um terço da largura, e em 320 px já quebra em duas linhas.
      onde: "Cargas do treino",
      href: "/treino",
    },
  ],
} as const;

/** A observação que fecha o resumo. */
export const OBSERVACAO_RESUMO =
  "Este resumo organiza as orientações discutidas e não substitui o acompanhamento do médico e/ou nutricionista, especialmente durante o uso de Mounjaro e na preparação para a cirurgia plástica.";
