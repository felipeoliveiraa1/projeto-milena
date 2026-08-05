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
  Plus,
  RotateCcw,
  ShieldAlert,
  Smartphone,
  Sun,
  Sunrise,
  Trash2,
  X,
} from "lucide-react";
import { PROTOCOLO, SEGURANCA, type RotinaBloco } from "@/data/protocol";
import { BLOCOS_SUPLEMENTOS, SUPPLEMENTS, SUPLEMENTOS_SUSPENSOS } from "@/data/supplements";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Eyebrow,
} from "@/components/ui/card";
import { RotinaItemRow } from "@/components/routine-item";
import { Checkbox } from "@/components/ui/checkbox";
import { Ring } from "@/components/ui/ring";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getDay,
  getTextoDoDia,
  setTextoDoDia,
  toggleRotina,
  toggleSupplement,
  type DayCheck,
} from "@/lib/storage";
import { setInicio, useInicio, useProtocolo } from "@/lib/protocol";
import { novoId, useRotina } from "@/lib/routine";
import { todayKey } from "@/lib/date";
import { cn } from "@/lib/utils";

const ICONE_BLOCO: Record<string, typeof Sunrise> = {
  manha: Sunrise,
  dia: Sun,
  movimento: Activity,
  acompanhamento: NotebookPen,
  noite: Moon,
};

const PERIODOS = [
  { valor: "manha", rotulo: "Manhã" },
  { valor: "dia", rotulo: "Durante o dia" },
  { valor: "noite", rotulo: "Noite" },
] as const;

const BADGE_STATUS = {
  protocolo: { texto: "Combina com o protocolo", classe: "bg-brand-soft text-brand" },
  prescricao: { texto: "Prescrição médica", classe: "bg-plum-soft text-plum" },
  opcional: { texto: "Opcional", classe: "bg-line-soft text-ink-muted" },
};

export default function RotinaPage() {
  const [dia, setDia] = useState<DayCheck | null>(null);
  const [editandoData, setEditandoData] = useState(false);
  const [rascunhoData, setRascunhoData] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<RotinaBloco[] | null>(null);
  const status = useProtocolo();
  const inicio = useInicio();
  const novaData = rascunhoData ?? inicio;
  const { blocos, origem, salvar, restaurar } = useRotina();

  useEffect(() => {
    getDay().then(setDia);
  }, []);

  async function handleRotina(id: string) {
    setDia((prev) =>
      prev ? { ...prev, supplements: { ...prev.supplements, [id]: !prev.supplements[id] } } : prev,
    );
    setDia(await toggleRotina(id));
  }

  async function handleSuplemento(id: string) {
    setDia((prev) =>
      prev ? { ...prev, supplements: { ...prev.supplements, [id]: !prev.supplements[id] } } : prev,
    );
    setDia(await toggleSupplement(id));
  }

  async function handleTexto(id: string, valor: string) {
    setDia(await setTextoDoDia(id, valor));
  }

  function salvarData() {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(novaData)) return;
    setInicio(novaData);
    setRascunhoData(null);
    setEditandoData(false);
  }

  const itensTodos = blocos.flatMap((b) => b.itens);
  const totalFeitos = dia
    ? itensTodos.filter((i) => dia.supplements[i.id] === true).length
    : 0;
  const pctGeral =
    itensTodos.length > 0 ? Math.round((totalFeitos / itensTodos.length) * 100) : 0;

  return (
    <div className="stagger space-y-5">
      <header>
        <Eyebrow className="text-plum">Protocolo {PROTOCOLO.nome}</Eyebrow>
        <h2 className="font-display mt-2 text-4xl leading-none text-ink">Rotina do dia</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{PROTOCOLO.resumo}</p>
      </header>

      {/* Ciclo ------------------------------------------------------------- */}
      <Card className="border-plum/15 bg-plum-soft/40">
        <CardContent className="p-5">
          <div className="flex items-center gap-5">
            <Ring
              value={dia ? pctGeral : 0}
              size={92}
              stroke={8}
              trackClassName="text-plum/15"
              barClassName="text-plum"
            >
              <span className="font-display text-xl leading-none text-plum tabular">
                {dia ? pctGeral : 0}%
              </span>
            </Ring>

            <div className="min-w-0 flex-1">
              <p className="eyebrow text-plum/70">
                Ciclo de {status?.total ?? PROTOCOLO.duracaoDias} dias
              </p>
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
                {totalFeitos}/{itensTodos.length} itens da rotina hoje
              </p>
            </div>
          </div>

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

      {/* Barra de edição da rotina ------------------------------------------ */}
      <div className="flex flex-wrap items-center gap-2">
        {rascunho ? (
          <>
            <Button
              size="sm"
              onClick={async () => {
                await salvar(rascunho);
                setRascunho(null);
              }}
            >
              <CheckCircle2 className="h-4 w-4" /> Salvar rotina
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setRascunho(null)}>
              <X className="h-4 w-4" /> Cancelar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-ink-muted"
              onClick={async () => {
                if (!confirm("Voltar a rotina para o padrão do protocolo?")) return;
                await restaurar();
                setRascunho(null);
              }}
            >
              <RotateCcw className="h-4 w-4" /> Restaurar padrão
            </Button>
          </>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setRascunho(structuredClone(blocos))}>
            <Pencil className="h-4 w-4" /> Editar rotina
          </Button>
        )}
        {origem === "aparelho" && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1.5 text-[0.6875rem] font-semibold text-gold">
            <Smartphone className="h-3 w-3" /> salva neste aparelho
          </span>
        )}
      </div>

      {/* Blocos -------------------------------------------------------------- */}
      {rascunho ? (
        <EditorRotina blocos={rascunho} onChange={setRascunho} />
      ) : (
        blocos.map((bloco) => {
          const Icone = ICONE_BLOCO[bloco.id] ?? ListChecks;
          const feitos = dia
            ? bloco.itens.filter((i) => dia.supplements[i.id] === true).length
            : 0;
          const pct =
            bloco.itens.length > 0 ? Math.round((feitos / bloco.itens.length) * 100) : 0;
          return (
            <Card key={bloco.id}>
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
                {bloco.itens.map((it) => (
                  <RotinaItemRow
                    key={it.id}
                    item={it}
                    checked={!!dia && dia.supplements[it.id] === true}
                    onToggle={() => handleRotina(it.id)}
                    texto={dia ? getTextoDoDia(dia, it.id) : ""}
                    onSalvarTexto={it.campo === "texto" ? (v) => handleTexto(it.id, v) : undefined}
                  />
                ))}
              </CardContent>
            </Card>
          );
        })
      )}

      {/* Suplementos --------------------------------------------------------- */}
      <header className="pt-2">
        <Eyebrow className="text-ink-muted">Farmácia</Eyebrow>
        <h3 className="font-display mt-2 text-3xl leading-none text-ink">Suplementos</h3>
        <p className="mt-2 text-sm text-ink-muted">
          O limão e o própolis estão na rotina da manhã, ali em cima.
        </p>
      </header>

      {BLOCOS_SUPLEMENTOS.map((bloco) => {
        const doBloco = SUPPLEMENTS.filter((s) => s.bloco === bloco.id);
        const feitos = dia ? doBloco.filter((s) => dia.supplements[s.id] === true).length : 0;
        return (
          <Card key={bloco.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {bloco.id === "manha" ? (
                      <Sunrise className="h-4.5 w-4.5 text-clay" />
                    ) : (
                      <Moon className="h-4.5 w-4.5 text-plum" />
                    )}
                    {bloco.titulo}
                  </CardTitle>
                  <CardDescription>{bloco.detalhe}</CardDescription>
                </div>
                <span className="shrink-0 text-sm font-bold text-ink tabular">
                  {feitos}
                  <span className="text-ink-muted">/{doBloco.length}</span>
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {doBloco.map((s) => {
                const checked = !!dia && dia.supplements[s.id] === true;
                const badge = BADGE_STATUS[s.status];
                return (
                  <div
                    key={s.id}
                    className={cn(
                      "rounded-xl2 border p-4 transition",
                      checked ? "border-brand/20 bg-brand-soft/40" : "border-line bg-surface",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => handleSuplemento(s.id)}
                        aria-label={`Marcar ${s.nome}`}
                        className="mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p
                            className={cn(
                              "font-bold",
                              checked ? "text-ink-muted line-through" : "text-ink",
                            )}
                          >
                            <Pill className="mr-1.5 inline h-3.5 w-3.5 text-clay" />
                            {s.nome}
                          </p>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[0.625rem] font-bold",
                              badge.classe,
                            )}
                          >
                            {badge.texto}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-ink-muted">{s.dose}</p>
                        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.funcao}</p>
                        {s.observacao && (
                          <p className="mt-2 rounded-xl bg-gold-soft p-3 text-xs leading-relaxed text-gold">
                            {s.observacao}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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

/* -------------------------------------------------------------------------- */
/* Editor da rotina                                                           */
/* -------------------------------------------------------------------------- */

function EditorRotina({
  blocos,
  onChange,
}: {
  blocos: RotinaBloco[];
  onChange: (blocos: RotinaBloco[]) => void;
}) {
  function atualizarBloco(idx: number, patch: Partial<RotinaBloco>) {
    onChange(blocos.map((b, i) => (i === idx ? { ...b, ...patch } : b)));
  }

  return (
    <div className="space-y-4">
      <p className="rounded-xl2 bg-plum-soft/60 p-4 text-xs leading-relaxed text-plum">
        Edite à vontade: renomeie, apague, acrescente itens e crie blocos novos. Nada aqui depende
        de atualização do app.
      </p>

      {blocos.map((bloco, idx) => (
        <Card key={bloco.id} className="border-plum/20">
          <CardHeader className="gap-3">
            <div className="flex items-center gap-2">
              <Input
                value={bloco.titulo}
                onChange={(e) => atualizarBloco(idx, { titulo: e.target.value })}
                placeholder="Nome do bloco"
                className="font-bold"
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remover bloco ${bloco.titulo}`}
                onClick={() => {
                  if (!confirm(`Remover o bloco "${bloco.titulo}" inteiro?`)) return;
                  onChange(blocos.filter((_, i) => i !== idx));
                }}
              >
                <Trash2 className="h-4 w-4 text-danger" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PERIODOS.map((p) => (
                <button
                  key={p.valor}
                  type="button"
                  onClick={() => atualizarBloco(idx, { periodo: p.valor })}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    bloco.periodo === p.valor
                      ? "border-plum bg-plum text-bone"
                      : "border-line bg-surface text-ink-muted hover:text-ink",
                  )}
                >
                  {p.rotulo}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="space-y-2">
            {bloco.itens.map((item, j) => (
              <div key={item.id} className="flex items-center gap-2">
                <Input
                  value={item.texto}
                  onChange={(e) =>
                    atualizarBloco(idx, {
                      itens: bloco.itens.map((it, k) =>
                        k === j ? { ...it, texto: e.target.value } : it,
                      ),
                    })
                  }
                  placeholder="O que fazer"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remover ${item.texto}`}
                  onClick={() =>
                    atualizarBloco(idx, { itens: bloco.itens.filter((_, k) => k !== j) })
                  }
                >
                  <Trash2 className="h-4 w-4 text-ink-muted" />
                </Button>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                atualizarBloco(idx, {
                  itens: [...bloco.itens, { id: novoId("r"), texto: "" }],
                })
              }
            >
              <Plus className="h-4 w-4" /> Adicionar item
            </Button>
          </CardContent>
        </Card>
      ))}

      <Button
        variant="secondary"
        className="w-full"
        onClick={() =>
          onChange([
            ...blocos,
            {
              id: novoId("bloco"),
              titulo: "Novo bloco",
              periodo: "dia",
              itens: [{ id: novoId("r"), texto: "" }],
            },
          ])
        }
      >
        <Plus className="h-4 w-4" /> Adicionar bloco
      </Button>
    </div>
  );
}
