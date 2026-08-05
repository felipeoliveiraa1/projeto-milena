"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Dumbbell } from "lucide-react";
import { Card, CardContent, Eyebrow } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WORKOUTS } from "@/data/workouts";
import { getDay, toggleWorkout } from "@/lib/storage";
import { diaDaSemana } from "@/lib/date";
import { useDia } from "@/components/day-context";

export function WorkoutOfDay() {
  const [carga, setCarga] = useState<{ data: string; feito: boolean } | null>(null);
  const { data } = useDia();
  const day = diaDaSemana(new Date(data + "T00:00:00"));

  useEffect(() => {
    getDay(data).then((d) => setCarga({ data, feito: d.workout }));
  }, [data]);

  const hydrated = carga?.data === data;
  const done = hydrated && carga.feito;

  const workout = WORKOUTS.find((w) => w.diaSemana === day) ?? WORKOUTS[0];
  const descanso = workout.exercicios.length <= 2;

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Eyebrow className="text-brand">Treino · {workout.diaNome}</Eyebrow>
            <p className="font-display mt-1.5 text-xl leading-tight text-ink">{workout.foco}</p>
            <p className="mt-1 text-sm text-ink-muted">
              {workout.exercicios.length} exercícios
              {!descanso && " · cerca de 40 min"}
            </p>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
            <Dumbbell className="h-5 w-5" />
          </span>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant={done ? "secondary" : "default"}
            onClick={async () => {
              setCarga({ data, feito: !done });
              const next = await toggleWorkout(data);
              setCarga({ data, feito: next.workout });
            }}
            className="flex-1"
            disabled={!hydrated}
          >
            {done ? (
              <>
                <CheckCircle2 className="h-4 w-4" /> Treino feito
              </>
            ) : (
              "Marcar treino feito"
            )}
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/treino">
              Ver exercícios <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
