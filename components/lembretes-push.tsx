"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, BellRing, Send, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ativarPush,
  desativarPush,
  enviarTeste,
  estadoPush,
  ehIOS,
  type EstadoPush,
} from "@/lib/push-cliente";

type Acao = "ativar" | "teste" | "desativar";

const AVISO = "rounded-xl2 bg-surface px-3.5 py-2.5 text-xs leading-relaxed text-ink-soft";

/**
 * Os lembretes NESTE aparelho: estado, ativar, teste e desativar. Não é um
 * Card inteiro — mora dentro do card "Lembretes no celular" de Ajustes. Quais
 * lembretes saem (remédios, água) é preferência da conta, salva junto com o
 * resto; a inscrição do aparelho não passa pelo rascunho.
 */
export function LembretesPush() {
  const [estado, setEstado] = useState<EstadoPush | null>(null);
  const [ocupado, setOcupado] = useState<Acao | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [iphone, setIphone] = useState(false);

  const conferir = useCallback(() => {
    return estadoPush()
      .then((e) => {
        setEstado(e);
        setIphone(ehIOS());
      })
      .catch(() => setEstado("sem-suporte"));
  }, []);

  useEffect(() => {
    let vivo = true;
    estadoPush()
      .then((e) => {
        if (!vivo) return;
        setEstado(e);
        setIphone(ehIOS());
      })
      .catch(() => {
        if (vivo) setEstado("sem-suporte");
      });

    // Ela pode liberar a notificação nos ajustes do aparelho e voltar ao app.
    function aoVoltar() {
      if (document.visibilityState === "visible") void conferir();
    }
    document.addEventListener("visibilitychange", aoVoltar);
    return () => {
      vivo = false;
      document.removeEventListener("visibilitychange", aoVoltar);
    };
  }, [conferir]);

  // Cada ação solta o botão no fim, dê certo ou não: um erro inesperado não
  // pode deixar a tela presa em "Ativando…".
  function ativar() {
    setOcupado("ativar");
    setErro(null);
    setAviso(null);
    // Sem nenhuma espera antes: o pedido de permissão precisa sair do toque.
    void ativarPush()
      .then(async (msg) => {
        setErro(msg);
        if (!msg) setAviso("Pronto! Toque em “Enviar um teste” para conferir.");
        await conferir();
      })
      .catch(() => setErro("Não deu para ativar. Tente de novo."))
      .finally(() => setOcupado(null));
  }

  function testar() {
    setOcupado("teste");
    setErro(null);
    setAviso(null);
    void enviarTeste()
      .then((msg) => {
        setErro(msg);
        if (!msg) setAviso("Teste enviado — deve chegar em alguns segundos.");
      })
      .catch(() => setErro("Não deu para mandar o teste. Tente de novo."))
      .finally(() => setOcupado(null));
  }

  function desativar() {
    setOcupado("desativar");
    setErro(null);
    setAviso(null);
    void desativarPush()
      .then(async (msg) => {
        setErro(msg);
        if (!msg) setAviso("Desativado neste celular. Os outros continuam como estão.");
        await conferir();
      })
      .catch(() => setErro("Não deu para desativar. Tente de novo."))
      .finally(() => setOcupado(null));
  }

  return (
    <div className="space-y-3">
      {estado === null && <p className="text-xs text-ink-muted">Conferindo este celular…</p>}

      {estado === "instalar-ios" && (
        <p className={`flex items-start gap-2 ${AVISO}`}>
          <Share className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
          <span>
            No iPhone, os lembretes só funcionam com o app instalado: no Safari, toque em
            Compartilhar → Adicionar à Tela de Início e abra o Mais Leve pelo ícone.
          </span>
        </p>
      )}

      {estado === "sem-suporte" && (
        <p className={AVISO}>
          Este navegador não recebe notificações.
          {iphone && " No iPhone, precisa do iOS 16.4 ou mais novo."}
        </p>
      )}

      {estado === "sem-chave" && (
        <p className={AVISO}>Os lembretes ainda não foram configurados no servidor.</p>
      )}

      {estado === "bloqueado" && (
        <p className="flex items-start gap-2 rounded-xl2 bg-gold-soft px-3.5 py-2.5 text-xs leading-relaxed text-gold">
          <BellOff className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            As notificações estão bloqueadas. No iPhone: Ajustes → Notificações → Mais Leve →
            ligue Permitir Notificações.
          </span>
        </p>
      )}

      {estado === "desligado" && (
        <Button onClick={ativar} disabled={ocupado !== null} className="w-full">
          <Bell className="h-4 w-4" />
          {ocupado === "ativar" ? "Ativando…" : "Ativar lembretes neste celular"}
        </Button>
      )}

      {estado === "ativo" && (
        <>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-brand">
            <BellRing className="h-4 w-4" /> Ativo neste celular ✓
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={testar} disabled={ocupado !== null}>
              <Send className="h-3.5 w-3.5" />
              {ocupado === "teste" ? "Enviando…" : "Enviar um teste"}
            </Button>
            <Button variant="ghost" size="sm" onClick={desativar} disabled={ocupado !== null}>
              <BellOff className="h-3.5 w-3.5" />
              {ocupado === "desativar" ? "Desativando…" : "Desativar neste celular"}
            </Button>
          </div>
        </>
      )}

      {aviso && !erro && (
        <p className="rounded-xl2 bg-brand-soft px-3.5 py-2.5 text-xs leading-relaxed text-brand-deep">
          {aviso}
        </p>
      )}
      {erro && (
        <p
          role="alert"
          className="rounded-xl2 bg-danger-soft px-3.5 py-2.5 text-xs leading-relaxed text-danger"
        >
          {erro}
        </p>
      )}
    </div>
  );
}
