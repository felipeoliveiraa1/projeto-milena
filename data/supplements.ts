/**
 * Suplementos durante os 15 dias do protocolo.
 *
 * O ritual de limão e própolis não está aqui: ele vive na rotina da manhã
 * (data/protocol.ts), para não existir dois lugares marcando a mesma coisa.
 */

export type Supplement = {
  id: string;
  nome: string;
  dose: string;
  horario: string;
  funcao: string;
  observacao?: string;
  /** prescricao = receita médica, não se mexe. opcional = decisão dela com o médico. */
  status: "protocolo" | "prescricao" | "opcional";
};

export const SUPPLEMENTS: Supplement[] = [
  {
    id: "omega3",
    nome: "Ômega 3 (EPA + DHA)",
    dose: "1–2 g",
    horario: "Junto com o almoço",
    funcao:
      "Anti-inflamatório de verdade — é o suplemento que mais combina com o protocolo. Ajuda na gordura no fígado, na pressão e no humor pós-parto.",
    observacao: "No rótulo: pelo menos 500 mg de EPA + DHA por cápsula. Tomar com a gordura do almoço melhora a absorção.",
    status: "protocolo",
  },
  {
    id: "vitafer-almoco",
    nome: "Vitafer (almoço)",
    dose: "1 comprimido",
    horario: "Logo após o almoço",
    funcao: "Reposição de ferro e vitaminas, prescrita para o pós-gestação.",
    observacao:
      "Não tome com café ou chá — atrapalham o ferro. Com a água com limão, a vitamina C melhora a absorção. Prescrição médica: não suspenda por causa do protocolo.",
    status: "prescricao",
  },
  {
    id: "vitafer-jantar",
    nome: "Vitafer (jantar)",
    dose: "1 comprimido",
    horario: "Logo após o jantar",
    funcao: "Segunda dose do dia, mantém o nível de ferro estável.",
    observacao: "Mesmo cuidado: longe de café e chá.",
    status: "prescricao",
  },
  {
    id: "vitd",
    nome: "Vitamina D3",
    dose: "conforme o exame",
    horario: "Junto com uma refeição com gordura",
    funcao: "Só faz sentido na dose que o exame indicar. Ajuda imunidade, humor e osso.",
    observacao: "Se não tem exame recente, converse com o médico antes de manter.",
    status: "prescricao",
  },
  {
    id: "creatina",
    nome: "Creatina monohidratada",
    dose: "3–5 g",
    horario: "Qualquer horário, todos os dias",
    funcao:
      "Ajuda força e recuperação no treino. Não tem leite e não é alimento processado, então não bate de frente com o protocolo.",
    observacao:
      "Não faz parte do Desinflama-se — é uma escolha sua com o médico. Se quiser fazer os 15 dias 'limpos', pode pausar sem prejuízo.",
    status: "opcional",
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
