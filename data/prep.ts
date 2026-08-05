/**
 * Preparo e conservação dos alimentos do cardápio.
 *
 * Vem direto das orientações fechadas na conversa: o que congela, o que só
 * refrigera, o que muda de textura e o que precisa ser feito na hora.
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
  titulo: "Duas etapas por semana",
  texto:
    "Não cozinhe os 15 dias de uma vez. Faça dois mutirões por semana: um no começo e outro no meio. Na geladeira fica só o que você come nos próximos dias; o resto vai congelado em porções.",
  passos: [
    "Deixe o grão-de-bico de molho na véspera do mutirão.",
    "Comece pelo que demora: grão-de-bico, arroz integral, quinoa, mandioca e abóbora.",
    "Enquanto cozinha, higienize e seque as folhas.",
    "Grelhe e desfie o frango; porcione o peixe cru.",
    "Resfrie rápido antes de congelar e etiquete tudo com nome e data.",
  ],
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
        como: "Desfiado, grelhado, assado ou em hambúrguer. Cozinhe, resfrie e divida em porções de uma refeição.",
      },
      {
        id: "p-peixe",
        nome: "Peixe",
        como: "Congele cru, limpo e já porcionado.",
        alerta: "Tempere com limão só perto do preparo — o limão 'cozinha' o peixe na geladeira.",
      },
      { id: "p-arroz", nome: "Arroz integral", como: "Cozinhe, resfrie rapidamente e porcione." },
      { id: "p-quinoa", nome: "Quinoa", como: "Cozinhe, escorra bem e porcione." },
      {
        id: "p-grao",
        nome: "Grão-de-bico",
        como: "De molho na véspera, cozinhe, escorra e congele em porções pequenas.",
      },
      { id: "p-batata-doce", nome: "Batata-doce", como: "Cozinhe ou asse deixando firme — se ficar muito mole, desmancha ao descongelar." },
      { id: "p-mandioca", nome: "Mandioca", como: "Cozinhe, escorra e congele em porções." },
      {
        id: "p-batata",
        nome: "Batata inglesa",
        como: "Congela, mas só funciona bem em purê, sopa ou preparação montada.",
        alerta: "Em cubos, vira borracha.",
      },
      { id: "p-molho", nome: "Molho de tomate caseiro", como: "Faça em quantidade e congele em porções." },
      { id: "p-sopa", nome: "Sopa", como: "Cozinhe, bata só uma parte e porcione." },
      {
        id: "p-brocolis",
        nome: "Brócolis e couve-flor",
        como: "Separe em floretes, branqueie (1–2 min na água fervente), resfrie no gelo, seque e congele.",
      },
      { id: "p-cenoura-cozida", nome: "Cenoura para preparações cozidas", como: "Branqueie ou cozinhe rapidamente antes de congelar." },
      { id: "p-abobora", nome: "Abóbora cabotiá", como: "Cozinhe ou asse e congele em cubos ou amassada." },
      { id: "p-beterraba", nome: "Beterraba", como: "Cozinhe ou asse, descasque, corte e congele." },
      {
        id: "p-couve",
        nome: "Couve",
        como: "Lave, higienize, seque, tire os talos grossos e fatie. Congela crua para refogar ou branqueada.",
      },
      { id: "p-cheiro-verde", nome: "Cheiro-verde", como: "Lave, seque bem, pique e congele solto." },
      { id: "p-manjericao", nome: "Manjericão", como: "Melhor congelar dentro do molho de tomate. As folhas soltas também vão." },
      { id: "p-cebola", nome: "Cebola picada", como: "Congele picada, pronta para refogado." },
      { id: "p-paozinho", nome: "Pãozinho de aveia ou cenoura", como: "Congele já assado e resfriado." },
      { id: "p-panqueca", nome: "Panqueca de banana", como: "Congele pronta, separando as unidades com papel." },
      { id: "p-hamburguer", nome: "Hambúrguer de frango", como: "Congele cru ou já preparado." },
      {
        id: "p-frutas-receita",
        nome: "Frutas para receita",
        como: "Banana, morango, abacaxi e uva congelam bem para vitamina e sobremesa de fruta.",
      },
      {
        id: "p-textura",
        nome: "Abobrinha, berinjela, chuchu e pimentão",
        como: "Só congele se for usar em sopa, molho ou refogado.",
        alerta: "Mudam de textura e soltam água — não servem para acompanhamento cortado.",
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
        id: "p-pate",
        nome: "Patê de atum/frango",
        como: "Faça pouca quantidade.",
        validade: "2 dias",
        alerta: "Não congele o patê já misturado.",
      },
      {
        id: "p-tofu",
        nome: "Tofu",
        como: "Mantenha na geladeira, na água, trocando a água.",
        validade: "poucos dias",
        alerta: "Congela, mas muda bastante a textura.",
      },
      { id: "p-folhas", nome: "Folhas", como: "Higienize, seque muito bem e guarde em pote com papel-toalha." },
      { id: "p-tomate-pepino", nome: "Tomate e pepino", como: "Guarde inteiros e corte perto do consumo." },
      {
        id: "p-cenoura-crua",
        nome: "Cenoura para salada e patê",
        como: "Mantenha inteira e seca. Ralada, use em 2 ou 3 dias.",
      },
      { id: "p-hortela", nome: "Hortelã", como: "Higienize, seque e guarde com papel-toalha levemente úmido." },
      { id: "p-melao", nome: "Melão", como: "Lave a casca, corte, tire as sementes e refrigere." },
      {
        id: "p-abacaxi",
        nome: "Abacaxi",
        como: "Refrigere o que for comer fresco; o excesso pode ir ao congelador para vitamina.",
      },
      { id: "p-berinjela", nome: "Berinjela", como: "Prepare para 2 ou 3 dias.", alerta: "Congelada refogada, amolece." },
      { id: "p-chuchu", nome: "Chuchu", como: "Guarde cru e inteiro. Cozido, dura até 3 dias na geladeira." },
      { id: "p-repolho", nome: "Repolho", como: "Mantenha a cabeça inteira; depois de cortar, proteja bem." },
      { id: "p-abobrinha", nome: "Abobrinha", como: "Inteira e seca na geladeira; corte perto do preparo. Refogada, 2 a 3 dias." },
      { id: "p-cuscuz", nome: "Cuscuz", como: "Guarde por pouco tempo — perde a textura rápido.", validade: "2 dias" },
      { id: "p-macarrao", nome: "Macarrão sem glúten", como: "Cozinhe só o que der para 2 ou 3 dias." },
      { id: "p-frutas", nome: "Frutas frescas", como: "Corte perto do consumo." },
      {
        id: "p-cebola-inteira",
        nome: "Cebola inteira",
        como: "Fora da geladeira, em local seco e ventilado. Cortada, aí sim vai para a geladeira.",
      },
    ],
  },
  {
    id: "hora",
    titulo: "Fazer na hora",
    descricao: "Não adianta adiantar — perde textura, sabor ou segurança.",
    icone: "flame",
    itens: [
      { id: "p-omelete", nome: "Omelete e ovos mexidos", como: "Sempre na hora." },
      { id: "p-bananovo", nome: "Bananovo", como: "Banana amassada com ovo, direto na frigideira." },
      { id: "p-tapioca", nome: "Tapioca e crepioca", como: "Na hora — a massa pronta murcha." },
      { id: "p-salada-temperada", nome: "Salada temperada", como: "Tempere só na hora de comer.", alerta: "Temperada com antecedência, a folha murcha." },
      { id: "p-salada-frutas", nome: "Salada de frutas", como: "Na hora ou, no máximo, na noite anterior." },
      {
        id: "p-peixe-descongelado",
        nome: "Peixe descongelado",
        como: "Descongele na geladeira e prepare.",
        alerta: "Peixe descongelado não volta cru para o congelador.",
      },
      { id: "p-frutas-cortadas", nome: "Frutas cortadas", como: "Corte na hora para não oxidar." },
    ],
  },
];

export const TOTAL_ITENS_PREPARO = PREPARO.reduce((s, g) => s + g.itens.length, 0);
