"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Droplet,
  Dumbbell,
  Flame,
  ListChecks,
  NotebookPen,
  Pencil,
  Utensils,
} from "lucide-react";
import { Card, CardContent, CardHeader, Eyebrow } from "@/components/ui/card";
import { Ring } from "@/components/ui/ring";
import { Button } from "@/components/ui/button";
import { cardapioDoDia } from "@/data/meals";
import { getPeriodo, getTextoDoDia, type DayCheck } from "@/lib/storage";
import { formatarAgua, resumoDoDia } from "@/lib/score";
import { useInicio, useProtocolo } from "@/lib/protocol";
import { usePreferencias } from "@/lib/settings";
import { useRotina } from "@/lib/routine";
import { useDia } from "@/components/day-context";
import { todayKey, dataExtenso } from "@/lib/date";
import { cn } from "@/lib/utils";

export default function HistoricoPage() {
  const [dias, setDias] = useState<Record<string, DayCheck>>({});
  const [carregando, setCarregando] = useState(true);
  const [aberto, setAberto] = useState<string | null>(null);
  const status = useProtocolo();
  const inicio = useInicio();
  const { prefs } = usePreferencias();
  const { blocos } = useRotina();
  const { definir } = useDia();
  const router = useRouter();

  const idsRotina = useMemo(() => blocos.flatMap((b) => b.itens.map((i) => i.id)), [blocos]);

  useEffect(() => {
    getPeriodo(inicio, todayKey())
      .then(setDias)
      .finally(() => setCarregando(false));
  }, [inicio]);

  /** Do dia de hoje para trás, até o começo do protocolo. */
  const linha = useMemo(() => {
    const diasCorridos = status?.naoComecou ? 0 : (status?.dia ?? 1);
    const lista: { data: string; numero: number }[] = [];
    const base = new Date(inicio + "T00:00:00");
    for (let i = 0; i < diasCorridos; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      lista.push({ data: todayKey(d), numero: i + 1 });
    }
    return lista.reverse();
  }, [inicio, status]);

  const resumos = useMemo(
    () =>
      linha.map((item) => ({
        ...item,
        resumo: resumoDoDia(dias[item.data], { metaAgua: prefs.aguaMetaMl, idsRotina }),
      })),
    [linha, dias, prefs.aguaMetaMl, idsRotina],
  );

  const comRegistro = resumos.filter((r) => r.resumo.temRegistro);
  const media =
    comRegistro.length > 0
      ? Math.round(comRegistro.reduce((s, r) => s + r.resumo.pct, 0) / comRegistro.length)
      : 0;
  const treinos = comRegistro.filter((r) => r.resumo.treino).length;
  const aguaTotal = comRegistro.reduce((s, r) => s + r.resumo.agua, 0);
  const refeicoesTotal = comRegistro.reduce((s, r) => s + r.resumo.refeicoes, 0);

  return (
    <div className="stagger space-y-5">
      <header>
        <Eyebrow className="text-brand">Histórico</Eyebrow>
        <h2 className="font-display mt-2 text-4xl leading-none text-ink">Até aqui</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Cada dia desde o começo do protocolo. Toque em um dia para ver o que foi feito — e para
          completar o que ficou faltando.
        </p>
      </header>

      <Card className="border-brand-deep bg-brand-deep text-bone">
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <Ring
              value={media}
              size={96}
              stroke={8}
              trackClassName="text-bone/15"
              barClassName="text-bone"
            >
              <span className="font-display text-2xl leading-none text-bone tabular">{media}%</span>
            </Ring>
            <div className="min-w-0 flex-1">
              <p className="eyebrow text-bone/50">Média de adesão</p>
              <p className="font-display mt-1 text-3xl leading-none text-bone tabular">
                {comRegistro.length}
                <span className="text-lg text-bone/60">
                  {comRegistro.length === 1 ? " dia registrado" : " dias registrados"}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <Mini icone={<Utensils className="h-3.5 w-3.5" />} valor={`${refeicoesTotal}`} rotulo="refeições" />
            <Mini icone={<Droplet className="h-3.5 w-3.5" />} valor={formatarAgua(aguaTotal)} rotulo="de água" />
            <Mini icone={<Dumbbell className="h-3.5 w-3.5" />} valor={`${treinos}`} rotulo="treinos" />
          </div>
        </CardContent>
      </Card>

      {carregando ? (
        <p className="text-sm text-ink-muted">Carregando...</p>
      ) : resumos.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="font-display text-2xl text-ink">O protocolo ainda não começou</p>
            <p className="mt-2 text-sm text-ink-muted">
              A data de início fica na aba Rotina.
            </p>
          </CardContent>
        </Card>
      ) : (
        resumos.map(({ data, numero, resumo }) => {
          const dia = dias[data];
          const estaAberto = aberto === data;
          const ehHoje = data === todayKey();
          return (
            <Card key={data} className={cn(!resumo.temRegistro && "border-dashed")}>
              <CardHeader>
                <button
                  className="flex w-full items-center gap-4 text-left"
                  onClick={() => setAberto(estaAberto ? null : data)}
                >
                  <Ring
                    value={resumo.pct}
                    size={54}
                    stroke={5}
                    trackClassName="text-line"
                    barClassName={resumo.pct >= 70 ? "text-brand" : "text-clay"}
                  >
                    <span className="text-[0.6875rem] font-bold text-ink tabular">
                      {resumo.pct}
                    </span>
                  </Ring>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-ink">Dia {numero}</p>
                      {ehHoje && (
                        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[0.625rem] font-bold text-brand">
                          hoje
                        </span>
                      )}
                      {!resumo.temRegistro && (
                        <span className="rounded-full bg-line-soft px-2 py-0.5 text-[0.625rem] font-bold text-ink-muted">
                          em branco
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-muted">
                      {dataExtenso(new Date(data + "T00:00:00"))}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[0.6875rem] text-ink-muted tabular">
                      <span className="flex items-center gap-1">
                        <Utensils className="h-3 w-3" /> {resumo.refeicoes}/4
                      </span>
                      <span className="flex items-center gap-1">
                        <Droplet className="h-3 w-3" /> {formatarAgua(resumo.agua)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Dumbbell className="h-3 w-3" /> {resumo.treino ? "sim" : "—"}
                      </span>
                      <span className="flex items-center gap-1">
                        <ListChecks className="h-3 w-3" /> {resumo.rotina}/{resumo.rotinaTotal}
                      </span>
                    </div>
                  </div>

                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-ink-muted transition",
                      estaAberto && "rotate-180",
                    )}
                  />
                </button>
              </CardHeader>

              {estaAberto && (
                <CardContent className="animate-rise space-y-3 border-t border-line/70 pt-4">
                  <Detalhe dia={dia} numero={numero} idsRotina={idsRotina} />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      definir(data);
                      router.push("/");
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    {resumo.temRegistro ? "Completar esse dia" : "Preencher esse dia"}
                  </Button>
                </CardContent>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}

function Detalhe({
  dia,
  numero,
  idsRotina,
}: {
  dia: DayCheck | undefined;
  numero: number;
  idsRotina: string[];
}) {
  if (!dia) {
    return <p className="text-sm text-ink-muted">Nenhum registro nesse dia.</p>;
  }

  const cardapio = cardapioDoDia(numero);
  const sintomas = getTextoDoDia(dia, "r-ac-sintomas");
  const gratidao = getTextoDoDia(dia, "r-n-gratidao");
  const rotinaFeitos = idsRotina.filter((id) => dia.supplements[id] === true).length;

  return (
    <div className="space-y-3">
      <div>
        <Eyebrow className="mb-1.5 text-ink-muted">Refeições</Eyebrow>
        <div className="flex flex-wrap gap-1.5">
          {cardapio.refeicoes.map((r) => (
            <span
              key={r.id}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-semibold",
                dia.meals[r.id]
                  ? "bg-brand-soft text-brand"
                  : "bg-line-soft text-ink-muted line-through",
              )}
            >
              {r.nome}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Selo icone={<Droplet className="h-3 w-3" />} texto={formatarAgua(dia.water)} />
        <Selo
          icone={<Dumbbell className="h-3 w-3" />}
          texto={dia.workout ? "treino feito" : "sem treino"}
        />
        <Selo
          icone={<ListChecks className="h-3 w-3" />}
          texto={`${rotinaFeitos} de ${idsRotina.length} na rotina`}
        />
      </div>

      {sintomas && (
        <div className="rounded-xl2 bg-plum-soft/60 p-3.5">
          <Eyebrow className="mb-1 flex items-center gap-1.5 text-plum">
            <NotebookPen className="h-3 w-3" /> Sintomas
          </Eyebrow>
          <p className="text-sm whitespace-pre-line text-ink-soft">{sintomas}</p>
        </div>
      )}

      {gratidao && (
        <div className="rounded-xl2 bg-gold-soft p-3.5">
          <Eyebrow className="mb-1 flex items-center gap-1.5 text-gold">
            <Flame className="h-3 w-3" /> Gratidão
          </Eyebrow>
          <p className="text-sm whitespace-pre-line text-gold">{gratidao}</p>
        </div>
      )}
    </div>
  );
}

function Selo({ icone, texto }: { icone: React.ReactNode; texto: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-line bg-bone/50 px-2.5 py-1 text-xs font-medium text-ink-soft">
      {icone}
      {texto}
    </span>
  );
}

function Mini({
  icone,
  valor,
  rotulo,
}: {
  icone: React.ReactNode;
  valor: string;
  rotulo: string;
}) {
  return (
    <div className="rounded-2xl bg-bone/10 px-3 py-2.5">
      <span className="flex items-center gap-1 text-bone/50">{icone}</span>
      <p className="mt-1 text-sm font-bold text-bone tabular">{valor}</p>
      <p className="text-[0.625rem] leading-tight text-bone/50">{rotulo}</p>
    </div>
  );
}
