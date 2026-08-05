/**
 * Suplementos, organizados em dois blocos: manhã e noite.
 *
 * As doses ficam como "conforme orientação" de propósito — quem define é o
 * médico ou a nutricionista dela, e o app não inventa quantidade.
 *
 * O ritual de limão e própolis não está aqui: ele vive na rotina da manhã
 * (data/protocol.ts), para não existir dois lugares marcando a mesma coisa.
 */

export type Supplement = {
  id: string;
  nome: string;
  dose: string;
  bloco: "manha" | "noite";
  /** Dias da semana em que ele entra (0 = domingo). Sem isto, é todo dia. */
  dias?: number[];
  funcao: string;
  observacao?: string;
  /** prescricao = receita médica, não se mexe. opcional = decisão dela com o médico. */
  status: "protocolo" | "prescricao" | "opcional";
};

export const BLOCOS_SUPLEMENTOS = [
  { id: "manha", titulo: "De manhã", detalhe: "Junto com o ritual da manhã." },
  { id: "noite", titulo: "À noite", detalhe: "Depois do jantar, antes de dormir." },
] as const;

export const SUPPLEMENTS: Supplement[] = [
  /* ----------------------------- manhã ----------------------------------- */
  {
    id: "nac",
    nome: "NAC",
    dose: "conforme orientação",
    bloco: "manha",
    funcao:
      "N-acetilcisteína: matéria-prima da glutationa, o antioxidante que o fígado usa para trabalhar. Combina com o objetivo de tratar a gordura no fígado.",
    observacao: "Costuma ser melhor absorvido longe das refeições. Se pesar no estômago, tome com comida.",
    status: "protocolo",
  },
  {
    id: "glutamina",
    nome: "Glutamina",
    dose: "conforme orientação",
    bloco: "manha",
    funcao:
      "Aminoácido que alimenta as células do intestino. Ajuda a barreira intestinal, que é o alvo central do protocolo.",
    observacao: "Dissolva em água em temperatura ambiente e tome longe das refeições.",
    status: "protocolo",
  },
  {
    id: "b12",
    nome: "Vitamina B12",
    dose: "conforme exame",
    bloco: "manha",
    funcao: "Energia, disposição e sistema nervoso. A dose certa é a que o seu exame indicar.",
    observacao: "De manhã, porque em algumas pessoas atrapalha o sono se tomada tarde.",
    status: "prescricao",
  },
  {
    id: "vitd",
    nome: "Vitamina D3",
    dose: "conforme exame",
    bloco: "manha",
    dias: [1], // segunda-feira
    funcao: "Imunidade, humor e osso. Só faz sentido na dose que o exame indicar.",
    observacao:
      "Uma vez por semana, na segunda. Tome junto de uma refeição com gordura — é assim que ela é absorvida.",
    status: "prescricao",
  },
  {
    id: "creatina",
    nome: "Creatina monohidratada",
    dose: "3–5 g",
    bloco: "manha",
    funcao:
      "Força e recuperação no treino. Não tem leite e não é industrializado, então não bate de frente com o protocolo.",
    observacao: "Todo dia, inclusive nos de descanso. Não precisa 'ciclar'.",
    status: "protocolo",
  },

  /* ----------------------------- noite ----------------------------------- */
  {
    id: "omega3",
    nome: "Ômega 3 (EPA + DHA)",
    dose: "conforme orientação",
    bloco: "noite",
    funcao:
      "Anti-inflamatório de verdade — o suplemento que mais combina com o protocolo. Ajuda fígado, pressão e humor no pós-parto.",
    observacao:
      "No rótulo: pelo menos 500 mg de EPA + DHA por cápsula. Tomar junto do jantar melhora a absorção.",
    status: "protocolo",
  },
  {
    id: "magnesio",
    nome: "Pró Magnésio",
    dose: "conforme orientação",
    bloco: "noite",
    funcao:
      "Relaxamento muscular, sono e intestino. À noite ele trabalha a favor da rotina de dormir cedo.",
    observacao: "Se soltar demais o intestino, converse sobre reduzir a dose.",
    status: "protocolo",
  },
  {
    id: "colageno",
    nome: "Colágeno",
    dose: "conforme orientação",
    bloco: "noite",
    funcao: "Pele, cabelo e articulações — o pós-parto costuma cobrar dos três.",
    observacao: "Dissolva na água ou no chá da noite. Sem açúcar e sem adoçante, como o resto do protocolo.",
    status: "protocolo",
  },
];

/** O que saiu da suplementação por causa do protocolo. */
export const SUPLEMENTOS_SUSPENSOS = [
  {
    nome: "Whey protein",
    porque:
      "É derivado do leite, e o protocolo tira leite e derivados nos 15 dias. A proteína do pós-treino passa a vir de comida: 2 ovos, frango desfiado ou o patê de atum/frango.",
  },
];
