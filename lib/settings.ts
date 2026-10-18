"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "./supabase";
import {
  clonarPadrao,
  migrarPreferencias,
  normalizaPreferencias,
  paraGravar,
  type Preferencias,
} from "./preferencias";

/**
 * Leitura e gravação das preferências. O formato, o padrão de fábrica e a
 * validação moram em lib/preferencias.ts (sem React), porque o servidor dos
 * lembretes também lê o que está gravado. Guardadas na mesma linha de
 * app_config usada pela rotina; enquanto a tabela não existir, ficam no aparelho.
 */
export {
  ehDataValida,
  ehHoraAcordarValida,
  ehHoraDormirValida,
  ehJanelaAguaValida,
  ehJanelaValida,
  PREFERENCIAS_PADRAO,
} from "./preferencias";
export type { Contagem, Preferencias } from "./preferencias";

const CHAVE_LOCAL = "desinflama-preferencias";

export type OrigemPreferencias = "nuvem" | "aparelho" | "padrao";

const normaliza = normalizaPreferencias;
const migrar = migrarPreferencias;

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
    : { prefs: clonarPadrao(), origem: "padrao" };
}

export async function salvarPreferencias(prefs: Preferencias): Promise<OrigemPreferencias> {
  const limpo = normaliza(prefs) ?? clonarPadrao();
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
  const [prefs, setPrefs] = useState<Preferencias>(clonarPadrao);
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
    const limpo = normaliza(novas) ?? clonarPadrao();
    setPrefs(limpo);
    setOrigem(await salvarPreferencias(limpo));
  }, []);

  // "Padrão" volta as metas e horários de fábrica, mas não apaga a data da
  // contagem: ela é da vida dela, não um ajuste.
  const restaurar = useCallback(async () => {
    const padrao = { ...clonarPadrao(), contagem: { ...prefs.contagem } };
    setPrefs(padrao);
    setOrigem(await salvarPreferencias(padrao));
  }, [prefs.contagem]);

  return { prefs, origem, carregando, salvar, restaurar };
}
