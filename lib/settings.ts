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
  /** Duração do ciclo do protocolo, em dias. */
  cicloDias: number;
  /** Qual plano de treino está valendo. */
  faseTreino: FaseTreino;
};

export const PREFERENCIAS_PADRAO: Preferencias = {
  // 3,4 L é a meta que ela vem seguindo — ajustável em /ajustes.
  aguaMetaMl: 3400,
  aguaPorcoes: [300, 600],
  pesoInicial: 84,
  pesoMeta: 70,
  cicloDias: 15,
  // Começa pela adaptação: ela não gosta de academia, e o plano completo de
  // cara é o caminho mais curto para largar.
  faseTreino: "adaptacao",
};

const CHAVE_LOCAL = "desinflama-preferencias";

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
    cicloDias: Math.round(numeroValido(p.cicloDias, 1, 365, PREFERENCIAS_PADRAO.cicloDias)),
    faseTreino:
      p.faseTreino === "completo" || p.faseTreino === "adaptacao"
        ? p.faseTreino
        : PREFERENCIAS_PADRAO.faseTreino,
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
    return cru ? normaliza(JSON.parse(cru)) : null;
  } catch {
    return null;
  }
}

function gravarLocal(prefs: Preferencias): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAVE_LOCAL, JSON.stringify(prefs));
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
      const prefs = normaliza(data?.preferencias);
      if (prefs) {
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
      .upsert({ id: 1, preferencias: limpo, updated_at: new Date().toISOString() });
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
