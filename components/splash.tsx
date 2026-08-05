"use client";

import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand";

/**
 * Abertura do app. Aparece no carregamento (inclusive quando ela abre pelo
 * ícone da tela de início, no modo PWA) e sai sozinha.
 *
 * Renderiza igual no servidor e no cliente para não quebrar a hidratação: quem
 * decide o fim é o efeito, não a marcação.
 */
export function Splash() {
  const [fase, setFase] = useState<"aberta" | "saindo" | "fim">("aberta");

  useEffect(() => {
    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Já abriu nesta sessão: sai de imediato, sem a espera nem o fade.
    const direto = window.sessionStorage.getItem("splash") === "1" || semMovimento;

    const sair = window.setTimeout(
      () => {
        window.sessionStorage.setItem("splash", "1");
        if (direto) {
          setFase("fim");
          return;
        }
        setFase("saindo");
        window.setTimeout(() => setFase("fim"), 520);
      },
      direto ? 0 : 1000,
    );

    return () => window.clearTimeout(sair);
  }, []);

  if (fase === "fim") return null;

  return (
    <div
      aria-hidden
      data-state={fase}
      className="fixed inset-0 z-100 flex items-center justify-center bg-brand-deep transition-[opacity,transform] duration-500 ease-out data-[state=saindo]:pointer-events-none data-[state=saindo]:scale-105 data-[state=saindo]:opacity-0"
    >
      <div className="flex flex-col items-center gap-5">
        <BrandMark className="animate-splash-mark h-16 w-16 rounded-3xl bg-bone text-brand-deep" />
        <div className="animate-splash-text flex flex-col items-center gap-1.5">
          <span className="font-display text-3xl leading-none text-bone">Mais Leve</span>
          <span className="text-[0.625rem] font-semibold tracking-[0.22em] text-bone/50 uppercase">
            plano da Milena
          </span>
        </div>
      </div>
    </div>
  );
}
