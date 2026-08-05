"use client";

import { useCallback, useEffect, useState } from "react";
import { ROTINA_PADRAO, type RotinaBloco } from "@/data/protocol";
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
  return blocos.length > 0 ? blocos : null;
}

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
