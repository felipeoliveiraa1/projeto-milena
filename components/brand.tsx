import { cn } from "@/lib/utils";

/**
 * Marca do app: um broto — folha que abre a partir de um caule.
 * Lê como crescimento e como "desinflamar", que é o eixo do plano.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-2xl bg-brand text-bone shadow-sm",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-[62%] w-[62%]">
        <path
          d="M12 21V10.5"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
        />
        <path
          d="M12 13.2c0-3.4 2.3-6.1 6-6.7.3 3.9-2.1 6.7-6 6.7Z"
          fill="currentColor"
          opacity="0.95"
        />
        <path
          d="M12 16.4c-3.2 0-5.2-2.3-5.1-5.6 3.1.5 5.1 2.8 5.1 5.6Z"
          fill="currentColor"
          opacity="0.6"
        />
      </svg>
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex flex-col leading-none", className)}>
      <span className="font-display text-[1.35rem] tracking-tight text-ink">Mais Leve</span>
      <span className="mt-0.5 text-[0.65rem] font-medium tracking-[0.14em] text-ink-muted uppercase">
        plano da Milena
      </span>
    </span>
  );
}
