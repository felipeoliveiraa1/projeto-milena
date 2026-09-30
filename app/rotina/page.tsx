"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
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
  TriangleAlert,
  Utensils,
  X,
} from "lucide-react";
import { PLANO, SEGURANCA, type RotinaBloco } from "@/data/protocol";
import {
  BLOCOS_SUPLEMENTOS,
  FORA_DA_LISTA,
  NOMES_DIAS,
  ROTULO_STATUS,
  SUPPLEMENTS,
  VOLTOU_NA_DIETA,
  diasAteProxima,
  entraNoDia,
  frequencia,
  type BlocoSuplemento,
  type StatusSuplemento,
  type Supplement,
} from "@/data/supplements";
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
  getDayComErro,
  getTextoDoDia,
  setTextoDoDia,
  textoNaoSalvo,
  toggleRotina,
  toggleSupplement,
  type DayCheck,
} from "@/lib/storage";
import { setInicio, statusPlano, useInicio } from "@/lib/protocol";
import { novoId, useRotina } from "@/lib/routine";
import { useDia } from "@/components/day-context";
import { DaySwitch } from "@/components/day-switch";
import { dataCurta, diaDaSemana, hojeKey } from "@/lib/date";
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

const ICONE_BLOCO_REMEDIO: Record<BlocoSuplemento, { Icone: typeof Sunrise; cor: string }> = {
  manha: { Icone: Sunrise, cor: "text-clay" },
  almoco: { Icone: Utensils, cor: "text-clay" },
  noite: { Icone: Moon, cor: "text-plum" },
  semanal: { Icone: CalendarDays, cor: "text-gold" },
};

// Medicamento pesa mais que suplemento, e o selo mostra isso de longe.
const CLASSE_STATUS: Record<StatusSuplemento, string> = {
  medicamento: "bg-plum text-bone",
  prescricao: "bg-plum-soft text-plum",
  suplemento: "bg-brand-soft text-brand",
};

// Os quatro que saíram têm o mesmo motivo: agrupa para não repetir a frase.
const FORA_POR_MOTIVO = Object.entries(
  FORA_DA_LISTA.reduce<Record<string, string[]>>((acc, f) => {
    (acc[f.porque] ??= []).push(f.nome);
    return acc;
  }, {}),
);

export default function RotinaPage() {
  // erro: a leitura falhou, e as marcas na tela podem não ser as do banco.
  const [carga, setCarga] = useState<{ data: string; dia: DayCheck; erro: boolean } | null>(
    null,
  );
  /** Item cujo toque (ou texto) não foi gravado — o aviso aparece logo abaixo dele. */
  const [naoSalvou, setNaoSalvou] = useState<{ data: string; id: string } | null>(null);
  const [editandoData, setEditandoData] = useState(false);
  const [rascunhoData, setRascunhoData] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<RotinaBloco[] | null>(null);
  const inicio = useInicio();
  const novaData = rascunhoData ?? inicio;
  const { blocos, origem, salvar, restaurar } = useRotina();
  const { data, ehHoje } = useDia();
  // O último valor que o banco confirmou para cada item e o número do último
  // toque nele (chave: dia + item). Se um toque não grava, a marca volta para o
  // confirmado — e só se ele foi o último: dois toques sem internet não deixam
  // na tela um estado que nunca foi salvo.
  const confirmados = useRef<Record<string, boolean>>({});
  const toques = useRef<Record<string, number>>({});


  // A jornada é contada para o dia que está na tela: lançando um dia antigo,
  // o card mostra a semana daquele dia, junto com a rotina dele.
  const status = useMemo(() => statusPlano(inicio, data), [inicio, data]);

  useEffect(() => {
    // O dia na tela pode mudar no meio da busca (troca de dia ou a virada das
    // 05:00): a resposta atrasada do dia anterior não toma o lugar da nova.
    let valendo = true;
    getDayComErro(data).then(({ dia: d, erro }) => {
      if (!valendo) return;
      for (const [id, v] of Object.entries(d.supplements)) {
        if (typeof v === "boolean") confirmados.current[`${data}:${id}`] = v;
      }
      setCarga({ data, dia: d, erro });
    });
    return () => {
      valendo = false;
    };
  }, [data]);

  // Só usa o que foi carregado se for do dia que está na tela.
  const dia = carga?.data === data ? carga.dia : null;
  const erroAoCarregar = carga?.data === data && carga.erro;

  function marcarLocal(id: string, valor: boolean) {
    setCarga((c) =>
      c && c.data === data
        ? { ...c, dia: { ...c.dia, supplements: { ...c.dia.supplements, [id]: valor } } }
        : c,
    );
  }

  // Marca na hora e grava o valor pretendido (não "o contrário do banco"): se
  // o dia não carregou, o toque para marcar não pode virar desmarcar.
  async function alternar(id: string, gravar: typeof toggleSupplement) {
    const chave = `${data}:${id}`;
    const alvo = !(dia?.supplements[id] === true);
    const toque = (toques.current[chave] ?? 0) + 1;
    toques.current[chave] = toque;
    marcarLocal(id, alvo);
    try {
      const novo = await gravar(id, data, alvo);
      confirmados.current[chave] = novo.supplements[id] === true;
      if (toques.current[chave] === toque) marcarLocal(id, confirmados.current[chave]);
      setNaoSalvou((f) => (f?.id === id ? null : f));
    } catch (err) {
      console.error(err);
      if (toques.current[chave] === toque) marcarLocal(id, confirmados.current[chave] ?? false);
      setNaoSalvou({ data, id });
    }
  }

  async function handleTexto(id: string, valor: string): Promise<boolean> {
    try {
      await setTextoDoDia(id, valor, data);
      // Só o texto muda na tela: trocar o dia inteiro pelo que o banco devolveu
      // desfaria, por um instante, marcas que ainda estão sendo gravadas.
      setCarga((c) =>
        c && c.data === data
          ? {
              ...c,
              dia: { ...c.dia, supplements: { ...c.dia.supplements, [`txt:${id}`]: valor } },
            }
          : c,
      );
      setNaoSalvou((f) => (f?.id === id ? null : f));
      return true;
    } catch (err) {
      console.error(err);
      setNaoSalvou({ data, id });
      return false;
    }
  }

  const falhou = (id: string) => naoSalvou?.data === data && naoSalvou.id === id;

  function salvarData() {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(novaData)) return;
    setInicio(novaData);
    setRascunhoData(null);
    setEditandoData(false);
  }

  const diaDaSemanaAtual = diaDaSemana(new Date(`${data}T00:00:00`));
  const itensTodos = blocos.flatMap((b) => b.itens);
  const totalFeitos = dia
    ? itensTodos.filter((i) => dia.supplements[i.id] === true).length
    : 0;
  const pctGeral =
    itensTodos.length > 0 ? Math.round((totalFeitos / itensTodos.length) * 100) : 0;

  /** "amanhã, quinta" ou "domingo, 04/10" — contado a partir do dia na tela. */
  function proximaVez(s: Supplement): string {
    const faltam = diasAteProxima(s, diaDaSemanaAtual);
    const quando = new Date(`${data}T00:00:00`);
    quando.setDate(quando.getDate() + faltam);
    const nome = NOMES_DIAS[quando.getDay()];
    return faltam === 1 ? `amanhã, ${nome}` : `${nome}, ${dataCurta(quando)}`;
  }

  return (
    <div className="stagger space-y-5">
      <header>
        <Eyebrow className="text-plum">{PLANO.nome}</Eyebrow>
        <h2 className="font-display mt-2 text-4xl leading-none text-ink">Rotina do dia</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{PLANO.resumo}</p>
      </header>

      <DaySwitch />

      {erroAoCarregar && (
          <p role="alert" className="rounded-xl2 bg-danger-soft px-3.5 py-2.5 text-xs leading-relaxed text-danger">
            Não deu para carregar as marcas deste dia — o que aparece aqui pode não estar
            certo. Confira a internet e, antes de repetir um remédio, veja se já não tomou.
          </p>
      )}

      {/* Jornada ----------------------------------------------------------- */}
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
              <p className="eyebrow text-plum/70">Jornada</p>
              <p className="font-display mt-1 text-3xl leading-none text-ink tabular">
                {status.naoComecou ? "A começar" : `Semana ${status.semana}`}
                {!status.naoComecou && (
                  <span className="text-lg text-ink-muted"> · dia {status.dia}</span>
                )}
              </p>
              <p className="mt-1.5 text-xs text-ink-muted tabular">
                {totalFeitos}/{itensTodos.length} itens da rotina {ehHoje ? "hoje" : "nesse dia"}
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-plum/10 pt-4">
            {editandoData ? (
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="date"
                  value={novaData}
                  max={hojeKey()}
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
                Comecei em {status.inicio.split("-").reverse().join("/")} · ajustar
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
                if (!confirm("Voltar a rotina para o padrão do app?")) return;
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
                  // A chave leva o dia: trocando de dia, a caixa de texto recomeça do zero.
                  <Fragment key={`${data}:${it.id}`}>
                    <RotinaItemRow
                      item={it}
                      checked={!!dia && dia.supplements[it.id] === true}
                      onToggle={() => alternar(it.id, toggleRotina)}
                      texto={dia ? getTextoDoDia(dia, it.id) : ""}
                      onSalvarTexto={
                        it.campo === "texto" ? (v) => handleTexto(it.id, v) : undefined
                      }
                      bloqueado={!dia || erroAoCarregar}
                      naoSalvo={it.campo === "texto" ? textoNaoSalvo(data, it.id) : undefined}
                    />
                    {falhou(it.id) && <NaoSalvou />}
                  </Fragment>
                ))}
              </CardContent>
            </Card>
          );
        })
      )}

      {/* Remédios e suplementos ---------------------------------------------- */}
      <header className="pt-2">
        <Eyebrow className="text-clay">Farmácia</Eyebrow>
        <h3 className="font-display mt-2 text-3xl leading-none text-ink">
          Remédios e suplementos
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          A lista que você mandou em 29/09, com a dose do jeito que está nela. Nada aqui muda sem o
          médico — nem dose, nem dia.
        </p>
      </header>

      {BLOCOS_SUPLEMENTOS.map((bloco) => {
        const doBloco = SUPPLEMENTS.filter((s) => s.bloco === bloco.id);
        if (doBloco.length === 0) return null;
        // O semanal só se marca no dia dele. Nos outros dias ele continua
        // aqui, com a data da próxima vez — as orientações do Mounjaro (e o
        // que fazer se esqueceu) valem a semana inteira.
        const deHoje = doBloco.filter((s) => entraNoDia(s, diaDaSemanaAtual));
        const outroDia = doBloco.filter((s) => !entraNoDia(s, diaDaSemanaAtual));
        const feitos = dia ? deHoje.filter((s) => dia.supplements[s.id] === true).length : 0;
        const { Icone, cor } = ICONE_BLOCO_REMEDIO[bloco.id];
        return (
          <Card key={bloco.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Icone className={cn("h-4.5 w-4.5", cor)} />
                    {bloco.titulo}
                  </CardTitle>
                  <CardDescription>{bloco.detalhe}</CardDescription>
                </div>
                {deHoje.length > 0 && (
                  <span className="shrink-0 text-sm font-bold text-ink tabular">
                    {feitos}
                    <span className="text-ink-muted">/{deHoje.length}</span>
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {deHoje.map((s) => (
                <Fragment key={s.id}>
                  <RemedioCard
                    s={s}
                    checked={!!dia && dia.supplements[s.id] === true}
                    onToggle={() => alternar(s.id, toggleSupplement)}
                  />
                  {falhou(s.id) && <NaoSalvou />}
                </Fragment>
              ))}
              {outroDia.map((s) => (
                <Fragment key={s.id}>
                  <RemedioCard
                    s={s}
                    checked={!!dia && dia.supplements[s.id] === true}
                    onToggle={() => alternar(s.id, toggleSupplement)}
                    outroDia={ehHoje ? `Próxima: ${proximaVez(s)}` : "Não entrava nesse dia."}
                  />
                  {falhou(s.id) && <NaoSalvou />}
                </Fragment>
              ))}
            </CardContent>
          </Card>
        );
      })}

      <Card className="border-dashed bg-bone-deep/40">
        <CardContent className="space-y-3 p-5">
          <p className="text-sm font-bold text-ink-soft">Fora da lista nova</p>
          {FORA_POR_MOTIVO.map(([porque, nomes]) => (
            <div key={porque} className="space-y-1.5">
              <div className="flex flex-wrap gap-1.5">
                {nomes.map((nome) => (
                  <span
                    key={nome}
                    className="rounded-full border border-line bg-surface px-2.5 py-1 text-[0.6875rem] font-semibold text-ink-muted"
                  >
                    {nome}
                  </span>
                ))}
              </div>
              <p className="text-xs leading-relaxed text-ink-muted">{porque}</p>
            </div>
          ))}
          <p className="border-t border-line/70 pt-3 text-xs leading-relaxed text-ink-muted">
            <strong className="text-ink-soft">{VOLTOU_NA_DIETA.nome}:</strong>{" "}
            {VOLTOU_NA_DIETA.texto}
          </p>
        </CardContent>
      </Card>

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
/* Remédio ou suplemento                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Cartão de um item da lista. No dia dele, vem com checkbox e tudo aberto.
 * Fora do dia (o semanal), vem com as orientações fechadas, para não pesar a
 * tela — mas a um toque, porque elas valem a semana toda. E dá para marcar
 * fora do dia: a bula do Mounjaro permite aplicar a dose esquecida em até 4
 * dias, e o registro precisa cair no dia em que ela aplicou de verdade.
 */
function RemedioCard({
  s,
  checked = false,
  onToggle,
  outroDia,
}: {
  s: Supplement;
  checked?: boolean;
  onToggle?: () => void;
  /** Quando o item não é do dia na tela: a linha que diz quando ele volta. */
  outroDia?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const ehDoDia = outroDia === undefined;
  const mostrarTudo = ehDoDia || aberto;
  const selo = frequencia(s);

  return (
    <div
      className={cn(
        "rounded-xl2 border p-4 transition",
        checked
          ? "border-brand/20 bg-brand-soft/40"
          : ehDoDia
            ? "border-line bg-surface"
            : "border-dashed border-line bg-bone/40",
      )}
    >
      <div className="flex items-start gap-3">
        {ehDoDia ? (
          <Checkbox
            checked={checked}
            onCheckedChange={() => onToggle?.()}
            aria-label={`Marcar ${s.nome}`}
            className="mt-0.5"
          />
        ) : (
          <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-ink-muted" aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          <p className={cn("font-bold", checked ? "text-ink-muted line-through" : "text-ink")}>
            <Pill className="mr-1.5 inline h-3.5 w-3.5 text-clay" />
            {s.nome}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {selo && (
              <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[0.625rem] font-bold text-gold">
                {selo}
              </span>
            )}
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[0.625rem] font-bold",
                CLASSE_STATUS[s.status],
              )}
            >
              {ROTULO_STATUS[s.status]}
            </span>
          </div>
          <p className="mt-1.5 text-xs font-semibold text-ink-soft">{s.dose}</p>
          {!ehDoDia && <p className="mt-1 text-xs text-ink-muted">{outroDia}</p>}

          {mostrarTudo && (
            <div className="space-y-2">
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.funcao}</p>

              {s.comoUsar && (
                <ul className="space-y-1.5">
                  {s.comoUsar.map((passo) => (
                    <li
                      key={passo}
                      className="flex items-start gap-2 text-xs leading-relaxed text-ink-soft"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-clay" />
                      <span>{passo}</span>
                    </li>
                  ))}
                </ul>
              )}

              {s.observacao && (
                <p className="rounded-xl bg-gold-soft p-3 text-xs leading-relaxed text-gold">
                  {s.observacao}
                </p>
              )}

              {s.alertas && s.alertas.length > 0 && (
                <div className="rounded-xl border border-danger/15 bg-danger-soft/60 p-3">
                  <p className="flex items-center gap-1.5 text-[0.6875rem] font-bold text-danger">
                    <TriangleAlert className="h-3.5 w-3.5" /> Fique de olho
                  </p>
                  <ul className="mt-1.5 space-y-1.5">
                    {s.alertas.map((alerta) => (
                      <li
                        key={alerta}
                        className="flex items-start gap-2 text-xs leading-relaxed text-ink-soft"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-danger" />
                        <span>{alerta}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {s.antes && (
                <p className="text-[0.6875rem] leading-relaxed text-ink-muted">
                  <strong className="text-ink-soft">Mudou em 29/09:</strong> {s.antes}
                </p>
              )}
            </div>
          )}

          {!ehDoDia && (
            // 44 px de altura para o dedo acertar — é por aqui que entra a dose
            // atrasada do Mounjaro. A margem negativa embaixo come parte do
            // respiro que a altura extra criaria no cartão.
            <div className="mt-1 -mb-3 flex flex-wrap items-center gap-x-4">
              <button
                type="button"
                onClick={() => setAberto(!aberto)}
                aria-expanded={aberto}
                className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-plum transition hover:text-ink"
              >
                {aberto ? "Fechar" : "Como usar e cuidados"}
                <ChevronDown className={cn("h-3.5 w-3.5 transition", aberto && "rotate-180")} />
              </button>
              <button
                type="button"
                onClick={() => onToggle?.()}
                aria-pressed={checked}
                className={cn(
                  "inline-flex min-h-11 items-center gap-1 text-xs font-semibold transition hover:text-ink",
                  checked ? "text-brand" : "text-ink-muted",
                )}
              >
                {checked ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Feito fora do dia · desfazer
                  </>
                ) : (
                  "Marcar como feito fora do dia"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Aparece logo abaixo do item quando o toque (ou o texto) não foi gravado. */
function NaoSalvou() {
  return (
    <p role="alert" className="px-1 text-xs font-semibold text-danger">
      Não deu para salvar agora. Confira a internet e tente de novo.
    </p>
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
