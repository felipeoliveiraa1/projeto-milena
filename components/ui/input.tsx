import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Campo de texto, número, data ou hora.
 *
 * Pensado para o Safari do iPhone: 16 px de fonte (abaixo disso o iOS dá zoom
 * ao tocar), `appearance-none` e `min-w-0` (sem isso o campo de data e hora
 * ignora a largura da coluna e passa por cima do vizinho), altura mínima (o de
 * data vazio encolhe) e o valor de data/hora alinhado à esquerda — o padrão do
 * iOS é centralizado. `block`, e não `flex`: com flex o campo de data do iOS
 * desalinha o texto.
 */
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "block h-12 min-h-11 w-full min-w-0 appearance-none rounded-xl2 border border-line bg-surface px-4 py-2 text-base text-ink transition placeholder:text-ink-muted focus-visible:border-brand-mid focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/10 disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-date-and-time-value]:min-h-[1.5em] [&::-webkit-date-and-time-value]:text-left [&::-webkit-datetime-edit]:p-0",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
