/**
 * Alimentação da recomposição corporal — as regras em volta da comida.
 *
 * Desde 18/10/2026 a comida do dia é o plano da nutricionista (data/meals.ts):
 * três refeições, duas opções em cada. Aqui ficam as metas, o jejum noturno,
 * as sugestões do app para o dia a dia com o Mounjaro, o que evitar e o que
 * mudou — cada mudança com o antes, o agora e o porquê.
 *
 * Do jejum, ela pediu em 29/09: à noite a medicação tira a fome, então a noite
 * vira jejum. Onde o app vai além do plano (o jejum e as sugestões), está
 * escrito o porquê. Quantidade e troca de alimento são com a nutricionista.
 */

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
    valor: "Proteína alta: cerca de 1,6 a 1,9 g por kg do peso ideal",
    detalhe:
      "A meta da nutricionista, para preservar a massa magra enquanto o peso cai. As opções do plano já vêm montadas para isso.",
  },
  {
    id: "agua",
    titulo: "Água",
    // Os horários são os padrão: a tela troca pelos que ela pôs em /ajustes.
    valor: "300 ml por vez, das 9h às 21h",
    // A tela completa com a meta do app e os lembretes.
    detalhe: "A meta do dia dividida em copos de 300 ml.",
  },
  {
    id: "ordem",
    titulo: "Ordem das refeições",
    valor: "Verdura e proteína primeiro",
    detalhe: "Legumes, verduras e proteína primeiro; o carboidrato vem depois.",
  },
];

/** A ordem do prato: salada/legumes → proteína → carboidrato. */
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
    porque:
      "Por último, na medida do plano — a quinoa, a batata-doce ou o grão-de-bico. Se a fome acabar antes, é ele que sobra no prato.",
  },
];

/* -------------------------------------------------------------------------- */
/* Jejum noturno                                                              */
/* -------------------------------------------------------------------------- */

/**
 * O jejum é o pedido dela: à noite não dá para comer. Os horários de verdade
 * vêm da janela configurada (lib/jejum.ts); os textos daqui não citam a hora
 * da janela para continuarem certos se ela mudar.
 */
export const JEJUM = {
  resumo:
    "A comida do dia cabe numa janela. Depois da última refeição, é jejum até o café da manhã.",
  porQue:
    "À noite a medicação tira a fome, e o jantar completo causa desconforto. Em vez de forçar, a noite vira jejum: a última refeição é o lanche da tarde, e a proteína do dia inteiro cabe dentro da janela.",
  /** Vale para qualquer janela: no card, só o título muda quando o jejum não é de 14 h. */
  porQueNaoEncurtar:
    "Com o Mounjaro a fome já é pouca. Numa janela mais curta, fica difícil fazer caber as três refeições e a proteína do plano — e aí sai músculo junto com a gordura.",
  metabolismo:
    "Com honestidade: jejum não acelera o metabolismo. O que ele faz é dar tempo para o corpo usar gordura como combustível durante a noite. Quem mantém o metabolismo alto enquanto o peso cai é o músculo — musculação e proteína.",
  pode: [
    // Os copos e os lembretes vêm de /ajustes: o texto não crava horário nem
    // tamanho de copo, que ela pode mudar lá.
    { item: "Água", detalhe: "Liberada. Os copos do dia seguem os horários que estão em Ajustes." },
    {
      item: "Chá, sem açúcar",
      detalhe:
        "Os chás da nutricionista, sem açúcar: chá verde, gengibre, canela, hibisco, cavalinha ou dente-de-leão — até 1 litro por dia somando todos. O verde tem cafeína: à noite, prefira os outros.",
    },
    {
      // Os de antes do café também caem no jejum, não só os da noite: sem
      // eles aqui, o texto ao pé da letra mandaria esperar o café para tomar.
      item: "Remédios e suplementos do jejum",
      detalhe:
        "Nos horários da Farmácia: de manhã, o probiótico e o mio-inositol antes do café (e a creatina, nos dias sem treino); à noite, a B12 derrete embaixo da língua e o magnésio vai com água. O colágeno vai junto do café da manhã. Mudar o horário de qualquer um, só com quem receitou.",
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
      "Passou? Aí sim um lanche com proteína — um ovo ou o kefir/iogurte natural.",
    ],
    atendimento:
      "Não melhorou: procure atendimento. Confusão ou desmaio: ligue 192 (SAMU). E, em qualquer caso, avise o médico.",
    dicas: [
      "Tem glicosímetro? Abaixo de 70 mg/dL é baixa.",
      "Só tontura, sem tremor nem suor: sente ou deite e beba água. Não passou? Siga os passos acima.",
      "Dor de cabeça forte e diferente da de costume: meça a pressão, se tiver aparelho, e procure atendimento no mesmo dia. Fortíssima e de repente: 192 (SAMU).",
    ],
    // Fica à mão, não na compra da semana: é socorro, não comida do plano.
    aMao: "Deixe à mão sachês de açúcar ou uma caixinha de suco comum. É o socorro — não é para o dia a dia.",
  },
  // Sem a hora da janela no texto: o card do jejum mostra a janela logo acima.
  treino:
    "Treino com carga: dentro da janela, depois do café da manhã ou entre o almoço e o lanche — de barriga cheia, espere uma hora ou mais, porque com o Mounjaro a digestão é lenta. Em jejum, só caminhada leve.",
};

/* -------------------------------------------------------------------------- */
/* Chás                                                                       */
/* -------------------------------------------------------------------------- */

export type Cha = {
  nome: string;
  texto: string;
  comoFazer: string;
};

/**
 * Os chás da lista da nutricionista, mais o gengibre com abacaxi — que não
 * está na lista, e o texto dele diz isso —, com o que os estudos mostram de
 * cada um. Sem promessa de emagrecer: o efeito no peso é pequeno, e o resumo
 * diz isso primeiro. O limite de 1 litro por dia vem das observações da
 * nutricionista (OBSERVACOES_NUTRI, em data/meals.ts). A seção fica na aba
 * Dieta (#chas), e o card da água registra as xícaras do dia sem contar na
 * meta de água (lib/storage.ts → somarCha). O nome é a key na tela: não pode
 * repetir.
 */
export const CHAS: {
  titulo: string;
  resumo: string;
  regra: string;
  itens: Cha[];
  cirurgia: string;
} = {
  titulo: "Chás",
  resumo:
    "Nenhum chá acelera o metabolismo a ponto de fazer diferença na balança: nos estudos, o efeito é pequeno — no máximo umas dezenas de calorias por dia, e só com o resto do plano em dia. O ganho real é outro: hidratar, trocar bebida doce e, no caso do gengibre, aliviar o enjoo do Mounjaro.",
  regra:
    "Até 1 litro por dia somando todos os chás, sempre sem açúcar — orientação da nutricionista. No jejum da noite, só os sem fruta e sem cafeína.",
  itens: [
    {
      nome: "Chá verde",
      texto:
        "É o mais estudado: as catequinas e a cafeína aumentam um pouco o gasto de energia, e nos estudos a perda de peso a mais foi pequena. Tem cafeína: tome até o meio da tarde.",
      comoFazer:
        "1 sachê (ou 1 colher de chá de folhas) em 200 ml de água quente, sem ferver; 3 minutos.",
    },
    {
      nome: "Gengibre",
      texto:
        "Num estudo pequeno, deu um pouco mais de saciedade depois do café da manhã. E ajuda no enjoo — bom nos dias do Mounjaro.",
      comoFazer:
        "3 ou 4 fatias finas da raiz (uns 3 cm) em 500 ml de água; ferva de 5 a 10 minutos e coe.",
    },
    {
      nome: "Gengibre com abacaxi",
      texto:
        "O abacaxi dá sabor; o que tem algum efeito é o gengibre. A fruta tem um pouco de açúcar: tome dentro da janela, não no jejum da noite. O abacaxi não está na lista da nutricionista — vale confirmar com ela.",
      comoFazer:
        "A casca de 1 abacaxi bem lavada (ou 2 rodelas) e 3 cm de gengibre em 1 litro de água; ferva 10 minutos, coe e tome quente ou gelado, sem açúcar.",
    },
    {
      nome: "Canela",
      texto:
        "Pode ajudar um pouco no açúcar do sangue. Prefira a canela-do-ceilão: a cássia, a mais comum no mercado, tem cumarina, que em excesso pesa no fígado. 1 pau por chá, sem exagero.",
      comoFazer: "1 pau de canela em 500 ml de água; ferva 5 minutos.",
    },
    {
      nome: "Hibisco",
      texto:
        "Num estudo, 3 xícaras por dia baixaram um pouco a pressão. Se sentir tontura ao levantar, diminua. No peso, o efeito é fraco.",
      comoFazer: "1 colher de sopa da flor seca em 500 ml de água quente; 5 minutos.",
    },
    {
      nome: "Cavalinha e dente-de-leão",
      texto:
        "São diuréticos: fazem perder água, não gordura. Com o Mounjaro, mantenha a meta de água; a cavalinha também pode baixar o potássio — fique no limite de chás.",
      comoFazer: "1 colher de sopa da erva seca em 500 ml de água quente; de 5 a 10 minutos.",
    },
  ],
  cirurgia:
    "Na reta final antes da cirurgia, conte ao cirurgião quais chás você toma: alguns, como o gengibre em quantidade, podem mexer na coagulação.",
};

/* -------------------------------------------------------------------------- */
/* Sugestões do app                                                           */
/* -------------------------------------------------------------------------- */

export type Sugestao = {
  id: string;
  titulo: string;
  texto: string;
  porque: string;
};

/**
 * O que o app sugere para o dia a dia com o Mounjaro. Nenhuma muda o plano —
 * quantidade e troca de alimento são com a nutricionista — e nenhuma mexe em
 * remédio. As de antes que eram do cardápio de 7 dias (whey, chia, folha
 * escura, cores, quinta e sexta, queijo, a conta da proteína) saíram com ele.
 */
export const SUGESTOES: Sugestao[] = [
  {
    id: "devagar",
    titulo: "Devagar, e pare na saciedade",
    texto: "Coma devagar e pare no primeiro sinal de saciedade.",
    porque: "O Mounjaro esvazia o estômago mais devagar — comer além da conta dá enjoo.",
  },
  {
    id: "porcao",
    titulo: "A porção não desceu inteira?",
    texto:
      "Comece pela salada e pela proteína e deixe o carboidrato por último: se algo tiver que sobrar, que seja ele. Se acontecer quase todo dia, conte à nutricionista — quem ajusta a porção é ela.",
    porque: "Com a fome curta, a proteína é a parte que protege o músculo.",
  },
  {
    id: "fritura",
    titulo: "Nada de fritura nem gordura pesada",
    texto: "Grelhado, assado, cozido ou refogado com pouco óleo — o azeite do plano já vem medido.",
    porque: "Fritura e gordura pesada pioram o enjoo e o refluxo no Mounjaro.",
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
    // Os remédios e suplementos da noite e os de antes do café entram no jejum:
    // sem essa ressalva, o texto ao pé da letra manda pular o que foi receitado.
    detalhe: "Da última refeição até o café da manhã, só água e chá sem açúcar — à noite, os sem cafeína — e os remédios e suplementos nos horários da Farmácia (os da noite e os de antes do café). Passou mal? Aí o jejum se quebra: o passo a passo está no card do jejum.",
  },
  {
    item: "Açúcar e doces",
    detalhe: "O Dr. Henry já pedia para cortar, e com o histórico de diabetes gestacional e a gordura no fígado segue valendo. O doce do dia é a fruta do plano.",
  },
  {
    item: "Álcool",
    detalhe: "Quem paga a conta é o fígado, que já tem gordura.",
  },
  {
    // Saiu em 12/10, a pedido dela. A dor de cabeça forte e diferente da de
    // costume fica fora da conta do café de propósito: ela pede o aparelho de
    // pressão e atendimento no mesmo dia, como no socorro do jejum; a
    // fortíssima de repente é 192, como em data/alarmes.ts. O chá verde voltou
    // em 18/10, liberado pela nutricionista.
    item: "Café (a bebida)",
    detalhe: "Saiu do plano em 12/10, a pedido seu. Tomava muito café? Tire aos poucos, ao longo de uma semana: dor de cabeça leve e cansaço nos primeiros dias são comuns e passam sozinhos. Dor de cabeça forte e diferente da de costume — ainda mais com visão embaralhada — não é do café: meça a pressão, se tiver aparelho, e procure atendimento no mesmo dia; fortíssima e de repente, 192 (SAMU). O chá verde a nutricionista liberou, dentro do limite de 1 litro de chás por dia. Remédio ou fórmula com cafeína: conte ao médico que o café saiu — sem mudar nada por conta própria.",
  },
  {
    item: "Pré-treino, termogênico e chás prontos “para emagrecer”",
    detalhe: "Pré-treino e termogênico costumam ter muita cafeína e outros estimulantes; chá pronto “seca-barriga” costuma ser diurético ou laxante. Com histórico de pressão alta e o Mounjaro, podem subir a pressão, disparar o coração e desidratar. Os chás da lista da nutricionista estão liberados, até 1 litro por dia; misturas prontas e cápsulas, não — nada disso entra sem o médico e a nutricionista.",
  },
];

export const CRITERIOS_ROTULO = [
  "Queijo branco sem lactose: compare proteína, gordura saturada e sódio na tabela.",
  "Iogurte natural sem lactose ou kefir: sem açúcar na lista de ingredientes.",
  "Whey: isolado e sem lactose, como está no plano.",
  "Bebida vegetal e pasta de amendoim: sem açúcar — na pasta, só amendoim na lista de ingredientes.",
  "Lista de ingredientes curta: quanto menos coisa escrita, melhor.",
];

/* -------------------------------------------------------------------------- */
/* O que mudou                                                                */
/* -------------------------------------------------------------------------- */

export type Mudanca = {
  id: string;
  tema: string;
  /**
   * "seguranca" aparece em vermelho. "plano" é o plano da nutricionista
   * (18/10) e vem no topo; "ajuste" é o que ela pediu em 12/10; "resumo" é o
   * que veio com o resumo de alimentação de 29/09 e segue valendo.
   */
  tipo: "plano" | "ajuste" | "seguranca" | "resumo" | "medico";
  antes: string;
  agora: string;
  porque: string;
};

/**
 * Até setembro o app seguia o Desinflama-se; em 29/09 veio o resumo de
 * alimentação, em 12/10 os ajustes que ela pediu e em 18/10 o plano da
 * nutricionista. Nada foi trocado em silêncio: cada mudança que segue valendo
 * está aqui com o antes, o agora e o porquê — e aparece na tela /dieta, a mais
 * nova primeiro. As que o plano de 18/10 desfez (chia todo dia, folha escura,
 * cores, o whey de antes, o pão, o cardápio da semana) saíram da lista. O id é
 * a key na tela: não pode repetir.
 */
export const MUDANCAS: Mudanca[] = [
  {
    id: "plano-nutricionista",
    tema: "Cardápio de 7 dias → plano da nutricionista com 3 refeições e 2 opções em cada",
    tipo: "plano",
    antes: "Um cardápio para cada dia da semana, com quatro refeições.",
    agora:
      "Café da manhã, almoço e lanche da tarde, cada um com a opção 1 e a opção 2. Na tela inicial você marca qual comeu; a lista de compras sai da divisão de dias que você escolher.",
    porque: "É o plano que a nutricionista prescreveu em 18/10.",
  },
  {
    id: "fecha-janela-saiu",
    tema: "Fecha a janela: saiu — a última refeição é o lanche da tarde",
    tipo: "plano",
    antes: "Uma quarta refeição, pequena, meia hora antes de a janela fechar.",
    agora: "O lanche da tarde é a última refeição do dia, até as 17h–18h. Depois, jejum.",
    porque:
      "É assim no plano da nutricionista. Os dias até 17/10 continuam com as quatro refeições no histórico.",
  },
  {
    id: "cha-verde",
    tema: "Chá verde liberado pela nutricionista, até 1 litro de chás por dia",
    tipo: "plano",
    antes: "Desde 12/10, só chá sem cafeína: o verde tinha saído junto com o café.",
    agora:
      "Chá verde, gengibre, canela, hibisco, cavalinha ou dente-de-leão, sem açúcar — até 1 litro por dia somando todos.",
    porque: "Está nas observações da nutricionista. O verde tem cafeína: à noite, prefira os outros.",
  },
  {
    id: "agua-copos",
    tema: "Água: copos de 300 ml das 9h às 21h, com lembrete",
    tipo: "plano",
    antes: "200 ml por hora, um copo a cada hora acordada.",
    agora:
      "A meta do dia dividida em copos de 300 ml, das 9h às 21h — os lembretes no celular avisam a hora de cada um.",
    porque: "Pedido seu, em 18/10. Os horários e o tamanho do copo mudam em Ajustes.",
  },
  {
    id: "sem-lactose",
    tema: "Laticínios: versões sem lactose e bebida vegetal",
    tipo: "plano",
    antes: "Queijo minas, ricota, cottage, iogurte proteico e um whey comum.",
    agora:
      "Queijo branco sem lactose, kefir ou iogurte natural sem lactose, whey protein isolado sem lactose e bebida vegetal sem açúcar.",
    porque: "São os itens do plano da nutricionista.",
  },
  {
    id: "cafe-fora",
    tema: "O café sai",
    tipo: "ajuste",
    antes: "Uma xícara de café no café da manhã, e café liberado também no jejum.",
    agora:
      "Sem café (a bebida). Os chás da nutricionista, sem açúcar, ficam no lugar — o verde inclusive, desde 18/10.",
    porque:
      "Pedido seu, em 12/10. Cafeína atrapalha o sono e aumenta a ansiedade: por isso o chá verde, que também tem, fica para o dia. Tomava muito café? Tire aos poucos, ao longo de uma semana.",
  },
  {
    id: "remedios",
    tema: "Remédios",
    tipo: "seguranca",
    antes:
      "A apostila do Desinflama-se chegava a sugerir suspender remédio conforme a pressão ou a glicemia — o app já seguia o trecho seguro.",
    agora:
      "Remédios do médico e o protocolo da nutricionista: dose, dia e horário são de quem receitou. O jejum e o plano alimentar se encaixam neles, nunca o contrário.",
    porque:
      "Com Mounjaro e histórico de pressão alta e diabetes gestacional, mexer por conta própria é arriscado. Nenhum remédio é ajustado sem quem receitou.",
  },
  {
    id: "jantar",
    tema: "O jantar vira jejum",
    tipo: "resumo",
    antes: "Jantar mais leve por volta das 19:30: sopa, omelete, peixe com legumes.",
    agora:
      "À noite, jejum. Desde 18/10 a última refeição é o lanche da tarde; depois, só água e os chás da nutricionista, sem açúcar — e os remédios e suplementos nos horários da Farmácia.",
    porque: "A medicação tira a fome à noite, e o jantar completo causa desconforto.",
  },
  {
    id: "ordem",
    tema: "Ordem do prato",
    tipo: "resumo",
    antes: "Folhas → legumes → proteína → carboidrato, com metade do prato de vegetais.",
    agora:
      "Verduras e legumes + proteína primeiro; carboidrato depois. A proteína tem medida: 150 g de frango ou 140 g de peixe no almoço, como está no plano.",
    porque:
      "O começo é o mesmo. A diferença é que a proteína não pode ficar para trás: com a fome curta, é ela que precisa entrar.",
  },
  {
    id: "lanchinho",
    tema: "O lanchinho do Dr. Henry",
    tipo: "medico",
    antes:
      "Ele sugeria um lanchinho a cada 2–3 h se batesse fome; no Desinflama-se valia o contrário: não beliscar.",
    agora:
      "O plano da nutricionista tem três refeições. Fome forte entre elas? Pergunte a ela o que pode entrar. Fora da janela, é jejum.",
    porque: "As quantidades do plano já contam com o déficit leve: lanche a mais é com a nutricionista.",
  },
];

/* -------------------------------------------------------------------------- */
/* Acompanhamento                                                             */
/* -------------------------------------------------------------------------- */

/**
 * O sinal de que está funcionando fica em PLANO.objetivo (data/protocol.ts).
 * Aqui, onde o app guarda cada parte dele: o peso na balança e a cintura na
 * aba Medidas do progresso. A força não tem registro próprio desde que a aba
 * Treino saiu (18/10): o link vai para o progresso, onde está o marco dela.
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
      onde: "Peso e medidas",
      href: "/progresso",
    },
  ],
} as const;
