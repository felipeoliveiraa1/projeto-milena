import type { Exercise, WorkoutDay } from "./workouts";
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
 * Fase de adaptação — continua sendo o padrão, porque ela não gosta de
 * academia e o plano cheio de cara é o caminho mais curto para largar.
 *
 * Em 29/09/2026 o médico pediu perna forte, parte interna da coxa, cuidado com
 * a diástase e cardio rápido entre as séries. Nos ajustes de 12/10, a pedido
 * dela, a semana virou treino todo dia, com o mesmo esqueleto do completo:
 * - 4 idas curtas, de uns 30 a 35 minutos: pernas na segunda e no sábado,
 *   costas e braços na terça e, na sexta, costas, braços e cintura com calma;
 * - 3 dias de caminhada: firme na quarta (o aeróbico da semana), leve na
 *   quinta (dia do Mounjaro) e ao ar livre no domingo — umas 4 h na semana,
 *   quase metade caminhando;
 * - parte interna da coxa em 3 idas e core de pouca pressão na linha do meio
 *   da barriga em todas;
 * - 30 s de cardio sem pular depois de cada série e o respiro até o fôlego
 *   voltar, nunca menos de 20 s. Nos dias de perna, o cardio é de braço.
 *
 * Regras de sempre: carga leve (a que deixa terminar a série conversando),
 * soltar o ar no esforço e nada que empurre a barriga para fora.
 */

/** Cardio e respiro mínimo depois de cada série. Mais curto que no completo: é começo. */
export const ENTRE_SERIES_ADAPTACAO = { cardio: "30 s", respiroMinimo: "20 s" };

/** A pílula de cada exercício. Desde 12/10 o respiro vai até o fôlego voltar. */
const ENTRE = `cardio ${ENTRE_SERIES_ADAPTACAO.cardio} + respiro pelo fôlego`;

/** A caminhada de sempre, de 30 minutos — cada dia muda o ritmo. */
const CAMINHADA_30: Exercise = { ...CAMINHADA, series: "1", reps: "30 min", descanso: "—" };

const CADEIRA_FLEXORA: Exercise = {
  nome: "Cadeira flexora (módulo da estação)",
  series: "2",
  reps: "15",
  descanso: ENTRE,
  beneficio: "A parte de trás da coxa, que segura o joelho e sustenta o bumbum.",
  equipamento: "Estação — módulo flexora",
  videoId: "Zss6E3VU6X0",
  grupos: ["perna"],
  carga: true,
};

/** Nas duas pernas da semana: 3 séries na segunda e 2 no sábado. */
const AGACHAMENTO_NO_BANCO: Exercise = {
  nome: "Agachamento no banco (sentar e levantar)",
  series: "3",
  reps: "12",
  descanso: ENTRE,
  beneficio:
    "A perna inteira no movimento de levantar da cadeira — o agachamento mais seguro para começar.",
  equipamento: "Banco reto (depois, um halter no peito)",
  videoId: "vt36o3w2G1g",
  grupos: ["perna"],
  // Começa sem peso, mas o halter entra ainda nesta fase: anotar mostra
  // quando ela passou para ele.
  carga: true,
  adaptacao:
    "Comece sem peso, encostando o bumbum no banco e levantando. Ficou fácil? Segure um halter no peito — vira o agachamento goblet, o passo antes da barra do plano completo.",
  dica: `${DICA_JOELHO} Solte o ar ao levantar.`,
};

/** Na terça e na sexta, igual nos dois dias. */
const REMADA_BAIXA: Exercise = {
  nome: "Remada baixa na polia (sentada)",
  series: "2",
  reps: "15",
  descanso: ENTRE,
  beneficio: "Meio das costas e ombros para trás — a postura que quem carrega bebê perde.",
  equipamento: "Estação — polia baixa",
  videoId: "f8AVh4VBbos",
  grupos: ["costas-bracos"],
  carga: true,
};

export const TREINO_ADAPTACAO: WorkoutDay[] = [
  {
    diaSemana: 1,
    diaNome: "Segunda",
    foco: "Pernas A — frente da coxa e bumbum",
    curto: "Pernas A",
    tipo: "academia",
    // Aquecimento + séries × (execução + 30 s de cardio + uns 30 s de
    // respiro) + as trocas de exercício: uns 32 a 36 minutos.
    duracaoMin: 35,
    cardioDeBraco: true,
    aquecimento: "5 min de bike ou elíptico bem leve",
    exercicios: [
      TRANSVERSO,
      {
        nome: "Cadeira extensora (módulo da estação)",
        series: "2",
        reps: "15",
        descanso: ENTRE,
        beneficio: "Frente da coxa forte, no movimento mais fácil de acertar da academia.",
        equipamento: "Estação — módulo extensora",
        videoId: "el3oHblB5DM",
        grupos: ["perna"],
        carga: true,
      },
      AGACHAMENTO_NO_BANCO,
      {
        nome: "Agachamento sumô com kettlebell leve",
        series: "3",
        reps: "12",
        descanso: ENTRE,
        beneficio:
          "Pés afastados e pontas para fora: é o agachamento que mais trabalha a parte interna da coxa.",
        equipamento: "Kettlebell leve (ou um halter), seguro com as duas mãos",
        videoId: "7CTbrHuL_b4",
        grupos: ["perna", "coxa-interna"],
        carga: true,
        dica: `${DICA_JOELHO} Solte o ar na subida.`,
      },
      {
        nome: "Subida no step",
        series: "2",
        reps: "10 por perna",
        descanso: ENTRE,
        beneficio: "Perna e bumbum no movimento de subir escada, uma perna de cada vez.",
        equipamento: "Step",
        videoId: "dWJhrSvTKyQ",
        grupos: ["perna"],
        adaptacao: "Sem peso por enquanto; os halteres entram no plano completo.",
        dica: `${DICA_JOELHO} Pé inteiro no step e a força vem da perna de cima — sem dar impulso com a de baixo.`,
      },
      {
        nome: "Dead bug (deitada, alterna braço e perna)",
        series: "2",
        reps: "8 cada lado",
        descanso: ENTRE,
        beneficio:
          "Barriga firme por dentro, com pouca pressão na linha do meio — um bom começo para quem tem diástase.",
        equipamento: "Colchonete",
        videoId: "0loS0bRNqfs",
        grupos: ["cintura"],
        diastase: NOTA_DEAD_BUG,
      },
    ],
    observacao:
      "A primeira semana é para aprender o movimento, não para sentir dor. Carga leve: se não der para conversar durante a série, está pesado.",
  },
  {
    diaSemana: 2,
    diaNome: "Terça",
    foco: "Costas e braços",
    curto: "Costas + braços",
    tipo: "academia",
    // Mesma conta da segunda: uns 29 a 33 minutos.
    duracaoMin: 30,
    cardioSemBraco: true,
    aquecimento: "5 min de elíptico + círculos de ombro",
    exercicios: [
      TRANSVERSO,
      {
        nome: "Puxada alta na polia (pegada aberta)",
        series: "2",
        reps: "15",
        descanso: ENTRE,
        beneficio: "Costas desenhadas e ombro aberto, sentada, com a máquina guiando o caminho.",
        equipamento: "Estação — polia alta",
        videoId: "mPmfwbc_svw",
        grupos: ["costas-bracos"],
        carga: true,
      },
      REMADA_BAIXA,
      { ...TRICEPS_COICE, series: "2", reps: "12 por braço", descanso: ENTRE },
      {
        nome: "Rosca martelo leve",
        series: "2",
        reps: "15",
        descanso: ENTRE,
        beneficio: "Frente do braço firme com halter leve — uma rosca só, sem buscar volume.",
        equipamento: "Par de halteres leves",
        videoId: "0qkQy8V2FC0",
        grupos: ["costas-bracos"],
        carga: true,
      },
      {
        nome: "Pallof press com elástico",
        series: "2",
        reps: "10 por lado",
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
    foco: "Caminhada firme + alongamento",
    curto: "Caminhada",
    tipo: "caminhada",
    duracaoMin: 40,
    exercicios: [
      { ...CAMINHADA_30, dica: "Passo apressado: a respiração acelera e dá para falar frases curtas, mas não para cantar." },
      ALONGAMENTO_ADUTOR,
      ALONGAMENTO_GERAL,
    ],
    observacao:
      "O aeróbico da semana; o intervalado entra no completo. Firme já não é leve: faça dentro da janela alimentar.",
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
        ...CAMINHADA_30,
        nome: "Caminhada leve",
        beneficio: "Mantém o corpo em movimento sem cobrar disposição de treino.",
      },
      ALONGAMENTO_ADUTOR,
    ],
    observacao:
      "Dia leve de propósito. A caminhada leve pode ser em jejum, antes do café da manhã — treino de força, só dentro da janela.",
  },
  {
    diaSemana: 5,
    diaNome: "Sexta",
    foco: "Costas, braços e cintura — calmo",
    curto: "Costas + cintura",
    tipo: "academia",
    // Mesma conta da segunda: uns 29 a 32 minutos.
    duracaoMin: 30,
    // Dia seguinte à aplicação: o cardio entre as séries fica só nas opções
    // que não sacodem o estômago — e, por ser dia de braço, sem o soco no ar.
    cardioSuave: true,
    cardioSemBraco: true,
    lembrete:
      "Dia seguinte ao Mounjaro, quando o enjoo costuma aparecer: tudo calmo e água em goles. Só enjoo leve? Caminhada leve no lugar — conta como treino. Vomitou, teve diarreia ou febre? Hoje é descanso e água em goles; se não passar, atendimento.",
    aquecimento: "5 min de elíptico ou bike bem leve",
    exercicios: [
      TRANSVERSO,
      REMADA_BAIXA,
      {
        nome: "Tríceps na corda (polia alta)",
        series: "2",
        reps: "15",
        descanso: ENTRE,
        beneficio:
          "A parte de trás do braço, com carga leve e muitas repetições: firma sem buscar volume.",
        equipamento: "Estação — polia alta + corda",
        videoId: "KhK5HWJfsrQ",
        grupos: ["costas-bracos"],
        carga: true,
      },
      { ...ELEVACAO_LATERAL, series: "2", reps: "12", descanso: ENTRE },
      {
        nome: "Elevação pélvica apertando uma almofada",
        series: "2",
        reps: "12",
        descanso: ENTRE,
        beneficio:
          "Bumbum e parte interna da coxa no mesmo movimento: aperte a almofada o tempo todo.",
        equipamento: "Colchonete + almofada, toalha enrolada ou bola pequena entre os joelhos",
        videoId: "IY4On8Xb-J8",
        grupos: ["perna", "coxa-interna"],
        adaptacao:
          "Sem cadeira adutora na academia, apertar algo entre os joelhos é o que faz a parte interna da coxa trabalhar aqui.",
      },
      {
        nome: "Perdigueiro (bird dog)",
        series: "2",
        reps: "8 cada lado",
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
    diaSemana: 6,
    diaNome: "Sábado",
    foco: "Pernas B — bumbum, posterior e parte interna",
    curto: "Pernas B",
    tipo: "academia",
    // Mesma conta da segunda: uns 32 a 36 minutos.
    duracaoMin: 35,
    cardioDeBraco: true,
    aquecimento: "5 min de bike em ritmo leve + 10 elevações pélvicas sem peso",
    exercicios: [
      TRANSVERSO,
      CADEIRA_FLEXORA,
      {
        nome: "Elevação pélvica no colchonete (sem peso)",
        series: "3",
        reps: "12",
        descanso: ENTRE,
        beneficio: "Bumbum e parte de trás da coxa, deitada e sem carga nenhuma.",
        equipamento: "Colchonete",
        // A ponte no chão, pés no colchonete e sem peso, do começo ao fim. O
        // vídeo de antes era a elevação no banco com barra (a do plano completo).
        videoId: "6jS6aH-78w4",
        grupos: ["perna"],
        dica: "Solte o ar ao subir e aperte o bumbum lá em cima, sem arquear a lombar.",
      },
      {
        nome: "Adução deitada de lado",
        series: "2",
        reps: "12 por perna",
        descanso: ENTRE,
        beneficio: "Trabalho direto na parte interna da coxa, onde está a flacidez.",
        equipamento: "Colchonete (depois, caneleira)",
        videoId: "Vgw2jCzpyxY",
        grupos: ["perna", "coxa-interna"],
        // Mesmo caso do agachamento no banco: a caneleira entra nesta fase.
        carga: true,
        adaptacao:
          "Entra no lugar da cadeira adutora, que a academia não tem. Comece sem caneleira; ela entra quando as 12 ficarem fáceis.",
      },
      { ...AGACHAMENTO_NO_BANCO, series: "2" },
      { ...DESLIZAMENTO_CALCANHAR, series: "2", descanso: ENTRE },
    ],
  },
  {
    diaSemana: 0,
    diaNome: "Domingo",
    foco: "Caminhada ao ar livre + alongamento",
    curto: "Caminhada",
    tipo: "caminhada",
    duracaoMin: 40,
    exercicios: [
      {
        ...CAMINHADA_30,
        nome: "Caminhada ao ar livre",
        beneficio: "Sol, ar livre e cabeça leve. Conta como treino.",
      },
      ALONGAMENTO_ADUTOR,
      ALONGAMENTO_GERAL,
    ],
    observacao:
      "Descanso ativo, em passo de passeio. Como é leve, pode ser em jejum, antes do café da manhã.",
  },
];
