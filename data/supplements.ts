export type Supplement = {
  id: string;
  nome: string;
  dose: string;
  horario: string;
  funcao: string;
  observacao?: string;
};

export const SUPPLEMENTS: Supplement[] = [
  {
    id: "whey",
    nome: "Whey Protein",
    dose: "30 g (1 scoop)",
    horario: "Logo após o treino",
    funcao:
      "Proteína de absorção rápida. Recupera o músculo, ajuda a ganhar massa magra e dá saciedade. Com déficit calórico para emagrecer, o Whey protege a musculatura.",
    observacao:
      "Pode bater com água, leite desnatado ou leite vegetal. Misture com a Creatina no mesmo shake.",
  },
  {
    id: "creatina",
    nome: "Creatina Monohidratada",
    dose: "3–5 g",
    horario: "Qualquer horário (de preferência junto com o Whey)",
    funcao:
      "Aumenta força, performance no treino e recuperação. Ajuda a ganhar massa magra com mais facilidade. Tomar TODOS os dias, mesmo nos de descanso, sem 'ciclar'.",
    observacao:
      "Beba bastante água ao longo do dia (já está na meta de 2,5–3 L). Os primeiros dias podem retir até 1 kg de água — é normal e não é gordura.",
  },
  {
    id: "omega3",
    nome: "Ômega 3 (EPA + DHA)",
    dose: "1–2 g",
    horario: "Junto com o almoço (com gordura ajuda absorção)",
    funcao:
      "Anti-inflamatório natural. Ajuda muito na gordura no fígado, na pressão e na recuperação muscular. Pós-parto também colabora com humor.",
    observacao: "Verifique no rótulo: precisa ter pelo menos 500 mg de EPA + DHA por cápsula.",
  },
  {
    id: "vitafer-almoco",
    nome: "Vitafer (almoço)",
    dose: "1 comprimido",
    horario: "Logo após o almoço",
    funcao:
      "Reposição de ferro e vitaminas. Pós-gestação muitas mulheres ficam anêmicas e cansadas. O ferro ajuda na disposição para treinar.",
    observacao:
      "Não tome com café, chá ou leite (atrapalham a absorção do ferro). Se possível, tome com suco de laranja ou água com limão — a vitamina C melhora a absorção do ferro.",
  },
  {
    id: "vitafer-jantar",
    nome: "Vitafer (jantar)",
    dose: "1 comprimido",
    horario: "Logo após o jantar",
    funcao:
      "Segunda dose diária. Mantém os níveis de ferro e vitaminas estáveis ao longo do dia.",
    observacao:
      "Mesmo cuidado: nada de café, chá preto ou leite junto. Pode tomar com um copo d'água ou suco natural.",
  },
];
