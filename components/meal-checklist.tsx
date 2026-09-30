"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown, Moon, Timer, Utensils } from "lucide-react";
import {
  REFEICOES_META,
  REFEICOES_ORDEM,
  cardapioDaData,
  type RefeicaoId,
  type TipoItem,
} from "@/data/meals";
import { ORDEM_CONSUMO } from "@/data/alimentacao";
import { Card, CardContent, CardHeader, CardTitle, Eyebrow } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { getDay, toggleMeal } from "@/lib/storage";
import { duracaoJanela, formatarDuracao, horariosDaJanela, useJanela } from "@/lib/jejum";
import { useIsClient } from "@/lib/now";
import { useDia } from "@/components/day-context";
import { cn } from "@/lib/utils";

export const CORES_TIPO: Record<TipoItem, string> = {
  proteina: "bg-clay-soft text-clay-deep",
  carbo: "bg-gold-soft text-gold",
  vegetal: "bg-brand-soft text-brand",
  fruta: "bg-plum-soft text-plum",
  bebida: "bg-line-soft text-ink-soft",
  extra: "bg-bone-deep text-ink-soft",
};

export const ROTULO_TIPO: Record<TipoItem, string> = {
  proteina: "proteína",
  carbo: "carbo",
  vegetal: "vegetal",
  fruta: "fruta",
  bebida: "bebida",
  extra: "extra",
};

export function MealChecklist() {
  const [carga, setCarga] = useState<{ data: string; checks: Record<string, boolean> } | null>(
    null,
  );
  const [open, setOpen] = useState<RefeicaoId | null>(null);
  const [naoSalvou, setNaoSalvou] = useState<{ data: string; id: RefeicaoId } | null>(null);
  // O que o banco confirmou para cada refeição e o número do último toque nela
  // (chave: dia + refeição). Se um toque não grava, a marca volta para o
  // confirmado — só se ele foi o último toque, para não sobrar na tela um
  // estado que nunca foi salvo.
  const confirmadas = useRef<Record<string, boolean>>({});
  const toques = useRef<Record<string, number>>({});
  const { data, ehHoje } = useDia();
  const { janela, status, carregando } = useJanela();
  // Até as preferências chegarem, a janela é a de fábrica: os horários guardam
  // o lugar, mas ficam escondidos — nada de 08:00 para quem abre às 09:00.
  const esperando = carregando && "invisible";
  // O cardápio muda com o dia da semana, e a data que o servidor enxerga pode
  // não ser a do celular (fuso). Por isso o conteúdo do dia só entra depois de
  // montar — antes disso aparecem só os nomes das refeições, que são iguais.
  const isClient = useIsClient();

  useEffect(() => {
    // Resposta atrasada de outro dia (troca de dia, virada das 05:00) não vale.
    let valendo = true;
    getDay(data).then((d) => {
      if (!valendo) return;
      for (const [id, v] of Object.entries(d.meals)) confirmadas.current[`${data}:${id}`] = v;
      setCarga({ data, checks: d.meals });
    });
    return () => {
      valendo = false;
    };
  }, [data]);

  const hydrated = carga?.data === data;
  const checks = hydrated ? carga.checks : {};

  function marcarLocal(id: RefeicaoId, valor: boolean) {
    setCarga((c) => (c && c.data === data ? { data, checks: { ...c.checks, [id]: valor } } : c));
  }

  async function handleToggle(id: RefeicaoId) {
    const chave = `${data}:${id}`;
    // Grava o que ela quer ver, não "o contrário do banco".
    const alvo = !checks[id];
    const toque = (toques.current[chave] ?? 0) + 1;
    toques.current[chave] = toque;
    marcarLocal(id, alvo);
    try {
      const next = await toggleMeal(id, data, alvo);
      confirmadas.current[chave] = !!next.meals[id];
      if (toques.current[chave] === toque) marcarLocal(id, confirmadas.current[chave]);
      setNaoSalvou((f) => (f?.id === id ? null : f));
    } catch (err) {
      console.error(err);
      if (toques.current[chave] === toque) marcarLocal(id, confirmadas.current[chave] ?? false);
      setNaoSalvou({ data, id });
    }
  }

  const cardapio = isClient ? cardapioDaData(data) : null;
  const horarios = horariosDaJanela(janela);
  const { jejum } = duracaoJanela(janela);
  const feitas = hydrated ? REFEICOES_ORDEM.filter((id) => checks[id]).length : 0;
  const proteinaMarcada =
    cardapio && hydrated
      ? cardapio.refeicoes.filter((r) => checks[r.id]).reduce((s, r) => s + r.proteina, 0)
      : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <Eyebrow className="text-clay">
              Cardápio{cardapio ? ` · ${cardapio.nome}` : ""}
            </Eyebrow>
            <CardTitle className="mt-1.5">
              {ehHoje ? "Refeições de hoje" : "Refeições do dia"}
            </CardTitle>
          </div>
          <p className="font-display shrink-0 text-2xl leading-none text-ink tabular">
            {feitas}
            <span className="text-ink-muted">/{REFEICOES_ORDEM.length}</span>
          </p>
        </div>
        <p className="text-sm text-ink-muted">
          {cardapio ? (
            <>
              Proteína marcada:{" "}
              <strong className="text-ink-soft tabular">
                {proteinaMarcada} de ~{cardapio.proteina} g
              </strong>
              {" · "}
              {/* Inteiro na quebra de linha: nunca o "g" sozinho embaixo. */}
              <span className="whitespace-nowrap">meta 90–100 g</span>
            </>
          ) : (
            " "
          )}
        </p>
      </CardHeader>

      <CardContent className="space-y-2">
        {ehHoje ? (
          // A caixa existe desde o primeiro render, com a altura final: o
          // estado da janela só aparece depois de montar e não empurra a tela.
          <div className="min-h-13.5 rounded-xl2 border border-line bg-bone/60 px-3.5 py-3">
            {status && (
              <>
                <p className="flex items-start gap-1.5 text-xs leading-relaxed">
                  {status.aberta ? (
                    <Utensils className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                  ) : (
                    <Moon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-plum" />
                  )}
                  <span className="tabular">
                    <strong className={status.aberta ? "text-brand" : "text-plum"}>
                      {status.aberta ? "Janela aberta" : "Jejum"}
                    </strong>
                    {/* Cada pedaço inteiro na quebra de linha: "abre às 08:00", nunca "abre às" / "08:00". */}
                    {(status.aberta
                      ? [
                          `fecha às ${status.proximaVirada}`,
                          `faltam ${formatarDuracao(status.minutosParaVirar)}`,
                        ]
                      : [
                          `${formatarDuracao(status.minutosNoEstado)} de ${formatarDuracao(jejum)}`,
                          `abre às ${status.proximaVirada}`,
                        ]
                    ).map((parte) => (
                      <span key={parte} className="text-ink-muted">
                        {" · "}
                        <span className="whitespace-nowrap">{parte}</span>
                      </span>
                    ))}
                  </span>
                </p>
                <Progress
                  value={status.pct}
                  aria-label={status.aberta ? "Quanto da janela já passou" : "Quanto do jejum já passou"}
                  className={cn("mt-2 h-1.5", status.aberta ? "bg-brand-soft" : "bg-plum-soft")}
                  indicatorClassName={status.aberta ? "bg-brand-mid" : "bg-plum"}
                />
              </>
            )}
          </div>
        ) : (
          <p className="flex items-center gap-1.5 px-1 text-xs text-ink-muted tabular">
            <Timer className="h-3.5 w-3.5 shrink-0" />
            <span className={cn(esperando)}>
              Janela das {janela.inicio} às {janela.fim} · {formatarDuracao(jejum)} de jejum
            </span>
          </p>
        )}

        {cardapio?.destaque && (
          <p className="flex items-start gap-2 rounded-xl2 bg-plum-soft px-3.5 py-2.5 text-xs leading-relaxed text-plum">
            <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {cardapio.destaque}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-xl2 bg-brand-soft/60 px-3.5 py-2.5 text-[0.6875rem] font-semibold text-brand">
          {ORDEM_CONSUMO.map((o, i) => (
            <span key={o.o} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-brand/40">→</span>}
              <span>{o.o}</span>
            </span>
          ))}
        </div>

        {REFEICOES_ORDEM.map((id) => {
          const refeicao = cardapio?.refeicoes.find((r) => r.id === id);
          const checked = hydrated && !!checks[id];
          const isOpen = open === id && !!refeicao;
          return (
            <div
              key={id}
              className={cn(
                "rounded-xl2 border transition",
                checked ? "border-brand/20 bg-brand-soft/50" : "border-line bg-surface",
              )}
            >
              <div className="flex items-center gap-3 p-3.5">
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => handleToggle(id)}
                  aria-label={REFEICOES_META[id].nome}
                />
                <button
                  className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
                  onClick={() => setOpen(isOpen ? null : id)}
                  aria-expanded={isOpen}
                >
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "font-semibold",
                        checked ? "text-ink-muted line-through" : "text-ink",
                      )}
                    >
                      {REFEICOES_META[id].nome}
                      {/* O selo mora junto do nome (inline-block, para o risco do
                          feito não passar por cima): na coluna da direita ele
                          espremia o resumo em 320 px. */}
                      {refeicao && (
                        <span
                          className="ml-1.5 inline-block rounded-full bg-clay-soft px-2 py-0.5 align-middle text-[0.625rem] font-bold text-clay-deep tabular"
                          title="Proteína estimada"
                        >
                          {refeicao.proteina} g
                          <span className="sr-only"> de proteína</span>
                        </span>
                      )}
                    </p>
                    {/* Até três linhas: em 320 px, "Peixe assado, legumes cozidos e purê
                        de mandioquinha" cabe inteiro. */}
                    <p className="line-clamp-3 text-xs text-ink-muted">
                      <span className={cn("tabular", esperando)}>
                        {horarios[id]}
                        {refeicao && " · "}
                      </span>
                      {refeicao?.resumo}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-2">
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-ink-muted transition",
                        isOpen && "rotate-180",
                      )}
                    />
                  </span>
                </button>
              </div>

              {naoSalvou?.data === data && naoSalvou.id === id && (
                <p role="alert" className="px-3.5 pb-3 text-xs font-semibold text-danger">
                  Não deu para salvar agora. Confira a internet e tente de novo.
                </p>
              )}

              {isOpen && refeicao && (
                <div className="animate-rise space-y-2 border-t border-line/70 px-4 py-3.5">
                  {refeicao.itens.map((it) => (
                    <div key={it.id} className="flex items-start gap-2">
                      <span
                        className={cn(
                          "mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[0.625rem] font-bold",
                          CORES_TIPO[it.tipo],
                        )}
                      >
                        {ROTULO_TIPO[it.tipo]}
                      </span>
                      <span className="flex-1 text-sm leading-relaxed text-ink-soft">
                        {it.label}
                      </span>
                      {it.proteina > 0 && (
                        <span className="shrink-0 pt-0.5 text-xs text-ink-muted tabular">
                          {it.proteina} g
                        </span>
                      )}
                    </div>
                  ))}
                  {refeicao.nota && (
                    <p className="rounded-xl2 bg-gold-soft px-3 py-2.5 text-xs leading-relaxed text-gold">
                      {refeicao.nota}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
