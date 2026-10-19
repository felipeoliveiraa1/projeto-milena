import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Só para exibir: troca o espaço entre um número e a unidade ("10 g",
 * "200 ml", "50.000 UI") por um espaço que não quebra, para a linha nunca
 * terminar em "10" com o "g" na de baixo. O texto em si (a prescrição) não muda.
 */
export function juntarUnidades(texto: string): string {
  return texto.replace(/(\d) (?=(?:g|mg|mcg|ml|kg|L|h|min|cm|kcal|UI)\b)/g, "$1 ");
}
