"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Eyebrow } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { addWeight, getWeights } from "@/lib/storage";
import { usePreferencias } from "@/lib/settings";
import { todayKey } from "@/lib/date";

export function WeightQuickInput() {
  const [value, setValue] = useState("");
  const [latest, setLatest] = useState<number | null>(null);
  const { prefs } = usePreferencias();
  const PESO_INICIAL = prefs.pesoInicial;
  const META = prefs.pesoMeta;

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
  const totalPerder = Math.max(0.1, PESO_INICIAL - META);
  const pctMeta = Math.max(0, Math.min(100, Math.round((perdido / totalPerder) * 100)));

  return (
    <Card>
      <CardHeader>
        <Eyebrow className="text-ink-muted">Balança</Eyebrow>
        <CardTitle className="mt-1.5">Peso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <p className="font-display text-5xl leading-none text-ink tabular">
            {ref.toFixed(1).replace(".", ",")}
            <span className="text-xl text-ink-muted"> kg</span>
          </p>
          <div className="text-right">
            <p className="text-[0.625rem] tracking-wide text-ink-muted uppercase">Meta</p>
            <p className="font-display text-2xl leading-none text-brand tabular">{META} kg</p>
          </div>
        </div>

        <div className="space-y-2">
          <Progress value={pctMeta} />
          <p className="text-xs text-ink-muted">
            {perdido > 0
              ? `Já eliminou ${perdido.toFixed(1).replace(".", ",")} kg — faltam ${(ref - META)
                  .toFixed(1)
                  .replace(".", ",")} kg.`
              : "Registre seu peso hoje para começar a acompanhar."}
          </p>
        </div>

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
