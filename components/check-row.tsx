"use client";

import type { ReactNode } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

/**
 * Linha clicável com checkbox.
 *
 * O container é uma div, e não um button: o Checkbox do Radix já renderiza um
 * <button>, e button dentro de button é HTML inválido — quebra a hidratação.
 * O clique no próprio checkbox para de propagar para não alternar duas vezes.
 */
export function CheckRow({
  checked,
  onToggle,
  label,
  className,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  /** Rótulo acessível do checkbox. */
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      onClick={onToggle}
      className={cn(
        "flex w-full cursor-pointer items-start gap-3 rounded-xl2 border p-3.5 text-left transition active:scale-[0.99]",
        checked
          ? "border-brand/20 bg-brand-soft/50"
          : "border-line bg-surface hover:border-line hover:bg-bone",
        className,
      )}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onToggle}
        onClick={(e) => e.stopPropagation()}
        aria-label={label}
        className="mt-0.5"
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
