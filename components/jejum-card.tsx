"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Dumbbell, Moon, ShieldAlert, Timer, Utensils } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Eyebrow,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JEJUM } from "@/data/alimentacao";
import {
  duracaoJanela,
  formatarDuracao,
  paraHHMM,
  paraMinutos,
  useJanela,
  type Janela,
} from "@/lib/jejum";
import { useAgoraVivo } from "@/lib/now";
import { cn } from "@/lib/utils";

const DIA = 24 * 60;

/**
 * Jejum noturno na tela da dieta: o estado agora, a janela no desenho das 24
 * horas e as regras. Os horários são sempre os da janela configurada — nada
 * de 18:00 escrito à mão.
 */
export function JejumCard({ id }: { id?: string }) {
  const { janela, status, carregando } = useJanela();
  const agora = useAgoraVivo();
  const { comendo, jejum } = duracaoJanela(janela);
  const { socorro } = JEJUM;
  // Enquanto as preferências carregam, a janela ainda é a de fábrica: o que sai
  // dela guarda o lugar (nada pula), mas fica escondido — mostrar 08:00 para
  // quem abre às 09:00 seria errado.
  const esperando = carregando && "invisible";

  return (
    <Card id={id} className="scroll-mt-24">
      <CardHeader>
        <Eyebrow className="text-plum">Jejum noturno</Eyebrow>
        <CardTitle className="mt-1.5 flex items-center gap-2">
          <Timer className="h-4.5 w-4.5 shrink-0 text-plum" />
          <span className={cn("tabular", esperando)}>
            Janela das {janela.inicio} às {janela.fim}
          </span>
        </CardTitle>
        <CardDescription>{JEJUM.resumo}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Estado agora. A caixa tem altura fixa para não pular quando o relógio chega. */}
        <div className="min-h-19 rounded-xl2 border border-line bg-bone/60 p-4">
          {status && (
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-bold",
                    status.aberta ? "text-brand" : "text-plum",
                  )}
                >
                  {status.aberta ? (
                    <Utensils className="h-3.5 w-3.5" />
                  ) : (
                    <Moon className="h-3.5 w-3.5" />
                  )}
                  {status.aberta ? "Janela aberta" : "Em jejum"}
                </p>
                {/* Cada pedaço fica inteiro na quebra de linha: nada de "14" numa linha e "h" na outra. */}
                <p className="mt-1 text-sm leading-snug text-ink-soft tabular">
                  {status.aberta ? (
                    <span className="whitespace-nowrap">
                      Fecha às <strong className="text-ink">{status.proximaVirada}</strong>
                    </span>
                  ) : (
                    <>
                      <span className="whitespace-nowrap">
                        Há <strong className="text-ink">{formatarDuracao(status.minutosNoEstado)}</strong>{" "}
                        de {formatarDuracao(jejum)}
                      </span>{" "}
                      ·{" "}
                      <span className="whitespace-nowrap">
                        abre às <strong className="text-ink">{status.proximaVirada}</strong>
                      </span>
                    </>
                  )}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-display text-3xl leading-none text-ink tabular">
                  {formatarDuracao(status.minutosParaVirar)}
                </p>
                <p className="mt-1 text-[0.625rem] text-ink-muted">
                  {status.aberta ? "para fechar" : "para abrir"}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className={cn(esperando)}>
          <Barra24h janela={janela} agora={agora} comendo={comendo} jejum={jejum} />
        </div>

        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-ink-soft">{JEJUM.porQue}</p>
          <div className="rounded-xl2 bg-bone-deep/60 p-4">
            {/* "14 horas" só quando o jejum é mesmo de 14 h: a janela muda em /ajustes. */}
            <Eyebrow className={cn("mb-1.5 text-ink-soft", esperando)}>
              {jejum === 14 * 60
                ? "Por que 14 horas, e não 16 ou mais"
                : "Por que não encurtar mais a janela"}
            </Eyebrow>
            <p className="text-xs leading-relaxed text-ink-soft">{JEJUM.porQueNaoEncurtar}</p>
          </div>
          <div className="rounded-xl2 bg-bone-deep/60 p-4">
            <Eyebrow className="mb-1.5 text-ink-soft">E o metabolismo?</Eyebrow>
            <p className="text-xs leading-relaxed text-ink-soft">{JEJUM.metabolismo}</p>
          </div>
        </div>

        <div>
          <Eyebrow className="mb-2.5 text-ink-muted">No jejum, pode</Eyebrow>
          <ul className="space-y-2.5">
            {JEJUM.pode.map((p) => (
              <li key={p.item} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span>
                  <strong className="text-sm text-ink">{p.item}</strong>
                  <span className="block text-xs leading-relaxed text-ink-muted">{p.detalhe}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Passo a passo numerado: na hora de passar mal, ninguém lê um parágrafo. */}
        <div className="rounded-xl2 border border-danger/25 bg-danger-soft/60 p-4 text-danger">
          <p className="flex items-center gap-2 text-sm font-bold">
            <ShieldAlert className="h-4 w-4 shrink-0" /> Quebre o jejum antes da hora
          </p>
          <p className="mt-1.5 text-xs leading-relaxed">{socorro.quando}</p>
          <ol className="mt-2 space-y-1.5">
            {socorro.passos.map((p, i) => (
              <li key={p} className="flex items-start gap-2 text-xs leading-relaxed">
                <span className="mt-px flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-danger text-[0.625rem] font-bold text-bone tabular">
                  {i + 1}
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ol>
          <p className="mt-2.5 text-xs leading-relaxed font-bold">{socorro.atendimento}</p>
          <ul className="mt-3 space-y-1.5 border-t border-danger/20 pt-3">
            {socorro.dicas.map((d) => (
              <li key={d} className="text-xs leading-relaxed">
                {d}
              </li>
            ))}
          </ul>
          <p className="mt-3 rounded-lg bg-surface/70 px-3 py-2 text-xs leading-relaxed font-semibold">
            {socorro.aMao}
          </p>
        </div>

        <p className="flex items-start gap-2.5 rounded-xl2 bg-brand-soft/60 p-4 text-xs leading-relaxed text-brand">
          <Dumbbell className="mt-0.5 h-4 w-4 shrink-0" />
          {JEJUM.treino}
        </p>

        <Button asChild variant="outline" size="sm">
          <Link href="/ajustes">
            Mudar o horário da janela <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * As 24 horas do dia numa barra: a janela em verde, o jejum em lilás e um
 * ponto no agora. Os trechos crescem na proporção dos minutos, com 2 px de
 * respiro entre eles; a legenda repete tudo em texto, porque o lilás claro
 * sozinho não tem contraste para ser a única pista.
 */
function Barra24h({
  janela,
  agora,
  comendo,
  jejum,
}: {
  janela: Janela;
  agora: Date | null;
  comendo: number;
  jejum: number;
}) {
  const abre = paraMinutos(janela.inicio);
  const fecha = paraMinutos(janela.fim);
  const trechos = [
    { id: "madrugada", minutos: abre, janela: false, titulo: `Jejum até ${janela.inicio}` },
    {
      id: "janela",
      minutos: fecha - abre,
      janela: true,
      titulo: `Janela das ${janela.inicio} às ${janela.fim}`,
    },
    { id: "noite", minutos: DIA - fecha, janela: false, titulo: `Jejum a partir das ${janela.fim}` },
  ].filter((t) => t.minutos > 0);
  const agoraMin = agora ? agora.getHours() * 60 + agora.getMinutes() : null;

  return (
    <figure className="space-y-2">
      <div className="relative">
        <div
          className="flex h-3 gap-0.5"
          role="img"
          aria-label={`As 24 horas do dia: janela das ${janela.inicio} às ${janela.fim} (${formatarDuracao(comendo)}) e jejum no resto (${formatarDuracao(jejum)}).`}
        >
          {trechos.map((t) => (
            <span
              key={t.id}
              title={t.titulo}
              className={cn("h-full rounded-sm", t.janela ? "bg-brand-mid" : "bg-plum-soft")}
              style={{ flexGrow: t.minutos, flexBasis: 0 }}
            />
          ))}
        </div>
        {agoraMin !== null && (
          <span
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink ring-2 ring-surface"
            style={{ left: `${(agoraMin / DIA) * 100}%` }}
            title={`Agora, ${paraHHMM(agoraMin)}`}
          />
        )}
      </div>

      <div className="relative h-3.5 text-[0.625rem] text-ink-muted tabular" aria-hidden>
        {[0, 6, 12, 18, 24].map((h) => (
          <span
            key={h}
            className={cn(
              "absolute top-0",
              h === 0 ? "left-0" : h === 24 ? "right-0" : "-translate-x-1/2",
            )}
            style={h > 0 && h < 24 ? { left: `${(h / 24) * 100}%` } : undefined}
          >
            {h}h
          </span>
        ))}
      </div>

      <figcaption className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs whitespace-nowrap text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[3px] bg-brand-mid" />
          Janela · <span className="tabular">{formatarDuracao(comendo)}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[3px] bg-plum-soft ring-1 ring-plum/25" />
          Jejum · <span className="tabular">{formatarDuracao(jejum)}</span>
        </span>
        {agoraMin !== null && (
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-ink" />
            Agora · <span className="tabular">{paraHHMM(agoraMin)}</span>
          </span>
        )}
      </figcaption>
    </figure>
  );
}
