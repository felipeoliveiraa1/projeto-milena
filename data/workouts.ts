import { PERFIL } from "./protocol";
import { ENTRE_SERIES_ADAPTACAO, TREINO_ADAPTACAO } from "./workouts-adaptacao";
import {
  ALONGAMENTO_ADUTOR,
  ALONGAMENTO_GERAL,
  CAMINHADA,
  DESLIZAMENTO_CALCANHAR,
  DICA_JOELHO,
  ELEVACAO_LATERAL,
  NOTA_DEAD_BUG,
  NOTA_PERDIGUEIRO,
  TRANSVERSO,
  TRICEPS_COICE,
} from "./workouts-comum";

/**
 * Treino da Milena — orientação do médico de 29/09/2026 e ajustes de 12/10, a
 * pedido dela: treinar todo dia, perder uns 15 kg, ganhar força, pernas
 * musculosas e costas e braços definidos.
 *
 * A semana tem o mesmo esqueleto nos dois planos:
 * - seg: pernas A (frente da coxa e bumbum) — no completo, perna pesada;
 * - ter: costas e braços;
 * - qua: no completo, cintura e o intervalado na bike — a única sessão forte;
 *   na adaptação, caminhada firme;
 * - qui: dia do Mounjaro — caminhada leve e alongamento;
 * - sex: costas, braços e cintura, tudo calmo (dia seguinte ao Mounjaro);
 * - sáb: pernas B (bumbum, posterior e parte interna da coxa);
 * - dom: caminhada ao ar livre e alongamento — descanso ativo.
 *
 * Desde 29/09, em todo dia de academia: cardio rápido e sem pular depois de
 * TODA série, para a perda de peso, e core de pouca pressão na linha do meio da
 * barriga, soltando o ar no esforço. Na semana, a parte interna da coxa
 * (flacidez) em pelo menos 3 sessões. Desde 12/10: o respiro entre as séries
 * vai até o fôlego voltar; perna 2 vezes por semana, com 48 h ou mais entre
 * elas, porque o músculo cresce no descanso; uma sessão forte só, porque treino
 * forte em dias seguidos não dá tempo de o músculo se recuperar; e, nos dias de
 * perna, cardio de braço entre as séries.
 *
 * O plano completo mora aqui; a adaptação, que é o padrão, em
 * workouts-adaptacao.ts. Os vídeos foram conferidos: existem e permitem player
 * embutido. Em 30/09 saíram os que mostravam outra versão do exercício (pernas
 * no ar, barra no lugar do colchonete, em pé sem apoio, só conversa); quando o
 * vídeo sozinho não basta, a dica do card diz como fazer.
 */

/** Para onde o exercício trabalha. Liga cada um ao que o médico pediu. */
export type Grupo = "perna" | "coxa-interna" | "cintura" | "costas-bracos";

export type Exercise = {
  nome: string;
  series: string;
  reps: string;
  /** O que vem entre uma série e outra — nos dias de academia, o cardio rápido. */
  descanso: string;
  beneficio: string;
  /** Aparelho/acessório da academia da Milena usado no exercício. */
  equipamento: string;
  /** ID do vídeo no YouTube (conferido: existe e permite player embutido). */
  videoId: string;
  /** Por que este exercício entrou no lugar de outro (falta de aparelho ou segurança). */
  adaptacao?: string;
  /** Dica de execução em uma linha — só quando ela muda o resultado. */
  dica?: string;
  /**
   * Cuidado com a diástase abdominal. O que empurra a barriga para fora nem
   * entra no plano; "cuidado" pede ajuste na execução.
   */
  diastase?: { nivel: "cuidado"; nota: string };
  grupos?: Grupo[];
  /**
   * Fica sem o cardio entre as séries: a respiração de preparo, caminhada,
   * alongamento e o que já é cardio. Todo o resto, em dia de academia, leva.
   */
  semCardio?: boolean;
  /**
   * Usa peso de fora — halter, kettlebell, estação/polia, barra ou caneleira —
   * e por isso ganha o campo "Carga de hoje" na tela. É o registro da força: o
   * objetivo é peso e cintura descendo com a carga igual ou subindo.
   */
  carga?: boolean;
};

/** Explícito nos dados — antes a tela adivinhava pelo número de exercícios. */
export type TipoDia = "academia" | "caminhada" | "descanso";

export type WorkoutDay = {
  diaSemana: number;
  diaNome: string;
  foco: string;
  curto: string;
  tipo: TipoDia;
  /** Minutos, contando aquecimento e o cardio entre as séries. Descanso não tem. */
  duracaoMin?: number;
  aquecimento?: string;
  /** Como a sessão anda quando foge do padrão (perna pesada, intervalado, dia calmo...). */
  comoFazer?: string;
  /**
   * Sexta, dia seguinte à aplicação do Mounjaro: o cardio entre as séries fica
   * só nas opções que não sacodem o estômago — o enjoo costuma vir nesse dia. A
   * quinta, dia da aplicação, é de caminhada leve desde 12/10.
   */
  cardioSuave?: boolean;
  /**
   * A sessão forte da semana — no completo, a quarta do intervalado. Uma só,
   * longe da quinta e da sexta (Mounjaro) e das pernas pesadas: treino forte em
   * dias seguidos não dá tempo de o músculo se recuperar (ajustes de 12/10).
   */
  intensa?: boolean;
  /**
   * Dia de perna: o cardio entre as séries fica só no que poupa a perna — bike,
   * step, marcha e elíptico cansam a perna da série seguinte.
   */
  cardioDeBraco?: boolean;
  /** Dia de braço: o cardio entre as séries fica sem o soco no ar e o polichinelo, que cansam o braço. */
  cardioSemBraco?: boolean;
  /** Lembrete do dia (Mounjaro e água). Aparece também na tela inicial. */
  lembrete?: string;
  exercicios: Exercise[];
  observacao?: string;
};

/** Levantado a partir das fotos da academia do prédio. */
export const EQUIPAMENTOS: { nome: string; detalhe: string }[] = [
  {
    nome: "Estação de musculação",
    detalhe: "polia alta, voador, polia baixa e módulo extensora/flexora",
  },
  { nome: "Halteres", detalhe: "rack completo, do leve ao pesado" },
  { nome: "Kettlebells", detalhe: "3 pesos leves (colorido)" },
  { nome: "Bancos", detalhe: "banco reto + banco ajustável (inclinado)" },
  { nome: "Barra e anilhas", detalhe: "com suporte" },
  { nome: "Caneleiras", detalhe: "tornozeleiras com peso" },
  { nome: "Corda de tríceps", detalhe: "para a polia alta" },
  { nome: "Cardio", detalhe: "2 esteiras, bike vertical, bike horizontal e elíptico" },
  { nome: "Espaldar com elásticos", detalhe: "faixas para ativação e alongamento" },
  { nome: "Acessórios", detalhe: "bola suíça, step, colchonete, foam roller e bastões" },
];

/** Aparelhos que a academia NÃO tem — quando o plano precisou de um, entrou outro exercício. */
export const SEM_APARELHO: string[] = [
  "Leg press 45°",
  "Cadeira abdutora e adutora",
  "Máquina de glúteo (coice)",
  "Máquina de panturrilha em pé",
  "Supino em máquina",
];

/** "3,9 cm" — a medida vem do perfil, para o número não se repetir solto pelo app. */
export const DIASTASE_CM = `${String(PERFIL.diastaseCm).replace(".", ",")} cm`;

/* -------------------------------------------------------------------------- */
/* Cardio entre as séries                                                     */
/* -------------------------------------------------------------------------- */

export type OpcaoCardio = {
  nome: string;
  /** Nome curto, para listas como "bike, elíptico ou marcha". */
  curto: string;
  como: string;
  videoId: string;
  /** Não sacode o estômago — serve nos dias de enjoo do Mounjaro. */
  suave: boolean;
  /** Não cansa a perna — o cardio entre as séries dos dias de perna. */
  poupaPerna?: boolean;
  /** Cansa o braço — fica fora dos dias de costas e braços. */
  cansaBraco?: boolean;
};

/**
 * Pedido do médico: depois de cada série, um cardio rápido. Todos sem pular —
 * impacto pesa na diástase e no assoalho pélvico do pós-parto.
 */
export const CARDIO_ENTRE_SERIES: { porque: string; opcoes: OpcaoCardio[] } = {
  porque:
    "O descanso parado vira movimento: o coração fica acelerado a sessão toda, e o treino gasta mais no mesmo tempo. Sem pular — impacto pesa no assoalho pélvico e na diástase. Voltar para a série pelo fôlego, e não pelo relógio, evita acumular cansaço.",
  opcoes: [
    {
      nome: "Polichinelo sem salto",
      curto: "polichinelo",
      como: "Abra um pé para o lado enquanto os braços sobem, volte e troque de lado.",
      videoId: "4Tcu8Y4iVsY",
      suave: false,
      poupaPerna: true,
      cansaBraco: true,
    },
    {
      nome: "Marcha com joelho alto",
      curto: "marcha",
      como: "Marcha rápida no lugar, joelho até onde der, braços junto. Um pé sempre no chão.",
      videoId: "qHO4yxAdoYY",
      suave: true,
    },
    {
      nome: "Subida alternada no step",
      curto: "step",
      como: "Suba e desça do step em ritmo rápido, trocando a perna que começa.",
      videoId: "4OOatVudJBo",
      suave: false,
    },
    {
      nome: "Soco no ar",
      curto: "soco no ar",
      como: "Pés firmes, joelhos soltos e socos alternados para a frente, soltando o ar a cada soco.",
      videoId: "Y1h7XI1Dg6Q",
      suave: false,
      poupaPerna: true,
      cansaBraco: true,
    },
    {
      nome: "Bike",
      curto: "bike",
      como: "Se estiver do lado: pedalada rápida com carga leve.",
      videoId: "dMJ5LO5NwY8",
      suave: true,
    },
    {
      nome: "Elíptico",
      curto: "elíptico",
      como: "Se estiver do lado: passada rápida, tronco reto, sem se pendurar no painel.",
      videoId: "Rltlu55sBLE",
      suave: true,
    },
  ],
};

/**
 * Opções que valem no dia: no dia seguinte ao Mounjaro, só as suaves; nos dias
 * de perna, só as que poupam a perna; nos de braço, nenhuma que canse o braço.
 * Toda academia da semana fica com pelo menos uma.
 */
export function opcoesCardio(dia: WorkoutDay): OpcaoCardio[] {
  return CARDIO_ENTRE_SERIES.opcoes.filter(
    (o) =>
      (!dia.cardioSuave || o.suave) &&
      (!dia.cardioDeBraco || o.poupaPerna) &&
      (!dia.cardioSemBraco || !o.cansaBraco),
  );
}

/* -------------------------------------------------------------------------- */
/* Plano completo                                                             */
/* -------------------------------------------------------------------------- */

/** Mais cardio e menos respiro mínimo que na adaptação: aqui o corpo já se acostumou. */
export const ENTRE_SERIES_COMPLETO = { cardio: "40 s", respiroMinimo: "15 s" };

/** A pílula de cada exercício. Desde 12/10 o respiro vai até o fôlego voltar. */
const ENTRE = `cardio ${ENTRE_SERIES_COMPLETO.cardio} + respiro pelo fôlego`;

/** Na quarta (2 séries) e no sábado (3). */
const PERDIGUEIRO: Exercise = {
  nome: "Perdigueiro (bird dog)",
  series: "3",
  reps: "10 cada lado",
  descanso: ENTRE,
  beneficio: "Costas e barriga trabalhando juntas, em quatro apoios, com pouca pressão na linha do meio.",
  equipamento: "Colchonete",
  videoId: "Nm8onc8ndVw",
  grupos: ["cintura"],
  diastase: NOTA_PERDIGUEIRO,
};

/** "Sem tempo?" das pernas pesadas: corta o volume, nunca o preparo. */
const SEM_TEMPO =
  "Sem tempo? Tire a última série de cada exercício — nunca o aquecimento nem o transverso.";

export const WORKOUTS: WorkoutDay[] = [
  {
    diaSemana: 1,
    diaNome: "Segunda",
    foco: "Pernas A — frente da coxa e bumbum",
    curto: "Pernas A",
    tipo: "academia",
    // Aquecimento (com a série leve de aproximação) + séries × (execução + 40 s
    // de cardio + uns 30 s de respiro; mais na barra, que espera o fôlego
    // inteiro) + as trocas de exercício: uns 51 a 56 minutos.
    duracaoMin: 55,
    cardioDeBraco: true,
    aquecimento:
      "5 min de bike + 10 agachamentos no banco sem peso + 1 série de 8 com a barra vazia (ou metade da carga), soltando o ar na subida — essa série não leva cardio.",
    comoFazer: `Dia de perna pesada: carga que deixa 2 repetições sobrando no fim da série e ainda deixa soltar o ar na subida. No agachamento com barra, volte para a série só com o fôlego inteiro, falando frases inteiras. ${SEM_TEMPO}`,
    exercicios: [
      TRANSVERSO,
      {
        nome: "Agachamento com barra no suporte",
        series: "3",
        reps: "10–12",
        descanso: ENTRE,
        beneficio: "Força na perna inteira, com os maiores músculos do corpo trabalhando juntos.",
        equipamento: "Barra + anilhas no suporte",
        videoId: "rM6SDUdl9fs",
        grupos: ["perna"],
        carga: true,
        adaptacao:
          "Entra no lugar do leg press, que a academia não tem. Cansada ou insegura com a barra? Goblet com halter.",
        dica: DICA_JOELHO,
        diastase: {
          nivel: "cuidado",
          nota: "Carga que deixe soltar o ar na subida. Se precisar prender a respiração para subir, está pesada — volte para o goblet.",
        },
      },
      {
        nome: "Subida no step com halteres",
        series: "3",
        reps: "10 por perna",
        descanso: ENTRE,
        beneficio: "Perna e bumbum, uma perna de cada vez, no movimento de subir escada.",
        equipamento: "Step (ou banco baixo) + par de halteres",
        videoId: "KCu2QHbnIZE",
        grupos: ["perna"],
        carga: true,
        adaptacao:
          "Entra no lugar do agachamento búlgaro: o mesmo trabalho de uma perna por vez, com bem menos desequilíbrio.",
        dica: `${DICA_JOELHO} A força vem da perna de cima — sem dar impulso com a de baixo.`,
      },
      {
        nome: "Cadeira extensora (módulo da estação)",
        series: "3",
        reps: "12–15",
        descanso: ENTRE,
        beneficio: "Isola a frente da coxa, que dá firmeza ao joelho.",
        equipamento: "Estação de musculação — módulo extensora",
        videoId: "el3oHblB5DM",
        grupos: ["perna"],
        carga: true,
      },
      {
        nome: "Elevação pélvica no banco com halter",
        series: "3",
        reps: "12",
        descanso: ENTRE,
        beneficio: "Bumbum e parte de trás da coxa com carga, sem impacto nenhum.",
        equipamento: "Banco reto + halter (com uma toalha entre o halter e o quadril)",
        videoId: "ptK0azwOXwM",
        grupos: ["perna"],
        carga: true,
        adaptacao: "Entra no lugar da máquina de glúteo, que a academia não tem.",
        dica: "Solte o ar ao subir e aperte o bumbum lá em cima, sem arquear a lombar.",
      },
      {
        nome: "Adução em pé na polia baixa",
        series: "3",
        reps: "12 por perna",
        descanso: ENTRE,
        beneficio: "Parte interna da coxa com carga ajustável, puxando a perna para dentro.",
        equipamento: "Estação — polia baixa + tornozeleira de polia",
        videoId: "ivCztwt2Vdo",
        grupos: ["perna", "coxa-interna"],
        carga: true,
        adaptacao:
          "Precisa de uma tornozeleira que prenda no cabo. Se não tiver como prender, faça a adução deitada com caneleira no lugar.",
      },
      {
        nome: "Dead bug (deitada, alterna braço e perna)",
        series: "3",
        reps: "10 cada lado",
        descanso: ENTRE,
        beneficio: "Barriga firme por dentro, com pouca pressão na linha do meio.",
        equipamento: "Colchonete",
        videoId: "0loS0bRNqfs",
        grupos: ["cintura"],
        diastase: NOTA_DEAD_BUG,
      },
    ],
  },
  {
    diaSemana: 2,
    diaNome: "Terça",
    foco: "Costas e braços — definir",
    curto: "Costas + braços",
    tipo: "academia",
    // Mesma conta da segunda, sem a série de aproximação: uns 37 a 41 minutos.
    duracaoMin: 40,
    cardioSemBraco: true,
    aquecimento: "5 min de elíptico + círculos de ombro",
    comoFazer:
      "Carga moderada: termine cada série com 2 ou 3 repetições sobrando. Chegou ao maior número do card em todas as séries? Na próxima, suba o menor passo. Nada pesado acima da cabeça.",
    exercicios: [
      TRANSVERSO,
      {
        nome: "Puxada alta na polia (pegada aberta)",
        series: "3",
        reps: "12–15",
        descanso: ENTRE,
        beneficio: "Costas desenhadas e postura de ombro aberto, com carga moderada.",
        equipamento: "Estação — polia alta com barra",
        videoId: "mPmfwbc_svw",
        grupos: ["costas-bracos"],
        carga: true,
      },
      {
        nome: "Remada unilateral com halter (serrote)",
        series: "3",
        reps: "12 por lado",
        descanso: ENTRE,
        beneficio: "Um lado das costas de cada vez: define e acerta a diferença entre os lados.",
        equipamento: "Banco reto + halter",
        videoId: "m4h4jT9patY",
        grupos: ["costas-bracos"],
        carga: true,
        dica: "Joelho e mão apoiados no banco, costas retas. Solte o ar ao puxar.",
      },
      {
        nome: "Crucifixo inverso com halteres",
        series: "2",
        reps: "15",
        descanso: ENTRE,
        beneficio: "Parte de trás do ombro e meio das costas — tira o ombro da frente.",
        equipamento: "Banco ajustável inclinado + halteres leves",
        // Deitada de barriga para baixo no banco inclinado, como o card pede. O
        // vídeo de antes só mostrava em pé curvada, sem apoio — o que pesa mais
        // na lombar e na barriga.
        videoId: "neiVTL2U5Qo",
        grupos: ["costas-bracos"],
        carga: true,
        dica: "Deitada de barriga para baixo no banco inclinado (uns 30 a 45°), braços pendurados; abra os braços até a linha dos ombros soltando o ar.",
      },
      { ...TRICEPS_COICE, series: "2", reps: "15 por braço", descanso: ENTRE },
      {
        nome: "Pallof press com elástico",
        series: "2",
        reps: "12 por lado",
        descanso: ENTRE,
        beneficio:
          "Cintura firme sem dobrar nem girar a coluna — um jeito seguro de treinar a lateral da barriga com diástase.",
        equipamento: "Elástico do espaldar",
        videoId: "GC0NIcCGRvw",
        grupos: ["cintura"],
        dica: "Elástico preso na altura do peito. Empurre as mãos para a frente soltando o ar, sem deixar o tronco girar.",
      },
    ],
  },
  {
    diaSemana: 3,
    diaNome: "Quarta",
    foco: "Cintura + intervalado na bike",
    curto: "Cintura + bike",
    tipo: "academia",
    // Aquecimento e cintura, uns 28 minutos; o intervalado, com o pedal leve
    // antes e depois, uns 17: cerca de 45 — até uns 50 se o leve pedir 2 minutos.
    duracaoMin: 45,
    // A única sessão forte da semana, 48 h depois da perna A e 72 h antes da
    // perna B. Sem cardioSuave: a cintura vem antes do cansaço, com o cardio
    // normal entre as séries — e o motivo do "suave" é o Mounjaro.
    intensa: true,
    aquecimento: "5 min de bike leve",
    comoFazer:
      "A única sessão forte da semana. Primeiro a cintura, com calma e soltando o ar; o intervalado fica para o fim. Na bike, 2 minutos leves antes do primeiro forte. No forte, dá para falar só palavras soltas. O leve dura até o fôlego voltar — 1 minuto, ou até 2 se precisar; se não voltar, fique no leve ou pare por hoje. Terminou: 3 a 5 minutos de pedal leve, até conseguir falar frases inteiras, antes de descer. Enjoou ou dormiu muito mal? Hoje o forte vira leve. Doente (vômito, diarreia, febre): descanso.",
    exercicios: [
      TRANSVERSO,
      {
        nome: "Carregar um halter de um lado só (suitcase carry)",
        series: "2",
        reps: "40 s por lado",
        descanso: ENTRE,
        beneficio:
          "Andar com peso de um lado só obriga a cintura a segurar o tronco reto — é assim que ela firma.",
        equipamento: "Um halter ou kettlebell",
        videoId: "eNWz-S0dT9c",
        grupos: ["cintura"],
        carga: true,
        dica: "Ombros na mesma altura e tronco reto, sem entortar para o lado do peso.",
      },
      {
        nome: "Prancha inclinada no banco",
        series: "2",
        reps: "20–30 s",
        descanso: ENTRE,
        // Com os antebraços num banco de uns 45 cm o corpo fica a ~34° do chão,
        // e a parte do peso que a barriga segura cai só uns 15%; com as mãos no
        // banco e os braços esticados, ~47° e uns 30%. Daí o "um pouco menos".
        beneficio:
          "O trabalho da prancha com um pouco menos de peso sobre a barriga do que no chão, porque o corpo fica inclinado.",
        equipamento: "Banco reto",
        videoId: "wLjhAdBSFzY",
        grupos: ["cintura"],
        adaptacao:
          "Entra no lugar da prancha no chão. Comece com as mãos no banco e os braços esticados: o corpo inclina mais e a barriga segura menos peso. Com os antebraços no banco, como no vídeo, alivia só um pouco em relação ao chão.",
        diastase: {
          nivel: "cuidado",
          nota: "Olhe a barriga de lado em toda série: se formar um 'morrinho' no meio, desça do banco e faça o dead bug no lugar. Sem morrinho, pode seguir.",
        },
      },
      {
        nome: "Elevação pélvica apertando uma almofada",
        series: "3",
        reps: "15",
        descanso: ENTRE,
        beneficio:
          "A perna do dia, deitada e sem sacudir nada: bumbum e parte interna da coxa juntos.",
        equipamento: "Colchonete + almofada, toalha enrolada ou bola pequena entre os joelhos",
        videoId: "IY4On8Xb-J8",
        grupos: ["perna", "coxa-interna"],
        adaptacao:
          "Sem cadeira adutora na academia, apertar algo entre os joelhos é o que faz a parte interna da coxa trabalhar aqui.",
      },
      { ...PERDIGUEIRO, series: "2" },
      {
        nome: "Bike intervalada",
        series: "6 ciclos",
        reps: "1 min forte + 1 a 2 min leve",
        descanso: "—",
        beneficio: "O coração acelera bastante e o impacto é zero — o assoalho pélvico agradece.",
        equipamento: "Bike vertical ou horizontal (ou o elíptico)",
        videoId: "dMJ5LO5NwY8",
        semCardio: true,
        adaptacao:
          "Entra no lugar do HIIT de corrida na esteira: o mesmo estímulo para o coração, sem impacto.",
        dica: "Nas 2 primeiras semanas do completo, 4 ciclos. No forte, só palavras soltas; no leve, pedal solto até o fôlego voltar. Banco na altura em que o joelho fica quase esticado embaixo. Enjoou ou ficou tonta? Fique no leve e encerre. Veio tremor, suor frio ou fraqueza: desça com cuidado, sente e tome o açúcar rápido do card de segurança.",
      },
    ],
  },
  {
    diaSemana: 4,
    diaNome: "Quinta",
    foco: "Caminhada leve + alongamento",
    curto: "Caminhada",
    tipo: "caminhada",
    duracaoMin: 35,
    lembrete:
      "Dia do Mounjaro. Caminhada leve e água em goles ao longo do dia — os 200 ml por hora de sempre. Vomitou ou teve diarreia? Hoje é descanso.",
    exercicios: [
      {
        ...CAMINHADA,
        nome: "Caminhada leve",
        series: "1",
        reps: "30 min",
        descanso: "—",
        beneficio: "Mantém o corpo em movimento sem cobrar disposição de treino.",
      },
      ALONGAMENTO_ADUTOR,
      ALONGAMENTO_GERAL,
    ],
    observacao:
      "Dia leve de propósito: o Mounjaro tira a fome e o corpo se recupera da quarta. A caminhada leve pode ser em jejum, antes do café da manhã.",
  },
  {
    diaSemana: 5,
    diaNome: "Sexta",
    foco: "Costas, braços e cintura — calmo",
    curto: "Costas + cintura",
    tipo: "academia",
    // Mesma conta da terça, sem pressa entre as séries: uns 37 a 41 minutos.
    duracaoMin: 40,
    // Dia seguinte à aplicação: o cardio entre as séries fica só nas opções
    // que não sacodem o estômago — e, por ser dia de braço, sem o soco no ar.
    cardioSuave: true,
    cardioSemBraco: true,
    lembrete:
      "Dia seguinte ao Mounjaro, quando o enjoo costuma aparecer: tudo calmo e água em goles. Só enjoo leve? Caminhada leve no lugar — conta como treino. Vomitou, teve diarreia ou febre? Hoje é descanso e água em goles; se não passar, atendimento.",
    aquecimento: "5 min de elíptico leve",
    comoFazer:
      "Dia calmo: a carga da última vez neste exercício, ou um pouco menos, com 3 repetições sobrando e sem pressa entre as séries. Tudo sentada, em pé ou deitada de costas — nada de barriga apoiada no banco.",
    exercicios: [
      TRANSVERSO,
      {
        nome: "Remada baixa na polia (sentada)",
        series: "3",
        reps: "12–15",
        descanso: ENTRE,
        beneficio: "Meio das costas e ombros para trás, sentada e sem sacudir o estômago.",
        equipamento: "Estação — polia baixa",
        videoId: "f8AVh4VBbos",
        grupos: ["costas-bracos"],
        carga: true,
      },
      {
        nome: "Tríceps na corda (polia alta)",
        series: "3",
        reps: "12–15",
        descanso: ENTRE,
        beneficio: "A parte de trás do braço, a que você quer firmar, com carga moderada.",
        equipamento: "Estação — polia alta + corda",
        videoId: "KhK5HWJfsrQ",
        grupos: ["costas-bracos"],
        carga: true,
      },
      { ...ELEVACAO_LATERAL, series: "2", reps: "15", descanso: ENTRE },
      {
        nome: "Rosca martelo leve",
        series: "2",
        reps: "12–15",
        descanso: ENTRE,
        beneficio: "Frente do braço firme — uma rosca só, leve, sem buscar volume.",
        equipamento: "Par de halteres leves",
        videoId: "0qkQy8V2FC0",
        grupos: ["costas-bracos"],
        carga: true,
      },
      { ...DESLIZAMENTO_CALCANHAR, series: "3", descanso: ENTRE },
    ],
  },
  {
    diaSemana: 6,
    diaNome: "Sábado",
    foco: "Pernas B — bumbum, posterior e parte interna",
    curto: "Pernas B",
    tipo: "academia",
    // Mesma conta da segunda: uns 52 a 57 minutos.
    duracaoMin: 55,
    cardioDeBraco: true,
    aquecimento:
      "5 min de bike leve + 10 elevações pélvicas sem peso + 1 série de 8 no stiff com metade da carga — essa série não leva cardio.",
    comoFazer: `Dia de perna pesada: carga que deixa 2 repetições sobrando no fim da série e ainda deixa soltar o ar na subida. No stiff, volte para a série só com o fôlego inteiro, falando frases inteiras. ${SEM_TEMPO}`,
    exercicios: [
      TRANSVERSO,
      {
        nome: "Stiff com halteres",
        series: "3",
        reps: "10–12",
        descanso: ENTRE,
        beneficio: "Parte de trás da coxa e bumbum — a base das pernas fortes que o médico pediu.",
        equipamento: "Par de halteres",
        videoId: "zPhI_hpBuZE",
        grupos: ["perna"],
        carga: true,
        dica: "Coluna reta o tempo todo: desça só até onde ela continuar reta e solte o ar na subida.",
      },
      {
        nome: "Agachamento sumô com halter ou kettlebell",
        series: "3",
        reps: "12",
        descanso: ENTRE,
        beneficio:
          "Pés bem afastados e pontas para fora: o agachamento que mais trabalha a parte interna da coxa.",
        equipamento: "Um halter ou kettlebell, seguro com as duas mãos",
        videoId: "7CTbrHuL_b4",
        grupos: ["perna", "coxa-interna"],
        carga: true,
        dica: `${DICA_JOELHO} Solte o ar na subida.`,
      },
      {
        nome: "Afundo com halteres (parado no lugar)",
        series: "3",
        reps: "10 por perna",
        descanso: ENTRE,
        beneficio: "Frente da coxa e bumbum, uma perna de cada vez, sem sair do lugar.",
        equipamento: "Par de halteres",
        videoId: "7MKHBgJcX5I",
        grupos: ["perna"],
        carga: true,
        dica: `${DICA_JOELHO} Tronco em pé e joelho de trás descendo reto em direção ao chão. Solte o ar ao subir.`,
      },
      {
        nome: "Cadeira flexora (módulo da estação)",
        series: "3",
        reps: "12–15",
        descanso: ENTRE,
        beneficio: "Isola a parte de trás da coxa, que protege o joelho.",
        equipamento: "Estação de musculação — módulo flexora",
        videoId: "Zss6E3VU6X0",
        grupos: ["perna"],
        carga: true,
      },
      {
        nome: "Adução deitada de lado com caneleira",
        series: "3",
        reps: "15 por perna",
        descanso: ENTRE,
        beneficio: "Trabalho direto na parte interna da coxa, onde está a flacidez.",
        equipamento: "Caneleira + colchonete",
        videoId: "Vgw2jCzpyxY",
        grupos: ["perna", "coxa-interna"],
        carga: true,
        adaptacao: "Entra no lugar da cadeira adutora, que a academia não tem.",
      },
      PERDIGUEIRO,
    ],
  },
  {
    diaSemana: 0,
    diaNome: "Domingo",
    foco: "Caminhada ao ar livre + alongamento",
    curto: "Caminhada",
    tipo: "caminhada",
    // Caminhada, borboleta e alongamento dão uns 40 a 50 minutos. O rolo ficou
    // na observação: item opcional na lista deixava o dia em 75%.
    duracaoMin: 45,
    exercicios: [
      { ...CAMINHADA, series: "1", reps: "30–40 min", descanso: "—" },
      ALONGAMENTO_ADUTOR,
      ALONGAMENTO_GERAL,
    ],
    observacao:
      "Descanso ativo, em passo de passeio. Como é leve, pode ser em jejum, antes do café da manhã. Sobrou tempo? 5 a 10 minutos de rolo (o azul da academia) soltam o quadril e a lombar.",
  },
];

/* -------------------------------------------------------------------------- */
/* Planos disponíveis                                                         */
/* -------------------------------------------------------------------------- */

export type FaseTreino = "adaptacao" | "completo";

export type Plano = {
  id: FaseTreino;
  nome: string;
  resumo: string;
  detalhe: string;
  dias: WorkoutDay[];
  /**
   * Prefixo dos ids de check, para um plano não marcar o exercício do outro. O
   * id é a posição do exercício no dia, então semana nova pede prefixo novo: os
   * checks do treino antigo não podem cair num exercício novo que ficou na
   * mesma posição. Mudou em 29/09 ("ra"/"rc") e de novo em 12/10 ("da"/"dc"),
   * quando a semana virou treino todo dia. Os de antes ("", "a", "ra" e "rc")
   * continuam gravados no banco: nunca reaproveitar.
   */
  prefixo: string;
  /**
   * O cardio depois de cada série e o respiro mínimo antes da próxima. Desde
   * 12/10 o respiro vai até o fôlego voltar (dá para falar frases curtas); o
   * tempo daqui é só o piso.
   */
  entreSeries: { cardio: string; respiroMinimo: string };
};

/** Espaço que não quebra a linha (U+00A0). */
const NBSP = " ";
/** Junção invisível (U+2060): também não deixa a linha quebrar ali. */
const JUNTA = "⁠";

/** "4 idas", "1 caminhada" — o número nunca se separa da palavra. */
function quantos(n: number, um: string, varios: string): string {
  return `${n}${NBSP}${n === 1 ? um : varios}`;
}

/**
 * "Todo dia · 4 idas + 3 caminhadas · 30–40 min", contado nos próprios dias:
 * assim o resumo do plano não desencontra do "cerca de N min" de cada dia. A
 * faixa vai do dia mais curto ao mais longo, caminhadas incluídas; sem nenhum
 * dia com duração, fica sem faixa.
 *
 * Os caracteres invisíveis seguram as partes juntas numa tela estreita: o
 * espaço antes do "·", do "+" e do "min", e entre o número e a palavra, não
 * quebra (U+00A0), e a junção depois do travessão (U+2060) também não — o
 * "min" nunca fica sozinho na linha de baixo.
 */
function resumoDoPlano(dias: WorkoutDay[]): string {
  const comTreino = dias.filter((d) => d.tipo !== "descanso").length;
  const idas = dias.filter((d) => d.tipo === "academia").length;
  const caminhadas = dias.filter((d) => d.tipo === "caminhada").length;
  const partes = [
    comTreino === 7 ? "Todo dia" : quantos(comTreino, "dia", "dias"),
    `${quantos(idas, "ida", "idas")}${NBSP}+ ${quantos(caminhadas, "caminhada", "caminhadas")}`,
  ];
  const minutos = dias.flatMap((d) => (d.duracaoMin ? [d.duracaoMin] : []));
  if (minutos.length > 0) {
    const de = Math.min(...minutos);
    const ate = Math.max(...minutos);
    partes.push(`${de === ate ? de : `${de}–${JUNTA}${ate}`}${NBSP}min`);
  }
  return partes.join(`${NBSP}· `);
}

export const PLANOS: Record<FaseTreino, Plano> = {
  adaptacao: {
    id: "adaptacao",
    nome: "Adaptação",
    resumo: resumoDoPlano(TREINO_ADAPTACAO),
    detalhe:
      "Para começar sem odiar academia: 4 idas com máquinas e movimentos simples, 2 a 3 séries com carga leve e cardio curtinho entre as séries. Nos outros 3 dias, caminhada — todo dia tem treino.",
    dias: TREINO_ADAPTACAO,
    prefixo: "da",
    entreSeries: ENTRE_SERIES_ADAPTACAO,
  },
  completo: {
    id: "completo",
    nome: "Completo",
    resumo: resumoDoPlano(WORKOUTS),
    detalhe:
      "Pernas pesadas na segunda e no sábado, costas e braços na terça e na sexta, o intervalado na bike na quarta — a única sessão forte — e caminhada na quinta e no domingo. Passe para ele quando fizer as 4 idas da adaptação inteiras por 2 semanas seguidas, com a carga subindo e sem morrinho na barriga, escape de urina ou peso na vagina — se tiver fisioterapeuta pélvica, com o ok dela. Nas 2 primeiras semanas: 2 séries nos exercícios com carga, goblet no lugar da barra e 4 ciclos na bike.",
    dias: WORKOUTS,
    prefixo: "dc",
    entreSeries: ENTRE_SERIES_COMPLETO,
  },
};

export function planoDe(fase: FaseTreino): Plano {
  return PLANOS[fase] ?? PLANOS.adaptacao;
}

/** Dias de academia que têm pelo menos um exercício do grupo. */
export function diasCom(plano: Plano, grupo: Grupo): WorkoutDay[] {
  return plano.dias.filter(
    (d) => d.tipo === "academia" && d.exercicios.some((e) => e.grupos?.includes(grupo)),
  );
}

/** Exercícios do dia que levam o cardio entre as séries. */
export function comCardio(dia: WorkoutDay): Exercise[] {
  return dia.tipo === "academia" ? dia.exercicios.filter((e) => !e.semCardio) : [];
}

/**
 * "6 exercícios · cerca de 30 min" — a mesma legenda na tela inicial e no
 * treino. Caminhada é treino do dia, não "sem academia".
 */
export function legendaDoDia(dia: WorkoutDay): string {
  if (dia.tipo === "descanso") return "Descanso · alongamento opcional";
  const n = dia.exercicios.length;
  const itens =
    dia.tipo === "academia" ? `${n} ${n === 1 ? "exercício" : "exercícios"}` : "Caminhada";
  return dia.duracaoMin ? `${itens} · cerca de ${dia.duracaoMin} min` : itens;
}

/* -------------------------------------------------------------------------- */
/* O que você e o médico pediram                                              */
/* -------------------------------------------------------------------------- */

/** O que a tela conta no plano para mostrar que o pedido está atendido. */
export type Medida = Grupo | "caminhada" | "cardio";

/**
 * Quase tudo veio da orientação médica de 29/09. Costas e braços definidos e
 * treinar todos os dias foram pedidos dela (o segundo em 12/10, junto com os
 * 15 kg da perda de peso) — e o card diz isso. Um só para os dois planos: onde
 * a resposta muda com o plano, o texto diz.
 */
export const PEDIDOS_MEDICO: { pedido: string; resposta: string; medida?: Medida }[] = [
  {
    pedido: "Fortalecer bastante as pernas",
    resposta:
      "Perna 2 vezes por semana, segunda e sábado, com carga que sobe aos poucos — no completo, perna pesada — e 48 horas ou mais entre elas: o músculo cresce no descanso. Num terceiro dia, um exercício leve de perna.",
    medida: "perna",
  },
  {
    pedido: "Perda de peso — perder 15 kg",
    resposta:
      "Cardio entre as séries e caminhada nos dias sem academia; no completo, também o intervalado na bike. Quem segura o metabolismo enquanto o peso cai é o músculo — por isso a perna forte vem junto. Gordura não sai de um lugar só: barriga e braços afinam com o corpo todo.",
  },
  {
    pedido: "Parte interna da coxa, com flacidez",
    resposta:
      "Pelo menos 3 sessões por semana: sumô, adução e elevação pélvica apertando uma almofada. Cadeira adutora a academia não tem.",
    medida: "coxa-interna",
  },
  {
    pedido: `Diástase de ${DIASTASE_CM}`,
    resposta:
      "Só entra core de pouca pressão na linha do meio: transverso, dead bug, deslizamento de calcanhar, perdigueiro e pallof — e, no completo, carregar peso de um lado só e a prancha inclinada no banco, esta sempre com o teste do morrinho. Nada que empurre a barriga para fora — veja o card logo abaixo.",
  },
  {
    pedido: "Definir a cintura",
    resposta:
      "Transverso, dead bug, perdigueiro e pallof — e, no completo, carregar peso de um lado só. Com honestidade: a cintura afina com a gordura saindo, o transverso firme e a postura — não com abdominal.",
    medida: "cintura",
  },
  {
    pedido: "Costas e braços definidos (pedido seu)",
    resposta:
      "Na adaptação, carga leve, para aprender o movimento. No completo, carga moderada: 12 a 15 repetições, terminando com 2 ou 3 sobrando. Ficou fácil chegar em 15, sobe um pouco. Nada pesado acima da cabeça. O braço afina com a gordura do corpo todo saindo; a carga é o que desenha.",
    medida: "costas-bracos",
  },
  {
    pedido: "Cardio rápido entre as séries",
    resposta:
      "Depois de cada série, 30 a 40 s de cardio sem pular e um respiro até o fôlego voltar — quando der para falar frases curtas, no mínimo 15 a 20 s. Nos dias de perna, cardio de braço.",
    medida: "cardio",
  },
  {
    pedido: "Treinar todos os dias (pedido seu)",
    resposta:
      "Todo dia tem treino: academia nas idas e caminhada nos outros dias. Os músculos se revezam e a sessão forte é uma só, para dar tempo de recuperar. Dia de doença é descanso — não quebra o plano.",
    medida: "caminhada",
  },
];

/* -------------------------------------------------------------------------- */
/* Diástase                                                                   */
/* -------------------------------------------------------------------------- */

export const DIASTASE = {
  fora: [
    "Prancha completa (na ponta dos pés)",
    "Mountain climber",
    "Abdominal clássico (crunch)",
    "Sit-up (subir o tronco inteiro)",
    "Elevação das duas pernas",
    "Bicicleta no ar",
    "Twist russo",
    "Canivete",
    "Burpee",
    "Flexão lateral de tronco com peso",
    "Saltos",
  ],
  porqueFora:
    "Todos colocam pressão demais na linha do meio da barriga — ficam de fora por cautela, até a fisioterapeuta liberar.",
  respirar:
    "Solte o ar pela boca, em biquinho, e feche o zíper da barriga de baixo para cima — no esforço de todo exercício. Se precisar prender a respiração para vencer a carga, ela está pesada.",
  morrinho:
    "Olhe a barriga de lado durante o exercício. Se aparecer um 'morrinho' no meio, é pressão demais para agora: diminua a carga ou a amplitude, ou troque o exercício.",
  // Peso ou "bola" na vagina é sinal de prolapso, motivo de encaminhar à fisio
  // pélvica (Goom, Donnelly e Brockwell, 2019) — o mesmo de SEGURANCA.
  fisio:
    "Com essa medida, vale ter uma fisioterapeuta pélvica acompanhando: ela mede de novo, confere o assoalho pélvico e diz quando dá para avançar. Escape de urina ou sensação de peso ou de 'bola' na vagina no esforço também são motivo para procurar. E leve a medida para a consulta da cirurgia plástica.",
};

/* -------------------------------------------------------------------------- */
/* O que mudou                                                                */
/* -------------------------------------------------------------------------- */

/** Dia dos ajustes que ela pediu: treino todo dia, pernas musculosas, força. */
export const AJUSTE_DATA = "12/10";

/**
 * Nada é trocado em silêncio: cada mudança de 12/10, com o porquê. Vem primeiro
 * na tela. O `oQue` é a key da lista — não pode repetir nem aqui nem na de 29/09.
 */
export const MUDANCAS_TREINO_1210: { oQue: string; porque: string }[] = [
  {
    oQue: "Treino todo dia",
    porque:
      "Pedido seu. Academia nas idas e caminhada nos outros dias; na adaptação, umas 4 h por semana, quase metade caminhando. O Dr. Henry falava em começar com 3 h e chegar a 5–6 h — vale mostrar este plano a ele na próxima consulta.",
  },
  {
    oQue: "Perna 2 vezes por semana, em vez de perna em toda ida",
    porque:
      "Pernas musculosas pedem carga e descanso: segunda e sábado são de perna, com 48 h ou mais entre elas.",
  },
  {
    oQue: "Costas e braços no completo: carga moderada, 12 a 15 repetições",
    porque:
      "Pedido seu: costas e braços definidos. Antes era carga leve e 15 a 20 repetições. Na adaptação, a carga segue leve, para aprender o movimento.",
  },
  {
    oQue: "Respiro pelo fôlego",
    porque:
      "O respiro de tempo fixo virou 'até o fôlego voltar', com o mínimo de antes. Voltar pelo fôlego evita acumular cansaço.",
  },
  {
    oQue: "Uma sessão forte só, na quarta",
    porque:
      "Treino forte em dias seguidos não dá tempo de o músculo se recuperar. O intervalado saiu da quinta, dia do Mounjaro, e ficou longe das pernas pesadas.",
  },
  {
    oQue: "Cardio de braço nos dias de perna",
    porque:
      "Bike, step, marcha e elíptico cansam a perna da série seguinte. Nos dias de costas e braços é o contrário: sem soco no ar nem polichinelo, que cansam o braço.",
  },
  {
    oQue: "Domingo deixou de ser descanso",
    porque:
      "Caminhada ao ar livre e alongamento: descanso ativo. Doente, descanse de verdade.",
  },
  {
    oQue: "Saíram o afundo lateral, o goblet, o sumô leve, o circuito de sexta e a caminhada inclinada de sábado",
    porque:
      "Com perna pesada 2 vezes por semana, cada sessão de perna ficou com os exercícios que mais rendem; o goblet segue como plano B da barra; o sábado virou perna e o domingo, caminhada.",
  },
  {
    oQue: "Dica de joelho nos agachamentos, afundos e no step",
    porque: "Joelho na direção da ponta do pé, sem entrar para dentro.",
  },
  {
    oQue: "Sinais para parar e procurar ajuda dentro do treino",
    porque: "Antes eles ficavam só na Rotina.",
  },
];

/** Dia em que chegou a orientação do médico que refez os dois planos. */
export const ORIENTACAO_DATA = "29/09";

/**
 * Histórico: o que mudou em 29/09, com a orientação do médico. O que a semana
 * de 12/10 desfez saiu daqui (perna em toda ida, as 5 idas do completo, os 30 a
 * 35 minutos da adaptação) — está na lista de cima.
 */
export const MUDANCAS_TREINO: { oQue: string; porque: string }[] = [
  {
    oQue: "Cardio rápido entre todas as séries",
    porque:
      "Pedido do médico para acelerar a perda de gordura. O descanso parado virou 30 a 40 s de cardio sem pular.",
  },
  {
    oQue: "Parte interna da coxa em 3 ou mais dias por semana",
    porque:
      "Pela flacidez nessa região. Sem cadeira adutora, entram sumô, adução com caneleira, adução na polia e a elevação pélvica apertando uma almofada.",
  },
  {
    oQue: "Saíram a prancha no chão e o mountain climber",
    porque: `Com diástase de ${DIASTASE_CM}, os dois pressionam demais a linha do meio da barriga. No lugar: transverso, dead bug, perdigueiro, pallof e a prancha inclinada no banco.`,
  },
  {
    oQue: "A prancha nos joelhos saiu da adaptação",
    porque:
      "Primeiro vêm a respiração com transverso e o perdigueiro. A prancha, inclinada no banco, fica para o plano completo.",
  },
  {
    oQue: "O HIIT de corrida na esteira virou intervalado na bike",
    porque:
      "Correr é impacto, e impacto pesa no assoalho pélvico e na diástase. Na bike o coração acelera do mesmo jeito.",
  },
  {
    oQue: "Saíram supino, voador e desenvolvimento de ombro",
    porque:
      "O treino de cima ficou com o que puxa — costas e a parte de trás do ombro, que seguram a postura de quem carrega bebê — e nada pesado acima da cabeça. Em 12/10, no completo, a carga de costas e braços passou a moderada — veja acima.",
  },
  {
    oQue: "Menos bíceps: saíram rosca direta, rosca alternada e tríceps testa",
    porque:
      "Fica uma rosca só, a martelo e leve, e o tríceps com corda e coice. Braço firme, sem virar braço grande.",
  },
  {
    oQue: "Saíram o coice de glúteo, a abdução com caneleira e a panturrilha",
    porque:
      "Para caber a parte interna da coxa e o cardio sem a sessão ficar longa demais. O bumbum segue com stiff, elevação pélvica, afundo e subida no step.",
  },
  {
    oQue: "O agachamento búlgaro virou subida no step",
    porque: "O mesmo trabalho de uma perna por vez, com bem menos desequilíbrio.",
  },
  {
    oQue: "Saiu a promessa de queimar a gordura da barriga",
    porque:
      "Gordura não sai de um lugar só. A barriga afina com a gordura do corpo todo diminuindo, o transverso firme e a postura.",
  },
];
