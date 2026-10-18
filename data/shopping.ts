/**
 * Catálogo de compras do plano da nutricionista (18/10/2026).
 *
 * A lista da semana é calculada: para cada refeição ela escolhe em quantos dias
 * come a opção 1 (o resto da semana é a opção 2), e a quantidade de cada
 * ingrediente é a soma de (porção × dias) em todas as opções que o usam. As
 * porções moram no próprio plano (data/meals.ts), na unidade daqui: `un`, `g`
 * ou `ml`.
 *
 * Os ids ficam gravados nas marcas de "já comprado" (shopping_state.items), por
 * isso um id antigo só volta para o mesmo alimento. Os que eram de alimentos que
 * saíram do plano (pão, patinho, iogurte proteico, o whey de antes…) não voltam
 * para outra coisa: a marca antiga passaria a valer para o item novo.
 */

import { PLANO_ALIMENTAR, REFEICOES_ORDEM, type RefeicaoPlanoId } from "./meals";

export type Unidade = "un" | "g" | "ml";

export type ShoppingItem = {
  id: string;
  nome: string;
  /** A unidade das porções no plano (data/meals.ts). */
  unidade: Unidade;
  /** Aviso de rótulo ou de preparo que importa na hora de comprar. */
  nota?: string;
  /** Despensa: entra em toda lista, mesmo que a semana não use. */
  essencial?: boolean;
  /** Quantidade escrita à mão — a dos essenciais, que não sai da conta. */
  quantidade?: string;
  /**
   * Como o total da semana vira texto de compra ("2 latas", "1 dúzia e meia").
   * Sem ela, vale o arredondamento padrão da unidade.
   */
  formato?: (total: number) => string;
};

export type ShoppingCategory = {
  id: string;
  nome: string;
  icone: string;
  itens: ShoppingItem[];
};

/* -------------------------------------------------------------------------- */
/* Arredondamento                                                             */
/* -------------------------------------------------------------------------- */

// As porções são frações exatas (½ tomate, ¼ de pepino), mas a soma em ponto
// flutuante pode passar um fio do inteiro: 2,0000000001 não vira 3 tomates.
const acima = (n: number, passo = 1) => Math.ceil(n / passo - 1e-9) * passo;

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

/**
 * Arredonda para cima no passo do tamanho — de 10 em 10 até 100, de 50 em 50
 * até 1.000, depois de 100 em 100 — e escreve em g/kg ou ml/L. A troca de
 * unidade é depois do arredondamento: 980 g vira "1 kg", nunca "1000 g".
 */
function formatarMedida(total: number, pequena: string, grande: string): string {
  if (total <= 0) return `0 ${pequena}`;
  const passo = total < 100 ? 10 : total < 1000 ? 50 : 100;
  const n = acima(total, passo);
  if (n < 1000) return `${n} ${pequena}`;
  return `${String(n / 1000).replace(".", ",")} ${grande}`;
}

export const formatarGramas = (total: number) => formatarMedida(total, "g", "kg");
const formatarMl = (total: number) => formatarMedida(total, "ml", "L");

const unidades = (total: number) => plural(acima(total), "unidade", "unidades");

/** Ovos de meia em meia dúzia: "meia dúzia", "1 dúzia e meia", "3 dúzias". */
export function formatarOvos(total: number): string {
  const meias = acima(total / 6);
  const duzias = Math.floor(meias / 2);
  const meia = meias % 2 === 1;
  const texto =
    duzias === 0
      ? "meia dúzia"
      : `${plural(duzias, "dúzia", "dúzias")}${meia ? " e meia" : ""}`;
  return `${texto} (${acima(total)} na semana)`;
}

/** Colheres de sopa de 10 g — a medida das sementes no plano. */
const colheres = (total: number) =>
  `${formatarGramas(total)} (${plural(acima(total / 10), "colher de sopa", "colheres de sopa")})`;

export function formatarQuantidade(item: ShoppingItem, total: number): string {
  if (item.formato && total > 0) return item.formato(total);
  if (item.quantidade) return item.quantidade;
  if (item.unidade === "g") return formatarGramas(total);
  if (item.unidade === "ml") return formatarMl(total);
  return unidades(total);
}

/* -------------------------------------------------------------------------- */
/* Catálogo                                                                   */
/* -------------------------------------------------------------------------- */

export const SHOPPING_LIST: ShoppingCategory[] = [
  {
    id: "proteinas",
    nome: "Carnes, peixes e ovos",
    icone: "🍗",
    itens: [
      // As claras contam como ovo inteiro: é assim que se compra.
      { id: "pr-ovos", nome: "Ovos", unidade: "un", formato: formatarOvos },
      {
        id: "pr-sardinha-atum",
        nome: "Sardinha ou atum em lata",
        unidade: "g",
        // Uma lata rende uns 100 g escorridos — duas porções do café da manhã.
        formato: (g) => `${plural(acima(g / 100), "lata", "latas")} (uns ${formatarGramas(g)} escorridos)`,
        nota: "50 g por café da manhã. No lugar, o plano também aceita 80 g de peito de frango desfiado.",
      },
      {
        id: "pr-frango-peito",
        nome: "Peito de frango",
        unidade: "g",
        nota: "150 g grelhado por almoço — é o peso pronto. Cru, o frango encolhe no preparo: compre com folga.",
      },
      {
        id: "pr-peixe",
        nome: "Filé de peixe (tilápia, merluza, pescada…)",
        unidade: "g",
        nota: "140 g por almoço, grelhado ou assado. Cru, encolhe um pouco: compre com folga.",
      },
    ],
  },
  {
    id: "laticinios",
    nome: "Sem lactose, whey e bebida vegetal",
    icone: "🧀",
    itens: [
      {
        id: "la-queijo-branco",
        nome: "Queijo branco sem lactose",
        unidade: "g",
        nota: "50 g por café da manhã.",
      },
      {
        id: "la-kefir-iogurte",
        nome: "Kefir ou iogurte natural sem lactose",
        unidade: "g",
        nota: "150 g por lanche. Natural: sem açúcar na lista de ingredientes.",
      },
      {
        id: "la-whey-isolado",
        nome: "Whey protein isolado sem lactose",
        unidade: "g",
        // Sem arredondar para pacote: o whey se compra por pote, e o que importa
        // é saber se o que tem em casa dá para a semana.
        formato: (g) => `${acima(g, 10)} g (${plural(acima(g / 30), "dose", "doses")} de até 30 g)`,
        nota: "Olhe quanto ainda tem no pote antes de comprar outro.",
      },
      {
        id: "la-bebida-vegetal",
        nome: "Bebida vegetal sem açúcar",
        unidade: "ml",
        formato: (ml) =>
          `${plural(acima(ml / 1000), "caixa de 1 L", "caixas de 1 L")} (${formatarMl(ml)} na semana)`,
        nota: "200 ml por shake. Aberta, dura poucos dias na geladeira — veja no rótulo.",
      },
    ],
  },
  {
    id: "carbos",
    nome: "Quinoa e grão-de-bico",
    icone: "🫘",
    itens: [
      {
        id: "ca-quinoa",
        nome: "Quinoa em grão",
        unidade: "g",
        nota: "60 g por almoço. Prefere mais carboidrato? A outra escolha do plano é 100 g de batata-doce assada.",
      },
      {
        id: "ca-grao-de-bico",
        nome: "Grão-de-bico",
        unidade: "g",
        // Cozido, ele passa do dobro do peso seco (uns 2,2 vezes); uma lata
        // escorrida dá uns 240 g. O seco vai no "uns", de 50 em 50 g.
        formato: (g) =>
          `${formatarGramas(g)} cozido (uns ${Math.max(50, Math.round(g / 2.2 / 50) * 50)} g do grão seco, ou ${plural(acima(g / 240), "lata", "latas")} de pronto)`,
        nota: "150 g cozido por almoço. A outra escolha do plano é 60 g de arroz integral.",
      },
    ],
  },
  {
    id: "folhas",
    nome: "Folhas",
    icone: "🥬",
    itens: [
      {
        // Mesmo alimento do catálogo antigo: o id continua.
        id: "fo-alface",
        nome: "Alface ou mix de folhas",
        unidade: "g",
        // Um pé de alface dá uns 300 g de folha limpa.
        formato: (g) => `${formatarGramas(g)} de folhas (uns ${plural(acima(g / 300), "pé", "pés")} de alface)`,
        nota: "Lavada e bem seca, dura uns 4 dias: compre metade agora e metade no meio da semana.",
      },
    ],
  },
  {
    id: "legumes",
    nome: "Legumes",
    icone: "🥦",
    itens: [
      { id: "le-tomate", nome: "Tomate", unidade: "un", formato: unidades },
      { id: "le-pepino", nome: "Pepino", unidade: "un", formato: unidades },
      { id: "le-cenoura", nome: "Cenoura", unidade: "un", formato: unidades },
      {
        id: "le-cozidos",
        nome: "Legumes para cozinhar (abobrinha, brócolis, vagem, chuchu…)",
        unidade: "g",
        nota: "100 g por almoço. Varie à vontade.",
      },
    ],
  },
  {
    id: "frutas",
    nome: "Frutas",
    icone: "🍎",
    itens: [
      {
        id: "fr-maca",
        nome: "Maçã pequena",
        unidade: "un",
        formato: unidades,
        nota: "Pequena mesmo: 80–100 g.",
      },
      {
        id: "fr-vermelhas",
        nome: "Frutas vermelhas (morango, mirtilo ou uva roxa)",
        unidade: "g",
        // Uma caixinha de morango tem uns 250 g.
        formato: (g) => `${formatarGramas(g)} (${plural(acima(g / 250), "caixinha", "caixinhas")})`,
        nota: "30 g por lanche. Congeladas, sem açúcar, também servem.",
      },
      {
        id: "fr-limao",
        nome: "Limão",
        unidade: "un",
        quantidade: "6 unidades",
        nota: "Para a água da manhã e o molho da salada.",
        essencial: true,
      },
    ],
  },
  {
    id: "extras",
    nome: "Sementes, castanhas e azeite",
    icone: "🫒",
    itens: [
      {
        id: "se-linhaca",
        nome: "Linhaça moída",
        unidade: "g",
        formato: colheres,
        nota: "Moída: inteira, ela passa direto. Depois de aberta, na geladeira, em pote fechado.",
      },
      { id: "se-chia", nome: "Chia", unidade: "g", formato: colheres },
      {
        id: "se-pasta-amendoim",
        nome: "Pasta de amendoim natural (sem açúcar)",
        unidade: "g",
        nota: "10 g por shake. Na lista de ingredientes, só amendoim. Um pote dura semanas.",
      },
      {
        id: "se-castanhas",
        nome: "Amêndoas ou castanhas-do-pará",
        unidade: "un",
        formato: unidades,
        nota: "5 por lanche.",
      },
      {
        // Mesmo alimento do catálogo antigo: o id continua.
        id: "go-azeite",
        nome: "Azeite de oliva extravirgem",
        unidade: "ml",
        essencial: true,
        quantidade: "1 garrafa",
        formato: (ml) => `1 garrafa (o plano usa uns ${formatarMl(ml)} na semana)`,
      },
    ],
  },
  {
    id: "temperos",
    nome: "Temperos",
    icone: "🌿",
    itens: [
      { id: "te-alho", nome: "Alho", unidade: "un", quantidade: "1 cabeça", essencial: true },
      { id: "te-cebola", nome: "Cebola", unidade: "un", quantidade: "3 unidades", essencial: true },
      { id: "te-sal", nome: "Sal", unidade: "un", quantidade: "1 pacote", essencial: true },
    ],
  },
  {
    id: "bebidas",
    nome: "Chás e rituais",
    icone: "🍵",
    itens: [
      {
        // Id novo: o "be-cha" de antes era só chá sem cafeína.
        id: "be-chas",
        nome: "Chás da nutricionista (verde, gengibre, canela, hibisco, cavalinha, dente-de-leão)",
        unidade: "un",
        quantidade: "1 ou 2 caixas",
        nota: "Sem açúcar, até 1 litro por dia somando todos. O verde tem cafeína: à noite, prefira os outros.",
        essencial: true,
      },
      {
        id: "be-propolis",
        nome: "Própolis",
        unidade: "un",
        quantidade: "1 frasco",
        nota: "Ritual da manhã, junto com o limão — só se cair bem. Compre quando estiver acabando.",
        essencial: true,
      },
    ],
  },
];

export const CATALOGO = new Map(
  SHOPPING_LIST.flatMap((c) =>
    c.itens.map((i) => [i.id, { ...i, categoriaId: c.id, categoria: c.nome, icone: c.icone }] as const),
  ),
);

export const ESSENCIAIS = SHOPPING_LIST.flatMap((c) => c.itens.filter((i) => i.essencial).map((i) => i.id));

/* -------------------------------------------------------------------------- */
/* A conta da semana                                                          */
/* -------------------------------------------------------------------------- */

const DIAS_DA_SEMANA = 7;

/** Em quantos dias da semana ela come a opção 1 de cada refeição; o resto é a opção 2. */
export type DiasDaOpcao1 = Record<RefeicaoPlanoId, number>;

export const DIAS_PADRAO: DiasDaOpcao1 = { cafe: 4, almoco: 4, lanche: 4 };

/** Chave do localStorage: a divisão é do aparelho, como uma preferência de tela. */
export const CHAVE_DIAS_LISTA = "mais-leve-lista-dias";

/** Aceita qualquer coisa (o que estava gravado) e devolve uma divisão válida, de 0 a 7. */
export function normalizaDias(valor: unknown): DiasDaOpcao1 {
  const dias = { ...DIAS_PADRAO };
  if (!valor || typeof valor !== "object") return dias;
  for (const id of REFEICOES_ORDEM) {
    const n = (valor as Record<string, unknown>)[id];
    if (typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= DIAS_DA_SEMANA) dias[id] = n;
  }
  return dias;
}

/** Total da semana de cada ingrediente: Σ (porção × dias da opção). */
export function totaisDaSemana(dias: DiasDaOpcao1): Map<string, number> {
  const totais = new Map<string, number>();
  for (const refeicao of PLANO_ALIMENTAR) {
    const daOpcao1 = dias[refeicao.id];
    for (const opcao of refeicao.opcoes) {
      const n = opcao.numero === 1 ? daOpcao1 : DIAS_DA_SEMANA - daOpcao1;
      if (n <= 0) continue;
      for (const item of opcao.itens) {
        for (const { id, qtd } of item.ingredientes) {
          totais.set(id, (totais.get(id) ?? 0) + qtd * n);
        }
      }
    }
  }
  return totais;
}

export type LinhaDaLista = { item: ShoppingItem; total: number; quantidade: string };

/**
 * A lista da semana, por categoria, na ordem do catálogo. Entra o que a semana
 * usa e os essenciais de despensa; categoria sem nada some.
 */
export function listaDaSemana(
  dias: DiasDaOpcao1,
): { categoria: ShoppingCategory; itens: LinhaDaLista[] }[] {
  const totais = totaisDaSemana(dias);
  return SHOPPING_LIST.map((categoria) => ({
    categoria,
    itens: categoria.itens
      .map((item) => {
        const total = totais.get(item.id) ?? 0;
        return { item, total, quantidade: formatarQuantidade(item, total) };
      })
      .filter((l) => l.total > 0 || l.item.essencial),
  })).filter((g) => g.itens.length > 0);
}
