"use client";

import { useEffect, useState } from "react";
import { Droplet, Minus, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Eyebrow } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDay, setWater } from "@/lib/storage";
import { usePreferencias } from "@/lib/settings";
import { useDia } from "@/components/day-context";
import { cn } from "@/lib/utils";

function formatar(ml: number): string {
  if (ml < 1000) return `${ml} ml`;
  return `${(ml / 1000).toFixed(1).replace(".", ",")} L`;
}

export function WaterTracker() {
  // Guarda a data junto do valor: assim dá para saber se o que está na tela é
  // do dia escolhido, sem precisar zerar estado dentro do efeito.
  const [carga, setCarga] = useState<{ data: string; ml: number } | null>(null);
  const { prefs } = usePreferencias();
  const { data } = useDia();

  useEffect(() => {
    getDay(data).then((d) => setCarga({ data, ml: d.water }));
  }, [data]);

  const hydrated = carga?.data === data;
  const ml = hydrated ? carga.ml : 0;

  function atualizar(novo: number) {
    const v = Math.max(0, Math.min(novo, 6000));
    setCarga({ data, ml: v });
    setWater(v, data).catch((err) => console.error(err));
  }

  const meta = prefs.aguaMetaMl;
  // A menor porção vira a "casinha" da barra de copos.
  const unidade = Math.min(...prefs.aguaPorcoes);
  const pct = Math.min(100, Math.round((ml / meta) * 100));
  const unidades = Math.max(1, Math.min(12, Math.round(meta / unidade)));
  const cheias = Math.floor(ml / unidade);
  const bateuMeta = ml >= meta;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <Eyebrow className="text-brand-mid">Hidratação</Eyebrow>
            <CardTitle className="mt-1.5">Água do dia</CardTitle>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl leading-none text-ink tabular">
              {hydrated ? formatar(ml) : "0 ml"}
            </p>
            <p className="text-xs text-ink-muted tabular">meta {formatar(meta)}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex gap-1">
          {Array.from({ length: unidades }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-8 flex-1 rounded-lg border transition-colors duration-300",
                hydrated && i < cheias
                  ? "border-brand bg-brand"
                  : "border-line bg-bone",
              )}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {prefs.aguaPorcoes.map((p) => (
            <Button key={p} onClick={() => atualizar(ml + p)} className="flex-1">
              <Droplet className="h-4 w-4" /> +{p} ml
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            onClick={() => atualizar(ml - unidade)}
            disabled={ml === 0}
            aria-label={`Tirar ${unidade} ml`}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => atualizar(0)}
            disabled={ml === 0}
            aria-label="Zerar o dia"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-center text-xs text-ink-muted">
          {bateuMeta ? "Meta batida! 💧" : `${pct}% da meta · faltam ${formatar(meta - ml)}`}
        </p>
      </CardContent>
    </Card>
  );
}
