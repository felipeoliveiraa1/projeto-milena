import type { WorkoutDay } from "./workouts";

/**
 * Fase de adaptação — para quem não gosta de academia.
 *
 * O plano completo tem 6 dias por semana, agachamento com barra e búlgaro.
 * Isso é muito para começar, e a chance de largar é alta. Aqui a lógica é
 * outra: 3 idas curtas por semana, tudo em máquina ou movimento simples, para
 * o corpo aprender e o hábito pegar. Nos outros dias, caminhada — sem academia.
 *
 * Regras que valem em todos os dias:
 * - carga leve, aquela que deixa terminar a série conversando;
 * - 2 séries por exercício, não 3 ou 4;
 * - 25 minutos dentro da academia, contando o aquecimento;
 * - nada de exercício que empurre a barriga para fora (diástase).
 *
 * Os vídeos são os mesmos já verificados no plano completo.
 */
export const TREINO_ADAPTACAO: WorkoutDay[] = [
  {
    diaSemana: 1,
    diaNome: "Segunda",
    foco: "Corpo todo A — só máquina",
    curto: "Corpo todo A",
    aquecimento: "8 min de caminhada tranquila na esteira, sem inclinação",
    exercicios: [
      {
        nome: "Cadeira extensora (módulo da estação)",
        series: "2",
        reps: "12",
        descanso: "60s",
        beneficio: "Acorda a coxa com o movimento mais fácil de acertar da academia.",
        equipamento: "Estação — módulo extensora",
        videoId: "el3oHblB5DM",
      },
      {
        nome: "Puxada alta na polia (pegada aberta)",
        series: "2",
        reps: "12",
        descanso: "60s",
        beneficio: "Costas e postura. Sentada, com a máquina guiando o caminho.",
        equipamento: "Estação — polia alta",
        videoId: "mPmfwbc_svw",
      },
      {
        nome: "Elevação pélvica no colchonete (sem peso)",
        series: "2",
        reps: "15",
        descanso: "45s",
        beneficio: "Liga o glúteo sem carga nenhuma — é o começo do bumbum firme.",
        equipamento: "Colchonete",
        videoId: "ptK0azwOXwM",
        adaptacao: "Na fase completa este mesmo exercício ganha o halter em cima do quadril.",
      },
      {
        nome: "Dead bug (deitada, alterna braço e perna)",
        series: "2",
        reps: "10 cada lado",
        descanso: "30s",
        beneficio: "O exercício de core mais seguro para o pós-parto. Fortalece por dentro.",
        equipamento: "Colchonete",
        videoId: "0loS0bRNqfs",
      },
    ],
    observacao:
      "Primeira semana é para aprender o movimento, não para sentir dor. Carga leve: se não conseguir conversar durante a série, está pesado.",
  },
  {
    diaSemana: 2,
    diaNome: "Terça",
    foco: "Caminhada — sem academia",
    curto: "Caminhada",
    exercicios: [
      {
        nome: "Caminhada tranquila",
        series: "1",
        reps: "20–30 min",
        descanso: "—",
        beneficio: "Queima gordura, não cansa e ainda dá para levar o bebê no carrinho.",
        equipamento: "Nenhum",
        videoId: "kSzu-qpZahU",
      },
      {
        nome: "Alongamento geral",
        series: "1",
        reps: "5–10 min",
        descanso: "—",
        beneficio: "Alivia a lombar, que é o que mais reclama no pós-parto.",
        equipamento: "Colchonete",
        videoId: "cvhQkEjB--o",
      },
    ],
    observacao: "Dia sem academia. Pode ser na rua, na esteira ou empurrando o carrinho.",
  },
  {
    diaSemana: 3,
    diaNome: "Quarta",
    foco: "Corpo todo B — só máquina",
    curto: "Corpo todo B",
    aquecimento: "8 min de bike em ritmo leve",
    exercicios: [
      {
        nome: "Cadeira flexora (módulo da estação)",
        series: "2",
        reps: "12",
        descanso: "60s",
        beneficio: "Posterior de coxa, a parte de trás da perna que sustenta o glúteo.",
        equipamento: "Estação — módulo flexora",
        videoId: "Zss6E3VU6X0",
      },
      {
        nome: "Voador na estação (peck deck)",
        series: "2",
        reps: "12",
        descanso: "60s",
        beneficio: "Peito e postura, sentada, com a máquina fazendo o caminho.",
        equipamento: "Estação — módulo voador",
        videoId: "QJT52jGuyVE",
      },
      {
        nome: "Remada na polia baixa sentada",
        series: "2",
        reps: "12",
        descanso: "60s",
        beneficio: "Fecha as costas e tira o ombro da frente — quem carrega bebê precisa.",
        equipamento: "Estação — polia baixa",
        videoId: "f8AVh4VBbos",
      },
      {
        nome: "Deslizamento de calcanhar (deitada)",
        series: "2",
        reps: "10 cada perna",
        descanso: "30s",
        beneficio: "Trabalha a barriga por dentro, do jeito que a fisioterapia usa na diástase.",
        equipamento: "Colchonete",
        videoId: "Ke9al-Aliyc",
      },
    ],
  },
  {
    diaSemana: 4,
    diaNome: "Quinta",
    foco: "Caminhada — sem academia",
    curto: "Caminhada",
    exercicios: [
      {
        nome: "Caminhada tranquila",
        series: "1",
        reps: "20–30 min",
        descanso: "—",
        beneficio: "Mantém o corpo em movimento sem cobrar disposição de treino.",
        equipamento: "Nenhum",
        videoId: "kSzu-qpZahU",
      },
    ],
    observacao: "Dia sem academia.",
  },
  {
    diaSemana: 5,
    diaNome: "Sexta",
    foco: "Corpo todo C — peso do corpo e halteres leves",
    curto: "Corpo todo C",
    aquecimento: "8 min de elíptico ou caminhada",
    exercicios: [
      {
        nome: "Agachamento sem peso (ou goblet bem leve)",
        series: "2",
        reps: "12",
        descanso: "60s",
        beneficio: "O movimento mais útil da vida: levantar da cadeira e do chão com o bebê.",
        equipamento: "Peso do corpo, depois halter leve",
        videoId: "ge1vdJRP0UA",
        adaptacao:
          "Comece sem peso nenhum, sentando e levantando de um banco. O halter entra quando isso ficar fácil.",
      },
      {
        nome: "Desenvolvimento de ombro com halteres leves",
        series: "2",
        reps: "12",
        descanso: "60s",
        beneficio: "Ombro e braço, sentada com as costas apoiadas.",
        equipamento: "Banco ajustável + halteres leves",
        videoId: "eufDL9MmF8A",
      },
      {
        nome: "Coice de glúteo em 4 apoios (sem caneleira)",
        series: "2",
        reps: "12 por perna",
        descanso: "45s",
        beneficio: "Glúteo direto, no colchonete, sem depender de máquina.",
        equipamento: "Colchonete",
        videoId: "RqGQZMusai4",
        adaptacao: "A caneleira entra depois, quando 12 repetições pararem de cansar.",
      },
      {
        nome: "Prancha apoiada nos joelhos",
        series: "2",
        reps: "20–30 s",
        descanso: "30s",
        beneficio: "Versão suave da prancha: mesmo trabalho por dentro, muito menos pressão.",
        equipamento: "Colchonete",
        videoId: "jh0z3gbljUM",
        diastase: {
          nivel: "cuidado",
          nota: "Nos joelhos mesmo, e olhando se a barriga forma um 'morrinho' no meio. Formou, para e diminui o tempo.",
        },
      },
    ],
  },
  {
    diaSemana: 6,
    diaNome: "Sábado",
    foco: "Caminhada leve",
    curto: "Caminhada",
    exercicios: [
      {
        nome: "Caminhada ao ar livre",
        series: "1",
        reps: "20–30 min",
        descanso: "—",
        beneficio: "Sol, ar livre e cabeça leve. Conta como treino.",
        equipamento: "Nenhum",
        videoId: "kSzu-qpZahU",
      },
    ],
    observacao: "Dia sem academia.",
  },
  {
    diaSemana: 0,
    diaNome: "Domingo",
    foco: "Descanso",
    curto: "Descanso",
    exercicios: [
      {
        nome: "Alongamento geral",
        series: "1",
        reps: "10 min",
        descanso: "—",
        beneficio: "Recuperação. Descansar faz parte do resultado.",
        equipamento: "Colchonete",
        videoId: "cvhQkEjB--o",
      },
    ],
    observacao: "Domingo é descanso de verdade. Não vá para a academia.",
  },
];
