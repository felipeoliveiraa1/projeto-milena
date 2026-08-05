export type Exercise = {
  nome: string;
  series: string;
  reps: string;
  descanso: string;
  beneficio: string;
  /** Aparelho/acessório da academia da Milena usado no exercício. */
  equipamento: string;
  /** ID do vídeo no YouTube (todos verificados: existem e permitem player embutido). */
  videoId?: string;
  /** Por que este exercício entrou no lugar do original (quando houve troca). */
  adaptacao?: string;
};

export type WorkoutDay = {
  diaSemana: number;
  diaNome: string;
  foco: string;
  curto: string;
  aquecimento?: string;
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

/** Aparelhos que a academia NÃO tem — cada um foi substituído no plano. */
export const SEM_APARELHO: string[] = [
  "Leg press 45°",
  "Cadeira abdutora",
  "Máquina de glúteo (coice)",
  "Máquina de panturrilha em pé",
  "Supino em máquina",
];

export const WORKOUTS: WorkoutDay[] = [
  {
    diaSemana: 1,
    diaNome: "Segunda",
    foco: "Inferior A — Glúteos e posterior",
    curto: "Glúteos / Posterior",
    aquecimento: "5 min de bike ou elíptico em ritmo leve",
    exercicios: [
      {
        nome: "Agachamento goblet (halter ou kettlebell)",
        series: "4",
        reps: "12",
        descanso: "60s",
        beneficio: "Recruta glúteo, quadríceps e posterior. Base do bumbum firme.",
        equipamento: "Halter ou kettlebell",
        videoId: "ge1vdJRP0UA",
        adaptacao:
          "Versão do agachamento livre segurando o peso na frente do peito: protege mais a lombar e não depende de barra.",
      },
      {
        nome: "Stiff com halteres",
        series: "3",
        reps: "12",
        descanso: "60s",
        beneficio: "Trabalha posterior de coxa e glúteo. Combate flacidez de banco de trás.",
        equipamento: "Par de halteres",
        videoId: "zPhI_hpBuZE",
      },
      {
        nome: "Cadeira flexora (módulo da estação)",
        series: "3",
        reps: "15",
        descanso: "45s",
        beneficio: "Isola posterior de coxa e melhora definição.",
        equipamento: "Estação de musculação — módulo flexora",
        videoId: "Zss6E3VU6X0",
      },
      {
        nome: "Elevação pélvica no banco com halter",
        series: "4",
        reps: "12",
        descanso: "60s",
        beneficio: "O melhor exercício para volume de glúteo máximo — o 'levantar' do bumbum.",
        equipamento: "Banco reto + halter",
        videoId: "ptK0azwOXwM",
        adaptacao:
          "Entra no lugar da máquina de glúteo, que sua academia não tem. Aqui o estímulo é até maior.",
      },
      {
        nome: "Abdução de quadril deitada com caneleira",
        series: "3",
        reps: "15 por perna",
        descanso: "45s",
        beneficio: "Foco no glúteo médio — aquele 'arredondamento' lateral do bumbum.",
        equipamento: "Caneleira (ou elástico do espaldar) + colchonete",
        videoId: "e9jmTvEwGqw",
        adaptacao:
          "Substitui a cadeira abdutora. Mesma função de glúteo médio, deitada no colchonete.",
      },
    ],
  },
  {
    diaSemana: 2,
    diaNome: "Terça",
    foco: "Superior A — Peito, tríceps e ombro",
    curto: "Peito / Tríceps / Ombro",
    aquecimento: "5 min de elíptico + rotação de ombros",
    exercicios: [
      {
        nome: "Supino reto com halteres no banco",
        series: "4",
        reps: "12",
        descanso: "60s",
        beneficio: "Trabalha peitoral e dá sustentação aos seios pós-amamentação.",
        equipamento: "Banco reto + par de halteres",
        videoId: "Cjh2fIMQHk0",
        adaptacao:
          "Sua academia não tem supino em máquina — com halteres o peito trabalha igual e ainda ganha estabilidade de ombro.",
      },
      {
        nome: "Voador na estação (peck deck)",
        series: "3",
        reps: "12",
        descanso: "45s",
        beneficio: "Abre o peitoral, melhora postura e definição dos seios.",
        equipamento: "Estação de musculação — módulo voador",
        videoId: "QJT52jGuyVE",
        adaptacao:
          "A estação tem o voador — mais fácil de acertar a execução do que o crucifixo com halteres.",
      },
      {
        nome: "Desenvolvimento de ombro com halteres",
        series: "3",
        reps: "12",
        descanso: "60s",
        beneficio: "Ombro definido + braço com cara de tonificado.",
        equipamento: "Banco ajustável (encosto alto) + halteres",
        videoId: "eufDL9MmF8A",
      },
      {
        nome: "Tríceps na corda (polia alta)",
        series: "4",
        reps: "15",
        descanso: "45s",
        beneficio: "Ataca a parte de trás do braço — região que você quer reduzir.",
        equipamento: "Estação — polia alta + corda",
        videoId: "KhK5HWJfsrQ",
      },
      {
        nome: "Elevação lateral com halteres",
        series: "3",
        reps: "15",
        descanso: "45s",
        beneficio: "Ombro 'redondinho' deixa a cintura parecer menor.",
        equipamento: "Par de halteres leves",
        videoId: "ORparUDksUk",
      },
    ],
  },
  {
    diaSemana: 3,
    diaNome: "Quarta",
    foco: "Cardio HIIT + Core",
    curto: "HIIT + Abdômen",
    aquecimento: "5 min de caminhada na esteira",
    exercicios: [
      {
        nome: "HIIT na esteira (1 min forte / 1 min leve)",
        series: "10 ciclos",
        reps: "20 min total",
        descanso: "—",
        beneficio: "Queima gordura ABDOMINAL especificamente. Acelera metabolismo o dia todo.",
        equipamento: "Esteira",
        videoId: "tOrC_rbzGvE",
      },
      {
        nome: "Prancha frontal",
        series: "3",
        reps: "30–45 s",
        descanso: "30s",
        beneficio:
          "Fortalece o transverso (a faixa que segura a barriga por dentro). Essencial pós-parto.",
        equipamento: "Colchonete",
        videoId: "jh0z3gbljUM",
      },
      {
        nome: "Dead bug (deitada, alterna braço e perna)",
        series: "3",
        reps: "12 cada lado",
        descanso: "30s",
        beneficio: "Estabiliza o core sem forçar diástase abdominal pós-gestação.",
        equipamento: "Colchonete",
        videoId: "0loS0bRNqfs",
      },
      {
        nome: "Mountain climber",
        series: "3",
        reps: "30s",
        descanso: "30s",
        beneficio: "Cardio + abdômen ao mesmo tempo. Tira gordura visceral do fígado.",
        equipamento: "Colchonete",
        videoId: "9wdmQlRzaO8",
      },
      {
        nome: "Abdominal infra (deitada, eleva pernas)",
        series: "3",
        reps: "15",
        descanso: "30s",
        beneficio: "Foco na barriga baixa (pochete pós-gestação).",
        equipamento: "Colchonete ou banco reto",
        videoId: "ixJcUH8AlL8",
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
    aquecimento: "5 min de bike + 10 agachamentos livres sem peso",
    exercicios: [
      {
        nome: "Agachamento com barra no suporte",
        series: "4",
        reps: "12",
        descanso: "60s",
        beneficio: "Construção de massa magra na perna inteira.",
        equipamento: "Barra + anilhas no suporte",
        videoId: "rM6SDUdl9fs",
        adaptacao:
          "Entra no lugar do leg press 45°, que sua academia não tem. Se estiver cansada, troque por goblet com halter.",
      },
      {
        nome: "Cadeira extensora (módulo da estação)",
        series: "3",
        reps: "15",
        descanso: "45s",
        beneficio: "Isola e define quadríceps.",
        equipamento: "Estação de musculação — módulo extensora",
        videoId: "el3oHblB5DM",
      },
      {
        nome: "Agachamento búlgaro com halteres",
        series: "3",
        reps: "10 por perna",
        descanso: "60s",
        beneficio: "Glúteo + equilíbrio. Excelente para 'levantar' o bumbum.",
        equipamento: "Banco reto + par de halteres",
        videoId: "IL4ebT8L1aQ",
        adaptacao: "Versão do afundo com o pé de trás apoiado no banco — pega mais glúteo.",
      },
      {
        nome: "Coice de glúteo em 4 apoios com caneleira",
        series: "4",
        reps: "12 por perna",
        descanso: "45s",
        beneficio: "Hipertrofia do glúteo máximo (volume do bumbum).",
        equipamento: "Caneleira + colchonete",
        videoId: "RqGQZMusai4",
        adaptacao: "Substitui a máquina de glúteo (coice). Com caneleira o estímulo é o mesmo.",
      },
      {
        nome: "Panturrilha em pé com halteres no step",
        series: "3",
        reps: "20",
        descanso: "30s",
        beneficio: "Tonifica panturrilha e ajuda a postura.",
        equipamento: "Step + halteres",
        videoId: "Znkj_cC8a5c",
        adaptacao:
          "Substitui a máquina de panturrilha em pé. O step dá a mesma amplitude de descida.",
      },
    ],
  },
  {
    diaSemana: 5,
    diaNome: "Sexta",
    foco: "Superior B — Costas, bíceps e ombro posterior",
    curto: "Costas / Bíceps",
    aquecimento: "5 min de elíptico + soltura de coluna",
    exercicios: [
      {
        nome: "Puxada alta na polia (pegada aberta)",
        series: "4",
        reps: "12",
        descanso: "60s",
        beneficio: "Costas em V, melhora postura e disfarça a cintura.",
        equipamento: "Estação — polia alta com barra",
        videoId: "mPmfwbc_svw",
      },
      {
        nome: "Remada na polia baixa sentada",
        series: "3",
        reps: "12",
        descanso: "60s",
        beneficio: "Postura ereta — afasta aquele 'corcovado' de quem cuida de bebê.",
        equipamento: "Estação — polia baixa",
        videoId: "f8AVh4VBbos",
      },
      {
        nome: "Rosca direta com halteres",
        series: "4",
        reps: "12",
        descanso: "45s",
        beneficio: "Bíceps definido. Junto com o tríceps de terça, define o braço todo.",
        equipamento: "Par de halteres",
        videoId: "c__3LAiXYOk",
      },
      {
        nome: "Rosca martelo",
        series: "3",
        reps: "12",
        descanso: "45s",
        beneficio: "Pega o braquial — músculo que dá firmeza ao braço.",
        equipamento: "Par de halteres",
        videoId: "0qkQy8V2FC0",
      },
      {
        nome: "Crucifixo inverso com halteres",
        series: "3",
        reps: "15",
        descanso: "45s",
        beneficio: "Ombro posterior e meio das costas — postura de quem carrega bebê no colo.",
        equipamento: "Banco ajustável + halteres leves",
        videoId: "5HDkxzxe400",
        adaptacao:
          "Entra no lugar do encolhimento de ombros: melhor retorno postural para o seu caso.",
      },
    ],
  },
  {
    diaSemana: 6,
    diaNome: "Sábado",
    foco: "Cardio LISS + Core e braços",
    curto: "Cardio leve + Braços",
    aquecimento: "—",
    exercicios: [
      {
        nome: "Caminhada inclinada na esteira (incl. 8–10%)",
        series: "1",
        reps: "30 min",
        descanso: "—",
        beneficio: "Queima gordura sem estressar o corpo. Ótimo pra fígado e pressão.",
        equipamento: "Esteira",
        videoId: "kSzu-qpZahU",
      },
      {
        nome: "Tríceps testa com halteres",
        series: "3",
        reps: "12",
        descanso: "45s",
        beneficio: "Reforço extra na parte de trás do braço.",
        equipamento: "Banco reto + halteres",
        videoId: "VakpIeaaeXA",
      },
      {
        nome: "Rosca alternada com halteres",
        series: "3",
        reps: "12 por lado",
        descanso: "45s",
        beneficio: "Tonifica bíceps com foco em simetria.",
        equipamento: "Par de halteres",
        videoId: "AuBN9_8Iihc",
      },
      {
        nome: "Abdominal oblíquo (em pé com halter)",
        series: "3",
        reps: "15 por lado",
        descanso: "30s",
        beneficio: "Cintura definida, marca os 'lados' da barriga.",
        equipamento: "1 halter",
        videoId: "F0B9K83FSUQ",
      },
    ],
  },
  {
    diaSemana: 0,
    diaNome: "Domingo",
    foco: "Descanso ativo",
    curto: "Descanso",
    exercicios: [
      {
        nome: "Caminhada leve ao ar livre",
        series: "1",
        reps: "20–30 min",
        descanso: "—",
        beneficio: "Recuperação, vitamina D, alongamento natural. Pode levar o bebê de carrinho.",
        equipamento: "Nenhum",
      },
      {
        nome: "Alongamento geral",
        series: "1",
        reps: "10 min",
        descanso: "—",
        beneficio: "Reduz dor lombar pós-gestação, melhora flexibilidade.",
        equipamento: "Colchonete",
        videoId: "cvhQkEjB--o",
      },
      {
        nome: "Liberação miofascial com o rolo",
        series: "1",
        reps: "5–10 min",
        descanso: "—",
        beneficio: "Solta a musculatura da semana e alivia dor de quadril e lombar.",
        equipamento: "Foam roller (rolo azul da academia)",
        videoId: "xGEo2H6jSYk",
        adaptacao: "A academia tem foam roller — use nos dias de descanso e depois das pernas.",
      },
    ],
    observacao:
      "Domingo é descanso. Se sentir muito disposta, faça só caminhada — não vá pra academia. Recuperação faz parte do resultado.",
  },
];
