"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  ChevronsUpDown,
  Clock,
  GitCompareArrows,
  ShieldAlert,
  ShoppingCart,
  Stethoscope,
  Tag,
  Utensils,
} from "lucide-react";
import { CARDAPIO, ORIENTACOES_MEDICO, type DiaCardapio, type TipoItem } from "@/data/meals";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CheckRow } from "@/components/check-row";
import { getShoppingState, setComponentsSelection, toggleComponentSelection } from "@/lib/storage";
import { useProtocolo } from "@/lib/protocol";
import { cn } from "@/lib/utils";

const CORES_TIPO: Record<TipoItem, string> = {
  proteina: "bg-rose-100 text-rose-700",
  carbo: "bg-amber-100 text-amber-800",
  vegetal: "bg-emerald-100 text-emerald-800",
  fruta: "bg-pink-100 text-pink-700",
  gordura: "bg-orange-100 text-orange-800",
  bebida: "bg-sky-100 text-sky-800",
};

const ROTULO_TIPO: Record<TipoItem, string> = {
  proteina: "proteína",
  carbo: "carbo",
  vegetal: "vegetal",
  fruta: "fruta",
  gordura: "gordura",
  bebida: "bebida",
};

const BADGE_DIVERGENCIA = {
  seguranca: { texto: "Segurança", classe: "bg-red-100 text-red-800" },
  protocolo: { texto: "Regra do protocolo", classe: "bg-violet-100 text-violet-800" },
  preferencia: { texto: "Preferência sua", classe: "bg-emerald-100 text-emerald-800" },
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
    () =>
      hydrated ? [...semana1, ...semana2].filter((id) => selected[id]).length : 0,
    [selected, hydrated, semana1, semana2],
  );

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-500">
          Protocolo {PROTOCOLO.nome}
        </p>
        <h2 className="text-2xl font-bold text-zinc-900">Cardápio dos {PROTOCOLO.duracaoDias} dias</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Montado com as suas preferências: frango, peixe, ovos e tofu; grão-de-bico como única
          leguminosa; sem leite, glúten, açúcar ou adoçante. Marque o que vai usar — a{" "}
          <Link href="/lista" className="font-medium text-rose-600 underline">
            lista de compras
          </Link>{" "}
          se monta sozinha.
        </p>
      </div>

      {totalSelecionados > 0 && (
        <Card className="border-emerald-300 bg-linear-to-br from-emerald-50 to-emerald-100">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-500 p-2 text-white">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-900">
                  {totalSelecionados} {totalSelecionados === 1 ? "item escolhido" : "itens escolhidos"}
                </p>
                <p className="text-xs text-emerald-700">Lista de compras atualizada</p>
              </div>
            </div>
            <Button asChild size="sm" variant="soft">
              <Link href="/lista">Ver lista</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Regras do prato ---------------------------------------------------- */}
      <Card className="border-emerald-200 bg-linear-to-br from-emerald-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-800">
            <Utensils className="h-5 w-5" /> Como montar o prato
          </CardTitle>
          <CardDescription>Vale para almoço e jantar, todos os dias.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex h-8 w-full overflow-hidden rounded-full">
            {MONTAGEM_PRATO.map((m) => (
              <div
                key={m.item}
                className={cn(
                  "flex items-center justify-center text-[10px] font-bold text-white",
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
              <div key={m.item} className="rounded-xl bg-white p-3 text-center text-xs">
                <span className={cn("mx-auto mb-1 block h-1.5 w-8 rounded-full", m.cor)} />
                <p className="font-semibold text-zinc-800">{m.item}</p>
                <p className="text-zinc-500">{m.fracao}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Ordem de comer
            </p>
            <ol className="space-y-2">
              {ORDEM_CONSUMO.map((o) => (
                <li key={o.o} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-white">
                    {o.passo}
                  </span>
                  <span>
                    <strong className="text-zinc-900">{o.o}</strong>
                    <span className="block text-xs text-zinc-600">{o.porque}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <ul className="space-y-1 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-900">
            {EXTRAS_PRATO.map((e) => (
              <li key={e} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                {e}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Cardápio dos 15 dias ----------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Os {PROTOCOLO.duracaoDias} dias</CardTitle>
          <CardDescription>
            Abre no dia em que você está. As quatro refeições são opções, não obrigação.
          </CardDescription>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => handleBulk(semana1, true)}>
              Selecionar dias 1–7
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulk(semana2, true)}>
              Selecionar dias 8–15
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
                    <p className="text-sm font-semibold text-zinc-800">
                      Dia {d.dia}
                      <span className="ml-2 text-xs font-normal text-zinc-500">
                        {marcados}/{ids.length} itens na lista
                      </span>
                    </p>
                    <Button
                      size="sm"
                      variant={tudoMarcado ? "soft" : "outline"}
                      onClick={() => handleBulk(ids, !tudoMarcado)}
                    >
                      {tudoMarcado ? "Desmarcar dia" : "Marcar dia todo"}
                    </Button>
                  </div>

                  {d.refeicoes.map((refeicao) => (
                    <div
                      key={refeicao.id}
                      className="space-y-2 rounded-2xl border border-zinc-100 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-zinc-900">{refeicao.nome}</p>
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                          <Clock className="h-3 w-3" /> {refeicao.hora}
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
                            className={cn(
                              "bg-white",
                              checked
                                ? "border-emerald-200 bg-emerald-50/60"
                                : "border-zinc-100 hover:bg-rose-50/40",
                            )}
                          >
                            <span
                              className={cn(
                                "mr-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                CORES_TIPO[it.tipo],
                              )}
                            >
                              {ROTULO_TIPO[it.tipo]}
                            </span>
                            <span
                              className={cn(
                                "text-sm",
                                checked ? "text-zinc-500 line-through" : "text-zinc-800",
                              )}
                            >
                              {it.label}
                            </span>
                          </CheckRow>
                        );
                      })}

                      {refeicao.nota && (
                        <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
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
          <CardTitle className="flex items-center gap-2">
            <ChevronsUpDown className="h-5 w-5 text-rose-500" /> Suas escolhas
          </CardTitle>
          <CardDescription>O cardápio inteiro respeita esta lista.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {[
            { titulo: "Proteínas", dados: PREFERENCIAS.proteinas },
            { titulo: "Carboidratos", dados: PREFERENCIAS.carboidratos },
            { titulo: "Leguminosas", dados: PREFERENCIAS.leguminosas },
          ].map(({ titulo, dados }) => (
            <div key={titulo}>
              <p className="mb-1 font-semibold text-zinc-900">{titulo}</p>
              <div className="flex flex-wrap gap-1">
                {dados.sim.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-800"
                  >
                    {s}
                  </span>
                ))}
                {dados.nao.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-500 line-through"
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
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Ban className="h-5 w-5" /> Fora do protocolo nos 15 dias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2 text-sm">
            {FORA_DO_PROTOCOLO.map((f) => (
              <li key={f.item} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                <span>
                  <strong className="text-zinc-900">{f.item}</strong>
                  <span className="block text-xs text-zinc-600">{f.detalhe}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="rounded-xl bg-sky-50 p-3">
            <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-sky-800">
              <Tag className="h-3 w-3" /> Como ler o rótulo
            </p>
            <ul className="space-y-1 text-xs text-sky-900">
              {CRITERIOS_ROTULO.map((c) => (
                <li key={c} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-sky-600" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Divergências -------------------------------------------------------- */}
      <Card className="border-violet-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-violet-800">
            <GitCompareArrows className="h-5 w-5" /> O que mudou e por quê
          </CardTitle>
          <CardDescription>
            O app era montado sobre o plano do médico. Nada foi trocado em silêncio — cada
            divergência entre os dois está aqui.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {DIVERGENCIAS.map((d) => {
            const badge = BADGE_DIVERGENCIA[d.tipo];
            return (
              <div
                key={d.id}
                className={cn(
                  "space-y-2 rounded-2xl border p-3",
                  d.tipo === "seguranca" ? "border-red-200 bg-red-50/60" : "border-zinc-100",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  {d.tipo === "seguranca" && <ShieldAlert className="h-4 w-4 text-red-600" />}
                  <p className="font-semibold text-zinc-900">{d.tema}</p>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      badge.classe,
                    )}
                  >
                    {badge.texto}
                  </span>
                </div>
                <p className="text-xs text-zinc-600">
                  <strong className="text-zinc-700">Antes:</strong> {d.antes}
                </p>
                <p className="text-xs text-zinc-600">
                  <strong className="text-zinc-700">Protocolo:</strong> {d.protocolo}
                </p>
                <p className="rounded-xl bg-emerald-50 p-2 text-xs text-emerald-900">
                  <strong>Decisão:</strong> {d.decisao}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Médico -------------------------------------------------------------- */}
      <Card className="border-sky-200 bg-linear-to-br from-sky-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sky-800">
            <Stethoscope className="h-5 w-5" /> Orientações do médico que seguem valendo
          </CardTitle>
          <CardDescription>
            {ORIENTACOES_MEDICO.medico} · {ORIENTACOES_MEDICO.especialidade}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2 text-sm text-zinc-700">
            {ORIENTACOES_MEDICO.pontos.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>{ORIENTACOES_MEDICO.emConflito}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
