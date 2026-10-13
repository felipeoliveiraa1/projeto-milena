"use client";

import { useCallback, useEffect, useState } from "react";
import { ROTINA_PADRAO, type RotinaBloco, type RotinaItem } from "@/data/protocol";
import { getSupabase } from "./supabase";

const CHAVE_LOCAL = "desinflama-rotina";

/** De onde veio a rotina que está na tela. */
export type OrigemRotina = "nuvem" | "aparelho" | "padrao";

function valida(valor: unknown): RotinaBloco[] | null {
  if (!Array.isArray(valor)) return null;
  const blocos = valor.filter(
    (b): b is RotinaBloco =>
      !!b &&
      typeof b === "object" &&
      typeof (b as RotinaBloco).id === "string" &&
      typeof (b as RotinaBloco).titulo === "string" &&
      Array.isArray((b as RotinaBloco).itens),
  );
  return blocos.length > 0 ? migrarRotina(blocos) : null;
}

/* -------------------------------------------------------------------------- */
/* Migração da rotina salva                                                   */
/* -------------------------------------------------------------------------- */

/**
 * O que um item de fábrica já foi. A rotina salva guarda uma cópia de cada
 * item; sem isto, quem já tinha salvado a rotina continuaria vendo "refeição
 * mais leve" à noite, bem na hora do jejum — ou o café, que saiu em 12/10.
 *
 * Cada versão compara só o que registra e troca pelo atual de fábrica:
 * - texto antigo: troca o texto e o detalhe (o detalhe acompanha o texto);
 * - detalhe antigo: troca só o detalhe — ela não edita o detalhe pela tela,
 *   então o que está ali é sempre de fábrica;
 * - opções antigas: troca as opções.
 *
 * Só troca o que ainda está igual ao antigo de fábrica — o que ela escreveu
 * com as próprias mãos fica como está.
 */
type VersaoAntiga = Partial<Pick<RotinaItem, "texto" | "detalhe" | "opcoes">>;

const FABRICA_ANTERIOR: Record<string, VersaoAntiga[]> = {
  "r-n-refeicao": [
    // Antes de 29/09, quando a noite ainda não era de jejum.
    { texto: "Fazer uma refeição mais leve" },
    // De 29/09 a 12/10, quando o café ainda estava no plano. É texto antigo,
    // só para comparar com a rotina salva — nunca vai para a tela.
    {
      detalhe:
        "Depois da última refeição, só água, chá ou café sem açúcar até o café da manhã — os remédios da noite seguem a lista.",
    },
  ],
  // "Desafio" era o nome do Desinflama-se; os motivos continuam.
  "r-m-motivos": [{ texto: "Reler os motivos do desafio" }],
  "r-ac-sintomas": [
    { opcoes: ["Sem sintomas", "Inchaço", "Dor de cabeça", "Intestino preso", "Cansaço", "Azia"] },
  ],
};

const FABRICA_ATUAL = new Map(ROTINA_PADRAO.flatMap((b) => b.itens).map((i) => [i.id, i]));

/** A versão bate quando tudo o que ela registra está igual no item salvo. */
function bate(item: RotinaItem, antiga: VersaoAntiga): boolean {
  return (
    (antiga.texto === undefined || item.texto === antiga.texto) &&
    (antiga.detalhe === undefined || item.detalhe === antiga.detalhe) &&
    (antiga.opcoes === undefined ||
      JSON.stringify(item.opcoes) === JSON.stringify(antiga.opcoes))
  );
}

function atualizarItem(item: RotinaItem): RotinaItem {
  // A rotina vem do banco: um item torto passa adiante sem derrubar a leitura.
  if (!item || typeof item !== "object") return item;
  const atual = FABRICA_ATUAL.get(item.id);
  if (!atual || !Object.hasOwn(FABRICA_ANTERIOR, item.id)) return item;
  return FABRICA_ANTERIOR[item.id].reduce<RotinaItem>((novo, antiga) => {
    if (!bate(novo, antiga)) return novo;
    let trocado = novo;
    if (antiga.texto !== undefined) {
      trocado = { ...trocado, texto: atual.texto, detalhe: atual.detalhe };
    }
    if (antiga.detalhe !== undefined) trocado = { ...trocado, detalhe: atual.detalhe };
    if (antiga.opcoes !== undefined) {
      // Cópia: a lista do ROTINA_PADRAO não pode ir parar na rotina dela.
      trocado = { ...trocado, opcoes: atual.opcoes && [...atual.opcoes] };
    }
    return trocado;
  }, item);
}

/**
 * Itens que entraram na rotina de fábrica depois que ela já podia ter salvado
 * a dela (ajustes de 12/10). Cada um chega uma vez só à rotina salva: entra
 * no bloco, ao lado da âncora, e o id vai para `recebidos` desse bloco. É essa
 * marca — gravada na nuvem junto da rotina quando ela salva — que impede o
 * item de voltar se ela apagar.
 *
 * Bloco apagado: nada a oferecer. Âncora apagada: o item vai para o fim do
 * bloco. Item que já está na rotina, em qualquer bloco: só marca, sem repetir.
 */
type ItemNovo = { bloco: string; id: string; antesDe?: string; depoisDe?: string };

const ITENS_NOVOS: ItemNovo[] = [
  { bloco: "noite", id: "r-n-telas", antesDe: "r-n-dormir" },
  { bloco: "movimento", id: "r-mov-pos-almoco", depoisDe: "r-mov-atividade" },
];

/** `recebidos` vem do banco: o que não for lista de textos conta como vazio. */
function lerRecebidos(bloco: RotinaBloco): string[] {
  const valor: unknown = bloco.recebidos;
  return Array.isArray(valor) ? valor.filter((x): x is string => typeof x === "string") : [];
}

function oferecer(blocos: RotinaBloco[], novo: ItemNovo): RotinaBloco[] {
  const alvo = blocos.findIndex((b) => b.id === novo.bloco);
  const padrao = FABRICA_ATUAL.get(novo.id);
  if (alvo < 0 || !padrao) return blocos;
  const bloco = blocos[alvo];
  const recebidos = lerRecebidos(bloco);
  if (recebidos.includes(novo.id)) return blocos;

  let itens = bloco.itens;
  const jaTem = blocos.some((b) => b.itens.some((i) => i?.id === novo.id));
  if (!jaTem) {
    const ancora = novo.antesDe ?? novo.depoisDe;
    const pos = ancora === undefined ? -1 : itens.findIndex((i) => i?.id === ancora);
    const onde = pos < 0 ? itens.length : novo.antesDe !== undefined ? pos : pos + 1;
    itens = [...itens.slice(0, onde), structuredClone(padrao), ...itens.slice(onde)];
  }
  return blocos.map((b, i) =>
    i === alvo ? { ...b, itens, recebidos: [...recebidos, novo.id] } : b,
  );
}

/**
 * Leva a rotina salva à fábrica de hoje sem passar por cima do que ela mudou.
 * Roda a cada leitura, da nuvem e do aparelho, e não grava na nuvem: o
 * resultado só vai para lá quando ela salva a rotina — e, até lá, sai igual em
 * toda leitura.
 *
 * Função pura: não mexe na rotina que recebe — ela pode ser o próprio
 * ROTINA_PADRAO, usado também no useState e no "restaurar" — e, rodada de
 * novo sobre o próprio resultado, não muda mais nada.
 */
export function migrarRotina(rotina: RotinaBloco[]): RotinaBloco[] {
  const atualizada = rotina.map((bloco) => ({
    ...bloco,
    itens: bloco.itens.map((item) => atualizarItem(item)),
  }));
  return ITENS_NOVOS.reduce(oferecer, atualizada);
}

/* -------------------------------------------------------------------------- */
/* Rotina de cada dia                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Dia (AAAA-MM-DD) em que cada item chegou à rotina de fábrica, para os que
 * vieram depois do começo da jornada. Item novo entra aqui e em ITENS_NOVOS.
 */
export const ROTINA_DESDE: Record<string, string> = {
  "r-n-telas": "2026-10-12",
  "r-mov-pos-almoco": "2026-10-12",
};

/**
 * Os ids da rotina que já existiam naquele dia. A nota de um dia passado conta
 * só esses: sem isto, um dia antigo com a rotina toda feita perderia pontos
 * por itens que ainda nem estavam no app.
 */
export function idsRotinaDoDia(ids: string[], data: string): string[] {
  return ids.filter((id) => !Object.hasOwn(ROTINA_DESDE, id) || data >= ROTINA_DESDE[id]);
}

/* -------------------------------------------------------------------------- */
/* Leitura e gravação                                                         */
/* -------------------------------------------------------------------------- */

function lerLocal(): RotinaBloco[] | null {
  if (typeof window === "undefined") return null;
  try {
    const cru = window.localStorage.getItem(CHAVE_LOCAL);
    return cru ? valida(JSON.parse(cru)) : null;
  } catch {
    return null;
  }
}

function gravarLocal(blocos: RotinaBloco[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAVE_LOCAL, JSON.stringify(blocos));
  } catch {
    // sem espaço ou modo privado — segue só com a nuvem
  }
}

/**
 * Lê a rotina configurada. Tenta o Supabase; se a tabela app_config ainda não
 * existir, cai para o que está salvo no aparelho e, por fim, para o padrão.
 *
 * O cache evita que cada componente da tela faça a mesma busca.
 */
let cache: Promise<{ blocos: RotinaBloco[]; origem: OrigemRotina }> | null = null;

export function carregarRotina(): Promise<{ blocos: RotinaBloco[]; origem: OrigemRotina }> {
  if (!cache) cache = buscarRotina();
  return cache;
}

async function buscarRotina(): Promise<{ blocos: RotinaBloco[]; origem: OrigemRotina }> {
  try {
    const { data, error } = await getSupabase()
      .from("app_config")
      .select("rotina")
      .eq("id", 1)
      .maybeSingle();
    if (!error) {
      const blocos = valida(data?.rotina);
      if (blocos) {
        gravarLocal(blocos);
        return { blocos, origem: "nuvem" };
      }
      // Tabela existe, mas ainda sem rotina salva: o padrão vale.
      const local = lerLocal();
      return local ? { blocos: local, origem: "aparelho" } : { blocos: ROTINA_PADRAO, origem: "padrao" };
    }
  } catch {
    // sem rede ou tabela ausente — segue para o aparelho
  }

  const local = lerLocal();
  return local ? { blocos: local, origem: "aparelho" } : { blocos: ROTINA_PADRAO, origem: "padrao" };
}

/** Salva a rotina. Grava sempre no aparelho e tenta a nuvem por cima. */
export async function salvarRotina(blocos: RotinaBloco[]): Promise<OrigemRotina> {
  gravarLocal(blocos);
  cache = null; // próxima leitura busca o valor novo
  try {
    const { error } = await getSupabase()
      .from("app_config")
      .upsert({ id: 1, rotina: blocos, updated_at: new Date().toISOString() });
    if (!error) return "nuvem";
  } catch {
    // deixa no aparelho
  }
  return "aparelho";
}

export function useRotina() {
  const [blocos, setBlocos] = useState<RotinaBloco[]>(ROTINA_PADRAO);
  const [origem, setOrigem] = useState<OrigemRotina>("padrao");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    carregarRotina().then(({ blocos, origem }) => {
      if (!ativo) return;
      setBlocos(blocos);
      setOrigem(origem);
      setCarregando(false);
    });
    return () => {
      ativo = false;
    };
  }, []);

  const salvar = useCallback(async (novos: RotinaBloco[]) => {
    setBlocos(novos);
    setOrigem(await salvarRotina(novos));
  }, []);

  // O padrão vai inteiro, com `recebidos`: os itens novos já estão dentro
  // dele, e a migração não os oferece de novo.
  const restaurar = useCallback(async () => {
    setBlocos(ROTINA_PADRAO);
    setOrigem(await salvarRotina(ROTINA_PADRAO));
  }, []);

  return { blocos, origem, carregando, salvar, restaurar };
}

export function novoId(prefixo: "r" | "bloco"): string {
  const aleatorio =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefixo}-${aleatorio}`;
}
