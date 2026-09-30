import { PERFIL } from "./protocol";
import { ENTRE_SERIES_ADAPTACAO, TREINO_ADAPTACAO } from "./workouts-adaptacao";
import {
  ALONGAMENTO_ADUTOR,
  ALONGAMENTO_GERAL,
  DESLIZAMENTO_CALCANHAR,
  NOTA_DEAD_BUG,
  NOTA_PERDIGUEIRO,
  TRANSVERSO,
} from "./workouts-comum";

/**
 * Treino da Milena — orientação do médico recebida em 29/09/2026.
 *
 * O que todo dia de academia precisa ter, nos dois planos:
 * - perna (o médico pediu pernas bem fortes);
 * - cardio rápido e sem pular depois de TODA série, para a perda de peso;
 * - parte interna da coxa (flacidez) em pelo menos 3 sessões por semana;
 * - core de pouca pressão na linha do meio da barriga, soltando o ar no esforço;
 * - costas e braços com carga leve e muitas repetições: definidos, não grandes.
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
  /** Como a sessão anda quando foge do padrão (circuito, intervalado...). */
  comoFazer?: string;
  /**
   * Quinta (aplicação do Mounjaro) e sexta: o cardio entre as séries fica só
   * nas opções que não sacodem o estômago — o enjoo costuma vir nesses dias.
   */
  cardioSuave?: boolean;
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
};

/**
 * Pedido do médico: depois de cada série, um cardio rápido. Todos sem pular —
 * impacto pesa na diástase e no assoalho pélvico do pós-parto.
 */
export const CARDIO_ENTRE_SERIES: { porque: string; opcoes: OpcaoCardio[] } = {
  porque:
    "O descanso parado vira movimento: o coração fica acelerado a sessão toda, e o treino gasta mais no mesmo tempo. Sem pular — impacto pesa no assoalho pélvico e na diástase.",
  opcoes: [
    {
      nome: "Polichinelo sem salto",
      curto: "polichinelo",
      como: "Abra um pé para o lado enquanto os braços sobem, volte e troque de lado.",
      videoId: "4Tcu8Y4iVsY",
      suave: false,
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

/** Opções que valem no dia: todas, ou só as suaves na quinta e na sexta. */
export function opcoesCardio(dia: WorkoutDay): OpcaoCardio[] {
  const todas = CARDIO_ENTRE_SERIES.opcoes;
  return dia.cardioSuave ? todas.filter((o) => o.suave) : todas;
}

/* -------------------------------------------------------------------------- */
/* Plano completo                                                             */
/* -------------------------------------------------------------------------- */

/** Mais cardio e menos respiro que na adaptação: aqui o corpo já se acostumou. */
export const ENTRE_SERIES_COMPLETO = { cardio: "40 s", respiro: "15 s" };

const ENTRE = `cardio ${ENTRE_SERIES_COMPLETO.cardio} + respiro ${ENTRE_SERIES_COMPLETO.respiro}`;

export const WORKOUTS: WorkoutDay[] = [
  {
    diaSemana: 1,
    diaNome: "Segunda",
    foco: "Pernas A — bumbum, posterior e parte interna da coxa",
    curto: "Pernas A",
    tipo: "academia",
    // Aquecimento + séries × (execução + cardio + respiro) + as trocas de
    // exercício: uns 44 a 49 minutos.
    duracaoMin: 50,
    aquecimento: "5 min de bike leve + 10 elevações pélvicas sem peso",
    exercicios: [
      TRANSVERSO,
      {
        nome: "Stiff com halteres",
        series: "3",
        reps: "12",
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
        dica: "Joelhos na direção das pontas dos pés. Solte o ar na subida.",
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
        nome: "Cadeira flexora (módulo da estação)",
        series: "3",
        reps: "15",
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
    foco: "Costas e braços — definir sem crescer",
    curto: "Costas + braços",
    tipo: "academia",
    // Mesma conta da segunda: uns 41 a 46 minutos.
    duracaoMin: 45,
    aquecimento: "5 min de elíptico + círculos de ombro",
    comoFazer:
      "Carga leve a moderada: termine cada série com 2 ou 3 repetições sobrando. Nada de série pesada de poucas repetições.",
    exercicios: [
      TRANSVERSO,
      {
        nome: "Agachamento goblet (halter ou kettlebell)",
        series: "3",
        reps: "15",
        descanso: ENTRE,
        beneficio:
          "A perna entra em todo dia de academia, como o médico pediu — hoje num agachamento moderado.",
        equipamento: "Halter ou kettlebell",
        videoId: "ge1vdJRP0UA",
        grupos: ["perna"],
        carga: true,
        adaptacao:
          "Versão do agachamento com o peso na frente do peito: protege mais a lombar e não depende de barra.",
        dica: "Solte o ar na subida.",
      },
      {
        nome: "Puxada alta na polia (pegada aberta)",
        series: "2",
        reps: "15–20",
        descanso: ENTRE,
        beneficio: "Costas desenhadas e postura de ombro aberto, com carga leve.",
        equipamento: "Estação — polia alta com barra",
        videoId: "mPmfwbc_svw",
        grupos: ["costas-bracos"],
        carga: true,
      },
      {
        nome: "Remada unilateral com halter (serrote)",
        series: "2",
        reps: "15 por lado",
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
        reps: "15–20",
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
      {
        nome: "Tríceps na corda (polia alta)",
        series: "2",
        reps: "15–20",
        descanso: ENTRE,
        beneficio: "A parte de trás do braço, a que você quer firmar, com carga leve.",
        equipamento: "Estação — polia alta + corda",
        videoId: "KhK5HWJfsrQ",
        grupos: ["costas-bracos"],
        carga: true,
      },
      {
        nome: "Tríceps coice com halter",
        series: "2",
        reps: "15 por braço",
        descanso: ENTRE,
        beneficio: "Mira o 'tchauzinho' — a parte de trás do braço — com halter leve.",
        equipamento: "Banco reto + halter leve",
        // Um braço por vez, joelho e mão no banco. O de antes era com os dois
        // braços, em pé e curvada.
        videoId: "gZhDheVmdf8",
        grupos: ["costas-bracos"],
        carga: true,
        dica: "Joelho e mão do mesmo lado apoiados no banco, costas retas e cotovelo colado ao corpo; estique o braço para trás soltando o ar. Um braço de cada vez.",
      },
      {
        nome: "Rosca martelo leve",
        series: "2",
        reps: "15",
        descanso: ENTRE,
        beneficio: "Frente do braço firme — uma rosca só, leve, sem buscar volume.",
        equipamento: "Par de halteres leves",
        videoId: "0qkQy8V2FC0",
        grupos: ["costas-bracos"],
        carga: true,
      },
    ],
  },
  {
    diaSemana: 3,
    diaNome: "Quarta",
    foco: "Pernas B — frente da coxa e parte interna",
    curto: "Pernas B",
    tipo: "academia",
    // Mesma conta da segunda: uns 47 a 52 minutos.
    duracaoMin: 50,
    aquecimento: "5 min de bike + 10 agachamentos no banco sem peso",
    exercicios: [
      TRANSVERSO,
      {
        nome: "Agachamento com barra no suporte",
        series: "3",
        reps: "12",
        descanso: ENTRE,
        beneficio: "Força na perna inteira, com os maiores músculos do corpo trabalhando juntos.",
        equipamento: "Barra + anilhas no suporte",
        videoId: "rM6SDUdl9fs",
        grupos: ["perna"],
        carga: true,
        adaptacao:
          "Entra no lugar do leg press, que a academia não tem. Cansada ou insegura com a barra? Goblet com halter.",
        diastase: {
          nivel: "cuidado",
          nota: "Carga que deixe soltar o ar na subida. Se precisar prender a respiração para subir, está pesada — volte para o goblet.",
        },
      },
      {
        nome: "Afundo lateral com halter",
        series: "3",
        reps: "10 por lado",
        descanso: ENTRE,
        beneficio: "Abre a perna para o lado: a parte interna da coxa trabalha esticando e firmando.",
        equipamento: "Halteres leves (um em cada mão, ou um só no peito)",
        videoId: "Cy51YCM6BnY",
        grupos: ["perna", "coxa-interna"],
        carga: true,
        dica: "O peso vai para a perna que dobra; a outra fica esticada, com o pé inteiro no chão.",
      },
      {
        nome: "Cadeira extensora (módulo da estação)",
        series: "3",
        reps: "15",
        descanso: ENTRE,
        beneficio: "Isola a frente da coxa, que dá firmeza ao joelho.",
        equipamento: "Estação de musculação — módulo extensora",
        videoId: "el3oHblB5DM",
        grupos: ["perna"],
        carga: true,
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
        dica: "A força vem da perna de cima — sem dar impulso com a de baixo.",
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
        nome: "Perdigueiro (bird dog)",
        series: "3",
        reps: "10 cada lado",
        descanso: ENTRE,
        beneficio: "Costas e barriga trabalhando juntas, em quatro apoios, com pouca pressão na linha do meio.",
        equipamento: "Colchonete",
        videoId: "Nm8onc8ndVw",
        grupos: ["cintura"],
        diastase: NOTA_PERDIGUEIRO,
      },
    ],
  },
  {
    diaSemana: 4,
    diaNome: "Quinta",
    foco: "Cintura + cardio intervalado de baixo impacto",
    curto: "Cintura + cardio",
    tipo: "academia",
    // Os 12 minutos do intervalado pesam: com a cintura, uns 43 a 45 minutos.
    duracaoMin: 45,
    cardioSuave: true,
    lembrete:
      "Dia do Mounjaro: nada que sacuda o estômago. Água em goles — os 200 ml por hora continuam valendo. Se o enjoo apertar, troque a sessão por uma caminhada leve.",
    aquecimento: "5 min de bike bem leve",
    comoFazer:
      "Primeiro o intervalado; depois a cintura, com o cardio entre as séries na bike, no elíptico ou em marcha.",
    exercicios: [
      TRANSVERSO,
      {
        nome: "Bike intervalada",
        series: "6 ciclos",
        reps: "1 min forte + 1 min leve",
        descanso: "—",
        beneficio: "O coração acelera bastante e o impacto é zero — o assoalho pélvico agradece.",
        equipamento: "Bike vertical ou horizontal (ou o elíptico)",
        videoId: "dMJ5LO5NwY8",
        semCardio: true,
        adaptacao:
          "Entra no lugar do HIIT de corrida na esteira: o mesmo estímulo para o coração, sem impacto.",
        dica: "'Forte' é quando conversar fica difícil, mas não impossível. Enjoou? Fique no leve.",
      },
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
        nome: "Dead bug (deitada, alterna braço e perna)",
        series: "2",
        reps: "10 cada lado",
        descanso: ENTRE,
        beneficio: "Barriga firme por dentro, com pouca pressão na linha do meio.",
        equipamento: "Colchonete",
        videoId: "0loS0bRNqfs",
        grupos: ["cintura"],
        diastase: NOTA_DEAD_BUG,
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
    ],
  },
  {
    diaSemana: 5,
    diaNome: "Sexta",
    foco: "Pernas C — corpo todo em circuito",
    curto: "Circuito",
    tipo: "academia",
    // Em circuito não há troca de aparelho entre as séries: uns 38 a 42 minutos.
    duracaoMin: 40,
    cardioSuave: true,
    lembrete:
      "Dia seguinte ao Mounjaro, quando o enjoo costuma aparecer: tudo calmo e água em goles. Não está bem? Caminhada leve no lugar — conta como treino.",
    aquecimento: "5 min de elíptico leve",
    comoFazer:
      "Depois da respiração, em circuito: uma série de cada exercício, na ordem, com o cardio entre eles. Terminou a lista, respire 1 minuto e comece a próxima volta — são 3 voltas.",
    exercicios: [
      TRANSVERSO,
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
        dica: "Tronco em pé e joelho de trás descendo reto em direção ao chão. Solte o ar ao subir.",
      },
      {
        nome: "Agachamento sumô leve",
        series: "3",
        reps: "15",
        descanso: ENTRE,
        beneficio: "Mais uma vez na semana para a parte interna da coxa, agora com carga leve.",
        equipamento: "Kettlebell ou halter leve",
        videoId: "7CTbrHuL_b4",
        grupos: ["perna", "coxa-interna"],
        carga: true,
      },
      {
        nome: "Remada baixa na polia (sentada)",
        series: "3",
        reps: "15",
        descanso: ENTRE,
        beneficio: "Meio das costas e ombros para trás, sentada e sem sacudir o estômago.",
        equipamento: "Estação — polia baixa",
        videoId: "f8AVh4VBbos",
        grupos: ["costas-bracos"],
        carga: true,
      },
      {
        nome: "Elevação lateral leve",
        series: "3",
        reps: "15",
        descanso: ENTRE,
        beneficio: "Ombro desenhado com halter bem leve — perto dele, a cintura parece mais fina.",
        equipamento: "Par de halteres leves",
        videoId: "ORparUDksUk",
        grupos: ["costas-bracos"],
        carga: true,
      },
      { ...DESLIZAMENTO_CALCANHAR, series: "3", descanso: ENTRE },
    ],
  },
  {
    diaSemana: 6,
    diaNome: "Sábado",
    foco: "Caminhada inclinada + alongamento",
    curto: "Caminhada",
    tipo: "caminhada",
    duracaoMin: 45,
    exercicios: [
      {
        nome: "Caminhada inclinada na esteira",
        series: "1",
        reps: "30–40 min",
        descanso: "—",
        beneficio:
          "Gasta bastante em ritmo de conversa e sem impacto. Aeróbico regular também ajuda o fígado e a pressão.",
        equipamento: "Esteira",
        // Animação curta: esteira inclinada, tronco em pé e braços soltos, sem
        // segurar no painel. O vídeo de antes era só conversa sobre vantagens.
        videoId: "uqR_AdvB_h8",
        semCardio: true,
        dica: "Inclinação que acelere a respiração sem tirar a conversa. Inclinada já não é leve: faça dentro da janela alimentar.",
      },
      ALONGAMENTO_ADUTOR,
      ALONGAMENTO_GERAL,
    ],
    observacao: "Sem se segurar no painel da esteira: se precisar, diminua a inclinação.",
  },
  {
    diaSemana: 0,
    diaNome: "Domingo",
    foco: "Descanso",
    curto: "Descanso",
    tipo: "descanso",
    exercicios: [
      {
        ...ALONGAMENTO_GERAL,
        nome: "Alongamento leve (opcional)",
        reps: "10 min",
        beneficio: "Só se der vontade. Descansar também faz parte do resultado.",
      },
      {
        nome: "Liberação com o rolo (opcional)",
        series: "1",
        reps: "5–10 min",
        descanso: "—",
        beneficio: "Solta a musculatura da semana e alivia quadril e lombar.",
        equipamento: "Foam roller (rolo azul da academia)",
        videoId: "xGEo2H6jSYk",
        semCardio: true,
      },
    ],
    observacao: "Domingo é descanso de verdade. Se der vontade de se mexer, só caminhada — nada de academia.",
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
   * Prefixo dos ids de check, para um plano não marcar o exercício do outro.
   * Mudou em 29/09 ("ra"/"rc"): os checks do treino antigo não podem cair num
   * exercício novo que ficou na mesma posição.
   */
  prefixo: string;
  /** Quanto dura o cardio e o respiro depois de cada série neste plano. */
  entreSeries: { cardio: string; respiro: string };
};

/**
 * "3 idas por semana · 30–35 min", contado nos próprios dias de academia:
 * assim o resumo do plano não desencontra do "cerca de N min" de cada dia.
 *
 * Os caracteres invisíveis seguram as partes juntas numa tela estreita: o
 * espaço   antes do "·" e do "min" não quebra, e o ⁠ depois do
 * travessão também não — o "min" nunca fica sozinho na linha de baixo.
 */
function resumoDoPlano(dias: WorkoutDay[]): string {
  const idas = dias.filter((d) => d.tipo === "academia");
  const minutos = idas.flatMap((d) => (d.duracaoMin ? [d.duracaoMin] : []));
  const de = Math.min(...minutos);
  const ate = Math.max(...minutos);
  const faixa = de === ate ? `${de}` : `${de}–⁠${ate}`;
  return `${idas.length} ${idas.length === 1 ? "ida" : "idas"} por semana · ${faixa} min`;
}

export const PLANOS: Record<FaseTreino, Plano> = {
  adaptacao: {
    id: "adaptacao",
    nome: "Adaptação",
    resumo: resumoDoPlano(TREINO_ADAPTACAO),
    detalhe:
      "Para começar sem odiar academia: máquinas e movimentos simples, 2 a 3 séries com carga leve e um cardio curtinho entre as séries. Nos outros dias, caminhada.",
    dias: TREINO_ADAPTACAO,
    prefixo: "ra",
    entreSeries: ENTRE_SERIES_ADAPTACAO,
  },
  completo: {
    id: "completo",
    nome: "Completo",
    resumo: resumoDoPlano(WORKOUTS),
    detalhe:
      "Perna em todas as idas, costas e braços leves, cintura com intervalado na bike e caminhada inclinada no sábado. Vale quando as 3 idas da adaptação já parecerem fáceis.",
    dias: WORKOUTS,
    prefixo: "rc",
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

/** "6 exercícios · cerca de 30 min" — a mesma legenda na tela inicial e no treino. */
export function legendaDoDia(dia: WorkoutDay): string {
  if (dia.tipo === "descanso") return "Descanso · alongamento opcional";
  const n = dia.exercicios.length;
  const itens =
    dia.tipo === "academia" ? `${n} ${n === 1 ? "exercício" : "exercícios"}` : "Sem academia";
  return dia.duracaoMin ? `${itens} · cerca de ${dia.duracaoMin} min` : itens;
}

/* -------------------------------------------------------------------------- */
/* O que você e o médico pediram                                              */
/* -------------------------------------------------------------------------- */

/** O que a tela conta no plano para mostrar que o pedido está atendido. */
export type Medida = Grupo | "caminhada" | "cardio";

/**
 * Quase tudo veio da orientação médica de 29/09; costas e braços "definidos,
 * mas magros" foi pedido dela — e o card diz isso.
 */
export const PEDIDOS_MEDICO: { pedido: string; resposta: string; medida?: Medida }[] = [
  {
    pedido: "Fortalecer bastante as pernas",
    resposta:
      "Perna em todo dia de academia, nos dois planos: agachamentos, cadeiras extensora e flexora, elevação pélvica e subida no step — e, no completo, também stiff e afundo.",
    medida: "perna",
  },
  {
    pedido: "Perda de peso",
    resposta:
      "Cardio entre as séries e caminhada nos outros dias; no completo, também intervalado na bike e caminhada inclinada. E quem segura o metabolismo enquanto o peso cai é o músculo — por isso a perna forte vem junto.",
    medida: "caminhada",
  },
  {
    pedido: "Parte interna da coxa, com flacidez",
    resposta:
      "Pelo menos 3 sessões por semana: sumô, adução deitada de lado e elevação pélvica apertando uma almofada — e, no completo, também afundo lateral e adução na polia. Cadeira adutora a academia não tem.",
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
    pedido: "Costas e braços definidos, mas magros (pedido seu)",
    resposta:
      "Carga leve a moderada, 15 a 20 repetições e poucas séries, sem desenvolvimento pesado acima da cabeça. Braço grande pede carga pesada, muitas séries e comida sobrando — o contrário deste plano.",
    medida: "costas-bracos",
  },
  {
    pedido: "Cardio rápido entre as séries",
    resposta:
      "Depois de cada série, 30 a 40 s de cardio sem pular, 15 a 20 s de respiro e a próxima série. Vem marcado em cada exercício.",
    medida: "cardio",
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
/* O que mudou em 29/09                                                       */
/* -------------------------------------------------------------------------- */

/** Dia em que chegou a orientação do médico que refez os dois planos. */
export const ORIENTACAO_DATA = "29/09";

/** Nada é trocado em silêncio: cada mudança do plano novo, com o porquê. */
export const MUDANCAS_TREINO: { oQue: string; porque: string }[] = [
  {
    oQue: "Cardio rápido entre todas as séries",
    porque:
      "Pedido do médico para acelerar a perda de gordura. O descanso parado virou 30 a 40 s de cardio sem pular.",
  },
  {
    oQue: "Perna em todo dia de academia, nos dois planos",
    porque:
      "O médico pediu pernas bem fortes. E é o músculo que segura o metabolismo enquanto o peso cai.",
  },
  {
    oQue: "Parte interna da coxa em 3 ou mais dias por semana",
    porque:
      "Pela flacidez nessa região. Sem cadeira adutora, entram sumô, adução com caneleira, afundo lateral, adução na polia e a elevação pélvica apertando uma almofada.",
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
      "Você pediu costas e braços definidos, mas magros. O treino de cima virou costas e tríceps leves, com 15 a 20 repetições, e nada pesado acima da cabeça.",
  },
  {
    oQue: "Menos bíceps: saíram rosca direta, rosca alternada e tríceps testa",
    porque:
      "Fica uma rosca só, a martelo e leve, e o tríceps com corda e coice. Braço firme, sem virar braço grande.",
  },
  {
    oQue: "Saíram o coice de glúteo, a abdução com caneleira e a panturrilha",
    porque:
      "Para caber a parte interna da coxa e o cardio sem a sessão passar de uns 50 minutos. O bumbum segue com stiff, elevação pélvica, afundo e subida no step.",
  },
  {
    oQue: "O agachamento búlgaro virou subida no step",
    porque: "O mesmo trabalho de uma perna por vez, com bem menos desequilíbrio.",
  },
  {
    oQue: "Completo: de 6 dias de academia para 5, mais a caminhada inclinada no sábado",
    porque:
      "Com perna em todo dia de academia, cinco idas já dão bastante trabalho. O sábado fica para o aeróbico, sem carga.",
  },
  {
    oQue: "Adaptação: de 25 para 30 a 35 minutos",
    porque:
      "O cardio entre as séries ocupa o lugar do descanso, e cada ida ganhou parte interna da coxa e core de pouca pressão na barriga.",
  },
  {
    oQue: "Saiu a promessa de queimar a gordura da barriga",
    porque:
      "Gordura não sai de um lugar só. A barriga afina com a gordura do corpo todo diminuindo, o transverso firme e a postura.",
  },
];
