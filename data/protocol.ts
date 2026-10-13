/**
 * Plano atual da Milena — recomposição corporal.
 *
 * Até setembro o app seguia o protocolo Desinflama-se (15 dias sem açúcar,
 * glúten, leite e industrializados). Em 29/09/2026 ela mandou o plano novo: o
 * resumo de alimentação para recomposição corporal, a lista de remédios e
 * suplementos, a bioimpedância de 12/08 e as orientações do médico para o
 * treino.
 *
 * Em 12/10/2026 vieram os ajustes que ela pediu — perder uns 15 kg ganhando
 * força, treino todo dia, o café fora do plano e as telas longe da cama antes
 * de dormir — e, junto, uma volta curta depois do almoço.
 *
 * Este arquivo guarda o que é do plano como um todo e a rotina de fábrica. As
 * regras de comida moram em data/alimentacao.ts, o treino em data/workouts.ts,
 * os remédios em data/supplements.ts e os sinais de parar o treino e procurar
 * ajuda em data/alarmes.ts.
 */

import { ALARMES_URGENTES } from "./alarmes";

export const PLANO = {
  nome: "Recomposição corporal",
  /**
   * Começo da jornada (AAAA-MM-DD). Serve de padrão — ela pode corrigir pelo
   * próprio app, na tela /rotina. 12/08 é o dia da bioimpedância de partida.
   */
  inicioPadrao: "2026-08-12",
  /**
   * O pedido dela em 12/10, numa frase (aparece no topo de /rotina). Sem
   * número de meta: a meta em kg é preferência que ela muda em /ajustes, e um
   * número fixo aqui ficaria desencontrado de /progresso e da tela inicial.
   */
  resumo:
    "Perder cerca de 15 kg sem perder músculo: treino todo dia, pernas fortes, costas e braços definidos, proteína em todas as refeições e jejum à noite.",
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
  /**
   * Itens de fábrica já oferecidos a este bloco, para não voltarem se ela
   * apagar. Viaja junto com a rotina salva; quem lê e marca é lib/routine.ts.
   */
  recebidos?: string[];
};

/**
 * Rotina que vem de fábrica. A Milena pode editar tudo pelo app (adicionar,
 * renomear e remover itens e blocos) — o que ela salvar vive em lib/routine.ts
 * e substitui esta lista. Aqui fica só o ponto de partida e o botão "restaurar".
 *
 * Os ids são gravados no Supabase dentro de daily_checks.supplements, junto com
 * os suplementos. O prefixo "r-" separa rotina de suplemento. Por isso um id
 * nunca muda, mesmo quando o texto muda: o histórico depende dele.
 *
 * Item novo de fábrica entra em três lugares: aqui, com id novo e o id também
 * no `recebidos` do bloco; em ITENS_NOVOS (lib/routine.ts), para chegar uma vez
 * só a quem já salvou a rotina; e em ROTINA_DESDE, para os dias de antes não
 * perderem pontos por um item que ainda não existia.
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
    recebidos: ["r-mov-pos-almoco"],
    itens: [
      { id: "r-mov-atividade", texto: "Fazer a atividade física do dia" },
      {
        // Ajustes de 12/10. É movimento leve do dia, não sessão: fica fora da
        // conta de minutos do treino.
        id: "r-mov-pos-almoco",
        texto: "Caminhar 10 a 15 minutos depois do almoço",
        detalhe:
          "Uma volta leve ajuda o açúcar do sangue depois da refeição; não conta como o treino do dia. No sol ou calor forte, vale dentro de casa ou na sombra — com água.",
      },
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
    recebidos: ["r-n-telas"],
    itens: [
      {
        // O id ainda é o da antiga "refeição mais leve": à noite agora é jejum.
        // O café saiu do plano em 12/10, a pedido dela; quem salvou a rotina
        // com o detalhe antigo recebe este pela migração de lib/routine.ts.
        id: "r-n-refeicao",
        texto: "Fechar a janela no horário",
        detalhe:
          "Depois da última refeição, só água e chá sem cafeína, sem açúcar, até o café da manhã — os remédios da noite seguem a lista.",
      },
      { id: "r-n-skincare", texto: "Skincare da noite" },
      {
        // Pedido dela em 12/10. O id já existiu até 04/08 ("Reduzir telas"),
        // com o mesmo sentido; as marcas daquela época são de antes da jornada.
        // O celular pode ficar: com bebê pequeno, ele é despertador, babá
        // eletrônica e o jeito de pedir ajuda à noite — por isso o som do
        // despertador e da babá fica ligado. Os registros da noite são feitos
        // no app, então vêm antes.
        id: "r-n-telas",
        texto: "Telas fora 1 hora antes de dormir",
        detalhe:
          "Antes, registre aqui os sintomas e a gratidão do dia. Depois, celular, TV e computador longe da cama: a luz e o conteúdo atrasam o sono. Se o celular é despertador ou babá eletrônica, ele fica — tela virada para baixo, notificações desligadas e o som do despertador e da babá ligado.",
      },
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

/**
 * Aparecem no fim de /rotina, com o próprio texto como chave: dois itens
 * iguais quebram a lista.
 */
export const SEGURANCA = [
  "Nenhum remédio é suspenso, trocado de dia ou ajustado sem o médico que receitou — Mounjaro, testosterona e fórmula inclusive.",
  // Tremor e suor frio são sinais de açúcar baixo, e a regra é açúcar rápido e
  // sozinho (ADA e SBD): proteína e fibra atrasam a subida — e o Mounjaro já
  // deixa o estômago mais lento. Confusão ou desmaio é 192: quem está assim
  // não consegue procurar atendimento sozinha. Espelho do socorro do jejum
  // (JEJUM.socorro, em data/alimentacao.ts) e do card do treino (AJUSTES_TREINO,
  // em data/alarmes.ts): mudou um, mude os outros.
  "Jejum não é para passar mal. Tremor, suor frio, fraqueza ou tontura podem ser açúcar baixo: 15 g de açúcar rápido e sozinho — 1 colher de sopa de açúcar na água ou 150 ml de suco ou refrigerante comum —, espere 15 minutos e, se não passar, repita uma vez. Passou: um lanche com proteína. Não passou: atendimento. Confusão ou desmaio: 192 (SAMU). E avise o médico.",
  "Mounjaro: dor forte na barriga que não passa (às vezes indo para as costas), vômito que não para ou sinais de desidratação — procure atendimento.",
  "Testosterona na pele: lave as mãos depois de passar e deixe o local coberto pela roupa. O bebê não pode encostar na pele onde foi aplicada.",
  // Quando parar o treino e procurar ajuda: o texto mora em data/alarmes.ts, e
  // o card do Treino mostra os mesmos, com as mesmas palavras. Em 12/10 saiu
  // daqui a regra antiga de dor no peito ("procure atendimento"), para o mesmo
  // sinal ter uma ordem só: 192.
  ...ALARMES_URGENTES,
  // Espelho de DIASTASE.fisio (data/workouts.ts).
  "Treino: escape de urina, sensação de peso ou de 'bola' na vagina, dor, ou a barriga formando um 'morrinho' no meio — pare, ajuste ou troque o exercício e fale com a fisioterapeuta pélvica.",
  // Ajustes de 12/10. É o que toda consulta antes de anestesia pergunta; com
  // tudo na mão antes de marcar, o cirurgião e o anestesista planejam o
  // preparo, e o médico que receitou decide sobre cada remédio a tempo.
  "Antes de marcar a cirurgia plástica (ou qualquer anestesia), leve ao cirurgião e ao anestesista a lista de todos os remédios — Mounjaro e testosterona inclusive — e todos os seus exames, também os que não estão no app. Conte se você ou alguém da família de sangue já teve trombose ou embolia. O Mounjaro costuma precisar de ajuste antes; a testosterona, só o médico decide se para.",
];
