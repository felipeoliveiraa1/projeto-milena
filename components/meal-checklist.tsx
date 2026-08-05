"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cardapioDoDia, type Refeicao, type TipoItem } from "@/data/meals";
import { ORDEM_CONSUMO } from "@/data/protocol";
import { Card, CardContent, CardHeader, CardTitle, Eyebrow } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { getDay, toggleMeal } from "@/lib/storage";
import { todayKey } from "@/lib/date";
import { useProtocolo } from "@/lib/protocol";
import { cn } from "@/lib/utils";

export const CORES_TIPO: Record<TipoItem, string> = {
  proteina: "bg-clay-soft text-clay-deep",
  carbo: "bg-gold-soft text-gold",
  vegetal: "bg-brand-soft text-brand",
  fruta: "bg-plum-soft text-plum",
  gordura: "bg-bone-deep text-ink-soft",
  bebida: "bg-line-soft text-ink-soft",
};

export const ROTULO_TIPO: Record<TipoItem, string> = {
  proteina: "proteína",
  carbo: "carbo",
  vegetal: "vegetal",
  fruta: "fruta",
  gordura: "gordura",
  bebida: "bebida",
};

export function MealChecklist() {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const status = useProtocolo();
  const dia = status?.diaCardapio ?? 1;

  useEffect(() => {
    getDay(todayKey()).then((d) => {
      setChecks(d.meals);
      setHydrated(true);
    });
  }, []);

  async function handleToggle(refeicao: Refeicao) {
    setChecks((prev) => ({ ...prev, [refeicao.id]: !prev[refeicao.id] }));
    const next = await toggleMeal(refeicao.id);
    setChecks({ ...next.meals });
  }

  const cardapio = cardapioDoDia(dia);
  const feitas = hydrated ? cardapio.refeicoes.filter((r) => checks[r.id]).length : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <Eyebrow className="text-clay">Cardápio · dia {dia}</Eyebrow>
            <CardTitle className="mt-1.5">Refeições de hoje</CardTitle>
          </div>
          <p className="font-display shrink-0 text-2xl leading-none text-ink tabular">
            {feitas}
            <span className="text-ink-muted">/{cardapio.refeicoes.length}</span>
          </p>
        </div>
        <p className="text-sm text-ink-muted">
          São opções — coma com fome e pare na saciedade.
        </p>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-xl2 bg-brand-soft/60 px-3.5 py-2.5 text-[0.6875rem] font-semibold text-brand">
          {ORDEM_CONSUMO.map((o, i) => (
            <span key={o.o} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-brand/40">→</span>}
              <span>{o.o}</span>
            </span>
          ))}
        </div>

        {cardapio.refeicoes.map((refeicao) => {
          const checked = hydrated && !!checks[refeicao.id];
          const isOpen = open === refeicao.id;
          const proteina = refeicao.itens.find((i) => i.tipo === "proteina");
          return (
            <div
              key={refeicao.id}
              className={cn(
                "rounded-xl2 border transition",
                checked ? "border-brand/20 bg-brand-soft/50" : "border-line bg-surface",
              )}
            >
              <div className="flex items-center gap-3 p-3.5">
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => handleToggle(refeicao)}
                  aria-label={refeicao.nome}
                />
                <button
                  className="flex flex-1 items-center justify-between gap-3 text-left"
                  onClick={() => setOpen(isOpen ? null : refeicao.id)}
                >
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "font-semibold",
                        checked ? "text-ink-muted line-through" : "text-ink",
                      )}
                    >
                      {refeicao.nome}
                    </p>
                    <p className="truncate text-xs text-ink-muted">
                      <span className="tabular">{refeicao.hora}</span>
                      {proteina && ` · ${proteina.label.split(":")[0]}`}
                    </p>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-ink-muted transition",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
              </div>

              {isOpen && (
                <div className="animate-rise space-y-2 border-t border-line/70 px-4 py-3.5">
                  {refeicao.itens.map((it) => (
                    <div key={it.id} className="flex items-start gap-2">
                      <span
                        className={cn(
                          "mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[0.625rem] font-bold",
                          CORES_TIPO[it.tipo],
                        )}
                      >
                        {ROTULO_TIPO[it.tipo]}
                      </span>
                      <span className="text-sm leading-relaxed text-ink-soft">{it.label}</span>
                    </div>
                  ))}
                  {refeicao.nota && (
                    <p className="rounded-xl2 bg-gold-soft px-3 py-2.5 text-xs leading-relaxed text-gold">
                      {refeicao.nota}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
