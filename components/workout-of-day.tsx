"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Dumbbell, ChevronRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WORKOUTS } from "@/data/workouts";
import { getDay, toggleWorkout } from "@/lib/storage";
import { diaDaSemana } from "@/lib/date";
import { cn } from "@/lib/utils";

export function WorkoutOfDay() {
  const [done, setDone] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [day, setDay] = useState(0);

  useEffect(() => {
    setDay(diaDaSemana());
    getDay().then((d) => {
      setDone(d.workout);
      setHydrated(true);
    });
  }, []);

  const workout = WORKOUTS.find((w) => w.diaSemana === day) ?? WORKOUTS[0];

  return (
    <Card className={cn("bg-linear-to-br border-2", workout.cor)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-rose-700" />
          Treino de hoje
        </CardTitle>
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-700/80">
          {workout.diaNome}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-lg font-semibold text-zinc-900">{workout.foco}</p>
        <p className="text-sm text-zinc-700">
          {workout.exercicios.length} exercícios · cerca de 40 min
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant={done ? "soft" : "default"}
            onClick={async () => {
              setDone((v) => !v);
              const next = await toggleWorkout();
              setDone(next.workout);
            }}
            className="flex-1"
            disabled={!hydrated}
          >
            {done ? (
              <>
                <CheckCircle2 className="h-4 w-4" /> Treino feito hoje
              </>
            ) : (
              "Marcar treino feito"
            )}
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/treino">
              Ver exercícios <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
