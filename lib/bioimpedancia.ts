"use client";

import { getSupabase } from "./supabase";
import { EXAME_BASE, type Bioimpedancia } from "@/data/bioimpedancia";

/**
 * Exames de bioimpedância que ela registra pelo app.
 *
 * Segue a ideia das medidas (lib/storage.ts): usa a tabela `bioimpedance`
 * quando ela existe e, enquanto não existe, guarda no aparelho. A diferença são
 * duas filas no aparelho, que a próxima leitura com a nuvem no ar esvazia:
 * - pendentes: exame que não chegou à nuvem. Sem esta fila, a primeira leitura
 *   da nuvem — ainda vazia logo depois da migration 0006 — apagaria do
 *   aparelho o exame que ela digitou antes;
 * - remoções: exame apagado aqui que a nuvem não confirmou (sem internet,
 *   sessão vencida). Sem esta fila, a leitura seguinte, que confia na nuvem,
 *   traria de volta o exame que ela apagou.
 *
 * O exame de partida (EXAME_BASE) mora no código e entra sempre na lista. Se
 * ela salvar um exame na mesma data, o salvo vence: é assim que se corrige um
 * número do laudo. Apagar essa correção devolve o exame original.
 */

export const TABELA_BIOIMPEDANCIA = "bioimpedance";

const CHAVE_CACHE = "mais-leve-bioimpedancia";
const CHAVE_PENDENTES = "mais-leve-bioimpedancia-pendentes";
const CHAVE_REMOCOES = "mais-leve-bioimpedancia-remocoes";

const COLUNAS = "date, peso, gordura, musculo, visceral, metabolismo, idade_corporal, idade, obs";

const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;

/** Exame na lista. `fixo` = o de partida vindo do código, que não se apaga. */
export type ExameListado = Bioimpedancia & { fixo: boolean };

export type ListaExames = {
  /** Do mais antigo para o mais novo. O de partida está sempre lá. */
  exames: ExameListado[];
  /** Quantos estão só neste aparelho, esperando a nuvem. */
  pendentes: number;
  /** Quantos foram apagados aqui e ainda esperam a nuvem confirmar. */
  remocoes: number;
};

function numeroOuNulo(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

/**
 * Lê um exame vindo da nuvem (colunas em snake_case) ou do aparelho (o próprio
 * objeto). O que não tiver data válida fica de fora.
 */
function normaliza(bruto: unknown): Bioimpedancia | null {
  if (!bruto || typeof bruto !== "object") return null;
  const r = bruto as Record<string, unknown>;
  if (typeof r.date !== "string" || !DATA_ISO.test(r.date)) return null;
  const obs = typeof r.obs === "string" ? r.obs.trim() : "";
  return {
    date: r.date,
    peso: numeroOuNulo(r.peso),
    gordura: numeroOuNulo(r.gordura),
    musculo: numeroOuNulo(r.musculo),
    visceral: numeroOuNulo(r.visceral),
    metabolismo: numeroOuNulo(r.metabolismo),
    idadeCorporal: numeroOuNulo(r.idade_corporal ?? r.idadeCorporal),
    idade: numeroOuNulo(r.idade),
    obs: obs || null,
  };
}

function soValidos(lista: unknown[]): Bioimpedancia[] {
  return lista.map(normaliza).filter((e): e is Bioimpedancia => e !== null);
}

function paraLinha(exame: Bioimpedancia) {
  return {
    date: exame.date,
    peso: exame.peso,
    gordura: exame.gordura,
    musculo: exame.musculo,
    visceral: exame.visceral,
    metabolismo: exame.metabolismo,
    idade_corporal: exame.idadeCorporal,
    idade: exame.idade,
    obs: exame.obs,
  };
}

function lerLocal(chave: string): Bioimpedancia[] {
  if (typeof window === "undefined") return [];
  try {
    const cru = window.localStorage.getItem(chave);
    const lista: unknown = cru ? JSON.parse(cru) : [];
    return Array.isArray(lista) ? soValidos(lista) : [];
  } catch {
    return [];
  }
}

function gravarLocal(chave: string, lista: Bioimpedancia[]): void {
  if (typeof window === "undefined") return;
  try {
    if (lista.length === 0) window.localStorage.removeItem(chave);
    else window.localStorage.setItem(chave, JSON.stringify(lista));
  } catch {
    // sem espaço ou modo privado — segue só com a nuvem
  }
}

/** Datas apagadas aqui que a nuvem ainda não confirmou. */
function lerRemocoes(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const cru = window.localStorage.getItem(CHAVE_REMOCOES);
    const lista: unknown = cru ? JSON.parse(cru) : [];
    return Array.isArray(lista)
      ? lista.filter((d): d is string => typeof d === "string" && DATA_ISO.test(d))
      : [];
  } catch {
    return [];
  }
}

function gravarRemocoes(datas: string[]): void {
  if (typeof window === "undefined") return;
  try {
    if (datas.length === 0) window.localStorage.removeItem(CHAVE_REMOCOES);
    else window.localStorage.setItem(CHAVE_REMOCOES, JSON.stringify([...new Set(datas)]));
  } catch {
    // sem espaço ou modo privado — a exclusão depende da nuvem responder
  }
}

/** Junta duas listas; na mesma data vale a segunda. Sai em ordem de data. */
function juntar(base: Bioimpedancia[], por: Bioimpedancia[]): Bioimpedancia[] {
  const mapa = new Map(base.map((e) => [e.date, e]));
  for (const e of por) mapa.set(e.date, e);
  return [...mapa.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function comPartida(salvos: Bioimpedancia[]): ExameListado[] {
  const lista: ExameListado[] = salvos.map((e) => ({ ...e, fixo: false }));
  if (!salvos.some((e) => e.date === EXAME_BASE.date)) {
    lista.push({ ...EXAME_BASE, fixo: true });
  }
  return lista.sort((a, b) => a.date.localeCompare(b.date));
}

/** O que aparece antes de a busca terminar: só o exame de partida. */
export function listaInicial(): ListaExames {
  return { exames: comPartida([]), pendentes: 0, remocoes: 0 };
}

/** Todos os exames, com o de partida, do mais antigo para o mais novo. */
export async function getExames(): Promise<ListaExames> {
  let salvos = lerLocal(CHAVE_CACHE);
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from(TABELA_BIOIMPEDANCIA)
      .select(COLUNAS)
      .order("date", { ascending: true });
    if (!error && data) {
      // Primeiro as exclusões que não chegaram à nuvem. A leitura acima é de
      // antes delas, então essas datas saem da resposta de qualquer jeito; se
      // a nuvem recusar de novo, continuam na fila para a próxima leitura.
      const remocoes = lerRemocoes();
      if (remocoes.length > 0) {
        const { error: falhaRemocao } = await supabase
          .from(TABELA_BIOIMPEDANCIA)
          .delete()
          .in("date", remocoes);
        if (!falhaRemocao) gravarRemocoes(lerRemocoes().filter((d) => !remocoes.includes(d)));
      }
      const pendentes = lerLocal(CHAVE_PENDENTES);
      if (pendentes.length > 0) {
        const { error: falhaEnvio } = await supabase
          .from(TABELA_BIOIMPEDANCIA)
          .upsert(pendentes.map(paraLinha));
        if (!falhaEnvio) gravarLocal(CHAVE_PENDENTES, []);
      }
      // Pendente vence na mesma data: é a versão mais nova, digitada aqui.
      const daNuvem = soValidos(data).filter((e) => !remocoes.includes(e.date));
      salvos = juntar(daNuvem, pendentes);
      gravarLocal(CHAVE_CACHE, salvos);
    }
  } catch {
    // tabela ausente ou sem rede — fica com o que está no aparelho
  }
  // O que ela apagou não volta para a tela, nem enquanto a nuvem não confirma.
  const naFila = lerRemocoes();
  return {
    exames: comPartida(salvos.filter((e) => !naFila.includes(e.date))),
    pendentes: lerLocal(CHAVE_PENDENTES).length,
    remocoes: naFila.length,
  };
}

export async function salvarExame(exame: Bioimpedancia): Promise<ListaExames> {
  gravarLocal(CHAVE_CACHE, juntar(lerLocal(CHAVE_CACHE), [exame]));
  // Salvar de novo numa data apagada vale mais que a exclusão na fila: sem
  // isto, a próxima leitura apagaria da nuvem o exame que acabou de subir.
  gravarRemocoes(lerRemocoes().filter((d) => d !== exame.date));
  let naNuvem = false;
  try {
    const { error } = await getSupabase().from(TABELA_BIOIMPEDANCIA).upsert(paraLinha(exame));
    if (error) console.warn("bioimpedância: guardando só no aparelho", error.message);
    else naNuvem = true;
  } catch {
    // segue no aparelho
  }
  const outros = lerLocal(CHAVE_PENDENTES).filter((e) => e.date !== exame.date);
  gravarLocal(CHAVE_PENDENTES, naNuvem ? outros : [...outros, exame]);
  return getExames();
}

export async function removerExame(date: string): Promise<ListaExames> {
  gravarLocal(
    CHAVE_CACHE,
    lerLocal(CHAVE_CACHE).filter((e) => e.date !== date),
  );
  gravarLocal(
    CHAVE_PENDENTES,
    lerLocal(CHAVE_PENDENTES).filter((e) => e.date !== date),
  );
  // Entra na fila antes de tentar e só sai com a nuvem confirmando. Sem
  // internet, o supabase-js não lança: devolve { error } — por isso o
  // resultado é conferido, e não só o catch.
  gravarRemocoes([...lerRemocoes(), date]);
  try {
    const { error } = await getSupabase().from(TABELA_BIOIMPEDANCIA).delete().eq("date", date);
    if (error) console.warn("bioimpedância: exclusão fica na fila do aparelho", error.message);
    else gravarRemocoes(lerRemocoes().filter((d) => d !== date));
  } catch {
    // segue na fila
  }
  return getExames();
}

/** Esquece a cópia e as filas deste aparelho — parte do "recomeçar do zero". */
export function limparExamesLocais(): void {
  gravarLocal(CHAVE_CACHE, []);
  gravarLocal(CHAVE_PENDENTES, []);
  gravarRemocoes([]);
}
