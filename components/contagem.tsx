"use client";

import Link from "next/link";
import { ArrowRight, CalendarHeart, PauseCircle, Stethoscope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SUPPLEMENTS } from "@/data/supplements";
import {
  dataCurtaDe,
  diasAte,
  EXAMES_ANTES_DA_CIRURGIA_DIAS,
  inicioDaPausa,
  inicioDosExames,
} from "@/lib/lembretes";
import { usePreferencias } from "@/lib/settings";
import { useAgoraVivo } from "@/lib/now";
import { dataExtensoNaFrase, hojeKey } from "@/lib/date";

/** "Testosterona, Ômega-3, Curcumina e Mounjaro" — os nomes como estão na Farmácia. */
function juntarNomes(nomes: string[]): string {
  if (nomes.length <= 1) return nomes.join("");
  return `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;
}

/**
 * Contagem regressiva da tela inicial, para a data que ela escolhe em Ajustes.
 * Quando a data é a da cirurgia, avisa os exames pré-operatórios (45 dias
 * antes) e as pausas de 30 dias antes: ômega-3 e curcumina, pela nutricionista;
 * testosterona e Mounjaro, pela orientação da cirurgia.
 *
 * Não aparece nada até as preferências chegarem — senão o cartão "escolha a
 * data" piscaria antes da contagem de verdade. O "hoje" anda com o relógio e
 * vira às 05:00, como no resto do app.
 */
export function ContagemRegressiva() {
  const { prefs, carregando } = usePreferencias();
  const agora = useAgoraVivo();
  if (carregando || !agora) return null;

  const { data, titulo, cirurgia } = prefs.contagem;

  if (!data) {
    return (
      <Card className="border-dashed bg-transparent shadow-none">
        <CardContent className="flex items-center justify-between gap-3 p-4">
          <p className="flex min-w-0 items-center gap-2 text-sm font-semibold text-ink-soft">
            <CalendarHeart className="h-4 w-4 shrink-0 text-gold" />
            Contagem regressiva — escolha a data
          </p>
          <Button asChild size="sm" variant="outline" className="shrink-0">
            <Link href="/ajustes#contagem">Escolher</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const hoje = hojeKey(agora);
  const dias = diasAte(data, hoje);
  const quando = new Date(`${data}T12:00:00`);
  const ano = quando.getFullYear();
  const dataEscrita = `${dataExtensoNaFrase(quando)}${ano !== Number(hoje.slice(0, 4)) ? ` de ${ano}` : ""}`;
  const passou = dias < 0;
  const doQue = titulo
    ? passou
      ? titulo.charAt(0).toUpperCase() + titulo.slice(1)
      : `para ${titulo}`
    : null;

  const exames = inicioDosExames(prefs);

  // Os itens que param antes da cirurgia, agrupados pelo dia em que a pausa começa.
  const pausas = cirurgia
    ? Object.entries(
        SUPPLEMENTS.reduce<Record<string, { nomes: string[]; dias: number }>>((acc, s) => {
          const inicio = inicioDaPausa(prefs, s);
          if (inicio && s.pausaAntesDaCirurgiaDias) {
            (acc[inicio] ??= { nomes: [], dias: s.pausaAntesDaCirurgiaDias }).nomes.push(s.curto);
          }
          return acc;
        }, {}),
      ).sort(([a], [b]) => a.localeCompare(b))
    : [];

  return (
    <Card className="border-gold/20 bg-gold-soft/50">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface text-gold">
            <CalendarHeart className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="eyebrow text-gold">Contagem regressiva</p>
            <p className="font-display mt-1.5 text-2xl leading-none text-ink">
              {dias > 1 && (
                <>
                  Faltam <span className="text-4xl tabular">{dias}</span> dias
                </>
              )}
              {dias === 1 && (
                <>
                  Falta <span className="text-4xl tabular">1</span> dia
                </>
              )}
              {dias === 0 && <span className="text-4xl">É hoje!</span>}
              {passou && (
                <>
                  Foi há <span className="text-4xl tabular">{-dias}</span>{" "}
                  {dias === -1 ? "dia" : "dias"}
                </>
              )}
            </p>
            <p className="mt-2 text-sm leading-snug text-ink-muted">
              {doQue && <span className="font-semibold text-ink-soft">{doQue} · </span>}
              {/* O dia da semana inteiro na quebra: nunca "terça-" / "feira". */}
              <span className="whitespace-nowrap">{dataEscrita.slice(0, dataEscrita.indexOf(" "))}</span>
              {dataEscrita.slice(dataEscrita.indexOf(" "))}
            </p>
          </div>
        </div>

        {exames && hoje <= data && (
          <p className="flex items-start gap-2 rounded-xl2 bg-surface/70 px-3.5 py-2.5 text-xs leading-relaxed text-ink-soft">
            <Stethoscope className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
            <span>
              {hoje < exames
                ? `Exames pré-operatórios: a partir de ${dataCurtaDe(exames)}, ${EXAMES_ANTES_DA_CIRURGIA_DIAS} dias antes.`
                : `Exames pré-operatórios: hora de fazer — desde ${dataCurtaDe(exames)}.`}
            </span>
          </p>
        )}

        {pausas.map(([inicio, { nomes, dias: antes }]) => {
          const quem = juntarNomes(nomes);
          const varios = nomes.length > 1;
          return (
            <p
              key={inicio}
              className="flex items-start gap-2 rounded-xl2 bg-surface/70 px-3.5 py-2.5 text-xs leading-relaxed text-ink-soft"
            >
              <PauseCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
              <span>
                {hoje < inicio
                  ? `${quem}: pausa a partir de ${dataCurtaDe(inicio)}, ${antes} dias antes.`
                  : `${quem} em pausa desde ${dataCurtaDe(inicio)} — ${varios ? "voltam" : "volta"} só quando o médico liberar.`}
              </span>
            </p>
          );
        })}

        {passou && (
          <Link
            href="/ajustes#contagem"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-gold transition hover:text-ink"
          >
            Atualizar a data <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
