"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  ListChecks,
  Moon,
  NotebookPen,
  Pencil,
  Pill,
  ShieldAlert,
  Sun,
  Sunrise,
} from "lucide-react";
import { PROTOCOLO, ROTINA, SEGURANCA, TOTAL_ITENS_ROTINA } from "@/data/protocol";
import { SUPPLEMENTS, SUPLEMENTOS_SUSPENSOS } from "@/data/supplements";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Eyebrow,
} from "@/components/ui/card";
import { CheckRow } from "@/components/check-row";
import { Checkbox } from "@/components/ui/checkbox";
import { Ring } from "@/components/ui/ring";
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
  protocolo: { texto: "Combina com o protocolo", classe: "bg-brand-soft text-brand" },
  prescricao: { texto: "Prescrição médica", classe: "bg-plum-soft text-plum" },
  opcional: { texto: "Opcional", classe: "bg-line-soft text-ink-muted" },
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
    <div className="stagger space-y-5">
      <header>
        <Eyebrow className="text-plum">Protocolo {PROTOCOLO.nome}</Eyebrow>
        <h2 className="font-display mt-2 text-4xl leading-none text-ink">Rotina do dia</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{PROTOCOLO.resumo}</p>
      </header>

      <Card className="border-plum/15 bg-plum-soft/40">
        <CardContent className="p-5">
          <div className="flex items-center gap-5">
            <Ring
              value={hydrated ? pctGeral : 0}
              size={92}
              stroke={8}
              trackClassName="text-plum/15"
              barClassName="text-plum"
            >
              <span className="font-display text-xl leading-none text-plum tabular">
                {hydrated ? pctGeral : 0}%
              </span>
            </Ring>

            <div className="min-w-0 flex-1">
              <p className="eyebrow text-plum/70">Ciclo de {PROTOCOLO.duracaoDias} dias</p>
              <p className="font-display mt-1 text-3xl leading-none text-ink">
                {!status
                  ? "—"
                  : status.naoComecou
                    ? "A começar"
                    : status.concluido
                      ? "Concluído"
                      : `Dia ${status.dia}`}
                {status && !status.naoComecou && !status.concluido && (
                  <span className="text-lg text-ink-muted"> de {status.total}</span>
                )}
              </p>
              <p className="mt-1.5 text-xs text-ink-muted tabular">
                {totalFeitos}/{TOTAL_ITENS_ROTINA} itens da rotina hoje
              </p>
            </div>
          </div>

          {status?.concluido && (
            <p className="mt-4 rounded-xl2 bg-surface/70 p-3 text-xs text-ink-soft">
              Terminou há {status.diasDepoisDoFim}{" "}
              {status.diasDepoisDoFim === 1 ? "dia" : "dias"}. O cardápio recomeçou do dia 1.
            </p>
          )}

          <div className="mt-4 border-t border-plum/10 pt-4">
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
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-plum transition hover:text-ink"
              >
                <Pencil className="h-3 w-3" />
                Comecei em {status ? status.inicio.split("-").reverse().join("/") : "—"} · ajustar
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {ROTINA.map((bloco) => {
        const Icone = ICONE_BLOCO[bloco.id as keyof typeof ICONE_BLOCO] ?? ListChecks;
        const feitos = hydrated ? bloco.itens.filter((i) => checks[i.id]).length : 0;
        const completo = feitos === bloco.itens.length && bloco.itens.length > 0;
        const pct = Math.round((feitos / bloco.itens.length) * 100);
        return (
          <Card key={bloco.id} className={cn(completo && "border-plum/30")}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="flex items-center gap-2">
                  <Icone className="h-4.5 w-4.5 text-plum" />
                  {bloco.titulo}
                </CardTitle>
                <span className="shrink-0 text-sm font-bold text-ink tabular">
                  {feitos}
                  <span className="text-ink-muted">/{bloco.itens.length}</span>
                </span>
              </div>
              {bloco.nota && <CardDescription>{bloco.nota}</CardDescription>}
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-line-soft">
                <div
                  className="h-full rounded-full bg-plum transition-[width] duration-500 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
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
                    className={checked ? "border-plum/20 bg-plum-soft/60" : undefined}
                  >
                    <span
                      className={cn(
                        "block text-sm font-medium",
                        checked ? "text-ink-muted line-through" : "text-ink",
                      )}
                    >
                      {it.texto}
                    </span>
                    {it.detalhe && (
                      <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">
                        {it.detalhe}
                      </span>
                    )}
                  </CheckRow>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      <header className="pt-2">
        <Eyebrow className="text-ink-muted">Farmácia</Eyebrow>
        <h3 className="font-display mt-2 text-3xl leading-none text-ink">Suplementos</h3>
        <p className="mt-2 text-sm text-ink-muted">
          O limão e o própolis estão na rotina da manhã, ali em cima.
        </p>
      </header>

      {SUPPLEMENTS.map((s) => {
        const checked = hydrated && !!checks[s.id];
        const badge = BADGE_STATUS[s.status];
        return (
          <Card key={s.id} className={cn(checked && "border-brand/25")}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-4.5 w-4.5 text-clay" />
                    {s.nome}
                  </CardTitle>
                  <p className="mt-1 text-sm text-ink-muted">
                    {s.dose} · {s.horario}
                  </p>
                  <span
                    className={cn(
                      "mt-2.5 inline-block rounded-full px-2.5 py-1 text-[0.625rem] font-bold",
                      badge.classe,
                    )}
                  >
                    {badge.texto}
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-center gap-1.5 text-[0.625rem] font-semibold tracking-wide text-ink-muted uppercase">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => handleSuplemento(s.id)}
                    aria-label={`Marcar ${s.nome}`}
                  />
                  <span>{checked ? "tomado" : "tomar"}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed text-ink-soft">{s.funcao}</p>
              {s.observacao && (
                <p className="rounded-xl2 bg-gold-soft p-3.5 text-xs leading-relaxed text-gold">
                  {s.observacao}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}

      {SUPLEMENTOS_SUSPENSOS.map((s) => (
        <Card key={s.nome} className="border-dashed bg-bone-deep/40">
          <CardContent className="space-y-1.5 p-5">
            <p className="text-sm font-bold text-ink-soft">{s.nome} — fora durante os 15 dias</p>
            <p className="text-xs leading-relaxed text-ink-muted">{s.porque}</p>
          </CardContent>
        </Card>
      ))}

      <Card className="border-danger/20 bg-danger-soft/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-danger">
            <ShieldAlert className="h-4.5 w-4.5" /> Regras de segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5">
            {SEGURANCA.map((s) => (
              <li key={s} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-soft">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
