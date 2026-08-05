"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  GitCompareArrows,
  ShieldAlert,
  ShoppingBasket,
  Sparkles,
  Stethoscope,
  Tag,
  Utensils,
} from "lucide-react";
import { CARDAPIO, ORIENTACOES_MEDICO, type DiaCardapio } from "@/data/meals";
import {
  CRITERIOS_ROTULO,
  DIVERGENCIAS,
  EXTRAS_PRATO,
  FORA_DO_PROTOCOLO,
  MONTAGEM_PRATO,
  ORDEM_CONSUMO,
  PREFERENCIAS,
  PROTOCOLO,
} from "@/data/protocol";
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
import { getShoppingState, setComponentsSelection, toggleComponentSelection } from "@/lib/storage";
import { useProtocolo } from "@/lib/protocol";
import { cn } from "@/lib/utils";

const BADGE_DIVERGENCIA = {
  seguranca: { texto: "Segurança", classe: "bg-danger-soft text-danger" },
  protocolo: { texto: "Regra do protocolo", classe: "bg-plum-soft text-plum" },
  preferencia: { texto: "Preferência sua", classe: "bg-brand-soft text-brand" },
};

function idsDoDia(dia: DiaCardapio): string[] {
  return dia.refeicoes.flatMap((r) => r.itens.map((i) => i.id));
}

export default function DietaPage() {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);
  // Aba escolhida na mão vence; sem escolha, abre no dia em que ela está.
  const [abaEscolhida, setAbaEscolhida] = useState<string | null>(null);
  const status = useProtocolo();
  const diaAtual = status?.diaCardapio ?? 1;

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

  const semana1 = useMemo(() => CARDAPIO.slice(0, 7).flatMap(idsDoDia), []);
  const semana2 = useMemo(() => CARDAPIO.slice(7).flatMap(idsDoDia), []);

  // Conta só o que existe no cardápio atual: o banco ainda guarda ids do plano
  // antigo (pré-protocolo), e eles não devem aparecer como escolha da Milena.
  const totalSelecionados = useMemo(
    () => (hydrated ? [...semana1, ...semana2].filter((id) => selected[id]).length : 0),
    [selected, hydrated, semana1, semana2],
  );

  return (
    <div className="stagger space-y-5">
      <header>
        <Eyebrow className="text-clay">Protocolo {PROTOCOLO.nome}</Eyebrow>
        <h2 className="font-display mt-2 text-4xl leading-none text-ink">
          Cardápio dos {PROTOCOLO.duracaoDias} dias
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Frango, peixe, ovos e tofu; grão-de-bico como única leguminosa; sem leite, glúten,
          açúcar ou adoçante. Marque o que vai usar — a{" "}
          <Link href="/lista" className="font-semibold text-clay underline underline-offset-2">
            lista de compras
          </Link>{" "}
          se monta sozinha.
        </p>
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

      {/* Regras do prato ---------------------------------------------------- */}
      <Card>
        <CardHeader>
          <Eyebrow className="text-brand">Regra do prato</Eyebrow>
          <CardTitle className="mt-1.5 flex items-center gap-2">
            <Utensils className="h-4.5 w-4.5 text-brand" /> Como montar
          </CardTitle>
          <CardDescription>Vale para almoço e jantar, todos os dias.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex h-9 w-full gap-1 overflow-hidden rounded-full">
            {MONTAGEM_PRATO.map((m) => (
              <div
                key={m.item}
                className={cn(
                  "flex items-center justify-center rounded-full text-[0.6875rem] font-bold text-bone",
                  m.cor,
                  m.fracao === "½ prato" ? "w-1/2" : "w-1/4",
                )}
              >
                {m.fracao}
              </div>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {MONTAGEM_PRATO.map((m) => (
              <div key={m.item} className="rounded-xl2 border border-line bg-bone/60 p-3">
                <span className={cn("mb-2 block h-1 w-7 rounded-full", m.cor)} />
                <p className="text-sm font-bold text-ink">{m.item}</p>
                <p className="text-xs text-ink-muted">{m.fracao}</p>
              </div>
            ))}
          </div>

          <div>
            <Eyebrow className="mb-2.5 text-ink-muted">Ordem de comer</Eyebrow>
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

          <ul className="space-y-1.5 rounded-xl2 bg-brand-soft/50 p-4">
            {EXTRAS_PRATO.map((e) => (
              <li key={e} className="flex items-start gap-2 text-xs leading-relaxed text-brand">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {e}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Cardápio dos 15 dias ----------------------------------------------- */}
      <Card>
        <CardHeader>
          <Eyebrow className="text-clay">Os {PROTOCOLO.duracaoDias} dias</Eyebrow>
          <CardTitle className="mt-1.5">Cardápio</CardTitle>
          <CardDescription>
            Abre no dia em que você está. As quatro refeições são opções, não obrigação.
          </CardDescription>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => handleBulk(semana1, true)}>
              Marcar dias 1–7
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulk(semana2, true)}>
              Marcar dias 8–15
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={abaEscolhida ?? String(diaAtual)}
            onValueChange={setAbaEscolhida}
            className="w-full"
          >
            <TabsList>
              {CARDAPIO.map((d) => (
                <TabsTrigger key={d.dia} value={String(d.dia)}>
                  {d.dia}
                </TabsTrigger>
              ))}
            </TabsList>

            {CARDAPIO.map((d) => {
              const ids = idsDoDia(d);
              const marcados = hydrated ? ids.filter((i) => selected[i]).length : 0;
              const tudoMarcado = marcados === ids.length;
              return (
                <TabsContent key={d.dia} value={String(d.dia)} className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-ink-muted">
                      <span className="font-bold text-ink">Dia {d.dia}</span> ·{" "}
                      <span className="tabular">
                        {marcados}/{ids.length}
                      </span>{" "}
                      na lista
                    </p>
                    <Button
                      size="sm"
                      variant={tudoMarcado ? "secondary" : "outline"}
                      onClick={() => handleBulk(ids, !tudoMarcado)}
                    >
                      {tudoMarcado ? "Desmarcar dia" : "Marcar dia todo"}
                    </Button>
                  </div>

                  {d.refeicoes.map((refeicao) => (
                    <div key={refeicao.id} className="space-y-2">
                      <div className="flex items-baseline gap-2 px-1">
                        <p className="text-sm font-bold text-ink">{refeicao.nome}</p>
                        <span className="text-xs text-ink-muted tabular">{refeicao.hora}</span>
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

      {/* Preferências -------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <Eyebrow className="text-ink-muted">Suas escolhas</Eyebrow>
          <CardTitle className="mt-1.5">O que entra e o que não entra</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { titulo: "Proteínas", dados: PREFERENCIAS.proteinas },
            { titulo: "Carboidratos", dados: PREFERENCIAS.carboidratos },
            { titulo: "Leguminosas", dados: PREFERENCIAS.leguminosas },
          ].map(({ titulo, dados }) => (
            <div key={titulo}>
              <p className="mb-2 text-sm font-bold text-ink">{titulo}</p>
              <div className="flex flex-wrap gap-1.5">
                {dados.sim.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand"
                  >
                    {s}
                  </span>
                ))}
                {dados.nao.map((s) => (
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

      {/* Fora do protocolo --------------------------------------------------- */}
      <Card>
        <CardHeader>
          <Eyebrow className="text-danger">Nos 15 dias</Eyebrow>
          <CardTitle className="mt-1.5 flex items-center gap-2">
            <Ban className="h-4.5 w-4.5 text-danger" /> Fora do protocolo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2.5">
            {FORA_DO_PROTOCOLO.map((f) => (
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

      {/* Divergências -------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <Eyebrow className="text-plum">Revisão</Eyebrow>
          <CardTitle className="mt-1.5 flex items-center gap-2">
            <GitCompareArrows className="h-4.5 w-4.5 text-plum" /> O que mudou e por quê
          </CardTitle>
          <CardDescription>
            O app era montado sobre o plano do médico. Nada foi trocado em silêncio — cada
            divergência está aqui.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {DIVERGENCIAS.map((d) => {
            const badge = BADGE_DIVERGENCIA[d.tipo];
            return (
              <div
                key={d.id}
                className={cn(
                  "space-y-2.5 rounded-xl2 border p-4",
                  d.tipo === "seguranca"
                    ? "border-danger/25 bg-danger-soft/40"
                    : "border-line bg-bone/50",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  {d.tipo === "seguranca" && <ShieldAlert className="h-4 w-4 text-danger" />}
                  <p className="text-sm font-bold text-ink">{d.tema}</p>
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
                  <strong className="text-ink-soft">Antes:</strong> {d.antes}
                </p>
                <p className="text-xs leading-relaxed text-ink-muted">
                  <strong className="text-ink-soft">Protocolo:</strong> {d.protocolo}
                </p>
                <p className="flex items-start gap-2 rounded-xl bg-surface p-3 text-xs leading-relaxed text-ink-soft">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                  <span>
                    <strong className="text-ink">Decisão:</strong> {d.decisao}
                  </span>
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Médico -------------------------------------------------------------- */}
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
          <p className="flex gap-2.5 rounded-xl2 bg-gold-soft p-4 text-xs leading-relaxed text-gold">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{ORIENTACOES_MEDICO.emConflito}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
