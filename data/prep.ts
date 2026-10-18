/**
 * Preparo e conservação dos alimentos do plano da nutricionista (18/10/2026).
 *
 * O que congela, o que só refrigera e o que precisa ser feito na hora — para
 * as proteínas e os grãos da semana caberem numa sessão de preparo. As porções
 * são as do plano (data/meals.ts): 150 g de frango e 140 g de peixe no almoço.
 *
 * As validades são as regras gerais de segurança dos alimentos: comida pronta
 * fica até 3 dias na geladeira e até 3 meses no congelador, bem fechada. O
 * rótulo do produto vale mais que a regra geral.
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
  titulo: "Uma sessão de preparo na semana",
  texto:
    "As proteínas e os grãos da semana saem de uma vez, no dia da compra, na divisão de opções que você escolheu na lista. Na geladeira fica o que você come em até 3 dias; o resto vai congelado em porções.",
  passos: [
    "Faça a compra pela lista — ela já sai com as quantidades da divisão que você escolheu.",
    "Comece pelo que demora: o grão-de-bico (de molho na véspera, se for o seco), a quinoa e a batata-doce.",
    "Grelhe o frango e separe em porções de 150 g para o almoço — e, se for usar no café da manhã no lugar da sardinha ou do atum, porções de 80 g desfiado.",
    "Porcione o peixe cru com uma folga — os 140 g do plano são do peixe já grelhado ou assado, e ele encolhe no preparo — e congele.",
    "Cozinhe os legumes da semana e alguns ovos para os lanches.",
    "Enquanto isso, lave e seque bem as folhas e corte os legumes crus da salada.",
    "Resfrie rápido antes de guardar e etiquete tudo com nome e data.",
    "No meio da semana: passe para a geladeira o que vai até domingo e compre folhas frescas, se precisar.",
  ],
  dica: "Uma balança de cozinha ajuda nas medidas que mais importam: 150 g de frango e 140 g de peixe no almoço, e a dose do whey.",
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
        nome: "Frango grelhado ou desfiado",
        como: "Grelhe, resfrie e divida em porções de 150 g (almoço) — ou de 80 g desfiado, para o café da manhã.",
        validade: "até 3 meses congelado",
      },
      {
        id: "p-peixe",
        nome: "Peixe porcionado",
        como: "Congele cru, limpo e porcionado, com uma folga sobre os 140 g: a medida do plano é a do peixe pronto.",
        validade: "até 3 meses congelado",
        alerta: "Tempere com limão só perto do preparo — o limão 'cozinha' o peixe na geladeira.",
      },
      {
        id: "p-grao-de-bico",
        nome: "Grão-de-bico cozido",
        como: "Deixe o seco de molho de 8 a 12 horas, troque a água e cozinhe até ficar macio. Escorra, resfrie e congele em porções de 150 g.",
        validade: "até 3 meses congelado",
      },
      {
        id: "p-quinoa",
        nome: "Quinoa cozida",
        como: "Lave bem antes de cozinhar (tira o amargo). Cozinhe, resfrie rápido e congele em porções.",
        validade: "até 3 meses congelado",
        alerta: "Não deixe a quinoa pronta esfriando fora da geladeira por horas.",
      },
      {
        id: "p-batata-doce",
        nome: "Batata-doce assada",
        como: "Asse, deixe esfriar e congele em porções de 100 g. Esquente no forno ou na frigideira.",
        validade: "até 3 meses congelado",
      },
      {
        id: "p-legumes-cozidos",
        nome: "Legumes cozidos",
        como: "Brócolis, vagem, cenoura e abobrinha: branqueie (1–2 min na água fervente), resfrie no gelo, seque e congele em porções de 100 g.",
        validade: "até 3 meses congelado",
      },
    ],
  },
  {
    id: "refrigerar",
    titulo: "Melhor só na geladeira",
    descricao: "Prepare pouco e para poucos dias.",
    icone: "fridge",
    itens: [
      {
        id: "p-ovos",
        nome: "Ovos cozidos",
        como: "Guarde com casca, em pote fechado, na geladeira.",
        validade: "até 5 dias",
      },
      {
        id: "p-proteina-pronta",
        nome: "Frango, peixe e grãos prontos",
        como: "Na geladeira, só o que você come nos próximos dias. O resto, congelado.",
        validade: "até 3 dias",
      },
      {
        id: "p-folhas",
        nome: "Salada lavada e seca",
        como: "Higienize, seque muito bem e guarde em pote fechado com papel-toalha.",
        validade: "3 a 4 dias",
        alerta: "Folha guardada molhada estraga rápido.",
      },
      {
        id: "p-legumes-crus",
        nome: "Legumes crus cortados",
        como: "Cenoura ralada e pepino em pote fechado. O tomate, corte perto de comer.",
        validade: "até 3 dias",
      },
      {
        id: "p-linhaca",
        nome: "Linhaça moída",
        como: "Depois de aberta, na geladeira, em pote bem fechado e longe da luz.",
        alerta: "Moída, ela perde o frescor rápido: cheiro de ranço, jogue fora.",
      },
      {
        id: "p-kefir",
        nome: "Kefir ou iogurte natural",
        como: "Fechado na geladeira até a hora de comer. Com a chia: misture e espere uns minutos antes de comer.",
        validade: "siga o rótulo — aberto, poucos dias",
        alerta: "Não congele: separa e fica aguado.",
      },
      {
        id: "p-queijo",
        nome: "Queijo branco sem lactose",
        como: "No pote, bem fechado, na parte mais fria da geladeira.",
        validade: "poucos dias depois de aberto — siga o rótulo",
      },
    ],
  },
  {
    id: "hora",
    titulo: "Fazer na hora",
    descricao: "Não adianta adiantar — perde textura, sabor ou segurança.",
    icone: "flame",
    itens: [
      {
        id: "p-omelete",
        nome: "Omelete e ovos mexidos",
        como: "Sempre na hora, numa frigideira antiaderente, com o fio de azeite do plano.",
      },
      {
        id: "p-shake",
        nome: "Shake de whey",
        como: "Bata na hora de tomar e tome logo. O pó fica fora da geladeira, com o pote bem fechado.",
      },
      {
        id: "p-molho",
        nome: "Molho de azeite e limão",
        como: "A colher de azeite com o limão espremido na hora.",
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
    ],
  },
];
