export type Exercise = {
  nome: string;
  series: string;
  reps: string;
  descanso: string;
  beneficio: string;
};

export type WorkoutDay = {
  diaSemana: number;
  diaNome: string;
  foco: string;
  curto: string;
  cor: string;
  aquecimento?: string;
  exercicios: Exercise[];
  observacao?: string;
};

export const WORKOUTS: WorkoutDay[] = [
  {
    diaSemana: 1,
    diaNome: "Segunda",
    foco: "Inferior A — Glúteos e posterior",
    curto: "Glúteos / Posterior",
    cor: "from-pink-100 to-rose-200 border-rose-300",
    aquecimento: "5 min de bike ou elíptico em ritmo leve",
    exercicios: [
      {
        nome: "Agachamento livre (com barra ou halteres)",
        series: "4",
        reps: "12",
        descanso: "60s",
        beneficio: "Recruta glúteo, quadríceps e posterior. Base do bumbum firme.",
      },
      {
        nome: "Stiff com halteres",
        series: "3",
        reps: "12",
        descanso: "60s",
        beneficio: "Trabalha posterior de coxa e glúteo. Combate flacidez de banco de trás.",
      },
      {
        nome: "Cadeira flexora",
        series: "3",
        reps: "15",
        descanso: "45s",
        beneficio: "Isola posterior de coxa e melhora definição.",
      },
      {
        nome: "Abdução de quadril (máquina)",
        series: "4",
        reps: "15",
        descanso: "45s",
        beneficio: "Foco no glúteo médio — aquele 'arredondamento' lateral do bumbum.",
      },
      {
        nome: "Panturrilha em pé na máquina",
        series: "3",
        reps: "20",
        descanso: "30s",
        beneficio: "Tonifica panturrilha e ajuda postura.",
      },
    ],
  },
  {
    diaSemana: 2,
    diaNome: "Terça",
    foco: "Superior A — Peito, tríceps e ombro",
    curto: "Peito / Tríceps / Ombro",
    cor: "from-sky-100 to-cyan-200 border-cyan-300",
    aquecimento: "5 min de elíptico + rotação de ombros",
    exercicios: [
      {
        nome: "Supino reto na máquina",
        series: "4",
        reps: "12",
        descanso: "60s",
        beneficio: "Trabalha peitoral e dá sustentação aos seios pós-amamentação.",
      },
      {
        nome: "Crucifixo com halteres (banco inclinado)",
        series: "3",
        reps: "12",
        descanso: "45s",
        beneficio: "Abre o peitoral, melhora postura e definição dos seios.",
      },
      {
        nome: "Desenvolvimento de ombro com halteres",
        series: "3",
        reps: "12",
        descanso: "60s",
        beneficio: "Ombro definido + braço com cara de tonificado.",
      },
      {
        nome: "Tríceps na corda (polia alta)",
        series: "4",
        reps: "15",
        descanso: "45s",
        beneficio: "Ataca a parte de trás do braço — região que você quer reduzir.",
      },
      {
        nome: "Elevação lateral com halteres",
        series: "3",
        reps: "15",
        descanso: "45s",
        beneficio: "Ombro 'redondinho' deixa cintura parecer menor.",
      },
    ],
  },
  {
    diaSemana: 3,
    diaNome: "Quarta",
    foco: "Cardio HIIT + Core",
    curto: "HIIT + Abdômen",
    cor: "from-amber-100 to-orange-200 border-orange-300",
    aquecimento: "5 min caminhada na esteira",
    exercicios: [
      {
        nome: "HIIT esteira (1 min forte / 1 min leve)",
        series: "10 ciclos",
        reps: "20 min total",
        descanso: "—",
        beneficio: "Queima gordura ABDOMINAL especificamente. Acelera metabolismo o dia todo.",
      },
      {
        nome: "Prancha frontal",
        series: "3",
        reps: "30–45 s",
        descanso: "30s",
        beneficio: "Fortalece o transverso (a faixa que segura a barriga por dentro). Essencial pós-parto.",
      },
      {
        nome: "Dead bug (deitada, alterna braço e perna)",
        series: "3",
        reps: "12 cada lado",
        descanso: "30s",
        beneficio: "Estabiliza o core sem forçar diástase abdominal pós-gestação.",
      },
      {
        nome: "Mountain climber",
        series: "3",
        reps: "30s",
        descanso: "30s",
        beneficio: "Cardio + abdômen ao mesmo tempo. Tira gordura visceral do fígado.",
      },
      {
        nome: "Abdominal infra (deitada, eleva pernas)",
        series: "3",
        reps: "15",
        descanso: "30s",
        beneficio: "Foco na barriga baixa (pochete pós-gestação).",
      },
    ],
    observacao:
      "Importante: nas primeiras 2 semanas evite abdominais clássicos (crunch). Priorize prancha e dead bug se ainda houver diástase abdominal.",
  },
  {
    diaSemana: 4,
    diaNome: "Quinta",
    foco: "Inferior B — Quadríceps e glúteos",
    curto: "Quadríceps / Glúteos",
    cor: "from-pink-100 to-rose-200 border-rose-300",
    aquecimento: "5 min bike + 10 agachamentos livres sem peso",
    exercicios: [
      {
        nome: "Leg press 45°",
        series: "4",
        reps: "12",
        descanso: "60s",
        beneficio: "Construção de massa magra na perna inteira com segurança lombar.",
      },
      {
        nome: "Cadeira extensora",
        series: "3",
        reps: "15",
        descanso: "45s",
        beneficio: "Isola e define quadríceps.",
      },
      {
        nome: "Afundo (avanço) com halteres",
        series: "3",
        reps: "10 por perna",
        descanso: "60s",
        beneficio: "Glúteo + equilíbrio. Excelente para 'levantar' o bumbum.",
      },
      {
        nome: "Glúteo na máquina (coice)",
        series: "4",
        reps: "12 por perna",
        descanso: "45s",
        beneficio: "Hipertrofia do glúteo máximo (volume do bumbum).",
      },
      {
        nome: "Abdução de quadril (máquina)",
        series: "3",
        reps: "15",
        descanso: "45s",
        beneficio: "Glúteo médio — culote/ladinho do quadril.",
      },
    ],
  },
  {
    diaSemana: 5,
    diaNome: "Sexta",
    foco: "Superior B — Costas, bíceps e ombro posterior",
    curto: "Costas / Bíceps",
    cor: "from-sky-100 to-cyan-200 border-cyan-300",
    aquecimento: "5 min elíptico + soltura de coluna",
    exercicios: [
      {
        nome: "Puxada alta na polia (pegada aberta)",
        series: "4",
        reps: "12",
        descanso: "60s",
        beneficio: "Costas em V, melhora postura e disfarça a cintura.",
      },
      {
        nome: "Remada baixa sentada (máquina)",
        series: "3",
        reps: "12",
        descanso: "60s",
        beneficio: "Postura ereta — afasta aquele 'corcovado' de quem cuida de bebê.",
      },
      {
        nome: "Rosca direta com halteres",
        series: "4",
        reps: "12",
        descanso: "45s",
        beneficio: "Bíceps definido. Junto com tríceps de terça, define o braço todo.",
      },
      {
        nome: "Rosca martelo",
        series: "3",
        reps: "12",
        descanso: "45s",
        beneficio: "Pega o braquial — músculo que dá grossura/firmeza ao braço.",
      },
      {
        nome: "Encolhimento de ombros (com halteres)",
        series: "3",
        reps: "15",
        descanso: "30s",
        beneficio: "Trapézio + postura. Quem pega bebê no colo precisa.",
      },
    ],
  },
  {
    diaSemana: 6,
    diaNome: "Sábado",
    foco: "Cardio LISS + Core e braços",
    curto: "Cardio leve + Braços",
    cor: "from-amber-100 to-orange-200 border-orange-300",
    aquecimento: "—",
    exercicios: [
      {
        nome: "Caminhada inclinada na esteira (incl. 8–10%)",
        series: "1",
        reps: "30 min",
        descanso: "—",
        beneficio: "Queima gordura sem estressar o corpo. Ótimo pra fígado e pressão.",
      },
      {
        nome: "Tríceps testa com halteres",
        series: "3",
        reps: "12",
        descanso: "45s",
        beneficio: "Reforço extra na parte de trás do braço.",
      },
      {
        nome: "Rosca alternada com halteres",
        series: "3",
        reps: "12 por lado",
        descanso: "45s",
        beneficio: "Tonifica bíceps com foco em simetria.",
      },
      {
        nome: "Abdominal oblíquo (em pé com halter)",
        series: "3",
        reps: "15 por lado",
        descanso: "30s",
        beneficio: "Cintura definida, marca os 'lados' da barriga.",
      },
    ],
  },
  {
    diaSemana: 0,
    diaNome: "Domingo",
    foco: "Descanso ativo",
    curto: "Descanso",
    cor: "from-zinc-100 to-zinc-200 border-zinc-300",
    exercicios: [
      {
        nome: "Caminhada leve ao ar livre",
        series: "1",
        reps: "20–30 min",
        descanso: "—",
        beneficio: "Recuperação, vitamina D, alongamento natural. Pode levar o bebê de carrinho.",
      },
      {
        nome: "Alongamento geral",
        series: "1",
        reps: "10 min",
        descanso: "—",
        beneficio: "Reduz dor lombar pós-gestação, melhora flexibilidade.",
      },
    ],
    observacao:
      "Domingo é descanso. Se sentir muito disposta, faça só caminhada — não vá pra academia. Recuperação faz parte do resultado.",
  },
];
