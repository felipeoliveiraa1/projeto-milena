"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Moon, Timer, Utensils } from "lucide-react";
import {
  PLANO_ATUAL_DESDE,
  REFEICOES_META,
  REFEICOES_ORDEM,
  chaveOpcao,
  lerOpcao,
  proteinaDaRefeicao,
  refeicaoDoPlano,
  refeicoesDaData,
  type RefeicaoId,
  type RefeicaoPlanoId,
} from "@/data/meals";
import { ORDEM_CONSUMO } from "@/data/alimentacao";
import { Card, CardContent, CardHeader, CardTitle, Eyebrow } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { getDay, getTextoDoDia, setTextoDoDia, toggleMeal } from "@/lib/storage";
import { duracaoJanela, formatarDuracao, horariosDaJanela, useJanela } from "@/lib/jejum";
import { useDia } from "@/components/day-context";
import { cn } from "@/lib/utils";

/** A opção que ela comeu: 1, 2 ou nenhuma escolhida. */
type Opcao = 1 | 2 | null;

type Carga = {
  data: string;
  checks: Record<string, boolean>;
  opcoes: Partial<Record<RefeicaoPlanoId, Opcao>>;
};

export function MealChecklist() {
  const [carga, setCarga] = useState<Carga | null>(null);
  const [open, setOpen] = useState<RefeicaoId | null>(null);
  const [naoSalvou, setNaoSalvou] = useState<{ data: string; id: RefeicaoId } | null>(null);
  // O que o banco confirmou para cada refeição (e para a opção escolhida) e o
  // número do último toque nela (chave: dia + refeição). Se um toque não grava,
  // a marca volta para o confirmado — só se ele foi o último toque, para não
  // sobrar na tela um estado que nunca foi salvo.
  const confirmadas = useRef<Record<string, boolean>>({});
  const toques = useRef<Record<string, number>>({});
  const opcoesConfirmadas = useRef<Record<string, Opcao>>({});
  const toquesOpcao = useRef<Record<string, number>>({});
  const { data, ehHoje } = useDia();
  const { janela, status, carregando } = useJanela();
  // Até as preferências chegarem, a janela é a de fábrica: os horários guardam
  // o lugar, mas ficam escondidos — nada de 08:00 para quem abre às 09:00.
  const esperando = carregando && "invisible";
  // Do plano da nutricionista em diante, três refeições com duas opções cada.
  // Os dias de antes mostram as quatro refeições que tinham, só para marcar.
  const planoNovo = data >= PLANO_ATUAL_DESDE;
  const ids = refeicoesDaData(data);

  useEffect(() => {
    // Resposta atrasada de outro dia (troca de dia, virada das 05:00) não vale.
    let valendo = true;
    getDay(data).then((d) => {
      if (!valendo) return;
      for (const [id, v] of Object.entries(d.meals)) confirmadas.current[`${data}:${id}`] = v;
      const opcoes: Carga["opcoes"] = {};
      for (const id of REFEICOES_ORDEM) {
        const opcao = lerOpcao(getTextoDoDia(d, chaveOpcao(id)));
        opcoes[id] = opcao;
        opcoesConfirmadas.current[`${data}:${id}`] = opcao;
      }
      setCarga({ data, checks: d.meals, opcoes });
    });
    return () => {
      valendo = false;
    };
  }, [data]);

  const hydrated = carga?.data === data;
  const checks = hydrated ? carga.checks : {};
  const opcoes = hydrated ? carga.opcoes : {};

  function marcarLocal(id: RefeicaoId, valor: boolean) {
    setCarga((c) => (c && c.data === data ? { ...c, checks: { ...c.checks, [id]: valor } } : c));
  }

  function marcarOpcaoLocal(id: RefeicaoPlanoId, valor: Opcao) {
    setCarga((c) => (c && c.data === data ? { ...c, opcoes: { ...c.opcoes, [id]: valor } } : c));
  }

  const limparAviso = (id: RefeicaoId) => setNaoSalvou((f) => (f?.id === id ? null : f));

  /** Marca na hora e grava; se não gravar, volta ao confirmado. Diz se gravou. */
  async function gravarRefeicao(id: RefeicaoId, alvo: boolean): Promise<boolean> {
    const chave = `${data}:${id}`;
    const toque = (toques.current[chave] ?? 0) + 1;
    toques.current[chave] = toque;
    marcarLocal(id, alvo);
    try {
      const next = await toggleMeal(id, data, alvo);
      confirmadas.current[chave] = !!next.meals[id];
      if (toques.current[chave] === toque) marcarLocal(id, confirmadas.current[chave]);
      return true;
    } catch (err) {
      console.error(err);
      if (toques.current[chave] === toque) marcarLocal(id, confirmadas.current[chave] ?? false);
      return false;
    }
  }

  async function handleToggle(id: RefeicaoId) {
    // Grava o que ela quer ver, não "o contrário do banco".
    const ok = await gravarRefeicao(id, !checks[id]);
    if (ok) limparAviso(id);
    else setNaoSalvou({ data, id });
  }

  /**
   * Toque num botão de opção. Escolher uma opção é dizer que comeu: a refeição
   * se marca junto, se ainda não estava. Tocar de novo na opção escolhida, com
   * a refeição marcada, tira a escolha e deixa a refeição como está — ela
   * comeu, só não quer dizer qual. Com a refeição desmarcada, o mesmo toque
   * marca de novo com essa opção: o botão aceso sem a refeição marcada é a
   * escolha que ficou de antes, e tocar nele é dizer "comi esta".
   * A opção é um texto do dia (ver chaveOpcao em data/meals.ts), gravado como
   * os textos da rotina.
   */
  async function escolherOpcao(id: RefeicaoPlanoId, numero: 1 | 2) {
    const chave = `${data}:${id}`;
    const alvo: Opcao = opcoes[id] === numero && checks[id] ? null : numero;
    const toque = (toquesOpcao.current[chave] ?? 0) + 1;
    toquesOpcao.current[chave] = toque;
    marcarOpcaoLocal(id, alvo);

    const marcando = alvo !== null && !checks[id] ? gravarRefeicao(id, true) : Promise.resolve(true);
    const gravandoOpcao = (async () => {
      try {
        await setTextoDoDia(chaveOpcao(id), alvo === null ? "" : String(alvo), data);
        opcoesConfirmadas.current[chave] = alvo;
        if (toquesOpcao.current[chave] === toque) marcarOpcaoLocal(id, alvo);
        return true;
      } catch (err) {
        console.error(err);
        if (toquesOpcao.current[chave] === toque) {
          marcarOpcaoLocal(id, opcoesConfirmadas.current[chave] ?? null);
        }
        return false;
      }
    })();

    const [okRefeicao, okOpcao] = await Promise.all([marcando, gravandoOpcao]);
    if (okRefeicao && okOpcao) limparAviso(id);
    else setNaoSalvou({ data, id });
  }

  const horarios = horariosDaJanela(janela);
  const { jejum } = duracaoJanela(janela);
  const feitas = hydrated ? ids.filter((id) => checks[id] === true).length : 0;
  // Refeição marcada sem opção conta a menor das duas (ver proteinaDaRefeicao).
  const proteinaMarcada = hydrated
    ? REFEICOES_ORDEM.filter((id) => checks[id] === true).reduce(
        (s, id) => s + proteinaDaRefeicao(id, opcoes[id] ?? null),
        0,
      )
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <Eyebrow className="text-clay">
              {planoNovo ? "Plano da nutricionista" : "Cardápio anterior"}
            </Eyebrow>
            <CardTitle className="mt-1.5">
              {ehHoje ? "Refeições de hoje" : "Refeições do dia"}
            </CardTitle>
          </div>
          <p className="font-display shrink-0 text-2xl leading-none text-ink tabular">
            {feitas}
            <span className="text-ink-muted">/{ids.length}</span>
          </p>
        </div>
        <p className="text-sm text-ink-muted">
          {planoNovo ? (
            <>
              Proteína marcada:{" "}
              <strong className="text-ink-soft tabular">~{proteinaMarcada} g</strong>{" "}
              {/* Inteiro na quebra de linha: nunca o "(estimativa)" partido. */}
              <span className="whitespace-nowrap">(estimativa)</span>
            </>
          ) : (
            "Dia de antes do plano da nutricionista: quatro refeições, só para marcar."
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

        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-xl2 bg-brand-soft/60 px-3.5 py-2.5 text-[0.6875rem] font-semibold text-brand">
          {ORDEM_CONSUMO.map((o, i) => (
            <span key={o.o} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-brand/40">→</span>}
              <span>{o.o}</span>
            </span>
          ))}
        </div>

        {ids.map((id) => {
          const checked = hydrated && checks[id] === true;
          const erro =
            naoSalvou?.data === data && naoSalvou.id === id ? (
              <p role="alert" className="px-3.5 pb-3 text-xs font-semibold text-danger">
                Não deu para salvar agora. Confira a internet e tente de novo.
              </p>
            ) : null;
          const caixa = cn(
            "rounded-xl2 border transition",
            checked ? "border-brand/20 bg-brand-soft/50" : "border-line bg-surface",
          );
          const nome = (
            <p
              className={cn("font-semibold", checked ? "text-ink-muted line-through" : "text-ink")}
            >
              {REFEICOES_META[id].nome}
            </p>
          );

          // Dia de antes do plano (ou o "jantar", que só existe nele): só a marca.
          if (!planoNovo || id === "jantar") {
            return (
              <div key={id} className={caixa}>
                <div className="flex items-center gap-3 p-3.5">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => handleToggle(id)}
                    aria-label={REFEICOES_META[id].nome}
                  />
                  <div className="min-w-0">
                    {nome}
                    <p className={cn("text-xs text-ink-muted tabular", esperando)}>{horarios[id]}</p>
                  </div>
                </div>
                {erro}
              </div>
            );
          }

          const refeicao = refeicaoDoPlano(id);
          const escolhida = opcoes[id] ?? null;
          const opcaoEscolhida = escolhida ? refeicao.opcoes[escolhida - 1] : null;
          const isOpen = open === id;
          // Aberta: a opção escolhida ou, sem escolha, as duas para comparar.
          const visiveis = opcaoEscolhida ? [opcaoEscolhida] : refeicao.opcoes;
          return (
            <div key={id} className={caixa}>
              <div className="flex items-center gap-3 px-3.5 pt-3.5 pb-2">
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
                    {nome}
                    <p className="line-clamp-2 text-xs text-ink-muted">
                      <span className={cn("tabular", esperando)}>{horarios[id]}</span>
                      {" · "}
                      {opcaoEscolhida
                        ? `${opcaoEscolhida.nome} · ~${opcaoEscolhida.proteina} g de proteína (estimativa)`
                        : "escolha a opção 1 ou a 2"}
                    </p>
                  </div>
                  <ChevronDown
                    className={cn("h-4 w-4 shrink-0 text-ink-muted transition", isOpen && "rotate-180")}
                  />
                </button>
              </div>

              {/* Alinhados com o nome: 14 px de respiro + 24 px do checkbox + 12 px. */}
              <div className="flex flex-wrap gap-2 pr-3.5 pb-3.5 pl-12.5">
                {refeicao.opcoes.map((o) => {
                  const ativa = escolhida === o.numero;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      // Antes de o dia carregar não dá para saber se o toque
                      // escolhe ou desfaz a escolha.
                      disabled={!hydrated}
                      onClick={() => escolherOpcao(id, o.numero)}
                      aria-pressed={ativa}
                      aria-label={`${REFEICOES_META[id].nome}: opção ${o.numero}, ${o.nome}`}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-semibold transition disabled:opacity-50",
                        ativa
                          ? "border-clay bg-clay text-bone"
                          : "border-line bg-surface text-ink-soft hover:border-clay/40 hover:text-ink",
                      )}
                    >
                      Opção {o.numero}
                    </button>
                  );
                })}
              </div>

              {erro}

              {isOpen && (
                <div className="animate-rise space-y-3 border-t border-line/70 px-4 py-3.5">
                  {visiveis.map((o) => (
                    <div key={o.id} className="space-y-1.5">
                      <p className="flex flex-wrap items-baseline justify-between gap-x-2 text-xs">
                        <span className="font-bold text-ink">
                          Opção {o.numero} · {o.nome}
                        </span>
                        <span className="text-ink-muted tabular">
                          ~{o.proteina} g de proteína (estimativa)
                        </span>
                      </p>
                      <ul className="space-y-1">
                        {o.itens.map((it) => (
                          <li
                            key={it.texto}
                            className="flex items-start gap-2 text-sm leading-relaxed text-ink-soft"
                          >
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-clay" />
                            {it.texto}
                          </li>
                        ))}
                      </ul>
                      {o.nota && <p className="text-xs leading-relaxed text-ink-muted">{o.nota}</p>}
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
