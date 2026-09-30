import type { Exercise } from "./workouts";

/**
 * Peças que os dois planos usam do mesmo jeito. Ficam num lugar só para a dica
 * mudar junto nos dois — e num arquivo à parte porque workouts.ts importa a
 * adaptação: se a adaptação importasse valores de volta, o ciclo quebraria o
 * carregamento dos módulos.
 */

/**
 * Deslizamento de calcanhar: igual nos dois planos, só muda o número de séries.
 * O vídeo é em inglês: os em português que achamos misturavam pernas no ar, as
 * duas pernas deslizando juntas ou uma bola, e com diástase a versão certa é a
 * de um pé por vez, no chão. Por isso a dica diz o movimento inteiro.
 */
export const DESLIZAMENTO_CALCANHAR: Omit<Exercise, "series" | "descanso"> = {
  nome: "Deslizamento de calcanhar (deitada)",
  reps: "10 cada perna",
  beneficio:
    "A barriga baixa trabalhando por dentro, do jeito que a fisioterapia usa na diástase.",
  equipamento: "Colchonete (de meia, para o pé deslizar)",
  videoId: "38xz_sRgj8Q",
  grupos: ["cintura"],
  dica: "Deitada, joelhos dobrados. Solte o ar fechando o zíper e deslize um calcanhar pelo chão até a perna esticar, sem a lombar sair do chão; volte e troque. O vídeo é em inglês, mas a imagem mostra tudo.",
};

/**
 * Abre toda ida à academia. Não leva o cardio entre as séries: é o preparo,
 * feito com calma, e ensina o jeito de soltar o ar que vale no treino inteiro.
 *
 * Sem `grupos` de propósito: ele está em todo dia de academia, e contá-lo na
 * cintura faria um dia só de costas e braços passar por dia de cintura na
 * prova de "Definir a cintura".
 */
export const TRANSVERSO: Exercise = {
  nome: "Respiração com transverso (fechar o zíper)",
  series: "1",
  reps: "8 respirações",
  descanso: "—",
  beneficio:
    "Liga a faixa funda da barriga antes de tudo — é ela que ajuda a controlar a pressão na barriga nos outros exercícios.",
  equipamento: "Colchonete",
  videoId: "H1DiyGnjwwI",
  semCardio: true,
  dica: "Deitada, joelhos dobrados. Puxe o ar pelo nariz; solte pela boca, em biquinho, fechando o zíper da barriga de baixo para cima.",
};

/**
 * O que mais pesa no dead bug é a perna esticando (ela pesa uns três braços e
 * tem alavanca maior). Por isso, se a barriga estufar, a perna é que encurta.
 */
export const NOTA_DEAD_BUG: NonNullable<Exercise["diastase"]> = {
  nivel: "cuidado",
  nota: "Lombar encostada no chão e barriga sem estufar. Estufou? Deixe os braços parados e, em vez de esticar a perna, desça o pé com o joelho dobrado até o calcanhar tocar o chão. Se ainda estufar, troque pelo deslizamento de calcanhar.",
};

export const NOTA_PERDIGUEIRO: NonNullable<Exercise["diastase"]> = {
  nivel: "cuidado",
  nota: "Zíper fechado e costas retas como uma mesa. Se a barriga pender ou estufar, estique só a perna e deixe as mãos no chão.",
};

export const ALONGAMENTO_ADUTOR: Exercise = {
  nome: "Alongamento da parte interna da coxa (borboleta)",
  series: "3",
  reps: "30 s",
  descanso: "—",
  beneficio: "Solta a parte interna da coxa, que trabalha nos dias de academia.",
  equipamento: "Colchonete",
  videoId: "OGJzqvXQ3jo",
  semCardio: true,
  dica: "Sentada, solas dos pés juntas e joelhos caindo para os lados. Sem empurrar os joelhos com as mãos.",
};

export const ALONGAMENTO_GERAL: Exercise = {
  nome: "Alongamento geral",
  series: "1",
  reps: "5–10 min",
  descanso: "—",
  beneficio: "Alivia a lombar, que é o que mais reclama no pós-parto.",
  equipamento: "Colchonete",
  videoId: "cvhQkEjB--o",
  semCardio: true,
};
