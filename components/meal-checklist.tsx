"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Clock, Info, Utensils } from "lucide-react";
import { cardapioDoDia, type Refeicao, type TipoItem } from "@/data/meals";
import { ORDEM_CONSUMO } from "@/data/protocol";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { getDay, toggleMeal } from "@/lib/storage";
import { todayKey } from "@/lib/date";
import { useProtocolo } from "@/lib/protocol";
import { cn } from "@/lib/utils";

const CORES_TIPO: Record<TipoItem, string> = {
  proteina: "bg-rose-100 text-rose-700",
  carbo: "bg-amber-100 text-amber-800",
  vegetal: "bg-emerald-100 text-emerald-800",
  fruta: "bg-pink-100 text-pink-700",
  gordura: "bg-orange-100 text-orange-800",
  bebida: "bg-sky-100 text-sky-800",
};

const ROTULO_TIPO: Record<TipoItem, string> = {
  proteina: "proteína",
  carbo: "carbo",
  vegetal: "vegetal",
  fruta: "fruta",
  gordura: "gordura boa",
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5 text-rose-500" />
          Refeições de hoje
        </CardTitle>
        <p className="text-xs text-zinc-500">
          Cardápio do dia {dia} do protocolo. São opções — coma com fome e pare na saciedade.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-wrap items-center gap-1 rounded-xl bg-emerald-50 px-3 py-2 text-[11px] text-emerald-900">
          <Info className="mr-1 h-3 w-3 text-emerald-600" />
          {ORDEM_CONSUMO.map((o, i) => (
            <span key={o.o} className="flex items-center gap-1">
              {i > 0 && <span className="text-emerald-400">→</span>}
              <span className="font-semibold">{o.o}</span>
            </span>
          ))}
        </div>

        {cardapio.refeicoes.map((refeicao) => {
          const checked = hydrated && !!checks[refeicao.id];
          const isOpen = open === refeicao.id;
          const proteinas = refeicao.itens.filter((i) => i.tipo === "proteina");
          return (
            <div
              key={refeicao.id}
              className={cn(
                "rounded-2xl border transition",
                checked ? "border-rose-200 bg-rose-50/60" : "border-zinc-100 bg-white",
              )}
            >
              <div className="flex items-center gap-3 p-3">
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
                        "font-medium",
                        checked ? "text-zinc-400 line-through" : "text-zinc-900",
                      )}
                    >
                      {refeicao.nome}
                    </p>
                    <p className="flex items-center gap-1 truncate text-xs text-zinc-500">
                      <Clock className="h-3 w-3 shrink-0" />
                      {refeicao.hora}
                      {proteinas.length > 0 && (
                        <span className="truncate"> · {proteinas[0].label.split(":")[0]}</span>
                      )}
                    </p>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-zinc-400 transition",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
              </div>
              {isOpen && (
                <div className="space-y-2 px-4 pb-4 text-sm">
                  {refeicao.itens.map((it) => (
                    <div key={it.id} className="flex items-start gap-2">
                      <span
                        className={cn(
                          "mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          CORES_TIPO[it.tipo],
                        )}
                      >
                        {ROTULO_TIPO[it.tipo]}
                      </span>
                      <span className="text-zinc-700">{it.label}</span>
                    </div>
                  ))}
                  {refeicao.nota && (
                    <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
                      {refeicao.nota}
                    </div>
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
