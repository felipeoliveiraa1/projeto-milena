"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Ban,
  CalendarDays,
  CheckCircle2,
  Clock,
  Droplet,
  Egg,
  GitCompareArrows,
  Lightbulb,
  Moon,
  ShieldAlert,
  ShoppingBasket,
  Sparkles,
  Stethoscope,
  Tag,
  Target,
  TrendingDown,
  TrendingUp,
  Utensils,
} from "lucide-react";
import { CARDAPIO, ORIENTACOES_MEDICO, cardapioDaData, type DiaCardapio } from "@/data/meals";
import {
  ACOMPANHAMENTO,
  CRITERIOS_ROTULO,
  ESTRUTURA_DIA,
  EVITAR,
  EXEMPLO_PROTEINA,
  FOCO,
  METAS,
  MUDANCAS,
  OBSERVACAO_RESUMO,
  ORDEM_CONSUMO,
  PREFERENCIAS,
  SUGESTOES,
  type Meta,
  type Mudanca,
  type ParteProteina,
} from "@/data/alimentacao";
import { PLANO } from "@/data/protocol";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Eyebrow,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CheckRow } from "@/components/check-row";
import { CORES_TIPO, ROTULO_TIPO } from "@/components/meal-checklist";
import { JejumCard } from "@/components/jejum-card";
import { useDia } from "@/components/day-context";
import { getShoppingState, setComponentsSelection, toggleComponentSelection } from "@/lib/storage";
import { duracaoJanela, formatarDuracao, horariosDaJanela, useJanela } from "@/lib/jejum";
import { usePreferencias } from "@/lib/settings";
import { formatarAgua } from "@/lib/score";
import { useIsClient } from "@/lib/now";
import { cn } from "@/lib/utils";

const BADGE_MUDANCA: Record<Mudanca["tipo"], { texto: string; classe: string }> = {
  seguranca: { texto: "Segurança", classe: "bg-danger-soft text-danger" },
  plano: { texto: "Plano novo", classe: "bg-plum-soft text-plum" },
  preferencia: { texto: "Preferência sua", classe: "bg-brand-soft text-brand" },
  medico: { texto: "Médico", classe: "bg-gold-soft text-gold" },
};

const ICONE_META: Record<Meta["id"], typeof Egg> = {
  proteina: Egg,
  agua: Droplet,
  ordem: Utensils,
};

const ATALHOS = [
  { href: "#metas", texto: "Metas" },
  { href: "#jejum", texto: "Jejum" },
  { href: "#estrutura", texto: "O dia" },
  { href: "#cardapio", texto: "Cardápio" },
  { href: "#sugestoes", texto: "Sugestões" },
  { href: "#mudancas", texto: "O que mudou" },
];

function idsDoDia(dia: DiaCardapio): string[] {
  return dia.refeicoes.flatMap((r) => r.itens.map((i) => i.id));
}

export default function DietaPage() {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);
  // Aba escolhida na mão vence; sem escolha, abre no dia do app — que vira
  // sozinho com a tela aberta e respeita o dia anterior que ela esteja
  // lançando. Só depois de montar: a data do servidor pode não ser a do celular.
  const [abaEscolhida, setAbaEscolhida] = useState<string | null>(null);
  const { data, ehHoje } = useDia();
  const isClient = useIsClient();
  // cardapioDaData lê a data com new Date(`${data}T00:00:00`), como a tela
  // inicial — o dia da semana sai do mesmo jeito nas duas telas.
  const diaHoje = isClient ? cardapioDaData(data).diaSemana : null;
  const { janela, carregando } = useJanela();
  const horarios = horariosDaJanela(janela);
  const { jejum } = duracaoJanela(janela);
  const { prefs, carregando: carregandoPrefs } = usePreferencias();
  // Enquanto as preferências carregam, a janela e a meta de água ainda são as
  // de fábrica: o lugar fica guardado, mas o valor só aparece quando chega o dela.
  const esperandoJanela = carregando && "invisible";

  useEffect(() => {
    getShoppingState().then((s) => {
      setSelected(s.selectedComponents);
      setHydrated(true);
    });
  }, []);

  async function handleToggle(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
    const next = await toggleComponentSelection(id);
    setSelected(next.selectedComponents);
  }

  async function handleBulk(ids: string[], value: boolean) {
    setSelected((prev) => {
      const copy = { ...prev };
      for (const id of ids) copy[id] = value;
      return copy;
    });
    const next = await setComponentsSelection(ids, value);
    setSelected(next.selectedComponents);
  }

  const todosIds = useMemo(() => CARDAPIO.flatMap(idsDoDia), []);

  // Conta só o que existe no cardápio atual: o banco ainda guarda ids dos
  // cardápios antigos ("d1-…"), e eles não devem aparecer como escolha dela.
  const totalSelecionados = useMemo(
    () => (hydrated ? todosIds.filter((id) => selected[id]).length : 0),
    [selected, hydrated, todosIds],
  );
  const semanaToda = hydrated && totalSelecionados === todosIds.length;

  return (
    <div className="stagger space-y-5">
      <header>
        <Eyebrow className="text-clay">{PLANO.nome}</Eyebrow>
        {/* Não "proteína primeiro": a ordem do prato começa pela verdura. */}
        <h2 className="font-display mt-2 text-4xl leading-none text-ink">
          Proteína em toda refeição
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          {FOCO} À noite, jejum. Marque no cardápio o que vai usar — a{" "}
          <Link href="/lista" className="font-semibold text-clay underline underline-offset-2">
            lista de compras
          </Link>{" "}
          se monta sozinha.
        </p>
        <nav aria-label="Nesta página" className="no-scrollbar -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1">
          {ATALHOS.map((a) => (
            <a
              key={a.href}
              href={a.href}
              className="shrink-0 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-bone"
            >
              {a.texto}
            </a>
          ))}
        </nav>
      </header>

      {totalSelecionados > 0 && (
        <Card className="border-brand/20 bg-brand-soft/50">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-bone">
                <ShoppingBasket className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-2xl leading-none text-ink tabular">
                  {totalSelecionados}
                </p>
                <p className="text-xs text-ink-muted">
                  {totalSelecionados === 1 ? "item escolhido" : "itens escolhidos"}
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="secondary">
              <Link href="/lista">Ver lista</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Metas do dia ------------------------------------------------------- */}
      <Card id="metas" className="scroll-mt-24">
        <CardHeader>
          <Eyebrow className="text-brand">Todo dia</Eyebrow>
          <CardTitle className="mt-1.5 flex items-center gap-2">
            <Target className="h-4.5 w-4.5 text-brand" /> Metas do dia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <ul className="space-y-3.5">
            {METAS.map((m) => {
              const Icone = ICONE_META[m.id];
              return (
                <li key={m.id} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                    <Icone className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink-muted">{m.titulo}</p>
                    <p className="text-sm font-bold text-ink">{m.valor}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
                      {m.detalhe}
                      {m.id === "agua" && (
                        <span className={cn(carregandoPrefs && "invisible")}>
                          {` No app, a meta do dia está em ${formatarAgua(prefs.aguaMetaMl)}.`}
                        </span>
                      )}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div>
            <Eyebrow className="mb-2.5 text-ink-muted">Ordem do prato</Eyebrow>
            <ol className="space-y-2.5">
              {ORDEM_CONSUMO.map((o) => (
                <li key={o.o} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-[0.6875rem] font-bold text-bone">
                    {o.passo}
                  </span>
                  <span>
                    <strong className="text-sm text-ink">{o.o}</strong>
                    <span className="block text-xs leading-relaxed text-ink-muted">{o.porque}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Jejum -------------------------------------------------------------- */}
      <JejumCard id="jejum" />

      {/* Estrutura do dia ---------------------------------------------------- */}
      <Card id="estrutura" className="scroll-mt-24">
        <CardHeader>
          <Eyebrow className="text-clay">Do resumo</Eyebrow>
          <CardTitle className="mt-1.5 flex items-center gap-2">
            <Clock className="h-4.5 w-4.5 text-clay" /> Estrutura do dia
          </CardTitle>
          <CardDescription>
            A tabela do resumo, nos horários da sua janela. A única mudança: a “Noite” veio
            para antes do jejum.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2.5">
            {ESTRUTURA_DIA.map((l) => (
              <li key={l.id} className="rounded-xl2 border border-line bg-bone/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink-muted tabular">
                      <span className={cn(esperandoJanela)}>
                        {horarios[l.id]}
                        {l.papel && " · "}
                      </span>
                      {l.papel?.toLowerCase()}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-bold text-ink">
                      {l.nome}
                      {l.noResumo && (
                        <span className="rounded-full bg-plum-soft px-2 py-0.5 text-[0.625rem] font-bold text-plum">
                          no resumo: {l.noResumo}
                        </span>
                      )}
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-full bg-clay-soft px-2.5 py-1 text-xs font-bold text-clay-deep tabular"
                    title="Proteína aproximada"
                  >
                    {l.proteina}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{l.base}</p>
                <Eyebrow className="mt-3 mb-1.5 text-ink-muted">Trocas</Eyebrow>
                <div className="flex flex-wrap gap-1.5">
                  {l.trocas.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-line bg-surface px-2.5 py-1 text-[0.6875rem] leading-snug text-ink-soft"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                {l.nota && (
                  <p className="mt-3 text-xs leading-relaxed text-ink-muted">{l.nota}</p>
                )}
              </li>
            ))}
            <li className="flex items-center gap-3 rounded-xl2 border border-plum/15 bg-plum-soft/70 p-4">
              <Moon className="h-4 w-4 shrink-0 text-plum" />
              <p className={cn("text-sm text-plum", esperandoJanela)}>
                <strong className="tabular">
                  {janela.fim} → {janela.inicio}
                </strong>{" "}
                · jejum de {formatarDuracao(jejum)}
              </p>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Exemplo de proteína -------------------------------------------------- */}
      <Card>
        <CardHeader>
          <Eyebrow className="text-clay">Do resumo</Eyebrow>
          <CardTitle className="mt-1.5">Exemplo de proteína no dia</CardTitle>
          <CardDescription>
            Cada refeição leva um pedaço. Juntas, caem dentro da meta de 90–100 g — e é por isso
            que a última refeição não sai, só muda de hora.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <BarrasProteina partes={EXEMPLO_PROTEINA} />
          <TabelaProteina partes={EXEMPLO_PROTEINA} />
        </CardContent>
      </Card>

      {/* Cardápio da semana ---------------------------------------------------- */}
      <Card id="cardapio" className="scroll-mt-24">
        <CardHeader>
          <Eyebrow className="text-clay">A semana</Eyebrow>
          <CardTitle className="mt-1.5">Cardápio</CardTitle>
          <CardDescription>
            Abre no dia de hoje. Quinta (dia da aplicação) e sexta trazem a proteína em formas
            que descem mais fácil.
          </CardDescription>
          <div className="mt-3">
            <Button
              size="sm"
              variant={semanaToda ? "secondary" : "outline"}
              onClick={() => handleBulk(todosIds, !semanaToda)}
            >
              {semanaToda ? "Desmarcar a semana" : "Marcar a semana toda"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={abaEscolhida ?? String(diaHoje ?? 1)}
            onValueChange={setAbaEscolhida}
            className="w-full"
          >
            <TabsList>
              {CARDAPIO.map((d) => (
                <TabsTrigger
                  key={d.diaSemana}
                  value={String(d.diaSemana)}
                  className="relative min-w-0 flex-1 px-1"
                >
                  {d.curto}
                  {d.diaSemana === diaHoje && (
                    <>
                      <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-current" />
                      <span className="sr-only">
                        {ehHoje ? " (hoje)" : " (dia que você está lançando)"}
                      </span>
                    </>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {CARDAPIO.map((d) => {
              const ids = idsDoDia(d);
              const marcados = hydrated ? ids.filter((i) => selected[i]).length : 0;
              const tudoMarcado = marcados === ids.length;
              return (
                <TabsContent key={d.diaSemana} value={String(d.diaSemana)} className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm text-ink-muted">
                        <span className="font-bold text-ink">{d.nome}</span> ·{" "}
                        <span className="tabular">
                          {marcados}/{ids.length}
                        </span>{" "}
                        na lista
                      </p>
                      <p className="text-xs text-ink-muted">
                        Proteína estimada:{" "}
                        <strong className="text-ink-soft tabular">~{d.proteina} g</strong>
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={tudoMarcado ? "secondary" : "outline"}
                      onClick={() => handleBulk(ids, !tudoMarcado)}
                    >
                      {tudoMarcado ? "Desmarcar dia" : "Marcar dia todo"}
                    </Button>
                  </div>

                  {d.destaque && (
                    <p className="flex items-start gap-2 rounded-xl2 bg-plum-soft px-3.5 py-2.5 text-xs leading-relaxed text-plum">
                      <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {d.destaque}
                    </p>
                  )}

                  {d.refeicoes.map((refeicao) => (
                    <div key={refeicao.id} className="space-y-2">
                      <div className="flex items-baseline justify-between gap-2 px-1">
                        <p className="text-sm font-bold text-ink">
                          {refeicao.nome}{" "}
                          <span
                            className={cn(
                              "ml-1 text-xs font-normal text-ink-muted tabular",
                              esperandoJanela,
                            )}
                          >
                            {horarios[refeicao.id]}
                          </span>
                        </p>
                        <span className="shrink-0 text-xs text-ink-muted tabular">
                          ~{refeicao.proteina} g de proteína
                        </span>
                      </div>

                      {refeicao.itens.map((it) => {
                        const checked = hydrated && !!selected[it.id];
                        return (
                          <CheckRow
                            key={it.id}
                            checked={checked}
                            onToggle={() => handleToggle(it.id)}
                            label={it.label}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p>
                                <span
                                  className={cn(
                                    "mr-2 inline-block rounded-full px-2 py-0.5 text-[0.625rem] font-bold",
                                    CORES_TIPO[it.tipo],
                                  )}
                                >
                                  {ROTULO_TIPO[it.tipo]}
                                </span>
                                <span
                                  className={cn(
                                    "text-sm",
                                    checked ? "text-ink-muted line-through" : "text-ink-soft",
                                  )}
                                >
                                  {it.label}
                                </span>
                              </p>
                              {it.proteina > 0 && (
                                <span className="shrink-0 pt-0.5 text-xs text-ink-muted tabular">
                                  {it.proteina} g
                                </span>
                              )}
                            </div>
                          </CheckRow>
                        );
                      })}

                      {refeicao.nota && (
                        <p className="rounded-xl2 bg-gold-soft px-3.5 py-2.5 text-xs leading-relaxed text-gold">
                          {refeicao.nota}
                        </p>
                      )}
                    </div>
                  ))}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Sugestões de ajuste ---------------------------------------------------- */}
      <Card id="sugestoes" className="scroll-mt-24">
        <CardHeader>
          <Eyebrow className="text-brand">Você pediu</Eyebrow>
          <CardTitle className="mt-1.5 flex items-center gap-2">
            <Lightbulb className="h-4.5 w-4.5 text-brand" /> Sugestões de ajuste
          </CardTitle>
          <CardDescription>
            “Caso seja necessário ajustar algo na alimentação, por favor sugerir.” Aqui estão,
            cada uma com o porquê. Nenhuma mexe em remédio — isso é só com o médico.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {SUGESTOES.map((s, i) => (
            <div key={s.id} className="rounded-xl2 border border-line bg-bone/50 p-4">
              <div className="flex items-start gap-2.5">
                <span className="mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[0.6875rem] font-bold text-bone tabular">
                  {i + 1}
                </span>
                <p className="text-sm font-bold leading-snug text-ink">
                  {s.titulo}
                  {s.origem === "resumo" && (
                    <span className="ml-2 inline-block rounded-full bg-clay-soft px-2 py-0.5 align-middle text-[0.625rem] font-bold text-clay-deep">
                      do resumo
                    </span>
                  )}
                </p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.texto}</p>
              <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                <span>
                  <strong className="text-ink-soft">Por quê:</strong> {s.porque}
                </span>
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Objetivo do acompanhamento ----------------------------------------------- */}
      <Card className="border-brand-deep bg-brand-deep text-bone">
        <CardContent className="space-y-4 p-6">
          <p className="eyebrow text-bone/50">Objetivo do acompanhamento</p>
          <div>
            <p className="text-sm text-bone/70">{ACOMPANHAMENTO.frase}</p>
            <p className="font-display mt-1.5 text-[1.625rem] leading-tight text-bone">
              {PLANO.objetivo}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {ACOMPANHAMENTO.sinais.map((s) => {
              const Icone = s.id === "forca" ? TrendingUp : TrendingDown;
              return (
                <Link
                  key={s.id}
                  href={s.href}
                  className="rounded-2xl bg-bone/10 px-3 py-2.5 transition hover:bg-bone/15"
                >
                  <Icone className="h-3.5 w-3.5 text-bone/60" />
                  <p className="mt-1 text-sm font-bold text-bone">{s.rotulo}</p>
                  <p className="text-[0.625rem] leading-tight text-bone/60">{s.direcao}</p>
                  <p className="mt-1 text-[0.625rem] leading-tight font-semibold text-bone/80">
                    {s.onde} →
                  </p>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* O que entra e o que não entra ------------------------------------------- */}
      <Card>
        <CardHeader>
          <Eyebrow className="text-ink-muted">Suas escolhas</Eyebrow>
          <CardTitle className="mt-1.5">O que entra e o que não entra</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {PREFERENCIAS.map(({ titulo, sim, nao }) => (
            <div key={titulo}>
              <p className="mb-2 text-sm font-bold text-ink">{titulo}</p>
              <div className="flex flex-wrap gap-1.5">
                {sim.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand"
                  >
                    {s}
                  </span>
                ))}
                {nao.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-line-soft px-2.5 py-1 text-xs text-ink-muted line-through"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* O que evitar --------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <Eyebrow className="text-danger">No dia a dia</Eyebrow>
          <CardTitle className="mt-1.5 flex items-center gap-2">
            <Ban className="h-4.5 w-4.5 text-danger" /> O que evitar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2.5">
            {EVITAR.map((f) => (
              <li key={f.item} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                <span>
                  <strong className="text-sm text-ink">{f.item}</strong>
                  <span className="block text-xs leading-relaxed text-ink-muted">{f.detalhe}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="rounded-xl2 bg-bone-deep/60 p-4">
            <Eyebrow className="mb-2 flex items-center gap-1.5 text-ink-soft">
              <Tag className="h-3 w-3" /> Como ler o rótulo
            </Eyebrow>
            <ul className="space-y-1.5">
              {CRITERIOS_ROTULO.map((c) => (
                <li
                  key={c}
                  className="flex items-start gap-2 text-xs leading-relaxed text-ink-soft"
                >
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* O que mudou ------------------------------------------------------------ */}
      <Card id="mudancas" className="scroll-mt-24">
        <CardHeader>
          <Eyebrow className="text-plum">Revisão</Eyebrow>
          <CardTitle className="mt-1.5 flex items-center gap-2">
            <GitCompareArrows className="h-4.5 w-4.5 text-plum" /> O que mudou e por quê
          </CardTitle>
          <CardDescription>
            Até setembro o app seguia o Desinflama-se. O plano novo troca muita coisa — e nada
            foi trocado em silêncio: cada mudança está aqui.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {MUDANCAS.map((m) => {
            const badge = BADGE_MUDANCA[m.tipo];
            return (
              <div
                key={m.id}
                className={cn(
                  "space-y-2.5 rounded-xl2 border p-4",
                  m.tipo === "seguranca"
                    ? "border-danger/25 bg-danger-soft/40"
                    : "border-line bg-bone/50",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  {m.tipo === "seguranca" && <ShieldAlert className="h-4 w-4 text-danger" />}
                  <p className="text-sm font-bold text-ink">{m.tema}</p>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[0.625rem] font-bold",
                      badge.classe,
                    )}
                  >
                    {badge.texto}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-ink-muted">
                  <strong className="text-ink-soft">Antes:</strong> {m.antes}
                </p>
                <p className="text-xs leading-relaxed text-ink-muted">
                  <strong className="text-ink-soft">Agora:</strong> {m.agora}
                </p>
                <p className="flex items-start gap-2 rounded-xl bg-surface p-3 text-xs leading-relaxed text-ink-soft">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                  <span>
                    <strong className="text-ink">Por quê:</strong> {m.porque}
                  </span>
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Médico ------------------------------------------------------------------ */}
      <Card>
        <CardHeader>
          <Eyebrow className="text-brand">Segue valendo</Eyebrow>
          <CardTitle className="mt-1.5 flex items-center gap-2">
            <Stethoscope className="h-4.5 w-4.5 text-brand" /> Orientações do médico
          </CardTitle>
          <CardDescription>
            {ORIENTACOES_MEDICO.medico} · {ORIENTACOES_MEDICO.especialidade}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2.5">
            {ORIENTACOES_MEDICO.pontos.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-soft">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          {ORIENTACOES_MEDICO.emConflito.map((c) => (
            <p key={c} className="flex gap-2.5 rounded-xl2 bg-gold-soft p-4 text-xs leading-relaxed text-gold">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{c}</span>
            </p>
          ))}
        </CardContent>
      </Card>

      <p className="px-1 text-[0.6875rem] leading-relaxed text-ink-muted">
        <strong className="text-ink-soft">Observação do resumo:</strong> {OBSERVACAO_RESUMO}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Exemplo de proteína                                                        */
/* -------------------------------------------------------------------------- */

// Eixo de 0 a 110 g: a faixa da meta (90–100 g) fica inteira à vista, com folga.
const ESCALA_G = 110;
const META_G = { min: 90, max: 100 };

const meio = (p: ParteProteina) => (p.min + p.max) / 2;

function faixaTexto(partes: ParteProteina[]): string {
  const min = partes.reduce((s, p) => s + p.min, 0);
  const max = partes.reduce((s, p) => s + p.max, 0);
  return min === max ? `~${min} g` : `~${min}–${max} g`;
}

/**
 * Duas barras no mesmo eixo: o dia do resumo, com as quatro refeições, e o
 * mesmo dia sem o fechamento. Uma cor só (é uma série: a proteína do dia); os
 * pedaços se separam pelo respiro de 2 px e pelos nomes logo abaixo.
 */
function BarrasProteina({ partes }: { partes: ParteProteina[] }) {
  const semFechamento = partes.filter((p) => p.id !== "jantar");
  return (
    <figure className="space-y-4">
      <LinhaProteina titulo="Com o fechamento" partes={partes} rotulos />
      <LinhaProteina titulo="Sem o fechamento" partes={semFechamento} />
      <figcaption className="flex items-center gap-1.5 text-[0.6875rem] text-ink-muted">
        <span className="h-2.5 w-4 rounded-[3px] bg-brand-soft ring-1 ring-brand/20" />
        Faixa da meta: {META_G.min}–{META_G.max} g
      </figcaption>
    </figure>
  );
}

function LinhaProteina({
  titulo,
  partes,
  rotulos = false,
}: {
  titulo: string;
  partes: ParteProteina[];
  rotulos?: boolean;
}) {
  const total = partes.reduce((s, p) => s + meio(p), 0);
  const largura = `${(total / ESCALA_G) * 100}%`;
  const descricao = partes.map((p) => `${p.nome} ${p.texto}`).join(", ");
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2 text-xs">
        <span className="font-semibold text-ink-soft">{titulo}</span>
        <span className="font-bold text-ink tabular">{faixaTexto(partes)}</span>
      </div>
      <div className="relative h-3">
        <span
          className="absolute -inset-y-1 rounded-sm bg-brand-soft"
          style={{
            left: `${(META_G.min / ESCALA_G) * 100}%`,
            width: `${((META_G.max - META_G.min) / ESCALA_G) * 100}%`,
          }}
          aria-hidden
        />
        <div
          className="relative flex h-full gap-0.5"
          style={{ width: largura }}
          role="img"
          aria-label={`${titulo}: ${descricao}. Total ${faixaTexto(partes)}.`}
        >
          {partes.map((p) => (
            <span
              key={p.id}
              className="h-full rounded-sm bg-clay"
              style={{ flexGrow: meio(p), flexBasis: 0 }}
              title={`${p.nome}: ${p.texto}`}
            />
          ))}
        </div>
      </div>
      {rotulos && (
        <div className="mt-1.5 flex gap-0.5" style={{ width: largura }} aria-hidden>
          {partes.map((p) => (
            <span
              key={p.id}
              className="min-w-0 text-center text-[0.625rem] whitespace-nowrap text-ink-muted"
              style={{ flexGrow: meio(p), flexBasis: 0 }}
            >
              {p.rotulo}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** A mesma conta em texto — é a versão que não depende do desenho. */
function TabelaProteina({ partes }: { partes: ParteProteina[] }) {
  return (
    <dl className="divide-y divide-line-soft rounded-xl2 border border-line text-sm">
      {partes.map((p) => (
        <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
          <dt className="text-ink-soft">
            {p.nome}
            {p.id === "jantar" && (
              <span className="block text-[0.6875rem] text-ink-muted">a “Noite” do resumo</span>
            )}
          </dt>
          <dd className="shrink-0 font-semibold text-ink tabular">{p.texto}</dd>
        </div>
      ))}
      <div className="flex items-center justify-between gap-3 bg-bone/60 px-4 py-2.5">
        <dt className="font-bold text-ink">Total</dt>
        <dd className="shrink-0 font-bold text-ink tabular">{faixaTexto(partes)}</dd>
      </div>
    </dl>
  );
}
