"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LockKeyhole, LogIn, LogOut } from "lucide-react";
import { BrandMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { emailDaSessao, entrar, sair, useSessao } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

/**
 * Porta de entrada do app. Sem sessão, só existe a tela de login — nenhum dado
 * é carregado, e as políticas do banco também exigem usuário autenticado.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { sessao, carregando } = useSessao();
  // Guarda o e-mail junto da resposta: assim dá para saber se o resultado é
  // desta sessão sem precisar zerar estado dentro do efeito.
  const [checagem, setChecagem] = useState<{ email: string; liberado: boolean } | null>(null);
  const email = emailDaSessao(sessao);

  // Entrar não basta: a conta também precisa estar em allowed_users. Sem esta
  // checagem, uma conta de fora veria o app inteiro vazio, sem entender por quê.
  useEffect(() => {
    if (!email) return;
    let ativo = true;
    getSupabase()
      .rpc("is_allowed")
      .then(({ data, error }) => {
        if (!ativo) return;
        // Banco antigo, sem a função: deixa passar. Quem barra de verdade são
        // as políticas de cada tabela.
        setChecagem({ email, liberado: error ? true : data === true });
      });
    return () => {
      ativo = false;
    };
  }, [email]);

  const liberado = checagem?.email === email ? checagem.liberado : null;

  if (carregando) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <span className="h-10 w-10 animate-pulse rounded-2xl bg-line" aria-label="Carregando" />
      </div>
    );
  }

  if (!sessao) return <TelaLogin />;

  if (liberado === false) return <TelaSemPermissao email={email} />;

  return <>{children}</>;
}

function Moldura({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-svh max-w-sm flex-col justify-center px-5 py-10">
      <div className="animate-rise rounded-card border border-line bg-surface p-7 shadow-[0_1px_2px_rgba(25,21,18,0.04),0_14px_30px_-20px_rgba(25,21,18,0.3)]">
        {children}
      </div>
    </div>
  );
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
    <Moldura>
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
    </Moldura>
  );
}

function TelaSemPermissao({ email }: { email: string }) {
  return (
    <Moldura>
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-soft text-danger">
        <LockKeyhole className="h-6 w-6" />
      </span>
      <h2 className="font-display mt-5 text-3xl leading-none text-ink">Conta sem acesso</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Você entrou como <strong className="text-ink">{email}</strong>, mas esse e-mail não está
        liberado para ver estes dados.
      </p>
      <p className="mt-3 rounded-xl2 bg-bone-deep/60 p-3.5 text-xs leading-relaxed text-ink-soft">
        Para liberar, adicione o e-mail na tabela <code>allowed_users</code> do Supabase — é um
        insert só, sem precisar publicar nada.
      </p>
      <Button variant="outline" className="mt-5 w-full" onClick={() => sair()}>
        <LogOut className="h-4 w-4" /> Sair e tentar outra conta
      </Button>
    </Moldura>
  );
}
