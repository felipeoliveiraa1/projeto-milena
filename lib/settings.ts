"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "./supabase";
import type { FaseTreino } from "@/data/workouts";

/**
 * Preferências que a Milena ajusta pelo próprio app, sem depender de deploy.
 * Guardadas na mesma linha de app_config usada pela rotina; enquanto a tabela
 * não existir, ficam no aparelho.
 */
export type Preferencias = {
  /** Meta diária de água, em mililitros. */
  aguaMetaMl: number;
  /** Botões de registro rápido de água, em mililitros. */
  aguaPorcoes: number[];
  /** Peso do começo da jornada, usado como referência das comparações. */
  pesoInicial: number;
  pesoMeta: number;
  /**
   * Janela alimentar, em "HH:MM": a primeira refeição abre, a última fecha. O
   * resto das 24 horas é jejum — ver lib/jejum.ts.
   */
  janelaInicio: string;
  janelaFim: string;
  /** Qual plano de treino está valendo. */
  faseTreino: FaseTreino;
};

export const PREFERENCIAS_PADRAO: Preferencias = {
  // O médico pediu 200 ml por hora: 16 horas acordada dão 3,2 L, e o botão de
  // 200 ml é "um copo por hora". Ajustável em /ajustes.
  aguaMetaMl: 3200,
  aguaPorcoes: [200, 400],
  // Peso da bioimpedância de 12/08, o ponto de partida da recomposição.
  pesoInicial: 85.5,
  pesoMeta: 70,
  // 10 horas comendo e 14 de jejum: a medicação tira a fome à noite, e 14 h é
  // o jejum que ainda deixa a proteína do dia caber na janela.
  janelaInicio: "08:00",
  janelaFim: "18:00",
  // Começa pela adaptação: ela não gosta de academia, e o plano completo de
  // cara é o caminho mais curto para largar.
  faseTreino: "adaptacao",
};

const CHAVE_LOCAL = "desinflama-preferencias";

/**
 * Versão do formato salvo. A 2 chegou com o plano de recomposição (29/09/2026):
 * água em 200 ml por hora, peso de partida da bioimpedância e janela do jejum.
 */
const VERSAO = 2;

/**
 * Padrões de fábrica que mudaram na versão 2. A versão antiga gravava o objeto
 * inteiro a cada troca de fase do treino, então "3,4 L" salvo quase sempre é o
 * padrão antigo, não uma escolha dela. Só troca o que ainda é igual ao de
 * fábrica — o que ela mudou à mão fica como está. Depois de gravada a versão
 * 2, 3,4 L volta a ser uma escolha possível.
 */
function migrar(valor: unknown): { valor: unknown; migrou: boolean } {
  if (!valor || typeof valor !== "object") return { valor, migrou: false };
  const p = valor as Record<string, unknown>;
  if (typeof p.versao === "number" && p.versao >= VERSAO) return { valor, migrou: false };
  return {
    valor: {
      ...p,
      aguaMetaMl: p.aguaMetaMl === 3400 ? 3200 : p.aguaMetaMl,
      aguaPorcoes: JSON.stringify(p.aguaPorcoes) === "[300,600]" ? [200, 400] : p.aguaPorcoes,
      pesoInicial: p.pesoInicial === 84 ? 85.5 : p.pesoInicial,
    },
    migrou: true,
  };
}

/** O que vai para o banco e para o aparelho: as preferências com a versão. */
function paraGravar(prefs: Preferencias) {
  return { ...prefs, versao: VERSAO };
}

export type OrigemPreferencias = "nuvem" | "aparelho" | "padrao";

function normaliza(valor: unknown): Preferencias | null {
  if (!valor || typeof valor !== "object") return null;
  const p = valor as Partial<Preferencias>;
  const porcoes = Array.isArray(p.aguaPorcoes)
    ? p.aguaPorcoes.filter((n) => typeof n === "number" && n > 0).slice(0, 4)
    : [];
  return {
    aguaMetaMl: numeroValido(p.aguaMetaMl, 300, 8000, PREFERENCIAS_PADRAO.aguaMetaMl),
    aguaPorcoes: porcoes.length > 0 ? porcoes : PREFERENCIAS_PADRAO.aguaPorcoes,
    pesoInicial: numeroValido(p.pesoInicial, 30, 250, PREFERENCIAS_PADRAO.pesoInicial),
    pesoMeta: numeroValido(p.pesoMeta, 30, 250, PREFERENCIAS_PADRAO.pesoMeta),
    ...janelaValida(p.janelaInicio, p.janelaFim),
    faseTreino:
      p.faseTreino === "completo" || p.faseTreino === "adaptacao"
        ? p.faseTreino
        : PREFERENCIAS_PADRAO.faseTreino,
  };
}

/**
 * A janela precisa abrir e fechar no mesmo dia e ter entre 4 e 18 horas —
 * senão o app calcularia jejum negativo ou de um dia inteiro.
 */
export function ehJanelaValida(inicio: unknown, fim: unknown): boolean {
  const minutos = (v: unknown) => {
    if (typeof v !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(v)) return null;
    const [h, m] = v.split(":").map(Number);
    return h * 60 + m;
  };
  const de = minutos(inicio);
  const ate = minutos(fim);
  if (de === null || ate === null) return false;
  const duracao = ate - de;
  return duracao >= 4 * 60 && duracao <= 18 * 60;
}

function janelaValida(
  inicio: unknown,
  fim: unknown,
): { janelaInicio: string; janelaFim: string } {
  if (ehJanelaValida(inicio, fim)) {
    return { janelaInicio: inicio as string, janelaFim: fim as string };
  }
  return {
    janelaInicio: PREFERENCIAS_PADRAO.janelaInicio,
    janelaFim: PREFERENCIAS_PADRAO.janelaFim,
  };
}

function numeroValido(valor: unknown, min: number, max: number, padrao: number): number {
  const n = typeof valor === "number" ? valor : Number(valor);
  if (!isFinite(n) || n < min || n > max) return padrao;
  return n;
}

function lerLocal(): Preferencias | null {
  if (typeof window === "undefined") return null;
  try {
    const cru = window.localStorage.getItem(CHAVE_LOCAL);
    return cru ? normaliza(migrar(JSON.parse(cru)).valor) : null;
  } catch {
    return null;
  }
}

function gravarLocal(prefs: Preferencias): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAVE_LOCAL, JSON.stringify(paraGravar(prefs)));
  } catch {
    // sem espaço — segue só com a nuvem
  }
}

/**
 * Vários componentes pedem as preferências ao mesmo tempo. O cache abaixo faz
 * a busca acontecer uma vez só por carregamento de página.
 */
let cache: Promise<{ prefs: Preferencias; origem: OrigemPreferencias }> | null = null;

export function carregarPreferencias(): Promise<{
  prefs: Preferencias;
  origem: OrigemPreferencias;
}> {
  if (!cache) cache = buscarPreferencias();
  return cache;
}

async function buscarPreferencias(): Promise<{
  prefs: Preferencias;
  origem: OrigemPreferencias;
}> {
  try {
    const { data, error } = await getSupabase()
      .from("app_config")
      .select("preferencias")
      .eq("id", 1)
      .maybeSingle();
    if (!error) {
      const { valor, migrou } = migrar(data?.preferencias);
      const prefs = normaliza(valor);
      if (prefs) {
        // Migrou? Grava uma vez com a versão nova, para não migrar de novo.
        if (migrou) {
          await getSupabase()
            .from("app_config")
            .upsert({ id: 1, preferencias: paraGravar(prefs), updated_at: new Date().toISOString() });
        }
        gravarLocal(prefs);
        return { prefs, origem: "nuvem" };
      }
    }
  } catch {
    // tabela ausente ou sem rede
  }
  const local = lerLocal();
  return local
    ? { prefs: local, origem: "aparelho" }
    : { prefs: PREFERENCIAS_PADRAO, origem: "padrao" };
}

export async function salvarPreferencias(prefs: Preferencias): Promise<OrigemPreferencias> {
  const limpo = normaliza(prefs) ?? PREFERENCIAS_PADRAO;
  gravarLocal(limpo);
  cache = null; // próxima leitura busca o valor novo
  try {
    const { error } = await getSupabase()
      .from("app_config")
      .upsert({ id: 1, preferencias: paraGravar(limpo), updated_at: new Date().toISOString() });
    if (!error) return "nuvem";
  } catch {
    // deixa no aparelho
  }
  return "aparelho";
}

export function usePreferencias() {
  const [prefs, setPrefs] = useState<Preferencias>(PREFERENCIAS_PADRAO);
  const [origem, setOrigem] = useState<OrigemPreferencias>("padrao");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    carregarPreferencias().then(({ prefs, origem }) => {
      if (!ativo) return;
      setPrefs(prefs);
      setOrigem(origem);
      setCarregando(false);
    });
    return () => {
      ativo = false;
    };
  }, []);

  const salvar = useCallback(async (novas: Preferencias) => {
    const limpo = normaliza(novas) ?? PREFERENCIAS_PADRAO;
    setPrefs(limpo);
    setOrigem(await salvarPreferencias(limpo));
  }, []);

  const restaurar = useCallback(async () => {
    setPrefs(PREFERENCIAS_PADRAO);
    setOrigem(await salvarPreferencias(PREFERENCIAS_PADRAO));
  }, []);

  return { prefs, origem, carregando, salvar, restaurar };
}
