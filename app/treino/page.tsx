"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Info, Repeat, Sparkles, Wrench } from "lucide-react";
import { WORKOUTS, EQUIPAMENTOS, SEM_APARELHO } from "@/data/workouts";
import { Card, CardContent, CardHeader, CardTitle, Eyebrow } from "@/components/ui/card";
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
    <div className="stagger space-y-5">
      <header>
        <Eyebrow className="text-brand">Plano de treino</Eyebrow>
        <h2 className="font-display mt-2 text-4xl leading-none text-ink">
          40 min por dia, 6× na semana
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Queimar gordura abdominal e tonificar braços, com glúteo de bônus. Antes de cada treino,
          5 min de aquecimento.
        </p>
      </header>

      <details className="group rounded-card border border-line bg-surface p-5">
        <summary className="flex cursor-pointer list-none items-center gap-2.5 text-sm font-bold text-ink">
          <Wrench className="h-4 w-4 text-brand" />
          Montado com os aparelhos da sua academia
          <span className="ml-auto text-xs font-medium text-ink-muted group-open:hidden">ver</span>
        </summary>
        <div className="mt-4 space-y-3">
          <ul className="space-y-1.5">
            {EQUIPAMENTOS.map((e) => (
              <li key={e.nome} className="text-xs leading-relaxed text-ink-muted">
                <strong className="text-ink-soft">{e.nome}</strong> — {e.detalhe}
              </li>
            ))}
          </ul>
          <p className="rounded-xl2 bg-bone-deep/60 p-3.5 text-xs leading-relaxed text-ink-soft">
            Sua academia não tem {SEM_APARELHO.join(", ").toLowerCase()}. Cada um foi trocado por um
            exercício equivalente — o card explica a troca.
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
            <TabsContent key={workout.diaSemana} value={String(workout.diaSemana)} className="space-y-3">
              <Card>
                <CardHeader>
                  <Eyebrow className="text-brand">{workout.diaNome}</Eyebrow>
                  <CardTitle className="font-display mt-1 text-2xl leading-tight">
                    {workout.foco}
                  </CardTitle>
                  {total > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-ink-muted">
                        <span>Progresso do treino</span>
                        <span className="font-bold text-ink tabular">
                          {done}/{total} · {pct}%
                        </span>
                      </div>
                      <Progress value={pct} />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {workout.aquecimento && (
                    <div className="rounded-xl2 bg-gold-soft p-3.5">
                      <Eyebrow className="text-gold">Aquecimento</Eyebrow>
                      <p className="mt-1 text-xs leading-relaxed text-gold">
                        {workout.aquecimento}
                      </p>
                    </div>
                  )}

                  {workout.exercicios.map((ex, i) => {
                    const id = exId(workout.diaSemana, i);
                    const checked = hydrated && !!checks[id];
                    return (
                      <div
                        key={ex.nome}
                        className={cn(
                          "rounded-xl2 border p-4 transition",
                          checked ? "border-brand/20 bg-brand-soft/40" : "border-line bg-surface",
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
                            <p className="text-[0.625rem] font-bold tracking-widest text-ink-muted uppercase">
                              Exercício {i + 1}
                            </p>
                            <p
                              className={cn(
                                "mt-1 font-bold",
                                checked ? "text-ink-muted line-through" : "text-ink",
                              )}
                            >
                              {ex.nome}
                            </p>

                            <div className="mt-2.5 flex flex-wrap gap-1.5">
                              <span className="flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[0.6875rem] font-bold text-brand">
                                <Repeat className="h-3 w-3" /> {ex.series} séries
                              </span>
                              <span className="rounded-full bg-clay-soft px-2.5 py-1 text-[0.6875rem] font-bold text-clay-deep">
                                {ex.reps} reps
                              </span>
                              <span className="flex items-center gap-1 rounded-full bg-line-soft px-2.5 py-1 text-[0.6875rem] font-bold text-ink-soft">
                                <Clock className="h-3 w-3" /> {ex.descanso}
                              </span>
                            </div>

                            <p className="mt-2.5 flex items-start gap-1.5 text-xs leading-relaxed text-ink-muted">
                              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {ex.beneficio}
                            </p>
                            <p className="mt-1.5 flex items-start gap-1.5 text-xs text-ink-muted">
                              <Wrench className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                              {ex.equipamento}
                            </p>
                            {ex.adaptacao && (
                              <p className="mt-2.5 flex items-start gap-2 rounded-xl bg-brand-soft/60 p-3 text-xs leading-relaxed text-brand">
                                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
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
                    <div className="rounded-xl2 bg-danger-soft/60 p-3.5">
                      <Eyebrow className="text-danger">Atenção</Eyebrow>
                      <p className="mt-1 text-xs leading-relaxed text-danger">
                        {workout.observacao}
                      </p>
                    </div>
                  )}

                  {hydrated && total > 0 && done === total && (
                    <div className="flex items-center gap-2.5 rounded-xl2 bg-brand p-4 text-bone">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-bold">Treino completo. Muito bem! 💪</span>
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
