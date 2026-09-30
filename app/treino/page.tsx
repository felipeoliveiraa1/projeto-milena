"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  Ban,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Droplet,
  Dumbbell,
  Eye,
  Flame,
  HeartPulse,
  History,
  Info,
  Lightbulb,
  ListChecks,
  Repeat,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Timer,
  Wind,
  Wrench,
} from "lucide-react";
import {
  DIASTASE,
  DIASTASE_CM,
  EQUIPAMENTOS,
  MUDANCAS_TREINO,
  ORIENTACAO_DATA,
  PEDIDOS_MEDICO,
  PLANOS,
  SEM_APARELHO,
  comCardio,
  diasCom,
  legendaDoDia,
  planoDe,
  type Exercise,
  type Medida,
  type Plano,
  type WorkoutDay,
} from "@/data/workouts";
import { usePreferencias } from "@/lib/settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Eyebrow,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ExerciseVideo } from "@/components/exercise-video";
import { CardioEntreSeries } from "@/components/cardio-entre-series";
import { useDia } from "@/components/day-context";
import { dataCurta, dataExtensoNaFrase, diaDaSemana, todayKey } from "@/lib/date";
import {
  getDay,
  getPeriodo,
  getTextoDoDia,
  setTextoDoDia,
  toggleExercise,
  textoNaoSalvo,
  type DayCheck,
} from "@/lib/storage";
import { cn } from "@/lib/utils";

/** O prefixo separa os checks de um plano dos do outro. */
function exId(prefixo: string, diaSemana: number, idx: number) {
  return prefixo ? `${prefixo}-${diaSemana}-${idx}` : `${diaSemana}-${idx}`;
}

/**
 * A carga fica guardada como texto do dia (lib/storage.ts), com a chave do
 * exercício pelo nome — não pela posição no dia: a flexora da segunda e a da
 * sexta são a mesma máquina, e mudar a ordem dos exercícios não pode fazer a
 * "Última vez" mostrar a carga de outro. Não entra no score — é só o registro
 * da força.
 */
function idCarga(ex: Exercise): string {
  const slug = ex.nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `carga:${slug}`;
}

/** Até onde a "Última vez" procura: umas 8 semanas antes do dia na tela. */
const DIAS_DE_HISTORICO = 56;

type UltimaCarga = { valor: string; data: string };

/** "2026-09-30" mais n dias. Ao meio-dia, para a conta não tropeçar no fuso. */
function somarDias(data: string, dias: number): string {
  const d = new Date(`${data}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return todayKey(d);
}

/** A carga mais recente do exercício nos dias antes do que está na tela. */
function ultimaCarga(anteriores: [string, DayCheck][], ex: Exercise): UltimaCarga | null {
  const chave = idCarga(ex);
  for (let i = anteriores.length - 1; i >= 0; i--) {
    const [data, dia] = anteriores[i];
    const valor = getTextoDoDia(dia, chave).trim();
    if (valor) return { valor, data };
  }
  return null;
}

/** A semana começa na segunda, como na academia. */
const ORDEM_SEMANA = [1, 2, 3, 4, 5, 6, 0];

function naOrdem(dias: WorkoutDay[]): WorkoutDay[] {
  return [...dias].sort(
    (a, b) => ORDEM_SEMANA.indexOf(a.diaSemana) - ORDEM_SEMANA.indexOf(b.diaSemana),
  );
}

export default function TreinoPage() {
  // O dia carregado fica junto da data: trocar o dia que está sendo preenchido
  // não mistura os exercícios (nem as cargas) de um dia com os do outro.
  const [registro, setRegistro] = useState<{ data: string; dia: DayCheck } | null>(null);
  // Os dias antes do que está na tela, do mais antigo ao mais novo — de onde
  // sai a "Última vez" de cada carga. Uma consulta só por dia na tela.
  const [anteriores, setAnteriores] = useState<{
    data: string;
    dias: [string, DayCheck][];
  } | null>(null);
  /** Exercício cujo toque não foi gravado — o aviso aparece no card dele. */
  const [naoSalvou, setNaoSalvou] = useState<{ data: string; id: string } | null>(null);
  // Cargas que não gravaram, por "dia:exercício". O campo pode ter saído da
  // tela (troca de aba ou de dia) antes de o erro chegar; quando volta, nasce
  // com o que ela digitou e o aviso de que não salvou — nada some calado.
  const [cargasNaoSalvas, setCargasNaoSalvas] = useState<Record<string, string>>({});
  // O que o banco confirmou para cada exercício e o número do último toque
  // nele (chave: dia + exercício). Se um toque não grava, a marca volta para o
  // confirmado — só se ele foi o último toque.
  const confirmados = useRef<Record<string, boolean>>({});
  const toques = useRef<Record<string, number>>({});
  // Aba escolhida na mão vence; sem escolha, abre no dia que está sendo preenchido.
  const [abaEscolhida, setAbaEscolhida] = useState<string | null>(null);
  const { data, ehHoje } = useDia();
  // Enquanto as preferências carregam, `prefs` ainda é o padrão de fábrica:
  // trocar a fase nesse meio-tempo gravaria a janela, a água e o peso de
  // fábrica por cima dos dela. Por isso o seletor espera.
  const { prefs, salvar, carregando } = usePreferencias();
  const plano = planoDe(prefs.faseTreino);

  useEffect(() => {
    let ativo = true;
    getDay(data).then((d) => {
      if (!ativo) return;
      for (const [id, v] of Object.entries(d.exercises)) confirmados.current[`${data}:${id}`] = v;
      setRegistro({ data, dia: d });
    });
    return () => {
      ativo = false;
    };
  }, [data]);

  useEffect(() => {
    let ativo = true;
    getPeriodo(somarDias(data, -DIAS_DE_HISTORICO), somarDias(data, -1)).then((periodo) => {
      if (!ativo) return;
      const dias = Object.entries(periodo).sort(([a], [b]) => a.localeCompare(b));
      setAnteriores({ data, dias });
    });
    return () => {
      ativo = false;
    };
  }, [data]);

  const dia = registro?.data === data ? registro.dia : null;
  const hydrated = dia !== null;
  // Os ids dependem do plano: até as preferências chegarem, o plano na tela
  // pode não ser o dela, e um toque cairia no exercício do outro plano.
  const pronto = hydrated && !carregando;
  const checks = dia?.exercises ?? {};
  const historico = anteriores?.data === data ? anteriores.dias : null;

  /** Muda o dia guardado na tela — só se ele ainda for o dia da gravação. */
  function mudarDia(dataDoDia: string, mudar: (d: DayCheck) => DayCheck) {
    setRegistro((r) => (r && r.data === dataDoDia ? { data: dataDoDia, dia: mudar(r.dia) } : r));
  }

  // Marca na hora e grava o valor pretendido (não "o contrário do banco").
  // Se não gravar (sem internet, por exemplo), a marca volta para o que o
  // banco confirmou: não pode aparecer como feito o que não foi salvo.
  async function handleToggle(id: string) {
    const dataDoDia = data;
    const chave = `${dataDoDia}:${id}`;
    const alvo = !checks[id];
    const toque = (toques.current[chave] ?? 0) + 1;
    toques.current[chave] = toque;
    const marcar = (valor: boolean) =>
      mudarDia(dataDoDia, (d) => ({ ...d, exercises: { ...d.exercises, [id]: valor } }));
    marcar(alvo);
    try {
      // A fila por dia de lib/storage.ts põe as gravações em ordem — e, por
      // morar no módulo, continua valendo se ela sair da tela e voltar.
      const novo = await toggleExercise(id, dataDoDia, alvo);
      confirmados.current[chave] = !!novo.exercises[id];
      // Só o exercício tocado, e só se não veio outro toque nele depois.
      if (toques.current[chave] === toque) marcar(confirmados.current[chave]);
      setNaoSalvou(null);
    } catch (err) {
      console.error(err);
      if (toques.current[chave] === toque) marcar(confirmados.current[chave] ?? false);
      setNaoSalvou({ data: dataDoDia, id });
    }
  }

  /** Grava a carga no dia em que foi digitada, mesmo que a tela já tenha mudado de dia. */
  async function salvarCarga(ex: Exercise, valor: string, dataDoDia: string) {
    const chave = idCarga(ex);
    const pendente = `${dataDoDia}:${chave}`;
    try {
      await setTextoDoDia(chave, valor, dataDoDia);
      // Só a carga muda na tela: trocar todos os textos pelo que o banco
      // devolveu desfaria, por um instante, cargas ainda na fila.
      mudarDia(dataDoDia, (d) => ({
        ...d,
        supplements: { ...d.supplements, [`txt:${chave}`]: valor },
      }));
      setCargasNaoSalvas((m) => {
        if (!(pendente in m)) return m;
        const resto = { ...m };
        delete resto[pendente];
        return resto;
      });
    } catch (err) {
      setCargasNaoSalvas((m) => ({ ...m, [pendente]: valor }));
      throw err;
    }
  }

  const ordered = naOrdem(plano.dias);
  const abaAtual = abaEscolhida ?? String(diaDaSemana(new Date(`${data}T00:00:00`)));

  return (
    <div className="stagger space-y-5">
      <header>
        <Eyebrow className="text-brand">Plano de treino · {plano.nome}</Eyebrow>
        <h2 className="font-display mt-2 text-4xl leading-none text-ink">
          {plano.resumo}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          {plano.detalhe}
        </p>
        <p className="mt-3 flex items-start gap-2 rounded-xl2 bg-plum-soft px-3.5 py-3 text-xs leading-relaxed text-plum">
          <Timer className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            {/* Os horários só aparecem com a janela dela carregada: antes
                disso seriam os de fábrica. */}
            <strong>Quando treinar:</strong> academia dentro da janela alimentar
            {!carregando && ` (${prefs.janelaInicio}–${prefs.janelaFim})`}, depois
            do café ou entre o almoço e o lanche. Em jejum, só caminhada leve.
          </span>
        </p>
      </header>

      {!ehHoje && (
        <p className="flex items-center gap-2 rounded-xl2 border border-clay/30 bg-clay-soft px-4 py-3 text-xs font-semibold text-clay-deep">
          <CalendarDays className="h-4 w-4 shrink-0" />
          Marcando o treino de {dataExtensoNaFrase(new Date(`${data}T00:00:00`))}.
        </p>
      )}

      <Card>
        <CardHeader>
          <Eyebrow className="text-brand">Fase do treino</Eyebrow>
          <CardTitle className="mt-1.5">Em que pé você está</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2" aria-busy={carregando}>
          {Object.values(PLANOS).map((op) => {
            // Até as preferências chegarem, nenhum aparece escolhido: o padrão
            // de fábrica não é necessariamente o plano dela.
            const ativo = !carregando && op.id === plano.id;
            return (
              <button
                key={op.id}
                type="button"
                disabled={carregando}
                aria-pressed={ativo}
                onClick={() => {
                  if (!carregando) salvar({ ...prefs, faseTreino: op.id });
                }}
                className={cn(
                  "w-full rounded-xl2 border p-3.5 text-left transition active:scale-[0.99] disabled:cursor-wait disabled:opacity-60",
                  ativo
                    ? "border-brand bg-brand-soft/50"
                    : "border-line bg-surface hover:bg-bone",
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
                  <p
                    className={cn(
                      "font-bold",
                      ativo ? "text-brand" : "text-ink",
                    )}
                  >
                    {op.nome}
                  </p>
                  <span className="text-xs font-semibold text-ink-muted">
                    {op.resumo}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  {op.detalhe}
                </p>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <PedidosDoMedico plano={plano} />

      <CardDiastase />

      <Tabs value={abaAtual} onValueChange={setAbaEscolhida} className="w-full">
        <TabsList>
          {ordered.map((w) => (
            // As 7 abas dividem a largura em vez de rolar: numa tela de 320 px
            // o sábado e o domingo ficavam escondidos — e no domingo a aba
            // escondida era justamente a de hoje.
            <TabsTrigger
              key={w.diaSemana}
              value={String(w.diaSemana)}
              className="min-w-0 flex-1 px-1"
            >
              {w.diaNome.slice(0, 3)}
            </TabsTrigger>
          ))}
        </TabsList>

        {ordered.map((workout) => {
          const total = workout.exercicios.length;
          const done = workout.exercicios.filter(
            (_, i) => !!checks[exId(plano.prefixo, workout.diaSemana, i)],
          ).length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const academia = workout.tipo === "academia";
          return (
            <TabsContent
              key={workout.diaSemana}
              value={String(workout.diaSemana)}
              className="space-y-3"
            >
              <Card>
                <CardHeader>
                  <Eyebrow className="text-brand">{workout.diaNome}</Eyebrow>
                  <CardTitle className="font-display mt-1 text-2xl leading-tight">
                    {workout.foco}
                  </CardTitle>
                  <p className="text-xs font-semibold text-ink-muted">
                    {legendaDoDia(workout)}
                  </p>
                  {total > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-ink-muted">
                        <span>Progresso do treino</span>
                        <span className="font-bold text-ink tabular">
                          {done}/{total} · {pct}%
                        </span>
                      </div>
                      <Progress value={pct} />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {workout.lembrete && (
                    <div className="flex items-start gap-2.5 rounded-xl2 bg-plum-soft p-3.5">
                      <Droplet className="mt-0.5 h-4 w-4 shrink-0 text-plum" />
                      <p className="text-xs leading-relaxed text-plum">
                        {workout.lembrete}
                      </p>
                    </div>
                  )}

                  {workout.aquecimento && (
                    // O dourado fica no fundo e no ícone; o texto vai escuro,
                    // porque dourado sobre dourado claro não dá leitura.
                    <div className="flex items-start gap-2.5 rounded-xl2 bg-gold-soft p-3.5">
                      <Flame className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      <div className="min-w-0">
                        <Eyebrow className="text-ink-soft">Aquecimento</Eyebrow>
                        <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                          {workout.aquecimento}
                        </p>
                      </div>
                    </div>
                  )}

                  {academia && <CardioEntreSeries plano={plano} dia={workout} />}

                  {workout.comoFazer && (
                    <div className="flex items-start gap-2.5 rounded-xl2 bg-brand-soft/60 p-3.5">
                      <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <p className="text-xs leading-relaxed text-brand">
                        {workout.comoFazer}
                      </p>
                    </div>
                  )}

                  {workout.exercicios.some((e) => e.carga) && (
                    <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-ink-soft">
                      <Dumbbell className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                      <span>
                        Nos exercícios com peso, anote a carga do dia: é assim que
                        você vê a força se manter, ou subir, enquanto o peso da
                        balança desce.
                      </span>
                    </p>
                  )}

                  {workout.exercicios.map((ex, i) => {
                    const id = exId(plano.prefixo, workout.diaSemana, i);
                    return (
                      <ExercicioCard
                        key={`${i}-${ex.nome}`}
                        ex={ex}
                        indice={i}
                        checked={!!checks[id]}
                        pronto={pronto}
                        naoSalvou={naoSalvou?.data === data && naoSalvou.id === id}
                        cardio={academia && !ex.semCardio}
                        onToggle={() => handleToggle(id)}
                        carga={
                          ex.carga
                            ? {
                                chave: `${data}:${idCarga(ex)}:${i}`,
                                rotulo: ehHoje ? "Carga de hoje" : "Carga do dia",
                                salva: dia && pronto ? getTextoDoDia(dia, idCarga(ex)) : null,
                                // O da página primeiro; o do módulo cobre quem saiu
                                // do /treino antes de o erro chegar.
                                naoSalva:
                                  cargasNaoSalvas[`${data}:${idCarga(ex)}`] ??
                                  textoNaoSalvo(data, idCarga(ex)),
                                ultima: historico ? ultimaCarga(historico, ex) : null,
                                onSalvar: (valor) => salvarCarga(ex, valor, data),
                              }
                            : undefined
                        }
                      />
                    );
                  })}

                  {workout.observacao && (
                    <div className="flex items-start gap-2.5 rounded-xl2 bg-bone-deep/60 p-3.5">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" />
                      <p className="text-xs leading-relaxed text-ink-soft">
                        {workout.observacao}
                      </p>
                    </div>
                  )}

                  {hydrated && total > 0 && done === total && (
                    <div className="flex items-center gap-2.5 rounded-xl2 bg-brand p-4 text-bone">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-bold">
                        Treino completo. Muito bem! 💪
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* O padding mora no summary, não no details: a área de toque é a
          faixa inteira, não só a linha do texto. */}
      <details className="group rounded-card border border-line bg-surface">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2.5 p-5 text-sm font-bold text-ink">
          <History className="h-4 w-4 shrink-0 text-plum" />
          O que mudou no treino em {ORIENTACAO_DATA}
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-ink-muted transition group-open:rotate-180" />
        </summary>
        <ul className="space-y-3 px-5 pb-5">
          {MUDANCAS_TREINO.map((m) => (
            <li key={m.oQue} className="border-l-2 border-plum/30 pl-3">
              <p className="text-sm font-bold text-ink">{m.oQue}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
                {m.porque}
              </p>
            </li>
          ))}
        </ul>
      </details>

      <details className="group rounded-card border border-line bg-surface">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2.5 p-5 text-sm font-bold text-ink">
          <Wrench className="h-4 w-4 shrink-0 text-brand" />
          Montado com os aparelhos da sua academia
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-ink-muted transition group-open:rotate-180" />
        </summary>
        <div className="space-y-3 px-5 pb-5">
          <ul className="space-y-1.5">
            {EQUIPAMENTOS.map((e) => (
              <li
                key={e.nome}
                className="text-xs leading-relaxed text-ink-muted"
              >
                <strong className="text-ink-soft">{e.nome}</strong> —{" "}
                {e.detalhe}
              </li>
            ))}
          </ul>
          <p className="rounded-xl2 bg-bone-deep/60 p-3.5 text-xs leading-relaxed text-ink-soft">
            Sua academia não tem {SEM_APARELHO.join(", ").toLowerCase()}. Quando
            o plano precisou de um deles, entrou um exercício equivalente — o
            card do exercício explica a troca.
          </p>
        </div>
      </details>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Exercício                                                                  */
/* -------------------------------------------------------------------------- */

/** "3" → "3 séries"; "6 ciclos" fica como está. */
function rotuloSeries(series: string): string {
  if (!/^\d+$/.test(series)) return series;
  return series === "1" ? "1 série" : `${series} séries`;
}

/** "12" → "12 repetições"; "30 min" e "10 por perna" ficam como estão. */
function rotuloReps(reps: string): string {
  return /^\d+(–\d+)?$/.test(reps) ? `${reps} repetições` : reps;
}

type CargaDoExercicio = {
  /** Muda com o dia: trocar de dia monta um campo novo, com o valor daquele dia. */
  chave: string;
  rotulo: string;
  /** O que já está gravado no dia; `null` enquanto o dia ou o plano carregam. */
  salva: string | null;
  /** O que ela digitou e não gravou (o campo saiu da tela antes do erro). */
  naoSalva?: string;
  ultima: UltimaCarga | null;
  onSalvar: (valor: string) => Promise<void>;
};

function ExercicioCard({
  ex,
  indice,
  checked,
  pronto,
  naoSalvou,
  cardio,
  onToggle,
  carga,
}: {
  ex: Exercise;
  indice: number;
  checked: boolean;
  /** O dia e o plano já carregaram — antes disso o toque não vale. */
  pronto: boolean;
  /** O último toque neste exercício não foi gravado. */
  naoSalvou: boolean;
  /** Leva o cardio entre as séries — ganha a marca do coração. */
  cardio: boolean;
  onToggle: () => void;
  /** Só nos exercícios com peso de fora. */
  carga?: CargaDoExercicio;
}) {
  return (
    <div
      className={cn(
        "rounded-xl2 border p-4 transition",
        checked ? "border-brand/20 bg-brand-soft/40" : "border-line bg-surface",
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={checked}
          onCheckedChange={onToggle}
          disabled={!pronto}
          aria-label={ex.nome}
          className="mt-1"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[0.625rem] font-bold tracking-widest text-ink-muted uppercase">
            Exercício {indice + 1}
          </p>
          <p
            className={cn(
              "mt-1 font-bold",
              checked ? "text-ink-muted line-through" : "text-ink",
            )}
          >
            {ex.nome}
          </p>
          {naoSalvou && (
            <p role="alert" className="mt-1 text-[0.6875rem] font-semibold text-danger">
              Não salvou. Confira a internet e marque de novo.
            </p>
          )}

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <span className="flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[0.6875rem] font-bold text-brand">
              <Repeat className="h-3 w-3" /> {rotuloSeries(ex.series)}
            </span>
            <span className="rounded-full bg-line-soft px-2.5 py-1 text-[0.6875rem] font-bold text-ink-soft">
              {rotuloReps(ex.reps)}
            </span>
            {cardio ? (
              <span
                className="flex items-center gap-1 rounded-full bg-clay-deep px-2.5 py-1 text-[0.6875rem] font-bold text-bone"
                title="Depois de cada série"
              >
                <HeartPulse className="h-3 w-3" /> {ex.descanso}
              </span>
            ) : (
              ex.descanso !== "—" && (
                <span className="flex items-center gap-1 rounded-full bg-line-soft px-2.5 py-1 text-[0.6875rem] font-bold text-ink-soft">
                  <Clock className="h-3 w-3" /> {ex.descanso}
                </span>
              )
            )}
          </div>

          <p className="mt-2.5 flex items-start gap-1.5 text-xs leading-relaxed text-ink-muted">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {ex.beneficio}
          </p>
          <p className="mt-1.5 flex items-start gap-1.5 text-xs text-ink-muted">
            <Wrench className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {ex.equipamento}
          </p>
          {ex.dica && (
            <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-ink-soft">
              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
              {ex.dica}
            </p>
          )}
          {ex.adaptacao && (
            <p className="mt-2.5 flex items-start gap-2 rounded-xl bg-brand-soft/60 p-3 text-xs leading-relaxed text-brand">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {ex.adaptacao}
            </p>
          )}

          {ex.diastase && (
            <p className="mt-2.5 flex items-start gap-2 rounded-xl bg-danger-soft p-3 text-xs leading-relaxed text-danger">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                <strong>Diástase:</strong> {ex.diastase.nota}
              </span>
            </p>
          )}

          {carga &&
            (carga.salva === null ? (
              <CampoCargaEsperando rotulo={carga.rotulo} />
            ) : (
              <CampoCarga
                key={carga.chave}
                nome={ex.nome}
                rotulo={carga.rotulo}
                inicial={carga.salva}
                naoSalva={carga.naoSalva}
                ultima={carga.ultima}
                onSalvar={carga.onSalvar}
              />
            ))}

          <ExerciseVideo nome={ex.nome} videoId={ex.videoId} />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Carga do dia                                                               */
/* -------------------------------------------------------------------------- */

const CLASSE_CAIXA_CARGA =
  "h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink transition placeholder:text-ink-muted focus-visible:border-brand-mid focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/10 disabled:cursor-wait disabled:opacity-60";

function RotuloCarga({ rotulo }: { rotulo: string }) {
  return (
    <>
      <Dumbbell className="h-3.5 w-3.5 shrink-0 text-brand" />
      {rotulo}
      <span className="font-medium">· opcional</span>
    </>
  );
}

/** O mesmo campo, parado, enquanto o dia ou o plano carregam. */
function CampoCargaEsperando({ rotulo }: { rotulo: string }) {
  return (
    <div className="mt-3 border-t border-line-soft pt-3">
      <p className="flex items-center gap-1.5 text-xs font-bold text-ink-soft">
        <RotuloCarga rotulo={rotulo} />
      </p>
      <input
        type="text"
        disabled
        aria-label={rotulo}
        placeholder="carregando…"
        className={cn(CLASSE_CAIXA_CARGA, "mt-1.5")}
      />
    </div>
  );
}

/**
 * "Carga de hoje": texto curto e livre ("4 kg cada", "placa 3"). Salva sozinho
 * 700 ms depois da última tecla, como a caixa de texto da rotina, ou na hora em
 * que ela sai do campo. Se o campo sair da tela antes disso (troca de aba ou de
 * dia), grava o que ficou digitado.
 */
function CampoCarga({
  nome,
  rotulo,
  inicial,
  naoSalva,
  ultima,
  onSalvar,
}: {
  nome: string;
  rotulo: string;
  inicial: string;
  naoSalva?: string;
  ultima: UltimaCarga | null;
  onSalvar: (valor: string) => Promise<void>;
}) {
  const idCampo = useId();
  const idAjuda = `${idCampo}-ajuda`;
  // Voltou para a tela com uma carga que não gravou: nasce com ela e o aviso.
  const [valor, setValor] = useState(naoSalva ?? inicial);
  /** O que está no banco, até onde a tela sabe. */
  const [gravado, setGravado] = useState(inicial.trim());
  /** Ela já digitou neste campo — daí em diante, o que ela digitou vence. */
  const [mexeu, setMexeu] = useState(naoSalva !== undefined);
  const [aviso, setAviso] = useState<"salvo" | "erro" | null>(
    naoSalva !== undefined ? "erro" : null,
  );

  // Chegou um valor novo do banco para este dia (a gravação de um campo que
  // saiu da tela terminou depois de ele voltar, por exemplo). Se ela ainda não
  // digitou aqui, a caixa acompanha.
  const [externo, setExterno] = useState(inicial);
  if (inicial !== externo) {
    setExterno(inicial);
    setGravado(inicial.trim());
    if (!mexeu) setValor(inicial);
  }

  // O erro da gravação chegou com o campo já de volta na tela (rede lenta): a
  // caixa passa a mostrar o que ela digitou e o aviso, em vez de ficar vazia.
  const [naoSalvaVista, setNaoSalvaVista] = useState(naoSalva);
  if (naoSalva !== naoSalvaVista) {
    setNaoSalvaVista(naoSalva);
    if (naoSalva !== undefined && !mexeu) {
      setValor(naoSalva);
      setMexeu(true);
      setAviso("erro");
    }
  }

  // A gravação lê tudo de refs: roda no temporizador, na saída do campo e
  // quando o campo sai da tela — nesse último caso, já sem render nenhum.
  const valorRef = useRef(valor);
  const gravadoRef = useRef(gravado);
  const salvarRef = useRef(onSalvar);
  /** Valor que está indo para o banco agora — para não mandar duas vezes. */
  const enviandoRef = useRef<string | null>(null);
  useEffect(() => {
    valorRef.current = valor;
    gravadoRef.current = gravado;
    salvarRef.current = onSalvar;
  });

  const gravar = useCallback(async (texto?: string) => {
    const v = (texto ?? valorRef.current).trim();
    if (v === gravadoRef.current || v === enviandoRef.current) return;
    enviandoRef.current = v;
    try {
      await salvarRef.current(v);
      gravadoRef.current = v;
      setGravado(v);
      setAviso("salvo");
    } catch (err) {
      console.error(err);
      setAviso("erro");
    } finally {
      if (enviandoRef.current === v) enviandoRef.current = null;
    }
  }, []);

  // 700 ms depois da última tecla.
  useEffect(() => {
    if (valor.trim() === gravado) return;
    const t = setTimeout(() => void gravar(), 700);
    return () => clearTimeout(t);
  }, [valor, gravado, gravar]);

  // Saiu da tela com algo por gravar: grava agora, no dia deste campo.
  useEffect(() => () => void gravar(), [gravar]);

  // O "salvo" some sozinho.
  useEffect(() => {
    if (aviso !== "salvo") return;
    const t = setTimeout(() => setAviso(null), 1600);
    return () => clearTimeout(t);
  }, [aviso]);

  return (
    <div className="mt-3 border-t border-line-soft pt-3">
      <label
        htmlFor={idCampo}
        className="flex items-center gap-1.5 text-xs font-bold text-ink-soft"
      >
        <RotuloCarga rotulo={rotulo} />
      </label>
      <div className="relative mt-1.5">
        <input
          id={idCampo}
          type="text"
          value={valor}
          onChange={(e) => {
            setMexeu(true);
            setValor(e.target.value);
          }}
          onBlur={(e) => void gravar(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          placeholder="ex.: 4 kg"
          maxLength={30}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="done"
          aria-label={`${rotulo}: ${nome}`}
          aria-describedby={ultima || aviso === "erro" ? idAjuda : undefined}
          className={cn(CLASSE_CAIXA_CARGA, "pr-20")}
        />
        {aviso === "salvo" && (
          <span className="pointer-events-none absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[0.625rem] font-bold text-brand">
            <Check className="h-3 w-3" /> salvo
          </span>
        )}
      </div>
      {(ultima || aviso === "erro") && (
        <div id={idAjuda} className="mt-1.5 space-y-1 text-[0.6875rem] leading-relaxed">
          {ultima && (
            <p className="text-ink-soft">
              Última vez: <strong className="text-ink">{ultima.valor}</strong> ·{" "}
              {dataCurta(new Date(`${ultima.data}T00:00:00`))}
            </p>
          )}
          {aviso === "erro" && (
            <p role="alert" className="flex flex-wrap items-center gap-x-2 font-semibold text-danger">
              Não salvou. Confira a internet.
              <button
                type="button"
                onClick={() => void gravar()}
                className="min-h-11 rounded-full px-1 underline underline-offset-2"
              >
                Tentar de novo
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* O que você e o médico pediram                                              */
/* -------------------------------------------------------------------------- */

/** "seg, qua e sex" */
function listaE(itens: string[]): string {
  if (itens.length <= 1) return itens.join("");
  return `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`;
}

/**
 * A prova de que o pedido está no plano, contada nos próprios dados — se
 * alguém mexer num exercício, o número acompanha em vez de mentir.
 */
function evidencia(plano: Plano, medida: Medida): string {
  const idas = plano.dias.filter((d) => d.tipo === "academia");
  if (medida === "caminhada") {
    const n = plano.dias.filter((d) => d.tipo === "caminhada").length;
    return `${idas.length} idas com cardio + ${n} ${n === 1 ? "dia" : "dias"} de caminhada`;
  }
  if (medida === "cardio") {
    const n = idas.reduce((soma, d) => soma + comCardio(d).length, 0);
    return `Marcado em ${n} exercícios da semana`;
  }
  const dias = diasCom(plano, medida);
  if (medida === "perna") return `Perna em ${dias.length} de ${idas.length} idas`;
  return `Em ${listaE(naOrdem(dias).map((d) => d.diaNome.slice(0, 3).toLowerCase()))}`;
}

function PedidosDoMedico({ plano }: { plano: Plano }) {
  return (
    <details className="group rounded-card border border-line bg-surface">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <Stethoscope className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-ink">
            O que você e o médico pediram
          </span>
          <span className="block text-xs leading-relaxed text-ink-muted">
            {PEDIDOS_MEDICO.length} pedidos — e onde cada um está no seu plano
          </span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-ink-muted transition group-open:rotate-180" />
      </summary>
      <ol className="space-y-4 px-5 pb-5">
        {PEDIDOS_MEDICO.map((p, i) => {
          const prova = p.medida ? evidencia(plano, p.medida) : null;
          return (
            <li key={p.pedido} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-[0.6875rem] font-bold text-bone tabular">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-ink">{p.pedido}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
                  {p.resposta}
                </p>
                {prova && (
                  <p className="mt-1.5 inline-flex items-start gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-[0.6875rem] font-bold text-brand">
                    <CheckCircle2 className="mt-px h-3 w-3 shrink-0" />
                    {prova}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </details>
  );
}

/* -------------------------------------------------------------------------- */
/* Diástase                                                                   */
/* -------------------------------------------------------------------------- */

function CardDiastase() {
  return (
    <Card className="border-danger/25">
      <CardHeader>
        <Eyebrow className="text-danger">Diástase de {DIASTASE_CM}</Eyebrow>
        <CardTitle className="mt-1.5">Barriga firme, nunca empurrada</CardTitle>
        {/* Sem prometer fechar: a evidência de exercício na diástase é fraca, e
            com essa medida quem avalia o fechamento é a fisio e o cirurgião. */}
        <CardDescription>
          Os exercícios de abdômen do plano foram escolhidos para trabalhar a
          barriga sem forçar a diástase. Eles melhoram a firmeza e o controle; se
          a distância diminui, quem mede é a fisioterapeuta — e, com{" "}
          {DIASTASE_CM}, o cirurgião avalia na plástica. No treino inteiro, vale
          isto:
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5">
        <Regra
          icone={<Wind className="h-4 w-4" />}
          titulo="Solte o ar no esforço"
          texto={DIASTASE.respirar}
        />
        <Regra
          icone={<Eye className="h-4 w-4" />}
          titulo="O teste do morrinho"
          texto={DIASTASE.morrinho}
        />
        <Regra
          icone={<Stethoscope className="h-4 w-4" />}
          titulo="Fisioterapia pélvica"
          texto={DIASTASE.fisio}
        />
        <details className="group rounded-xl2 bg-danger-soft">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 p-3.5 text-xs font-bold text-danger">
            <Ban className="h-3.5 w-3.5 shrink-0" />
            Fora do plano ({DIASTASE.fora.length})
            <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 transition group-open:rotate-180" />
          </summary>
          <div className="px-3.5 pb-3.5">
            <p className="text-xs leading-relaxed text-danger">
              {DIASTASE.porqueFora}
            </p>
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {DIASTASE.fora.map((f) => (
                <li
                  key={f}
                  className="rounded-full bg-surface px-2.5 py-1 text-[0.6875rem] font-semibold text-danger"
                >
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}

function Regra({
  icone,
  titulo,
  texto,
}: {
  icone: ReactNode;
  titulo: string;
  texto: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl2 border border-line p-3.5">
      <span className="mt-0.5 shrink-0 text-danger">{icone}</span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-ink">{titulo}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{texto}</p>
      </div>
    </div>
  );
}
