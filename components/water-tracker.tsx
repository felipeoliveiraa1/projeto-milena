"use client";

import { useEffect, useState } from "react";
import { Droplet, Milk } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDay, setWater } from "@/lib/storage";
import { todayKey } from "@/lib/date";
import { cn } from "@/lib/utils";

const META = 2;
const TAMANHO = "1,2 L";

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

  const pct = Math.round((count / META) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplet className="h-5 w-5 text-sky-500" />
          Água — meta {META} garrafas de {TAMANHO}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={pct} indicatorClassName="bg-sky-400" />
        <div className="flex items-end justify-center gap-6">
          {Array.from({ length: META }).map((_, i) => {
            const filled = hydrated && i < count;
            return (
              <button
                key={i}
                onClick={() => update(i + 1 === count ? i : i + 1)}
                aria-label={`Garrafa ${i + 1}`}
                className={cn(
                  "flex flex-col items-center gap-1 transition active:scale-95",
                )}
              >
                <div
                  className={cn(
                    "flex h-32 w-20 items-center justify-center rounded-3xl border-4 transition-all",
                    filled
                      ? "animate-pop border-sky-400 bg-sky-100 text-sky-600 shadow-md shadow-sky-200"
                      : "border-sky-100 bg-white text-sky-200",
                  )}
                >
                  <Milk
                    className={cn("h-14 w-14 transition", filled && "drop-shadow")}
                    strokeWidth={1.5}
                  />
                </div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    filled ? "text-sky-700" : "text-zinc-400",
                  )}
                >
                  Garrafa {i + 1}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-center text-xs text-zinc-500">
          Toque na garrafa quando terminar. Total: {(META * 1.2).toFixed(1)} L por dia.
        </p>
      </CardContent>
    </Card>
  );
}
