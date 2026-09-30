/**
 * Plano atual da Milena — recomposição corporal.
 *
 * Até setembro o app seguia o protocolo Desinflama-se (15 dias sem açúcar,
 * glúten, leite e industrializados). Em 29/09/2026 ela mandou o plano novo: o
 * resumo de alimentação para recomposição corporal, a lista de remédios e
 * suplementos, a bioimpedância de 12/08 e as orientações do médico para o
 * treino.
 *
 * Este arquivo guarda o que é do plano como um todo e a rotina de fábrica. As
 * regras de comida moram em data/alimentacao.ts, o treino em data/workouts.ts
 * e os remédios em data/supplements.ts.
 */

export const PLANO = {
  nome: "Recomposição corporal",
  /**
   * Começo da jornada (AAAA-MM-DD). Serve de padrão — ela pode corrigir pelo
   * próprio app, na tela /rotina. 12/08 é o dia da bioimpedância de partida.
   */
  inicioPadrao: "2026-08-12",
  resumo:
    "Perder gordura sem perder músculo: proteína em todas as refeições, janela de refeições com jejum à noite, perna forte e cardio entre as séries.",
  /** O sinal de que está dando certo, nas palavras do resumo de alimentação. */
  objetivo:
    "Peso e cintura diminuindo enquanto a força na musculação se mantém ou aumenta.",
};

/** Dados que ela passou em 29/09/2026 e que o app usa nas contas. */
export const PERFIL = {
  nome: "Milena",
  idade: 39,
  alturaM: 1.61,
  /** Peso que ela informou em 29/09/2026. No dia a dia, vale a balança do app. */
  pesoInformadoKg: 85,
  /** Afastamento dos retos abdominais medido. Orienta todo exercício de abdômen. */
  diastaseCm: 3.9,
};

/* -------------------------------------------------------------------------- */
/* Rotina diária                                                              */
/* -------------------------------------------------------------------------- */

export type RotinaItem = {
  id: string;
  texto: string;
  detalhe?: string;
  /** Quando presente, o item ganha uma caixa de digitação salva por dia. */
  campo?: "texto";
  placeholder?: string;
  /** Atalhos que preenchem a caixa com um toque. */
  opcoes?: string[];
};

export type RotinaBloco = {
  id: string;
  titulo: string;
  /** Usado para mostrar o bloco certo na tela inicial conforme a hora. */
  periodo: "manha" | "dia" | "noite";
  itens: RotinaItem[];
  nota?: string;
};

/**
 * Rotina que vem de fábrica. A Milena pode editar tudo pelo app (adicionar,
 * renomear e remover itens e blocos) — o que ela salvar vive em lib/routine.ts
 * e substitui esta lista. Aqui fica só o ponto de partida e o botão "restaurar".
 *
 * Os ids são gravados no Supabase dentro de daily_checks.supplements, junto com
 * os suplementos. O prefixo "r-" separa rotina de suplemento. Por isso um id
 * nunca muda, mesmo quando o texto muda: o histórico depende dele.
 */
export const ROTINA_PADRAO: RotinaBloco[] = [
  {
    id: "manha",
    titulo: "Rotina da manhã",
    periodo: "manha",
    itens: [
      { id: "r-m-alarme", texto: "Levantar sem adiar o alarme" },
      { id: "r-m-luz", texto: "Abrir as cortinas e tomar luz natural" },
      { id: "r-m-oracao", texto: "Fazer oração" },
      { id: "r-m-lingua", texto: "Raspar a língua" },
      { id: "r-m-evacuacao", texto: "Observar a evacuação" },
      { id: "r-m-agua", texto: "Beber água em jejum" },
      {
        id: "r-m-limao-propolis",
        texto: "Tomar limão e própolis",
        detalhe: "Só se cair bem. Qualquer desconforto, suspende e conversa com o médico.",
      },
      { id: "r-m-banho", texto: "Tomar banho" },
      { id: "r-m-arrumar", texto: "Arrumar-se" },
      {
        id: "r-m-skincare",
        texto: "Skincare",
        detalhe: "Termine sempre com o protetor solar.",
      },
      { id: "r-m-cama", texto: "Arrumar a cama" },
      { id: "r-m-declaracoes", texto: "Fazer as declarações" },
      { id: "r-m-objetivos", texto: "Visualizar os objetivos" },
      { id: "r-m-proverbios", texto: "Ler Provérbios ou Salmos" },
      { id: "r-m-motivos", texto: "Reler os seus motivos" },
    ],
  },
  {
    id: "movimento",
    titulo: "Movimento",
    periodo: "dia",
    nota: "O treino do dia fica na aba Treino — este bloco é o extra.",
    itens: [
      { id: "r-mov-atividade", texto: "Fazer a atividade física do dia" },
      {
        id: "r-mov-agachamento",
        texto: "Agachamentos ao ir ao banheiro",
        detalhe: "Só se for seguro e confortável pra você. Sentiu dor, não force.",
      },
    ],
  },
  {
    id: "acompanhamento",
    titulo: "Acompanhamento",
    // À noite: registrar os sintomas do dia é fechamento, não meio da tarde.
    // Assim o bloco aparece na tela inicial junto da rotina da noite.
    periodo: "noite",
    itens: [
      {
        id: "r-ac-sintomas",
        texto: "Registrar sintomas do dia",
        campo: "texto",
        placeholder: "Como o corpo respondeu hoje?",
        // Enjoo e falta de fome são os efeitos mais comuns do Mounjaro — vale
        // anotar para levar ao médico.
        opcoes: [
          "Sem sintomas",
          "Enjoo",
          "Sem fome",
          "Intestino preso",
          "Azia",
          "Inchaço",
          "Cansaço",
          "Dor de cabeça",
        ],
      },
    ],
  },
  {
    id: "noite",
    titulo: "Rotina da noite",
    periodo: "noite",
    itens: [
      {
        // O id ainda é o da antiga "refeição mais leve": à noite agora é jejum.
        id: "r-n-refeicao",
        texto: "Fechar a janela no horário",
        detalhe:
          "Depois da última refeição, só água, chá ou café sem açúcar até o café da manhã — os remédios da noite seguem a lista.",
      },
      { id: "r-n-skincare", texto: "Skincare da noite" },
      { id: "r-n-dormir", texto: "Dormir em horário adequado" },
      {
        id: "r-n-gratidao",
        texto: "Registrar três motivos de gratidão",
        campo: "texto",
        placeholder: "1. \n2. \n3. ",
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Segurança                                                                  */
/* -------------------------------------------------------------------------- */

export const SEGURANCA = [
  "Nenhum remédio é suspenso, trocado de dia ou ajustado sem o médico que receitou — Mounjaro, testosterona e fórmula inclusive.",
  // Tremor e suor frio são sinais de açúcar baixo, e a regra é açúcar rápido e
  // sozinho (ADA e SBD): proteína e fibra atrasam a subida — e o Mounjaro já
  // deixa o estômago mais lento.
  "Jejum não é para passar mal. Tremor, suor frio, fraqueza ou tontura podem ser açúcar baixo: 15 g de açúcar rápido e sozinho — 1 colher de sopa de açúcar na água ou 150 ml de suco ou refrigerante comum —, espere 15 minutos e, se não passar, repita uma vez. Passou: um lanche com proteína. Não passou, confusão ou desmaio: atendimento. E avise o médico.",
  "Mounjaro: dor forte na barriga que não passa (às vezes indo para as costas), vômito que não para ou sinais de desidratação — procure atendimento.",
  "Testosterona na pele: lave as mãos depois de passar e deixe o local coberto pela roupa. O bebê não pode encostar na pele onde foi aplicada.",
  "Treino: dor ou aperto no peito, falta de ar fora do normal para o esforço, tontura forte, desmaio ou coração disparado ou irregular — pare e procure atendimento. Não é caso de trocar de exercício.",
  "Treino: escape de urina, sensação de peso ou de 'bola' na vagina, dor, ou a barriga formando um 'morrinho' no meio — pare, ajuste ou troque o exercício e fale com a fisioterapeuta pélvica.",
  "Antes da cirurgia plástica (ou de qualquer anestesia), avise o cirurgião e o anestesista de todos os remédios — o Mounjaro costuma precisar de ajuste antes.",
];
