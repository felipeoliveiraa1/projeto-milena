"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import type { RotinaItem } from "@/data/protocol";
import { CheckRow } from "@/components/check-row";
import { cn } from "@/lib/utils";

/**
 * Item da rotina. Quando o item tem `campo: "texto"`, aparece uma caixa de
 * digitação salva por dia — usada na gratidão e nos sintomas.
 * O texto salva sozinho, 700 ms depois da última tecla.
 */
export function RotinaItemRow({
  item,
  checked,
  onToggle,
  texto,
  onSalvarTexto,
  tom = "plum",
}: {
  item: RotinaItem;
  checked: boolean;
  onToggle: () => void;
  texto?: string;
  onSalvarTexto?: (valor: string) => void;
  tom?: "plum" | "brand";
}) {
  const [valor, setValor] = useState(texto ?? "");
  const [salvo, setSalvo] = useState(false);
  const textoExterno = texto ?? "";

  // Ajuste de estado durante o render (padrão do React para "prop mudou"):
  // quando o dia termina de carregar do banco, a caixa recebe o texto salvo.
  const [textoAnterior, setTextoAnterior] = useState(textoExterno);
  if (textoExterno !== textoAnterior) {
    setTextoAnterior(textoExterno);
    setValor(textoExterno);
  }

  // A função de salvar vive numa ref para o temporizador não reiniciar toda vez
  // que o componente pai renderiza.
  const salvarRef = useRef(onSalvarTexto);
  useEffect(() => {
    salvarRef.current = onSalvarTexto;
  });

  useEffect(() => {
    // Igual ao que já está salvo: nada a fazer (inclusive na primeira carga).
    if (!salvarRef.current || valor === textoExterno) return;
    const t = setTimeout(() => {
      salvarRef.current?.(valor);
      setSalvo(true);
      setTimeout(() => setSalvo(false), 1600);
    }, 700);
    return () => clearTimeout(t);
  }, [valor, textoExterno]);

  const corAtiva = tom === "brand" ? "border-brand/20 bg-brand-soft/50" : "border-plum/20 bg-plum-soft/60";

  return (
    <div className="space-y-2">
      <CheckRow
        checked={checked}
        onToggle={onToggle}
        label={item.texto}
        className={checked ? corAtiva : undefined}
      >
        <span
          className={cn(
            "block text-sm font-medium",
            checked ? "text-ink-muted line-through" : "text-ink",
          )}
        >
          {item.texto}
        </span>
        {item.detalhe && (
          <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">
            {item.detalhe}
          </span>
        )}
      </CheckRow>

      {item.campo === "texto" && onSalvarTexto && (
        <div className="ml-1 space-y-2 border-l-2 border-line pl-3">
          {item.opcoes && item.opcoes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.opcoes.map((o) => {
                const ativo = valor.trim() === o;
                return (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setValor(ativo ? "" : o)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-semibold transition",
                      ativo
                        ? "border-plum bg-plum text-bone"
                        : "border-line bg-surface text-ink-muted hover:border-plum/40 hover:text-ink",
                    )}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
          )}

          <div className="relative">
            <textarea
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder={item.placeholder}
              rows={item.opcoes ? 2 : 3}
              className="w-full resize-y rounded-xl2 border border-line bg-surface px-3.5 py-2.5 text-sm leading-relaxed text-ink transition placeholder:text-ink-muted focus-visible:border-plum/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-plum/10"
            />
            {salvo && (
              <span className="absolute right-3 bottom-3 flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[0.625rem] font-bold text-brand">
                <Check className="h-3 w-3" /> salvo
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
