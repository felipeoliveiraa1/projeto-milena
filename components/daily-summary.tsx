"use client";

import { useEffect, useState } from "react";
import { Flame, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PROTOCOLO, ROTINA_IDS, TOTAL_ITENS_ROTINA } from "@/data/protocol";
import { getDay, getStreak } from "@/lib/storage";
import { dataExtenso } from "@/lib/date";
import { useProtocolo } from "@/lib/protocol";
import { useAgora } from "@/lib/now";

/** Peso de cada frente no "plano de hoje" — soma 1. */
const PESOS = { refeicoes: 0.3, agua: 0.15, treino: 0.2, rotina: 0.35 };

export function DailySummary() {
  const [pct, setPct] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const agora = useAgora();
  const status = useProtocolo();
  const today = agora ? dataExtenso(agora) : "";

  useEffect(() => {
    Promise.all([getDay(), getStreak()])
      .then(([day, streakValue]) => {
        const refeicoes = Object.values(day.meals).filter(Boolean).length;
        const rotina = ROTINA_IDS.filter((id) => day.supplements[id]).length;
        const score =
          PESOS.refeicoes * Math.min(refeicoes / 4, 1) +
          PESOS.agua * Math.min(day.water / 2, 1) +
          PESOS.treino * (day.workout ? 1 : 0) +
          PESOS.rotina * Math.min(rotina / TOTAL_ITENS_ROTINA, 1);
        setPct(Math.round(score * 100));
        setStreak(streakValue);
        setHydrated(true);
      })
      .catch(() => setHydrated(true));
  }, []);

  return (
    <Card className="bg-linear-to-br from-rose-100 to-orange-100 border-rose-200">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-rose-600">
              {hydrated ? today : "—"}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-zinc-900">Bom dia, Milena!</h2>
            {status && (
              <p className="mt-1 text-sm font-medium text-rose-800">
                {status.naoComecou
                  ? `${PROTOCOLO.nome} começa em breve`
                  : status.concluido
                    ? `${PROTOCOLO.nome} · ciclo de ${status.total} dias concluído 🎉`
                    : `${PROTOCOLO.nome} · dia ${status.dia} de ${status.total}`}
              </p>
            )}
          </div>
          <div className="shrink-0 rounded-2xl bg-white/70 px-3 py-2 text-center shadow-sm">
            <p className="flex items-center gap-1 text-xs text-rose-700">
              <Flame className="h-3 w-3" /> Sequência
            </p>
            <p className="text-2xl font-bold text-rose-700">{hydrated ? streak : 0}</p>
            <p className="text-[10px] text-zinc-500">dias</p>
          </div>
        </div>

        {status && !status.naoComecou && !status.concluido && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-rose-800">
              <span>Protocolo</span>
              <span className="font-semibold">
                {status.dia}/{status.total} dias
              </span>
            </div>
            <Progress value={status.pct} indicatorClassName="bg-emerald-500" />
          </div>
        )}

        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 font-medium text-rose-800">
              <Sparkles className="h-4 w-4" />
              Plano de hoje
            </span>
            <span className="font-semibold text-rose-700">{pct}%</span>
          </div>
          <Progress value={pct} indicatorClassName="bg-rose-500" />
          <p className="text-[11px] text-rose-700/80">
            Refeições, água, treino e rotina do protocolo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
