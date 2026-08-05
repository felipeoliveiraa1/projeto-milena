"use client";

import { useEffect, useState } from "react";
import { Droplet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Eyebrow } from "@/components/ui/card";
import { getDay, setWater } from "@/lib/storage";
import { todayKey } from "@/lib/date";
import { cn } from "@/lib/utils";

const META = 2;
const LITROS_POR_GARRAFA = 1.2;

export function WaterTracker() {
  const [count, setCount] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    getDay(todayKey()).then((d) => {
      setCount(Math.min(d.water, META));
      setHydrated(true);
    });
  }, []);

  function update(value: number) {
    const v = Math.max(0, Math.min(value, META));
    setCount(v);
    setWater(v).catch((err) => console.error(err));
  }

  const litros = (count * LITROS_POR_GARRAFA).toFixed(1).replace(".", ",");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <Eyebrow className="text-brand-mid">Hidratação</Eyebrow>
            <CardTitle className="mt-1.5">Água do dia</CardTitle>
          </div>
          <p className="font-display shrink-0 text-2xl leading-none text-ink tabular">
            {hydrated ? litros : "0,0"}
            <span className="text-base text-ink-muted"> L</span>
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: META }).map((_, i) => {
            const filled = hydrated && i < count;
            return (
              <button
                key={i}
                onClick={() => update(i + 1 === count ? i : i + 1)}
                aria-pressed={filled}
                aria-label={`Garrafa ${i + 1} de ${META}`}
                className={cn(
                  "group relative h-28 overflow-hidden rounded-xl2 border transition active:scale-[0.98]",
                  filled ? "border-brand bg-brand text-bone" : "border-line bg-bone text-ink-muted",
                )}
              >
                {/* nível da água subindo dentro da garrafa */}
                <span
                  className={cn(
                    "absolute inset-x-0 bottom-0 transition-[height] duration-500 ease-out",
                    filled ? "h-full bg-brand" : "h-0",
                  )}
                />
                <span className="relative flex h-full flex-col items-center justify-center gap-1.5">
                  <Droplet
                    className={cn("h-7 w-7 transition", filled && "animate-pop fill-bone/20")}
                    strokeWidth={1.6}
                  />
                  <span className="text-xs font-semibold">
                    {LITROS_POR_GARRAFA.toFixed(1).replace(".", ",")} L
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-center text-xs text-ink-muted">
          Toque na garrafa quando terminar. Meta: 2,4 L por dia.
        </p>
      </CardContent>
    </Card>
  );
}
