"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Clock, Utensils } from "lucide-react";
import { MEALS, type Meal } from "@/data/meals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { getDay, toggleMeal } from "@/lib/storage";
import { todayKey } from "@/lib/date";
import { cn } from "@/lib/utils";

export function MealChecklist() {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    getDay(todayKey()).then((d) => {
      setChecks(d.meals);
      setHydrated(true);
    });
  }, []);

  async function handleToggle(meal: Meal) {
    setChecks((prev) => ({ ...prev, [meal.id]: !prev[meal.id] }));
    const next = await toggleMeal(meal.id);
    setChecks({ ...next.meals });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5 text-rose-500" />
          Refeições de hoje
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {MEALS.map((meal) => {
          const checked = hydrated && !!checks[meal.id];
          const isOpen = open === meal.id;
          return (
            <div
              key={meal.id}
              className={cn(
                "rounded-2xl border transition",
                checked ? "border-rose-200 bg-rose-50/60" : "border-zinc-100 bg-white",
              )}
            >
              <div className="flex items-center gap-3 p-3">
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => handleToggle(meal)}
                  aria-label={meal.nome}
                />
                <button
                  className="flex flex-1 items-center justify-between gap-3 text-left"
                  onClick={() => setOpen(isOpen ? null : meal.id)}
                >
                  <div>
                    <p
                      className={cn(
                        "font-medium",
                        checked ? "text-zinc-400 line-through" : "text-zinc-900",
                      )}
                    >
                      {meal.nome}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-zinc-500">
                      <Clock className="h-3 w-3" />
                      {meal.hora} · {meal.macros.kcal} kcal · P {meal.macros.proteina}g
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
                <div className="space-y-3 px-4 pb-4 text-sm">
                  <ul className="list-inside list-disc space-y-1 text-zinc-700">
                    {meal.alimentos.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                  <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
                    <strong className="block text-amber-700">Por que comer:</strong>
                    {meal.porQue}
                  </div>
                  {meal.substituicoes && (
                    <div className="text-xs">
                      <strong className="mb-1 block text-zinc-700">Substituições:</strong>
                      <ul className="space-y-1">
                        {meal.substituicoes.map((s, i) => (
                          <li
                            key={`${s.trocar}-${s.por}-${i}`}
                            className="rounded-lg bg-rose-50/60 px-2 py-1.5"
                          >
                            <p className="font-medium text-zinc-800">
                              {s.trocar} → {s.por}
                            </p>
                            <p className="text-zinc-500">
                              {s.quantidade} · {s.macros.kcal} kcal · P {s.macros.proteina}g · C {s.macros.carbo}g · G {s.macros.gordura}g
                            </p>
                          </li>
                        ))}
                      </ul>
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
