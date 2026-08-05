"use client";

import { useState, type ReactNode } from "react";
import { LogIn } from "lucide-react";
import { BrandMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { entrar, useSessao } from "@/lib/auth";

/**
 * Porta de entrada do app. Sem sessão, só existe a tela de login — nenhum dado
 * é carregado, e as políticas do banco também exigem usuário autenticado.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { sessao, carregando } = useSessao();

  if (carregando) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-10 w-10 animate-pulse rounded-2xl bg-line" aria-label="Carregando" />
      </div>
    );
  }

  if (!sessao) return <TelaLogin />;

  return <>{children}</>;
}

function TelaLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !senha) return;
    setEnviando(true);
    setErro(null);
    const problema = await entrar(email, senha);
    setErro(problema);
    setEnviando(false);
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-sm flex-col justify-center px-5 py-10">
      <div className="animate-rise rounded-card border border-line bg-surface p-7 shadow-[0_1px_2px_rgba(25,21,18,0.04),0_14px_30px_-20px_rgba(25,21,18,0.3)]">
        <BrandMark className="h-12 w-12" />
        <h2 className="font-display mt-5 text-3xl leading-none text-ink">Entrar</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Seus dados de saúde ficam atrás do login — só quem tem conta aqui enxerga.
        </p>

        <form onSubmit={enviar} className="mt-6 space-y-3">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-ink-soft">E-mail</span>
            <Input
              type="email"
              inputMode="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-ink-soft">Senha</span>
            <Input
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {erro && (
            <p className="rounded-xl2 bg-danger-soft px-3.5 py-2.5 text-xs font-semibold text-danger">
              {erro}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={enviando}>
            <LogIn className="h-4 w-4" />
            {enviando ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
