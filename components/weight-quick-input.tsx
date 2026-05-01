"use client";

import { useEffect, useState } from "react";
import { Scale, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { addWeight, getWeights } from "@/lib/storage";
import { todayKey } from "@/lib/date";

const PESO_INICIAL = 84;
const META = 70;

export function WeightQuickInput() {
  const [value, setValue] = useState("");
  const [latest, setLatest] = useState<number | null>(null);

  useEffect(() => {
    getWeights().then((list) => {
      if (list.length > 0) setLatest(list[list.length - 1].weight);
    });
  }, []);

  async function save() {
    const w = parseFloat(value.replace(",", "."));
    if (isNaN(w) || w < 30 || w > 200) return;
    setLatest(w);
    setValue("");
    await addWeight({ date: todayKey(), weight: w });
  }

  const ref = latest ?? PESO_INICIAL;
  const perdido = Math.max(0, PESO_INICIAL - ref);
  const totalPerder = PESO_INICIAL - META;
  const pctMeta = Math.min(100, Math.round((perdido / totalPerder) * 100));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-emerald-500" />
          Peso
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-zinc-500">Atual</p>
            <p className="text-3xl font-bold text-zinc-900">
              {ref.toFixed(1)}<span className="text-base font-medium text-zinc-500"> kg</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500">Meta</p>
            <p className="text-xl font-semibold text-emerald-600">{META} kg</p>
          </div>
        </div>
        <Progress value={pctMeta} indicatorClassName="bg-emerald-400" />
        <p className="text-xs text-zinc-500">
          {perdido > 0
            ? `Você já eliminou ${perdido.toFixed(1)} kg — faltam ${(ref - META).toFixed(1)} kg.`
            : "Registre seu peso hoje para começar a acompanhar."}
        </p>
        <div className="flex gap-2">
          <Input
            inputMode="decimal"
            placeholder="Peso de hoje (kg)"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Button onClick={save} size="icon" aria-label="Salvar peso">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
