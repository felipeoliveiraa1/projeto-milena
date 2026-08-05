"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  ListChecks,
  Moon,
  Pencil,
  Pill,
  ShieldAlert,
  Sun,
  Sunrise,
  Activity,
  NotebookPen,
} from "lucide-react";
import { PROTOCOLO, ROTINA, SEGURANCA, TOTAL_ITENS_ROTINA } from "@/data/protocol";
import { SUPPLEMENTS, SUPLEMENTOS_SUSPENSOS } from "@/data/supplements";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckRow } from "@/components/check-row";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDay, toggleRotina, toggleSupplement } from "@/lib/storage";
import { setInicio, useInicio, useProtocolo } from "@/lib/protocol";
import { todayKey } from "@/lib/date";
import { cn } from "@/lib/utils";

const ICONE_BLOCO = {
  manha: Sunrise,
  dia: Sun,
  movimento: Activity,
  acompanhamento: NotebookPen,
  noite: Moon,
} as const;

const BADGE_STATUS = {
  protocolo: { texto: "Combina com o protocolo", classe: "bg-emerald-100 text-emerald-800" },
  prescricao: { texto: "Prescrição médica", classe: "bg-sky-100 text-sky-800" },
  opcional: { texto: "Opcional", classe: "bg-zinc-100 text-zinc-600" },
};

export default function RotinaPage() {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);
  const [editandoData, setEditandoData] = useState(false);
  const [rascunhoData, setRascunhoData] = useState<string | null>(null);
  const status = useProtocolo();
  const inicio = useInicio();
  const novaData = rascunhoData ?? inicio;

  useEffect(() => {
    getDay().then((d) => {
      setChecks(d.supplements);
      setHydrated(true);
    });
  }, []);

  async function handleRotina(id: string) {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
    const next = await toggleRotina(id);
    setChecks({ ...next.supplements });
  }

  async function handleSuplemento(id: string) {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
    const next = await toggleSupplement(id);
    setChecks({ ...next.supplements });
  }

  function salvarData() {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(novaData)) return;
    setInicio(novaData);
    setRascunhoData(null);
    setEditandoData(false);
  }

  const totalFeitos = hydrated
    ? ROTINA.flatMap((b) => b.itens).filter((i) => checks[i.id]).length
    : 0;
  const pctGeral = Math.round((totalFeitos / TOTAL_ITENS_ROTINA) * 100);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-500">
          Protocolo {PROTOCOLO.nome}
        </p>
        <h2 className="text-2xl font-bold text-zinc-900">Rotina do dia</h2>
        <p className="mt-1 text-sm text-zinc-600">{PROTOCOLO.resumo}</p>
      </div>

      <Card className="border-violet-200 bg-linear-to-br from-violet-50 to-rose-50">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-violet-700">
                <CalendarDays className="h-3 w-3" /> Ciclo de {PROTOCOLO.duracaoDias} dias
              </p>
              <p className="text-2xl font-bold text-zinc-900">
                {!status
                  ? "—"
                  : status.naoComecou
                    ? "Ainda não começou"
                    : status.concluido
                      ? "Ciclo concluído"
                      : `Dia ${status.dia}`}
                {status && !status.naoComecou && !status.concluido && (
                  <span className="text-base font-medium text-zinc-500"> de {status.total}</span>
                )}
              </p>
              {status?.concluido && (
                <p className="text-xs text-violet-700">
                  Terminou há {status.diasDepoisDoFim}{" "}
                  {status.diasDepoisDoFim === 1 ? "dia" : "dias"}. O cardápio recomeçou do dia 1.
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500">Rotina de hoje</p>
              <p className="text-2xl font-bold text-violet-700">
                {hydrated ? `${pctGeral}%` : "—"}
              </p>
              <p className="text-[10px] text-zinc-500">
                {totalFeitos}/{TOTAL_ITENS_ROTINA} itens
              </p>
            </div>
          </div>

          {status && !status.naoComecou && !status.concluido && (
            <Progress value={status.pct} indicatorClassName="bg-violet-500" />
          )}

          {editandoData ? (
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="date"
                value={novaData}
                max={todayKey()}
                onChange={(e) => setRascunhoData(e.target.value)}
                className="max-w-45"
              />
              <Button size="sm" onClick={salvarData}>
                Salvar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditandoData(false)}>
                Cancelar
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setEditandoData(true)}
              className="inline-flex items-center gap-1 text-xs font-medium text-violet-700 hover:text-violet-900"
            >
              <Pencil className="h-3 w-3" />
              Comecei em{" "}
              {status ? status.inicio.split("-").reverse().join("/") : "—"} · ajustar
            </button>
          )}
        </CardContent>
      </Card>

      {ROTINA.map((bloco) => {
        const Icone = ICONE_BLOCO[bloco.id as keyof typeof ICONE_BLOCO] ?? ListChecks;
        const feitos = hydrated ? bloco.itens.filter((i) => checks[i.id]).length : 0;
        const completo = feitos === bloco.itens.length && bloco.itens.length > 0;
        return (
          <Card key={bloco.id} className={cn(completo && "border-violet-300 ring-2 ring-violet-100")}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="flex items-center gap-2">
                  <Icone className="h-5 w-5 text-violet-500" />
                  {bloco.titulo}
                </CardTitle>
                <span className="shrink-0 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800">
                  {feitos}/{bloco.itens.length}
                </span>
              </div>
              {bloco.nota && <CardDescription>{bloco.nota}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-2">
              {bloco.itens.map((it) => {
                const checked = hydrated && !!checks[it.id];
                return (
                  <CheckRow
                    key={it.id}
                    checked={checked}
                    onToggle={() => handleRotina(it.id)}
                    label={it.texto}
                    className={
                      checked ? "border-violet-200 bg-violet-50" : "border-zinc-100 bg-white"
                    }
                  >
                    <span
                      className={cn(
                        "block text-sm",
                        checked ? "text-zinc-400 line-through" : "text-zinc-800",
                      )}
                    >
                      {it.texto}
                    </span>
                    {it.detalhe && (
                      <span className="mt-0.5 block text-[11px] text-zinc-500">{it.detalhe}</span>
                    )}
                  </CheckRow>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      <div>
        <h3 className="text-lg font-bold text-zinc-900">Suplementos</h3>
        <p className="text-sm text-zinc-600">
          Marque conforme tomar. O limão e o própolis estão na rotina da manhã, ali em cima.
        </p>
      </div>

      {SUPPLEMENTS.map((s) => {
        const checked = hydrated && !!checks[s.id];
        const badge = BADGE_STATUS[s.status];
        return (
          <Card key={s.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-rose-500" />
                    {s.nome}
                  </CardTitle>
                  <CardDescription className="mt-1 flex flex-wrap items-center gap-1">
                    {s.dose} ·
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {s.horario}
                    </span>
                  </CardDescription>
                  <span
                    className={cn(
                      "mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      badge.classe,
                    )}
                  >
                    {badge.texto}
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-center gap-1 text-xs text-zinc-500">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => handleSuplemento(s.id)}
                    aria-label={`Marcar ${s.nome}`}
                  />
                  <span>{checked ? "Tomado" : "Tomar"}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-zinc-700">{s.funcao}</p>
              {s.observacao && (
                <div className="flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>{s.observacao}</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {SUPLEMENTOS_SUSPENSOS.map((s) => (
        <Card key={s.nome} className="border-zinc-200 bg-zinc-50">
          <CardContent className="space-y-1 p-4">
            <p className="text-sm font-semibold text-zinc-700">
              {s.nome} — fora durante os 15 dias
            </p>
            <p className="text-xs text-zinc-600">{s.porque}</p>
          </CardContent>
        </Card>
      ))}

      <Card className="border-red-200 bg-red-50/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <ShieldAlert className="h-5 w-5" /> Regras de segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-red-900">
            {SEGURANCA.map((s) => (
              <li key={s} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
