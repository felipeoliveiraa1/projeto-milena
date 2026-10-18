/**
 * Quando parar o treino e procurar ajuda — ajustes de 12/10/2026.
 *
 * Fonte única destes textos: entram nas Regras de segurança da Rotina
 * (SEGURANCA, em data/protocol.ts). O card da testosterona repete as mesmas
 * condutas, com as mesmas palavras, para nunca haver duas ordens diferentes
 * para o mesmo sinal.
 *
 * Até 18/10 havia também uma aba Treino, com um card próprio destes sinais e
 * dos ajustes do treino do dia. A aba saiu; o que vale para a segurança ficou
 * em SEGURANCA.
 *
 * Este arquivo não importa nada de propósito: protocol.ts importa daqui, e um
 * valor vindo de lá fecharia um ciclo de carregamento.
 */

/** Do mais urgente para o menos. Fazem parte das Regras de segurança. */
export const ALARMES_URGENTES: string[] = [
  "Dor, aperto ou peso no peito; falta de ar que começa de repente ou muito maior do que o esforço pede; tosse com sangue; desmaio; coração disparado ou batendo irregular que não acalma depois de alguns minutos parada; rosto torto, fala enrolada, fraqueza de um lado do corpo ou dor de cabeça fortíssima que começa de repente — pare e ligue 192 (SAMU). Não vá dirigindo.",
  "Uma perna só — em geral a batata da perna — inchada, doída, quente ou vermelha: pronto-socorro no mesmo dia. Não é dor de treino; não espere passar.",
  "Xixi escuro, cor de chá ou de refrigerante de cola, nos dias depois do treino — mesmo com pouca dor —, ou dor muscular muito mais forte que a de costume, que piora em vez de melhorar, com o músculo inchado, duro ou fraco: pare de treinar, beba água e procure atendimento no mesmo dia. Anti-inflamatório por conta própria, não.",
];
