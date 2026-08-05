/**
 * Protocolo Desinflama-se — regras, rotina e restrições da Milena.
 *
 * Fonte: apostila do protocolo + e-books de receitas + a lista de preferências
 * e ajustes que ela fechou na conversa exportada em 04/08/2026.
 *
 * Este arquivo é a única fonte de verdade das regras. O cardápio (data/meals.ts),
 * a lista de compras (data/shopping.ts) e o preparo (data/prep.ts) derivam daqui.
 */

export const PROTOCOLO = {
  nome: "Desinflama-se",
  duracaoDias: 15,
  /**
   * Data em que a Milena começou o ciclo de 15 dias (formato AAAA-MM-DD).
   * Serve de padrão — ela pode corrigir pelo próprio app, na tela /rotina.
   */
  inicioPadrao: "2026-08-03",
  resumo:
    "15 dias tirando do prato o que inflama (açúcar, adoçante, glúten, leite, fritura, álcool e industrializado) e colocando comida de verdade, água, sono e rotina.",
};

/* -------------------------------------------------------------------------- */
/* Montagem do prato                                                          */
/* -------------------------------------------------------------------------- */

export const MONTAGEM_PRATO = [
  { fracao: "½ prato", item: "Verduras e legumes", cor: "bg-brand" },
  { fracao: "¼ prato", item: "Proteína", cor: "bg-clay" },
  { fracao: "¼ prato", item: "Carboidrato", cor: "bg-gold" },
];

export const ORDEM_CONSUMO = [
  { passo: 1, o: "Folhas", porque: "Fibra primeiro: enche o estômago e segura o pico de glicose." },
  { passo: 2, o: "Legumes", porque: "Mais fibra e volume, ainda antes da parte densa." },
  { passo: 3, o: "Proteína", porque: "Saciedade que dura e preserva massa magra." },
  { passo: 4, o: "Carboidrato", porque: "Por último, o corpo já está saciado e você come menos." },
];

export const EXTRAS_PRATO = [
  "Leguminosa: grão-de-bico em porção pequena, se cair bem.",
  "Gordura boa: um fio de azeite, 1 colher de chá de chia ou linhaça, ou algumas nozes.",
  "Refeições menores: proteína + carboidrato de qualidade + fruta ou vegetal.",
];

/* -------------------------------------------------------------------------- */
/* Preferências fechadas pela Milena                                          */
/* -------------------------------------------------------------------------- */

export const PREFERENCIAS = {
  proteinas: {
    sim: ["Frango", "Peixe", "Ovos", "Tofu"],
    nao: ["Frutos do mar", "Fígado", "Sardinha"],
  },
  carboidratos: {
    sim: [
      "Arroz integral",
      "Batata",
      "Batata-doce",
      "Mandioca",
      "Quinoa",
      "Tapioca",
      "Cuscuz",
      "Macarrão sem glúten",
    ],
    nao: ["Mandioquinha (batata baroa) — não é a mesma coisa que mandioca"],
  },
  leguminosas: {
    sim: ["Grão-de-bico"],
    nao: ["Feijão", "Lentilha", "Ervilha"],
  },
};

/* -------------------------------------------------------------------------- */
/* Permitidos e proibidos                                                     */
/* -------------------------------------------------------------------------- */

export const FORA_DO_PROTOCOLO = [
  { item: "Açúcar", detalhe: "Em qualquer forma — inclusive mel e melado." },
  { item: "Adoçante", detalhe: "Nenhum, nem natural nem artificial." },
  { item: "Glúten", detalhe: "Trigo, pão comum, torrada, macarrão comum, bolacha." },
  { item: "Leite e derivados", detalhe: "Leite, iogurte, queijo, coalhada, requeijão e whey." },
  { item: "Frituras", detalhe: "Nada de imersão em óleo." },
  { item: "Álcool", detalhe: "Zero durante os 15 dias." },
  {
    item: "Industrializado fora da lista",
    detalhe: "Só entra o que passar nos critérios de rótulo abaixo.",
  },
];

export const CRITERIOS_ROTULO = [
  "Poucos ingredientes — se a lista é longa, devolve pra prateleira.",
  "Sem açúcar adicionado (inclusive xarope de glicose, maltodextrina, dextrose).",
  "Sem corante.",
  "Sem realçador de sabor.",
  "Sem gordura vegetal hidrogenada.",
];

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
};

/**
 * Rotina que vem de fábrica. A Milena pode editar tudo pelo app (adicionar,
 * renomear e remover itens e blocos) — o que ela salvar vive em lib/routine.ts
 * e substitui esta lista. Aqui fica só o ponto de partida e o botão "restaurar".
 *
 * Os ids são gravados no Supabase dentro de daily_checks.supplements, junto com
 * os suplementos. O prefixo "r-" separa rotina de suplemento.
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
      { id: "r-m-motivos", texto: "Reler os motivos do desafio" },
    ],
  },
  {
    id: "movimento",
    titulo: "Movimento",
    periodo: "dia",
    nota: "O treino do dia fica na aba Treino — este bloco é o extra do protocolo.",
    itens: [
      { id: "r-mov-atividade", texto: "Fazer a atividade física do dia" },
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
    periodo: "dia",
    itens: [
      {
        id: "r-ac-sintomas",
        texto: "Registrar sintomas do dia",
        campo: "texto",
        placeholder: "Como o corpo respondeu hoje?",
        opcoes: [
          "Sem sintomas",
          "Inchaço",
          "Dor de cabeça",
          "Intestino preso",
          "Cansaço",
          "Azia",
        ],
      },
    ],
  },
  {
    id: "noite",
    titulo: "Rotina da noite",
    periodo: "noite",
    itens: [
      { id: "r-n-refeicao", texto: "Fazer uma refeição mais leve" },
      { id: "r-n-skincare", texto: "Skincare da noite" },
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
/* Divergências encontradas na revisão                                        */
/* -------------------------------------------------------------------------- */

export type Divergencia = {
  id: string;
  tema: string;
  /** Gravidade: "seguranca" aparece primeiro e em vermelho. */
  tipo: "seguranca" | "protocolo" | "preferencia";
  antes: string;
  protocolo: string;
  decisao: string;
};

/**
 * O app foi originalmente montado sobre o plano do Dr. Henry (endocrinologista).
 * O protocolo Desinflama-se conflita com ele em vários pontos. Nada foi apagado
 * em silêncio: cada troca está registrada aqui e aparece na tela /dieta.
 */
export const DIVERGENCIAS: Divergencia[] = [
  {
    id: "medicamento",
    tema: "Medicamento",
    tipo: "seguranca",
    antes:
      "A apostila diz, em um trecho, que só o médico pode retirar medicamento — e, em outro, sugere suspender conforme a pressão ou a glicemia.",
    protocolo: "Os dois trechos não podem valer ao mesmo tempo.",
    decisao:
      "O app segue o trecho seguro: nenhum medicamento é suspenso ou ajustado sem o médico responsável. Com histórico de pressão alta gestacional e diabetes gestacional, isso não é negociável.",
  },
  {
    id: "laticinios",
    tema: "Leite e derivados",
    tipo: "protocolo",
    antes:
      "O plano anterior usava iogurte natural, leite desnatado, coalhada, queijos e whey — apareciam em quatro das seis refeições.",
    protocolo: "O protocolo tira leite e derivados durante os 15 dias.",
    decisao:
      "Saíram do cardápio e da lista. A proteína passou a vir de ovos, frango, peixe e tofu; onde precisava de leite, entrou leite de amêndoas caseiro ou de rótulo curto.",
  },
  {
    id: "gluten",
    tema: "Glúten",
    tipo: "protocolo",
    antes:
      "Pão integral, torrada integral, granola, macarrão integral, barra de cereais e bolacha de água e sal.",
    protocolo: "O protocolo tira o glúten.",
    decisao:
      "Trocados por tapioca, crepioca, pãozinho de aveia ou cenoura, cuscuz de milho e macarrão sem glúten. Compre aveia com selo sem glúten — a aveia comum costuma vir contaminada com trigo.",
  },
  {
    id: "acucar-mel",
    tema: "Açúcar, mel e adoçante",
    tipo: "protocolo",
    antes: "Havia mel no pré-treino, chocolate 70%, tâmaras e frutas secas como lanche.",
    protocolo:
      "Os materiais se contradizem: uma receita salgada traz mel como opcional, e o e-book de receitas doces afirma que o protocolo não usa mel.",
    decisao:
      "O app segue a regra mais restritiva: sem açúcar, sem mel e sem adoçante. Doce é fruta, e a canela faz o papel de adoçar.",
  },
  {
    id: "proteinas",
    tema: "Proteínas",
    tipo: "preferencia",
    antes:
      "O plano tinha salmão, camarão, atum fresco, sardinha, lombo de porco, patinho, coxão mole e peito de peru.",
    protocolo: "Você fechou em frango, peixe, ovos e tofu — sem frutos do mar, fígado e sardinha.",
    decisao:
      "Todo o resto saiu. O atum ficou só na versão do patê, em lata, com o óleo escorrido por completo — e o patê está sempre escrito como atum/frango, porque você ainda vai testar o atum.",
  },
  {
    id: "leguminosas",
    tema: "Leguminosas",
    tipo: "preferencia",
    antes: "Grão-de-bico estava na lista de evitar, junto com feijão e lentilha.",
    protocolo: "Agora o grão-de-bico é a única leguminosa que você mantém.",
    decisao:
      "Inverteu: grão-de-bico entrou no cardápio em porções pequenas (inclusive como homus). Feijão, lentilha e ervilha seguem fora.",
  },
  {
    id: "suplementos",
    tema: "Suplementos",
    tipo: "protocolo",
    antes: "Whey protein e creatina no pós-treino, ômega 3 e Vitafer.",
    protocolo: "Whey é derivado do leite.",
    decisao:
      "Whey saiu durante os 15 dias — a proteína do pós-treino virou comida (ovos ou frango). Creatina não tem leite e não é alimento: fica como decisão sua com o médico. Ômega 3 continua. Vitafer é prescrição e não se mexe.",
  },
  {
    id: "mandioquinha",
    tema: "Mandioquinha",
    tipo: "preferencia",
    antes: "Mandioquinha (batata baroa) aparecia como substituição do arroz.",
    protocolo: "Mandioquinha não é mandioca, e não está na sua lista de carboidratos.",
    decisao: "Saiu do cardápio e da lista de compras. Mandioca continua.",
  },
  {
    id: "salada-entrada",
    tema: "Salada como entrada",
    tipo: "protocolo",
    antes: "O médico já pedia salada como entrada obrigatória em toda refeição principal.",
    protocolo: "O protocolo pede a ordem folhas → legumes → proteína → carboidrato.",
    decisao:
      "Aqui os dois concordam. A regra ficou e virou a ordem oficial do prato no app.",
  },
];

/* -------------------------------------------------------------------------- */
/* Segurança                                                                  */
/* -------------------------------------------------------------------------- */

export const SEGURANCA = [
  "Nenhum medicamento é suspenso ou ajustado sem o médico que receitou.",
  "Limão, própolis, banho gelado, volume grande de água e exercício são adaptados à sua tolerância.",
  "Tontura, dor, enjoo, falta de ar ou fraqueza: não force o hábito, pare e procure orientação.",
  "Preparações perecíveis vão pra geladeira rápido; na geladeira só o que você come nos próximos dias.",
  "Não descongele alimento em cima da pia. Peixe descongelado se prepara — não volta cru pro congelador.",
  "Folhas e frutas cortadas ficam sempre refrigeradas.",
];
