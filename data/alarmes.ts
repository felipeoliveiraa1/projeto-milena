/**
 * Quando parar o treino e procurar ajuda — ajustes de 12/10/2026.
 *
 * Fonte única destes textos. Os urgentes entram nas Regras de segurança da
 * Rotina (data/protocol.ts) e no card do Treino; os ajustes ficam só no card do
 * Treino. O card da testosterona repete as mesmas condutas, com as mesmas
 * palavras, para nunca haver duas ordens diferentes para o mesmo sinal.
 *
 * Este arquivo não importa nada de propósito: protocol.ts e workouts.ts se
 * importam, e um valor vindo deles aqui fecharia um ciclo de carregamento.
 */

/** Título e explicação do card do Treino. */
export const CARD_ALARMES = {
  titulo: "Quando parar e procurar ajuda",
  /** Aparece com o card fechado: o mais urgente fica sempre à vista. */
  resumo: "Dor no peito, falta de ar de repente ou desmaio: pare e ligue 192 (SAMU). Toque para ver os outros sinais.",
  descricao:
    "Treinar é seguro e ajuda o coração, o açúcar do sangue e a circulação. É esperado: fôlego curto que volta em 1 a 2 minutos parada e músculo dolorido 1 ou 2 dias depois de um treino novo, que melhora com movimento leve. Xixi amarelo-escuro, sem os sinais abaixo, é pouca água: beba mais.",
};

/** Do mais urgente para o menos. Também fazem parte das Regras de segurança. */
export const ALARMES_URGENTES: string[] = [
  "Dor, aperto ou peso no peito; falta de ar que começa de repente ou muito maior do que o esforço pede; tosse com sangue; desmaio; coração disparado ou batendo irregular que não acalma depois de alguns minutos parada; rosto torto, fala enrolada, fraqueza de um lado do corpo ou dor de cabeça fortíssima que começa de repente — pare e ligue 192 (SAMU). Não vá dirigindo.",
  "Uma perna só — em geral a batata da perna — inchada, doída, quente ou vermelha: pronto-socorro no mesmo dia. Não é dor de treino; não espere passar.",
  "Xixi escuro, cor de chá ou de refrigerante de cola, nos dias depois do treino — mesmo com pouca dor —, ou dor muscular muito mais forte que a de costume, que piora em vez de melhorar, com o músculo inchado, duro ou fraco: pare de treinar, beba água e procure atendimento no mesmo dia. Anti-inflamatório por conta própria, não.",
];

/** O que muda no treino do dia. Só no card do Treino. */
export const AJUSTES_TREINO: string[] = [
  "Vômito, diarreia ou febre: hoje não tem treino — descanso e água em goles. Volte quando estiver comendo e bebendo normal; um dia parado não atrapalha o plano. Se não pararem, ou se vierem boca seca, pouco xixi ou tontura, procure atendimento.",
  "Tremor, suor frio ou fraqueza durante o treino podem ser açúcar baixo: pare, sente e tome açúcar rápido — 3 sachês de açúcar num pouco de água ou 150 ml de suco comum (zero não serve). Espere 15 minutos e, se não passar, repita uma vez. Não melhorou: procure atendimento; confusão ou desmaio: 192 (SAMU). Só tontura, sem tremor nem suor: sente ou deite e beba água; não passou, tome o açúcar. Leve sempre na bolsa 3 sachês de açúcar ou uma caixinha de suco comum.",
  "Pontada ou dor no joelho, no quadril ou na lombar durante o exercício — diferente do cansaço do músculo: diminua a amplitude ou a carga, ou troque o exercício. Inchou, travou, está mancando ou a dor desce para a perna, com formigamento ou fraqueza: médico.",
];
