"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";

export type EstadoSessao = {
  sessao: Session | null;
  carregando: boolean;
};

/** Sessão atual, acompanhando login e logout em qualquer aba. */
export function useSessao(): EstadoSessao {
  const [estado, setEstado] = useState<EstadoSessao>({ sessao: null, carregando: true });

  useEffect(() => {
    let ativo = true;

    getSupabase()
      .auth.getSession()
      .then(({ data }) => {
        if (ativo) setEstado({ sessao: data.session, carregando: false });
      })
      .catch(() => {
        if (ativo) setEstado({ sessao: null, carregando: false });
      });

    const { data: inscricao } = getSupabase().auth.onAuthStateChange((_evento, sessao) => {
      setEstado({ sessao, carregando: false });
    });

    return () => {
      ativo = false;
      inscricao.subscription.unsubscribe();
    };
  }, []);

  return estado;
}

export async function entrar(email: string, senha: string): Promise<string | null> {
  const { error } = await getSupabase().auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password: senha,
  });
  if (!error) return null;
  if (error.message.toLowerCase().includes("invalid login credentials")) {
    return "E-mail ou senha não conferem.";
  }
  if (error.message.toLowerCase().includes("email not confirmed")) {
    return "Esse e-mail ainda não foi confirmado no Supabase.";
  }
  return error.message;
}

export async function sair(): Promise<void> {
  await getSupabase().auth.signOut();
}

export function emailDaSessao(sessao: Session | null): string {
  return sessao?.user?.email ?? "";
}
