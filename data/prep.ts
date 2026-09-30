/**
 * Preparo e conservação dos alimentos do cardápio da semana.
 *
 * O que congela, o que só refrigera e o que precisa ser feito na hora — para
 * a semana caber em um mutirão e um reforço. As porções seguem o resumo de
 * alimentação: 120 g de frango, carne ou peixe no almoço, 70 g de frango no
 * fechamento.
 */

export type PrepItem = {
  id: string;
  nome: string;
  como: string;
  /** Quanto tempo dura depois de pronto, quando isso importa. */
  validade?: string;
  /** Alerta que muda a decisão (textura, segurança, sabor). */
  alerta?: string;
};

export type PrepGrupo = {
  id: "congelar" | "refrigerar" | "hora";
  titulo: string;
  descricao: string;
  icone: "snow" | "fridge" | "flame";
  itens: PrepItem[];
};

export const ESTRATEGIA = {
  titulo: "Um mutirão e um reforço",
  texto:
    "O cardápio se repete toda semana, então a compra e o preparo viram rotina. Um mutirão no dia da compra e um reforço rápido no meio da semana. Na geladeira fica o que você come em até 3 dias; o resto vai congelado em porções.",
  passos: [
    "Faça a compra pela lista — ela já sai com as quantidades da semana.",
    "Comece pelo que demora: arroz, batata, mandioca, mandioquinha e abóbora.",
    // O cardápio pede o frango de três jeitos — não é tudo desfiado.
    "Prepare o frango da semana — grelhado (segunda), em cubos ao molho (quarta) e desfiado (sexta e fechamentos) — e separe em porções de 120 g (almoço) e 70 g (fecha a janela).",
    "Porcione o patinho e o peixe crus, uma refeição por pacote, e congele.",
    "Enquanto isso, higienize e seque as folhas.",
    "Resfrie rápido antes de congelar e etiquete tudo com nome e data.",
    "No meio da semana: passe para a geladeira o que vai até domingo e cozinhe mais ovos, se precisar.",
  ],
  dica: "Uma balança de cozinha ajuda nas duas medidas que mais importam: 120 g de frango, carne ou peixe no almoço e 40 g de whey no lanche.",
};

export const PREPARO: PrepGrupo[] = [
  {
    id: "congelar",
    titulo: "Pode congelar",
    descricao: "Cozinhe, resfrie rápido, porcione e etiquete com nome e data.",
    icone: "snow",
    itens: [
      {
        id: "p-frango",
        nome: "Frango",
        como: "Grelhado, em cubos ou desfiado. Cozinhe, resfrie e divida em porções de 120 g e de 70 g.",
      },
      {
        id: "p-patinho",
        nome: "Patinho",
        como: "Congele cru, já em iscas ou moído, uma refeição por pacote. O moído também pode ir refogado e pronto.",
      },
      {
        id: "p-peixe",
        nome: "Peixe",
        como: "Congele cru, limpo e já porcionado.",
        alerta: "Tempere com limão só perto do preparo — o limão 'cozinha' o peixe na geladeira.",
      },
      {
        id: "p-arroz",
        nome: "Arroz",
        como: "Cozinhe, resfrie rápido e congele em porções pequenas — no almoço é só um pouco.",
        alerta: "Não deixe o arroz pronto esfriando fora da geladeira por horas.",
      },
      { id: "p-mandioca", nome: "Mandioca", como: "Cozinhe, escorra e congele em porções." },
      {
        id: "p-mandioquinha",
        nome: "Mandioquinha",
        como: "Cozinhe e congele já em purê.",
        alerta: "Em pedaços, fica mole e aguada ao descongelar.",
      },
      {
        id: "p-batata",
        nome: "Batata",
        como: "Congela, mas só funciona bem em purê.",
        alerta: "Em cubos, vira borracha — cozida ou assada, faça para 2 ou 3 dias e deixe na geladeira.",
      },
      {
        id: "p-pao",
        nome: "Pão francês",
        como: "Tire o miolo, congele em saquinho e esquente na frigideira, no forno ou na torradeira.",
      },
      {
        id: "p-legumes",
        nome: "Brócolis, vagem e cenoura",
        como: "Branqueie (1–2 min na água fervente), resfrie no gelo, seque e congele.",
      },
      { id: "p-abobora", nome: "Abóbora cabotiá", como: "Cozinhe ou asse e congele em cubos ou amassada." },
      {
        id: "p-couve",
        nome: "Couve",
        como: "Lave, seque, tire os talos grossos e fatie. Congela crua, pronta para refogar.",
      },
      { id: "p-cheiro-verde", nome: "Cheiro-verde", como: "Lave, seque bem, pique e congele solto." },
      { id: "p-cebola", nome: "Cebola picada", como: "Congele picada, pronta para o refogado." },
      {
        id: "p-frutas-whey",
        nome: "Banana e morango",
        como: "Maduros demais? Congele em pedaços — vão bem batidos com o whey.",
      },
    ],
  },
  {
    id: "refrigerar",
    titulo: "Melhor só na geladeira",
    descricao: "Prepare pouco e para poucos dias.",
    icone: "fridge",
    itens: [
      { id: "p-ovos", nome: "Ovos cozidos", como: "Guarde com casca na geladeira.", validade: "até 5 dias" },
      {
        id: "p-claras",
        nome: "Claras separadas",
        como: "Se separar antes, guarde em pote fechado e use logo.",
        validade: "até 2 dias",
      },
      {
        id: "p-proteina-pronta",
        nome: "Frango, carne e peixe prontos",
        como: "Na geladeira, só o que você come nos próximos dias. O resto, congelado.",
        validade: "até 3 dias",
      },
      {
        id: "p-queijo",
        nome: "Queijo minas, ricota e cottage",
        como: "No pote, bem fechados, na parte mais fria da geladeira.",
        validade: "poucos dias depois de abertos — siga o rótulo",
        alerta: "Não congele: ficam esfarelados e soltam água.",
      },
      {
        id: "p-iogurte",
        nome: "Iogurte proteico",
        como: "Fechado na geladeira até a hora de comer.",
      },
      { id: "p-folhas", nome: "Folhas", como: "Higienize, seque muito bem e guarde em pote com papel-toalha." },
      { id: "p-tomate-pepino", nome: "Tomate e pepino", como: "Guarde inteiros e corte perto de comer." },
      {
        id: "p-legumes-prontos",
        nome: "Legumes cozidos e refogados",
        como: "Abobrinha, chuchu, couve e cenoura prontos.",
        validade: "até 3 dias",
      },
      {
        id: "p-macarrao",
        nome: "Macarrão integral sem glúten",
        como: "Cozinhe só o que der para 2 ou 3 dias — sem glúten, amolece rápido.",
      },
      {
        id: "p-morango",
        nome: "Morango",
        como: "Na geladeira, sem lavar. Lave só na hora de comer, senão estraga rápido.",
      },
      {
        id: "p-fora",
        nome: "Banana e cebola inteira",
        como: "Fora da geladeira, em lugar fresco e arejado. Cebola cortada, aí sim, vai para a geladeira.",
      },
    ],
  },
  {
    id: "hora",
    titulo: "Fazer na hora",
    descricao: "Não adianta adiantar — perde textura, sabor ou segurança.",
    icone: "flame",
    itens: [
      { id: "p-omelete", nome: "Omelete e ovos mexidos", como: "Sempre na hora, numa frigideira antiaderente." },
      {
        id: "p-whey",
        nome: "Whey do lanche",
        como: "Bata na hora de tomar. O pó fica fora da geladeira, com o pote bem fechado.",
      },
      {
        id: "p-salada-temperada",
        nome: "Salada temperada",
        como: "Tempere só na hora de comer.",
        alerta: "Temperada com antecedência, a folha murcha.",
      },
      {
        id: "p-peixe-descongelado",
        nome: "Peixe descongelado",
        como: "Descongele na geladeira, nunca em cima da pia, e prepare.",
        alerta: "Peixe descongelado não volta cru para o congelador.",
      },
      {
        id: "p-frutas-cortadas",
        nome: "Frutas cortadas",
        como: "Corte na hora — banana e maçã escurecem rápido.",
      },
    ],
  },
];

export const TOTAL_ITENS_PREPARO = PREPARO.reduce((s, g) => s + g.itens.length, 0);
