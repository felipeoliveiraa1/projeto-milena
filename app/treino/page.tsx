"use client";

import { useEffect, useState } from "react";
import { Dumbbell, Clock, Repeat, Info, PlayCircle } from "lucide-react";
import { WORKOUTS } from "@/data/workouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { diaDaSemana } from "@/lib/date";

export default function TreinoPage() {
  const [today, setToday] = useState<number | null>(null);

  useEffect(() => {
    setToday(diaDaSemana());
  }, []);

  const ordered = [...WORKOUTS].sort((a, b) => {
    const order = [1, 2, 3, 4, 5, 6, 0];
    return order.indexOf(a.diaSemana) - order.indexOf(b.diaSemana);
  });

  const defaultTab = today === null ? "1" : String(today);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-500">Plano de treino</p>
        <h2 className="text-2xl font-bold text-zinc-900">40 min por dia · 6x semana</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Foco em queimar gordura abdominal e tonificar braços, com glúteo de bônus.
          Antes de cada treino: 5 min de aquecimento.
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList>
          {ordered.map((w) => (
            <TabsTrigger key={w.diaSemana} value={String(w.diaSemana)}>
              {w.diaNome.slice(0, 3)}
            </TabsTrigger>
          ))}
        </TabsList>

        {ordered.map((workout) => (
          <TabsContent key={workout.diaSemana} value={String(workout.diaSemana)}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-rose-500" />
                  {workout.diaNome} · {workout.curto}
                </CardTitle>
                <p className="text-sm text-zinc-600">{workout.foco}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {workout.aquecimento && (
                  <div className="rounded-xl bg-orange-50 p-3 text-xs text-orange-900">
                    <strong className="block text-orange-700">Aquecimento</strong>
                    {workout.aquecimento}
                  </div>
                )}
                {workout.exercicios.map((ex, i) => {
                  const tutorialUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
                    `${ex.nome} como fazer execução correta`,
                  )}`;
                  return (
                    <div key={ex.nome} className="rounded-2xl border border-zinc-100 bg-white p-4">
                      <p className="text-xs font-bold text-rose-500">EXERCÍCIO {i + 1}</p>
                      <p className="mt-1 font-semibold text-zinc-900">{ex.nome}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="flex items-center gap-1 rounded-full bg-rose-100 px-2 py-1 text-rose-700">
                          <Repeat className="h-3 w-3" /> {ex.series} séries
                        </span>
                        <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-amber-800">
                          {ex.reps} reps
                        </span>
                        <span className="flex items-center gap-1 rounded-full bg-sky-100 px-2 py-1 text-sky-800">
                          <Clock className="h-3 w-3" /> {ex.descanso}
                        </span>
                      </div>
                      <p className="mt-2 flex items-start gap-1 text-xs text-zinc-600">
                        <Info className="mt-0.5 h-3 w-3 shrink-0 text-zinc-400" /> {ex.beneficio}
                      </p>
                      <a
                        href={tutorialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                      >
                        <PlayCircle className="h-3.5 w-3.5" /> Ver tutorial no YouTube
                      </a>
                    </div>
                  );
                })}
                {workout.observacao && (
                  <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-900">
                    <strong className="block text-rose-700">Atenção:</strong>
                    {workout.observacao}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
