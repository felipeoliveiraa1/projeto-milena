"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Apple,
  Ban,
  Clock,
  Replace,
  Stethoscope,
  CheckCircle2,
  ShoppingCart,
  ChevronsUpDown,
} from "lucide-react";
import {
  ALIMENTOS_EVITAR,
  MEALS,
  ORIENTACOES_MEDICO,
  SUBSTITUICOES_GERAIS,
  TOTAL_MACROS,
  type Meal,
} from "@/data/meals";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getShoppingState, toggleComponentSelection } from "@/lib/storage";
import { cn } from "@/lib/utils";

export default function DietaPage() {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    getShoppingState().then((s) => {
      setSelected(s.selectedComponents);
      setHydrated(true);
    });
  }, []);

  async function handleToggle(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
    const next = await toggleComponentSelection(id);
    setSelected(next.selectedComponents);
  }

  const totalSelecionados = hydrated
    ? Object.values(selected).filter(Boolean).length
    : 0;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-500">
          Plano alimentar
        </p>
        <h2 className="text-2xl font-bold text-zinc-900">Sua dieta completa</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Marque cada item (alimento ou substituição) que você vai usar — vai montando o cardápio
          do seu jeito. Os ingredientes aparecem em <strong>/lista</strong> automaticamente.
        </p>
      </div>

      {totalSelecionados > 0 && (
        <Card className="border-emerald-300 bg-linear-to-br from-emerald-50 to-emerald-100">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-500 p-2 text-white">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-900">
                  {totalSelecionados}{" "}
                  {totalSelecionados === 1 ? "item escolhido" : "itens escolhidos"}
                </p>
                <p className="text-xs text-emerald-700">
                  Lista de compras consolidada atualizada
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="soft">
              <Link href="/lista">Ver lista</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-sky-200 bg-linear-to-br from-sky-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sky-800">
            <Stethoscope className="h-5 w-5" /> Orientações do médico
          </CardTitle>
          <CardDescription>
            {ORIENTACOES_MEDICO.medico} · {ORIENTACOES_MEDICO.especialidade}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-zinc-700">
            {ORIENTACOES_MEDICO.pontos.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-linear-to-br from-emerald-50 to-rose-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-800">Total do dia (de referência)</CardTitle>
          <CardDescription>Distribuídos nas 6–7 refeições abaixo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3 text-center">
            <Macro label="Kcal" value={TOTAL_MACROS.kcal.toString()} unit="" />
            <Macro label="Proteína" value={TOTAL_MACROS.proteina.toString()} unit="g" />
            <Macro label="Carbo" value={TOTAL_MACROS.carbo.toString()} unit="g" />
            <Macro label="Gordura" value={TOTAL_MACROS.gordura.toString()} unit="g" />
          </div>
        </CardContent>
      </Card>

      {MEALS.map((meal) => (
        <MealCard
          key={meal.id}
          meal={meal}
          selected={selected}
          hydrated={hydrated}
          onToggle={handleToggle}
        />
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Replace className="h-5 w-5 text-rose-500" /> Substituições gerais
          </CardTitle>
          <CardDescription>
            Tabela de equivalência com porção e macros — use para variar sem perder o equilíbrio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 text-sm">
          {SUBSTITUICOES_GERAIS.map((g) => (
            <div key={g.grupo} className="space-y-2">
              <div>
                <p className="font-semibold text-zinc-900">{g.grupo}</p>
                {g.nota && <p className="text-xs text-zinc-500">{g.nota}</p>}
              </div>
              <div className="overflow-x-auto rounded-xl border border-rose-100">
                <table className="w-full text-xs">
                  <thead className="bg-rose-50 text-rose-700">
                    <tr>
                      <th className="px-2 py-2 text-left font-semibold">Alimento</th>
                      <th className="px-2 py-2 text-left font-semibold">Porção</th>
                      <th className="px-2 py-2 text-right font-semibold">kcal</th>
                      <th className="px-2 py-2 text-right font-semibold">P</th>
                      <th className="px-2 py-2 text-right font-semibold">C</th>
                      <th className="px-2 py-2 text-right font-semibold">G</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-50">
                    {g.opcoes.map((o) => (
                      <tr key={o.nome}>
                        <td className="px-2 py-2 font-medium text-zinc-800">{o.nome}</td>
                        <td className="px-2 py-2 text-zinc-600">{o.quantidade}</td>
                        <td className="px-2 py-2 text-right text-zinc-700">{o.macros.kcal}</td>
                        <td className="px-2 py-2 text-right text-zinc-700">{o.macros.proteina}</td>
                        <td className="px-2 py-2 text-right text-zinc-700">{o.macros.carbo}</td>
                        <td className="px-2 py-2 text-right text-zinc-700">{o.macros.gordura}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Ban className="h-5 w-5" /> Evitar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-1 text-sm text-zinc-700">
            {ALIMENTOS_EVITAR.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function MealCard({
  meal,
  selected,
  hydrated,
  onToggle,
}: {
  meal: Meal;
  selected: Record<string, boolean>;
  hydrated: boolean;
  onToggle: (id: string) => void;
}) {
  const totalNoCard = meal.componentes.length + (meal.substituicoes?.length ?? 0);
  const marcadosNoCard = [
    ...meal.componentes.map((c) => c.id),
    ...(meal.substituicoes?.map((s) => s.id) ?? []),
  ].filter((id) => hydrated && selected[id]).length;

  return (
    <Card
      className={cn(
        "transition",
        marcadosNoCard > 0 && "border-emerald-300 ring-2 ring-emerald-200",
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2">
              <Apple className="h-5 w-5 text-rose-500" />
              {meal.nome}
            </CardTitle>
            <p className="flex items-center gap-1 text-xs text-zinc-500">
              <Clock className="h-3 w-3" />
              {meal.hora} · {meal.macros.kcal} kcal · P {meal.macros.proteina}g · C {meal.macros.carbo}g · G {meal.macros.gordura}g
            </p>
          </div>
          {marcadosNoCard > 0 && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              {marcadosNoCard}/{totalNoCard}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
            Alimentos da refeição
          </p>
          {meal.componentes.map((c) => {
            const checked = hydrated && !!selected[c.id];
            return (
              <button
                key={c.id}
                onClick={() => onToggle(c.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border bg-white p-3 text-left transition active:scale-[0.99]",
                  checked
                    ? "border-emerald-200 bg-emerald-50/60"
                    : c.alternativa
                      ? "border-zinc-100 border-dashed"
                      : "border-zinc-100 hover:bg-rose-50/40",
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => onToggle(c.id)}
                  className="mt-0.5"
                />
                <span
                  className={cn(
                    "flex-1 text-sm",
                    checked ? "text-zinc-500 line-through" : "text-zinc-800",
                    c.alternativa && !checked && "text-zinc-600 italic",
                  )}
                >
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
          <strong className="block text-amber-700">Por que comer:</strong>
          {meal.porQue}
        </div>

        {meal.substituicoes && meal.substituicoes.length > 0 && (
          <div className="space-y-2">
            <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-rose-700">
              <ChevronsUpDown className="h-3 w-3" /> Substituições (também selecionáveis)
            </p>
            <div className="space-y-2">
              {meal.substituicoes.map((s) => {
                const checked = hydrated && !!selected[s.id];
                return (
                  <button
                    key={s.id}
                    onClick={() => onToggle(s.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl border-2 p-3 text-left transition active:scale-[0.99]",
                      checked
                        ? "border-emerald-300 bg-emerald-50/60"
                        : "border-rose-100 bg-rose-50/40 hover:bg-rose-50",
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => onToggle(s.id)}
                      className="mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          checked ? "text-zinc-500 line-through" : "text-rose-900",
                        )}
                      >
                        {s.trocar} → {s.por}
                      </p>
                      <p className="text-xs text-rose-700">{s.quantidade}</p>
                      <p className="mt-1 text-[11px] text-zinc-600">
                        {s.macros.kcal} kcal · P {s.macros.proteina}g · C {s.macros.carbo}g · G {s.macros.gordura}g
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Macro({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-2xl bg-white/80 p-3">
      <p className="text-2xl font-bold text-zinc-900">
        {value}
        <span className="text-xs font-medium text-zinc-500">{unit}</span>
      </p>
      <p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
    </div>
  );
}
