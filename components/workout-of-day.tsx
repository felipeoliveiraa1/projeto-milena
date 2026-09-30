"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Droplet,
  Dumbbell,
  Footprints,
  HeartPulse,
  Moon,
} from "lucide-react";
import { Card, CardContent, Eyebrow } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { legendaDoDia, opcoesCardio, planoDe } from "@/data/workouts";
import { listaOu } from "@/components/cardio-entre-series";
import { usePreferencias } from "@/lib/settings";
import { getDay, toggleWorkout } from "@/lib/storage";
import { diaDaSemana } from "@/lib/date";
import { useDia } from "@/components/day-context";
import { cn } from "@/lib/utils";

export function WorkoutOfDay() {
  const [carga, setCarga] = useState<{ data: string; feito: boolean } | null>(
    null,
  );
  const [naoSalvou, setNaoSalvou] = useState<string | null>(null);
  // O que o banco confirmou em cada dia e o número do último toque: se um
  // toque não grava, o botão volta para o confirmado — só se foi o último.
  const confirmado = useRef<Record<string, boolean>>({});
  const toques = useRef<Record<string, number>>({});
  const { data } = useDia();
  // Enquanto as preferências não chegam, o plano é o de fábrica: o card guarda
  // o lugar, mas não mostra a adaptação para quem está no completo.
  const { prefs, carregando } = usePreferencias();
  const esperando = carregando && "invisible";
  const plano = planoDe(prefs.faseTreino);
  const day = diaDaSemana(new Date(data + "T00:00:00"));

  useEffect(() => {
    // O dia pode virar no meio da busca (a virada das 05:00): a resposta
    // atrasada do dia anterior não toma o lugar da nova.
    let ativo = true;
    getDay(data).then((d) => {
      if (!ativo) return;
      confirmado.current[data] = d.workout;
      setCarga({ data, feito: d.workout });
    });
    return () => {
      ativo = false;
    };
  }, [data]);

  /** Guarda a marca — só se a tela ainda estiver no dia do toque. */
  function marcar(dataDoToque: string, feito: boolean) {
    setCarga((c) => (c && c.data !== dataDoToque ? c : { data: dataDoToque, feito }));
  }

  const hydrated = carga?.data === data;
  const done = hydrated && carga.feito;

  const workout = plano.dias.find((w) => w.diaSemana === day) ?? plano.dias[0];
  // O tipo do dia vem dos dados — o tempo e o lembrete do cardio também.
  const academia = workout.tipo === "academia";
  const { cardio, respiro } = plano.entreSeries;

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Eyebrow className={cn("text-brand", esperando)}>
              {plano.nome} · {workout.diaNome}
            </Eyebrow>
            <p className={cn("font-display mt-1.5 text-xl leading-tight text-ink", esperando)}>
              {workout.foco}
            </p>
            <p className={cn("mt-1 text-sm text-ink-muted", esperando)}>
              {legendaDoDia(workout)}
            </p>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
            {academia ? (
              <Dumbbell className="h-5 w-5" />
            ) : workout.tipo === "caminhada" ? (
              <Footprints className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </span>
        </div>

        {academia && !carregando && (
          <p className="flex items-start gap-2.5 rounded-xl2 bg-clay-soft px-3.5 py-3 text-xs leading-relaxed text-clay-deep">
            <HeartPulse className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
            <span>
              <strong>Cardio entre todas as séries:</strong> {cardio} sem
              pular e {respiro} de respiro antes da próxima.
              {workout.cardioSuave &&
                ` Hoje, só ${listaOu(opcoesCardio(workout).map((o) => o.curto))}.`}
            </span>
          </p>
        )}

        {workout.lembrete && !carregando && (
          <p className="flex items-start gap-2.5 rounded-xl2 bg-plum-soft px-3.5 py-3 text-xs leading-relaxed text-plum">
            <Droplet className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{workout.lembrete}</span>
          </p>
        )}

        {/* flex-1 só lado a lado: em coluna, a base 0 do flex-1 esmagava os
            botões para a altura do texto e ignorava o h-11. */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant={done ? "secondary" : "default"}
            onClick={async () => {
              const dataDoToque = data;
              // Grava o que ela quer ver, não "o contrário do banco".
              const alvo = !done;
              const toque = (toques.current[dataDoToque] ?? 0) + 1;
              toques.current[dataDoToque] = toque;
              marcar(dataDoToque, alvo);
              try {
                const next = await toggleWorkout(dataDoToque, alvo);
                confirmado.current[dataDoToque] = next.workout;
                if (toques.current[dataDoToque] === toque) marcar(dataDoToque, next.workout);
                setNaoSalvou((d) => (d === dataDoToque ? null : d));
              } catch (err) {
                // Não gravou (sem internet, por exemplo): volta para o que o
                // banco confirmou, para não aparecer como feito o que não foi
                // salvo — e ela fica sabendo.
                console.error(err);
                if (toques.current[dataDoToque] === toque) {
                  marcar(dataDoToque, confirmado.current[dataDoToque] ?? false);
                }
                setNaoSalvou(dataDoToque);
              }
            }}
            className="sm:flex-1"
            disabled={!hydrated || carregando}
          >
            {done ? (
              <>
                <CheckCircle2 className="h-4 w-4" /> Treino feito
              </>
            ) : (
              "Marcar treino feito"
            )}
          </Button>
          <Button asChild variant="outline" className="sm:flex-1">
            <Link href="/treino">
              Ver exercícios <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        {naoSalvou === data && (
          <p role="alert" className="text-center text-xs font-semibold text-danger">
            Não deu para salvar agora. Confira a internet e tente de novo.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
