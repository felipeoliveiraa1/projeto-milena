"use client";

import { useState } from "react";
import { HeartPulse } from "lucide-react";
import { Eyebrow } from "@/components/ui/card";
import { ExerciseVideo } from "@/components/exercise-video";
import {
  CARDIO_ENTRE_SERIES,
  opcoesCardio,
  type OpcaoCardio,
  type Plano,
  type WorkoutDay,
} from "@/data/workouts";
import { cn } from "@/lib/utils";

/** "bike, elíptico ou marcha" */
export function listaOu(itens: string[]): string {
  if (itens.length <= 1) return itens.join("");
  return `${itens.slice(0, -1).join(", ")} ou ${itens[itens.length - 1]}`;
}

/**
 * O recado do dia sobre o cardio — as opções da lista já vêm filtradas. A
 * sexta é dia de braço e também o dia seguinte ao Mounjaro: vale o recado do
 * estômago, que lista só o que sobra (o de braço citaria o step, que não vale).
 */
function recadoDoDia(
  dia: WorkoutDay,
  opcoes: OpcaoCardio[],
): { texto: string; mounjaro: boolean } | null {
  if (dia.cardioSuave) {
    return {
      texto: `Hoje, só o que não sacode o estômago: ${listaOu(opcoes.map((o) => o.curto))}, num ritmo mais calmo.`,
      mounjaro: true,
    };
  }
  if (dia.cardioDeBraco) {
    return {
      texto:
        "Hoje é dia de perna: entre as séries, cardio de braço — soco no ar ou polichinelo sem salto. Bike, step, marcha e elíptico cansam a perna da próxima série.",
      mounjaro: false,
    };
  }
  if (dia.cardioSemBraco) {
    return {
      texto:
        "Hoje é dia de braço: entre as séries, bike, marcha, step ou elíptico — soco no ar e polichinelo cansam o braço.",
      mounjaro: false,
    };
  }
  return null;
}

/**
 * O cardio entre as séries é pedido do médico e vale para todo exercício de
 * academia. Por isso abre o dia, antes da lista, em vez de ficar num rodapé:
 * série → cardio → respiro pelo fôlego tem que virar o jeito normal de treinar.
 *
 * As opções são botões e só uma abre por vez — com até seis opções e um vídeo
 * em cada, a lista aberta empurraria os exercícios para longe no celular.
 */
export function CardioEntreSeries({ plano, dia }: { plano: Plano; dia: WorkoutDay }) {
  const [aberta, setAberta] = useState<string | null>(null);
  const opcoes = opcoesCardio(dia);
  const selecionada = opcoes.find((o) => o.nome === aberta) ?? null;
  const recado = recadoDoDia(dia, opcoes);
  // Desde 12/10 o respiro vai até o fôlego voltar; o tempo é só o mínimo.
  const { cardio, respiroMinimo } = plano.entreSeries;

  return (
    <section
      aria-label="Cardio entre as séries"
      className="rounded-xl2 border-2 border-clay/30 bg-clay-soft p-4"
    >
      <div className="flex items-center gap-2">
        <HeartPulse className="h-4 w-4 text-clay" />
        <Eyebrow className="text-clay-deep">Entre todas as séries</Eyebrow>
      </div>
      <p className="font-display mt-1.5 text-2xl leading-tight text-ink">
        {cardio} de cardio, sem pular
      </p>

      <ol className="mt-3 grid grid-cols-3 gap-1.5 text-center">
        <Passo titulo="1 série" detalhe="do exercício" />
        <Passo titulo={cardio} detalhe="de cardio" destaque />
        <Passo titulo="respiro" detalhe={`até falar frases curtas (mín. ${respiroMinimo})`} />
      </ol>
      <p className="mt-1.5 text-center text-[0.6875rem] font-semibold text-clay-deep">
        …e a próxima série. Vale para todo exercício marcado com o coração.
      </p>

      <p className="mt-3 text-xs leading-relaxed text-clay-deep">
        Se o fôlego levar mais de 1 minuto para voltar, o cardio está forte demais: na
        próxima, mais devagar.
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-clay-deep">{CARDIO_ENTRE_SERIES.porque}</p>

      {recado && (
        <p
          className={cn(
            "mt-2.5 rounded-xl bg-surface/80 px-3 py-2 text-xs font-semibold leading-relaxed",
            recado.mounjaro ? "text-plum" : "text-clay-deep",
          )}
        >
          {recado.texto}
        </p>
      )}

      <p className="mt-3 text-[0.6875rem] font-bold tracking-wide text-clay-deep uppercase">
        Escolha um — toque para ver como fazer
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {opcoes.map((op) => {
          const ativa = op.nome === aberta;
          return (
            <button
              key={op.nome}
              type="button"
              aria-pressed={ativa}
              onClick={() => setAberta(ativa ? null : op.nome)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-bold transition active:scale-[0.98]",
                // clay-deep: o texto claro sobre o terracota comum não chegava a 4,5:1.
                ativa ? "bg-clay-deep text-bone" : "bg-surface text-clay-deep hover:bg-surface/70",
              )}
            >
              {op.nome}
            </button>
          );
        })}
      </div>

      {selecionada && (
        <div className="animate-rise mt-2.5 rounded-xl bg-surface p-3">
          <p className="text-xs leading-relaxed text-ink-soft">
            {selecionada.como}
            {/* Nos outros dias vale o "rápido" do pedido do médico; na sexta,
                dia seguinte ao Mounjaro, o recado acima pede ritmo calmo — a
                descrição acompanha. */}
            {dia.cardioSuave && " Hoje, sem acelerar: ritmo confortável."}
          </p>
          {/* key: trocar de opção fecha o vídeo da anterior. */}
          <ExerciseVideo
            key={selecionada.nome}
            nome={selecionada.nome}
            videoId={selecionada.videoId}
            className="mt-2"
          />
        </div>
      )}
    </section>
  );
}

function Passo({
  titulo,
  detalhe,
  destaque = false,
}: {
  titulo: string;
  detalhe: string;
  destaque?: boolean;
}) {
  // No destaque, fundo clay-deep e texto claro cheio (5,6:1): no terracota
  // comum, e com o texto a 80%, a leitura ficava abaixo de 4,5:1.
  return (
    <li className={cn("rounded-xl px-2 py-2.5", destaque ? "bg-clay-deep text-bone" : "bg-surface")}>
      <p className={cn("text-sm font-bold tabular", destaque ? "text-bone" : "text-ink")}>
        {titulo}
      </p>
      <p
        className={cn(
          "text-[0.625rem] font-semibold",
          destaque ? "text-bone" : "text-ink-muted",
        )}
      >
        {detalhe}
      </p>
    </li>
  );
}
