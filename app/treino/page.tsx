"use client";

import { useEffect, useState } from "react";
import { Dumbbell, Clock, Repeat, Info, Wrench, Sparkles, CheckCircle2 } from "lucide-react";
import { WORKOUTS, EQUIPAMENTOS, SEM_APARELHO } from "@/data/workouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ExerciseVideo } from "@/components/exercise-video";
import { diaDaSemana } from "@/lib/date";
import { useAgora } from "@/lib/now";
import { getDay, toggleExercise } from "@/lib/storage";
import { cn } from "@/lib/utils";

function exId(diaSemana: number, idx: number) {
  return `${diaSemana}-${idx}`;
}

export default function TreinoPage() {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);
  // Aba escolhida na mão vence; sem escolha, abre no dia de hoje.
  const [abaEscolhida, setAbaEscolhida] = useState<string | null>(null);
  const agora = useAgora();
  const today = agora ? diaDaSemana(agora) : null;

  useEffect(() => {
    getDay().then((d) => {
      setChecks(d.exercises);
      setHydrated(true);
    });
  }, []);

  async function handleToggle(id: string) {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
    const next = await toggleExercise(id);
    setChecks({ ...next.exercises });
  }

  const ordered = [...WORKOUTS].sort((a, b) => {
    const order = [1, 2, 3, 4, 5, 6, 0];
    return order.indexOf(a.diaSemana) - order.indexOf(b.diaSemana);
  });

  const abaAtual = abaEscolhida ?? String(today ?? 1);

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

      <details className="group rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-emerald-900">
          <Wrench className="h-4 w-4 text-emerald-600" />
          Montado com os aparelhos da sua academia
          <span className="ml-auto text-xs font-normal text-emerald-700 group-open:hidden">
            ver
          </span>
        </summary>
        <div className="mt-3 space-y-3 text-xs text-emerald-900">
          <ul className="space-y-1">
            {EQUIPAMENTOS.map((e) => (
              <li key={e.nome}>
                <strong>{e.nome}</strong> — {e.detalhe}
              </li>
            ))}
          </ul>
          <p className="rounded-xl bg-white/70 p-3 text-emerald-800">
            Sua academia não tem {SEM_APARELHO.join(", ").toLowerCase()}. Cada um desses
            foi trocado por um exercício equivalente — o card do exercício explica a
            troca.
          </p>
        </div>
      </details>

      <Tabs value={abaAtual} onValueChange={setAbaEscolhida} className="w-full">
        <TabsList>
          {ordered.map((w) => (
            <TabsTrigger key={w.diaSemana} value={String(w.diaSemana)}>
              {w.diaNome.slice(0, 3)}
            </TabsTrigger>
          ))}
        </TabsList>

        {ordered.map((workout) => {
          const total = workout.exercicios.length;
          const done = workout.exercicios.filter((_, i) =>
            hydrated ? !!checks[exId(workout.diaSemana, i)] : false,
          ).length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          return (
            <TabsContent key={workout.diaSemana} value={String(workout.diaSemana)}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-rose-500" />
                    {workout.diaNome} · {workout.curto}
                  </CardTitle>
                  <p className="text-sm text-zinc-600">{workout.foco}</p>
                  {total > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span>Progresso do treino</span>
                        <span className="font-semibold text-rose-700">
                          {done}/{total} · {pct}%
                        </span>
                      </div>
                      <Progress value={pct} indicatorClassName="bg-rose-500" />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {workout.aquecimento && (
                    <div className="rounded-xl bg-orange-50 p-3 text-xs text-orange-900">
                      <strong className="block text-orange-700">Aquecimento</strong>
                      {workout.aquecimento}
                    </div>
                  )}
                  {workout.exercicios.map((ex, i) => {
                    const id = exId(workout.diaSemana, i);
                    const checked = hydrated && !!checks[id];
                    return (
                      <div
                        key={ex.nome}
                        className={cn(
                          "rounded-2xl border p-4 transition",
                          checked
                            ? "border-rose-200 bg-rose-50/60"
                            : "border-zinc-100 bg-white",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => handleToggle(id)}
                            aria-label={ex.nome}
                            className="mt-1"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-rose-500">EXERCÍCIO {i + 1}</p>
                            <p
                              className={cn(
                                "mt-0.5 font-semibold",
                                checked ? "text-zinc-400 line-through" : "text-zinc-900",
                              )}
                            >
                              {ex.nome}
                            </p>
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
                            <p className="mt-1.5 flex items-start gap-1 text-xs text-zinc-500">
                              <Wrench className="mt-0.5 h-3 w-3 shrink-0 text-zinc-400" />
                              {ex.equipamento}
                            </p>
                            {ex.adaptacao && (
                              <p className="mt-2 flex items-start gap-1 rounded-xl bg-emerald-50 p-2 text-xs text-emerald-900">
                                <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                                {ex.adaptacao}
                              </p>
                            )}
                            <ExerciseVideo nome={ex.nome} videoId={ex.videoId} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {workout.observacao && (
                    <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-900">
                      <strong className="block text-rose-700">Atenção:</strong>
                      {workout.observacao}
                    </div>
                  )}
                  {hydrated && total > 0 && done === total && (
                    <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">Treino completo! Bom trabalho 💪</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
