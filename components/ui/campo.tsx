import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Lista agrupada de campos, no jeito dos Ajustes do iPhone: uma linha por
 * campo, o rótulo à esquerda e o campo, de largura fixa, à direita. Em 320 px
 * ou em 430 px os campos ficam alinhados entre si, e um rótulo que quebra em
 * duas linhas não empurra o campo do vizinho.
 */
export function GrupoCampos({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "divide-y divide-line/70 overflow-hidden rounded-xl2 border border-line bg-bone/40",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Uma linha do grupo. É um <label>: tocar no rótulo abre o campo. Com
 * `acao` (um botão ao lado do campo), vira <div> — botão dentro de label
 * repassaria o toque para o campo.
 */
export function LinhaCampo({
  rotulo,
  detalhe,
  children,
  acao,
  className,
}: {
  rotulo: React.ReactNode;
  detalhe?: React.ReactNode;
  /** O campo, com CAMPO_NA_LINHA e `w-22` (hora, número) ou `w-44` (data, texto). */
  children: React.ReactNode;
  /** Botão depois do campo (remover, por exemplo). */
  acao?: React.ReactNode;
  className?: string;
}) {
  const Caixa = acao ? "div" : "label";
  return (
    <Caixa className={cn("flex min-h-15 items-center gap-3 px-3.5 py-2", className)}>
      {/* O rótulo cresce e quebra em palavras; o campo encolhe só se faltar espaço (320 px). */}
      <span className="min-w-18 flex-1">
        <span className="block text-sm font-semibold leading-snug text-ink">{rotulo}</span>
        {detalhe && (
          <span className="mt-0.5 block text-xs leading-snug text-ink-muted">{detalhe}</span>
        )}
      </span>
      <span className="flex min-w-0 items-center justify-end gap-1">
        {children}
        {acao}
      </span>
    </Caixa>
  );
}

/** Classes do campo dentro da linha: compacto e com o valor à direita. */
export const CAMPO_NA_LINHA =
  "h-11 max-w-full px-3 text-right tabular [&::-webkit-date-and-time-value]:text-right";
