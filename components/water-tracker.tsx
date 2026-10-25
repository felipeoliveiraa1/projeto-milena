"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Droplet, Leaf, Minus, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Eyebrow } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MAX_CHA_ML,
  chaEmMl,
  getDayComErro,
  setWater,
  somarAgua,
  somarCha,
} from "@/lib/storage";
import { usePreferencias } from "@/lib/settings";
import { coposCobertos, planoDeAgua } from "@/lib/lembretes";
import { paraMinutos } from "@/lib/janela";
import { HORA_VIRADA_DO_DIA } from "@/lib/date";
import { useAgoraVivo } from "@/lib/now";
import { useDia } from "@/components/day-context";
import { cn, juntarUnidades } from "@/lib/utils";

function formatar(ml: number): string {
  if (ml < 1000) return `${ml} ml`;
  return `${(ml / 1000).toFixed(1).replace(".", ",")} L`;
}

/** Uma xícara de chá, o passo do "+" e do "−". */
const XICARA_ML = 200;
/** O limite de chás da nutricionista, somando todos (data/alimentacao.ts → CHAS). */
const LIMITE_CHA_ML = 1000;

export function WaterTracker() {
  // Guarda a data junto do valor: assim dá para saber se o que está na tela é
  // do dia escolhido, sem precisar zerar estado dentro do efeito.
  // erro: a leitura do dia falhou — o número na tela pode não ser o do banco.
  const [carga, setCarga] = useState<{ data: string; ml: number; erro?: boolean } | null>(null);
  const [naoSalvou, setNaoSalvou] = useState<string | null>(null);
  // O total que o banco confirmou em cada dia e o número do último toque. Cada
  // gravação devolve o total de verdade; quando o último toque termina — deu
  // certo ou não —, a tela mostra o que o banco tem.
  const confirmado = useRef<Record<string, number>>({});
  const toques = useRef<Record<string, number>>({});
  // O chá, à parte da água: não entra na meta, na nota do dia nem nos
  // lembretes. Grava do mesmo jeito (somarXicara, abaixo), com o próprio
  // total confirmado e a própria contagem de toques.
  const [cha, setCha] = useState<{ data: string; ml: number } | null>(null);
  const [chaNaoSalvou, setChaNaoSalvou] = useState<string | null>(null);
  const chaConfirmado = useRef<Record<string, number>>({});
  const chaToques = useRef<Record<string, number>>({});
  const { prefs, carregando } = usePreferencias();
  const { data, ehHoje } = useDia();
  const agora = useAgoraVivo();

  useEffect(() => {
    // Resposta atrasada de outro dia (troca de dia, virada das 05:00) não vale.
    let valendo = true;
    getDayComErro(data).then(({ dia: d, erro }) => {
      if (!valendo) return;
      if (!erro) {
        confirmado.current[data] = d.water;
        chaConfirmado.current[data] = chaEmMl(d);
      }
      setCarga({ data, ml: d.water, erro });
      setCha({ data, ml: chaEmMl(d) });
    });
    return () => {
      valendo = false;
    };
  }, [data]);

  const hydrated = carga?.data === data;
  const ml = hydrated ? carga.ml : 0;

  /**
   * "+200" e "−" mandam a diferença, não o total: o banco soma ao que já tem.
   * Mandar o total da tela trocava 1,4 L por 200 ml quando a tela ainda estava
   * carregando. Cada toque que falha desfaz só a parte dele — dois toques sem
   * internet voltam os dois.
   */
  function gravar(
    dataDoToque: string,
    otimista: (ml: number) => number,
    desfazer: (ml: number) => number,
    tarefa: Promise<{ water: number }>,
  ) {
    const toque = (toques.current[dataDoToque] ?? 0) + 1;
    toques.current[dataDoToque] = toque;
    setCarga((c) => (c && c.data === dataDoToque ? { ...c, ml: otimista(c.ml) } : c));
    const mostrar = (ml: number) =>
      setCarga((c) => (c && c.data === dataDoToque ? { data: dataDoToque, ml } : c));
    tarefa
      .then((novo) => {
        confirmado.current[dataDoToque] = novo.water;
        if (toques.current[dataDoToque] === toque) mostrar(novo.water);
        setNaoSalvou((d) => (d === dataDoToque ? null : d));
      })
      .catch((err) => {
        console.error(err);
        const ok = confirmado.current[dataDoToque];
        if (toques.current[dataDoToque] === toque && ok !== undefined) mostrar(ok);
        // Sem nada confirmado (o dia nem carregou), desfaz só a parte deste toque.
        else if (ok === undefined) {
          setCarga((c) => (c && c.data === dataDoToque ? { ...c, ml: desfazer(c.ml) } : c));
        }
        setNaoSalvou(dataDoToque);
      });
  }

  function somar(delta: number) {
    gravar(
      data,
      (ml) => Math.max(0, Math.min(ml + delta, 6000)),
      (ml) => Math.max(0, ml - delta),
      somarAgua(delta, data),
    );
  }

  /** Zerar é o único que manda o total (0). */
  function zerar() {
    gravar(data, () => 0, (ml) => ml, setWater(0, data));
  }

  /**
   * "+ Xícara" e "−" do chá: como a água, mandam a diferença e mostram na
   * hora. Quando o último toque termina, a tela mostra o total do banco; um
   * toque que falha sem nada confirmado desfaz só a parte dele.
   */
  function somarXicara(delta: number) {
    const dataDoToque = data;
    const toque = (chaToques.current[dataDoToque] ?? 0) + 1;
    chaToques.current[dataDoToque] = toque;
    const mostrar = (ml: number) =>
      setCha((c) => (c && c.data === dataDoToque ? { data: dataDoToque, ml } : c));
    setCha((c) =>
      c && c.data === dataDoToque ? { ...c, ml: Math.max(0, Math.min(c.ml + delta, MAX_CHA_ML)) } : c,
    );
    somarCha(delta, dataDoToque)
      .then((novo) => {
        const total = chaEmMl(novo);
        chaConfirmado.current[dataDoToque] = total;
        if (chaToques.current[dataDoToque] === toque) mostrar(total);
        setChaNaoSalvou((d) => (d === dataDoToque ? null : d));
      })
      .catch((err) => {
        console.error(err);
        const ok = chaConfirmado.current[dataDoToque];
        if (chaToques.current[dataDoToque] === toque && ok !== undefined) mostrar(ok);
        else if (ok === undefined) {
          setCha((c) => (c && c.data === dataDoToque ? { ...c, ml: Math.max(0, c.ml - delta) } : c));
        }
        setChaNaoSalvou(dataDoToque);
      });
  }

  const meta = prefs.aguaMetaMl;
  // O "−" tira a menor porção dos botões.
  const unidade = Math.min(...prefs.aguaPorcoes);
  const pct = Math.min(100, Math.round((ml / meta) * 100));
  // Uma casinha por copo do plano (meta dividida em copos, o último com o que
  // sobra — ver planoDeAgua). Uma casinha enche quando o total chega ao
  // esperado depois daquele copo. Mais de 16 copos não cabem: aí cada
  // casinha vale meta ÷ 16.
  const plano = planoDeAgua(prefs);
  const cobertos = coposCobertos(prefs, ml);
  const unidades = Math.max(1, Math.min(16, plano.copos));
  const cheias =
    plano.copos <= 16 ? cobertos : Math.min(unidades, Math.floor((ml / meta) * unidades));

  // Próximo copo: o primeiro horário que ainda não está coberto e não passou.
  // Depois da meia-noite (o dia do app só vira às 05:00) já passou de todos.
  const agoraMin = agora
    ? (agora.getHours() < HORA_VIRADA_DO_DIA ? agora.getHours() + 24 : agora.getHours()) * 60 +
      agora.getMinutes()
    : null;
  const proximo =
    agoraMin === null
      ? null
      : (plano.horarios.slice(cobertos).find((h) => paraMinutos(h) >= agoraMin) ?? null);
  // Passou de 8, vira duas fileiras — senão as casinhas ficam finas demais no celular.
  const colunas = unidades > 8 ? Math.ceil(unidades / 2) : unidades;
  const bateuMeta = ml >= meta;
  const chaDoDia = cha?.data === data;
  const chaMl = chaDoDia ? cha.ml : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Eyebrow className="text-brand-mid">Hidratação</Eyebrow>
            <CardTitle className="mt-1.5">Água do dia</CardTitle>
            {/* Só com as preferências carregadas: antes, o plano seria o de fábrica. */}
            {!carregando && (
              <>
                <p className="mt-1 text-xs text-ink-muted tabular">
                  {plano.copos === 1
                    ? `1 copo de ${plano.ultimoMl} ml, às ${prefs.aguaInicio}`
                    : `${plano.copos} copos de ${plano.copoMl} ml, das ${prefs.aguaInicio} às ${prefs.aguaFim}${
                        // O último copo leva só o que falta para a meta.
                        plano.ultimoMl !== plano.copoMl ? ` (o último, ${plano.ultimoMl} ml)` : ""
                      }`}
                </p>
                {hydrated &&
                  (cobertos >= plano.copos ? (
                    <p className="mt-0.5 text-xs font-semibold text-brand tabular">
                      {ehHoje ? "Todos os copos de hoje ✓" : "Todos os copos do dia ✓"}
                    </p>
                  ) : ehHoje && agoraMin !== null ? (
                    <p className="mt-0.5 text-xs font-semibold text-brand-mid tabular">
                      {proximo ? `Próximo copo: ${proximo}` : "Os horários de hoje já passaram."}
                    </p>
                  ) : null)}
              </>
            )}
          </div>
          {/* Inteiro numa linha: em 320 px o "900 ml" quebrava em "900" / "ml". */}
          <div className="shrink-0 text-right whitespace-nowrap">
            <p className="font-display text-3xl leading-none text-ink tabular">
              {hydrated ? formatar(ml) : "0 ml"}
            </p>
            <p className="mt-1 text-xs text-ink-muted tabular">meta {formatar(meta)}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: unidades }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "rounded-lg border transition-colors duration-300",
                unidades > 8 ? "h-6" : "h-8",
                hydrated && i < cheias
                  ? "border-brand bg-brand"
                  : "border-line bg-bone",
              )}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {prefs.aguaPorcoes.map((p) => (
            <Button key={p} onClick={() => somar(p)} disabled={!hydrated} className="flex-1">
              <Droplet className="h-4 w-4" /> +{p} ml
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            onClick={() => somar(-Math.min(unidade, ml))}
            disabled={ml === 0}
            aria-label={`Tirar ${unidade} ml`}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={zerar}
            disabled={ml === 0}
            aria-label="Zerar o dia"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {carga?.data === data && carga.erro && (
          <p role="alert" className="text-center text-xs font-semibold text-danger">
            Não deu para carregar a água deste dia — o número pode não estar certo. O que
            você somar agora vai para o total gravado.
          </p>
        )}

        {naoSalvou === data && (
          <p role="alert" className="text-center text-xs font-semibold text-danger">
            Não deu para salvar agora. Confira a internet e tente de novo.
          </p>
        )}

        <p className="text-center text-xs text-ink-muted">
          {bateuMeta ? "Meta batida! 💧" : `${pct}% da meta · faltam ${formatar(meta - ml)}`}
        </p>

        {/* Chá: no mesmo card, separado da água. Não soma na meta, na nota do
            dia nem nos lembretes — é para ela ver o limite de 1 L de chás. */}
        <div className="space-y-2.5 border-t border-line/70 pt-4">
          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-ink tabular">
            <Leaf className="h-4 w-4 shrink-0 text-brand-mid" aria-hidden />
            {/* juntarUnidades: o número nunca fica numa linha e a unidade na outra. */}
            <span className="font-semibold">
              {ehHoje ? "Chá hoje" : "Chá no dia"}: {juntarUnidades(formatar(chaMl))}
            </span>
            <span className="text-xs text-ink-muted">{juntarUnidades("· até 1 L por dia")}</span>
          </p>
          {/* Em 320 px o texto do botão não cabe numa linha: ele quebra em duas,
              e o "−" guarda os 44 px — sem isto, virava um oval de 30 px. */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => somarXicara(XICARA_ML)}
              disabled={!chaDoDia}
              className="h-auto min-h-11 min-w-0 flex-1 whitespace-normal py-2 leading-tight"
            >
              {juntarUnidades(`+ Xícara de chá (${XICARA_ML} ml)`)}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => somarXicara(-Math.min(XICARA_ML, chaMl))}
              disabled={chaMl === 0}
              aria-label={`Tirar ${XICARA_ML} ml de chá`}
              className="shrink-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
          {chaMl > LIMITE_CHA_ML && (
            <p className="text-xs font-semibold text-gold">
              {juntarUnidades("Passou de 1 L de chás — o limite da nutricionista.")}
            </p>
          )}
          {chaNaoSalvou === data && (
            <p role="alert" className="text-xs font-semibold text-danger">
              Não deu para salvar agora. Confira a internet e tente de novo.
            </p>
          )}
          {/* O link tem 44 px de altura para o dedo; a margem negativa
              devolve o espaço, para a linha não crescer. */}
          <p className="flex flex-wrap items-center justify-between gap-x-3 text-xs text-ink-muted">
            <span>O chá não entra na meta de água.</span>
            <Link
              href="/dieta#chas"
              className="-my-3.5 inline-flex min-h-11 items-center gap-1 font-semibold text-brand-mid transition hover:text-ink"
            >
              Ideias de chá <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
