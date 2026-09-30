"use client";

import { useEffect, useRef, useState } from "react";
import { Droplet, Minus, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Eyebrow } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDayComErro, setWater, somarAgua } from "@/lib/storage";
import { usePreferencias } from "@/lib/settings";
import { useDia } from "@/components/day-context";
import { cn } from "@/lib/utils";

function formatar(ml: number): string {
  if (ml < 1000) return `${ml} ml`;
  return `${(ml / 1000).toFixed(1).replace(".", ",")} L`;
}

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
  const { prefs } = usePreferencias();
  const { data } = useDia();

  useEffect(() => {
    // Resposta atrasada de outro dia (troca de dia, virada das 05:00) não vale.
    let valendo = true;
    getDayComErro(data).then(({ dia: d, erro }) => {
      if (!valendo) return;
      if (!erro) confirmado.current[data] = d.water;
      setCarga({ data, ml: d.water, erro });
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

  const meta = prefs.aguaMetaMl;
  // A menor porção dá o tamanho da "casinha": com a meta de 3,2 L e o copo de
  // 200 ml, são 16 — um copo por hora acordada, como o médico pediu.
  const unidade = Math.min(...prefs.aguaPorcoes);
  const pct = Math.min(100, Math.round((ml / meta) * 100));
  const unidades = Math.max(1, Math.min(16, Math.round(meta / unidade)));
  // Cada casinha vale meta ÷ casinhas: a barra enche junto com o %, mesmo
  // quando a meta não é múltiplo exato do copo.
  const cheias = Math.min(unidades, Math.floor((ml / meta) * unidades));
  // Passou de 8, vira duas fileiras — senão as casinhas ficam finas demais no celular.
  const colunas = unidades > 8 ? Math.ceil(unidades / 2) : unidades;
  const bateuMeta = ml >= meta;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <Eyebrow className="text-brand-mid">Hidratação</Eyebrow>
            <CardTitle className="mt-1.5">Água do dia</CardTitle>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl leading-none text-ink tabular">
              {hydrated ? formatar(ml) : "0 ml"}
            </p>
            <p className="text-xs text-ink-muted tabular">meta {formatar(meta)}</p>
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
      </CardContent>
    </Card>
  );
}
