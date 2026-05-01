"use client";

import { useEffect, useState } from "react";
import { Sparkles, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MEALS } from "@/data/meals";
import { getDay, getStreak } from "@/lib/storage";
import { dataExtenso } from "@/lib/date";

export function DailySummary() {
  const [pct, setPct] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(dataExtenso(new Date()));
    Promise.all([getDay(), getStreak()])
      .then(([day, streakValue]) => {
        const meals = Object.values(day.meals).filter(Boolean).length;
        const totalItems = MEALS.length + 2 + 1; // refeições + 2 garrafas + treino
        const score = meals + Math.min(day.water, 2) + (day.workout ? 1 : 0);
        setPct(Math.round((score / totalItems) * 100));
        setStreak(streakValue);
        setHydrated(true);
      })
      .catch(() => setHydrated(true));
  }, []);

  return (
    <Card className="bg-linear-to-br from-rose-100 to-orange-100 border-rose-200">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-rose-600">
              {hydrated ? today : "—"}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-zinc-900">
              Bom dia, Milena!
            </h2>
          </div>
          <div className="rounded-2xl bg-white/70 px-3 py-2 text-center shadow-sm">
            <p className="flex items-center gap-1 text-xs text-rose-700">
              <Flame className="h-3 w-3" /> Sequência
            </p>
            <p className="text-2xl font-bold text-rose-700">{hydrated ? streak : 0}</p>
            <p className="text-[10px] text-zinc-500">dias</p>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 font-medium text-rose-800">
              <Sparkles className="h-4 w-4" />
              Plano de hoje
            </span>
            <span className="font-semibold text-rose-700">{pct}%</span>
          </div>
          <Progress value={pct} indicatorClassName="bg-rose-500" />
        </div>
      </CardContent>
    </Card>
  );
}
