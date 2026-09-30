"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Moon, Pill, Sun, Sunrise } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Eyebrow } from "@/components/ui/card";
import { CheckRow } from "@/components/check-row";
import { RotinaItemRow } from "@/components/routine-item";
import { Button } from "@/components/ui/button";
import {
  SUPPLEMENTS,
  ehSemanal,
  suplementosDoDia,
  suplementosDoPeriodo,
} from "@/data/supplements";
import {
  getDayComErro,
  getTextoDoDia,
  setTextoDoDia,
  textoNaoSalvo,
  toggleRotina,
  toggleSupplement,
  type DayCheck,
} from "@/lib/storage";
import { usePeriodoAgora } from "@/lib/protocol";
import { useRotina } from "@/lib/routine";
import { useDia } from "@/components/day-context";
import { diaDaSemana } from "@/lib/date";
import { cn } from "@/lib/utils";

const TITULO = {
  manha: { texto: "Rotina da manhã", Icone: Sunrise },
  dia: { texto: "Rotina do dia", Icone: Sun },
  noite: { texto: "Rotina da noite", Icone: Moon },
};

type Carga = {
  data: string;
  dia: DayCheck;
  /** A leitura falhou: as marcas na tela podem não ser as do banco. */
  erro: boolean;
  /**
   * Semanais que ainda não estavam marcados quando o dia carregou. O semanal
   * fica na tela o dia todo até ser marcado — e, marcado, só sai na próxima
   * vez que a tela abrir, para não fugir debaixo do dedo.
   */
  semanaisPendentes: string[];
};

function semanaisPendentes(dia: DayCheck): string[] {
  return SUPPLEMENTS.filter((s) => ehSemanal(s) && dia.supplements[s.id] !== true).map(
    (s) => s.id,
  );
}

/**
 * Mostra na tela inicial só o que faz sentido para a hora atual: o bloco da
 * rotina do período e os remédios e suplementos que vão junto.
 */
export function RoutineNow() {
  const [carga, setCarga] = useState<Carga | null>(null);
  /** Item cujo toque (ou texto) não foi gravado — o aviso aparece logo abaixo dele. */
  const [naoSalvou, setNaoSalvou] = useState<{ data: string; id: string } | null>(null);
  // Anda com o relógio: de madrugada (até 05:00) ainda é noite — B12 e
  // colágeno continuam aqui, e os da manhã só entram com o dia novo.
  const periodo = usePeriodoAgora() ?? "manha";
  const { blocos } = useRotina();
  const { data, ehHoje } = useDia();
  // O último valor que o banco confirmou para cada item e o número do último
  // toque nele (chave: dia + item). Se um toque não grava, a marca volta para o
  // confirmado — e só se ele foi o último: dois toques sem internet não deixam
  // na tela um estado que nunca foi salvo.
  const confirmados = useRef<Record<string, boolean>>({});
  const toques = useRef<Record<string, number>>({});


  useEffect(() => {
    // O dia pode virar no meio da busca (às 05:00, com o app aberto): a
    // resposta atrasada do dia anterior não toma o lugar da nova.
    let valendo = true;
    getDayComErro(data).then(({ dia: d, erro }) => {
      if (!valendo) return;
      for (const [id, v] of Object.entries(d.supplements)) {
        if (typeof v === "boolean") confirmados.current[`${data}:${id}`] = v;
      }
      setCarga({ data, dia: d, erro, semanaisPendentes: semanaisPendentes(d) });
    });
    return () => {
      valendo = false;
    };
  }, [data]);

  // Só usa o que foi carregado se for do dia que está na tela.
  const atual = carga?.data === data ? carga : null;
  const dia = atual?.dia ?? null;

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

  // Num dia que já passou não existe "agora": mostra a rotina inteira para ela
  // conseguir lançar tudo de uma vez.
  const doPeriodo = ehHoje ? blocos.filter((b) => b.periodo === periodo) : blocos;
  const itens = doPeriodo.flatMap((b) => b.itens);
  const feitos = dia ? itens.filter((i) => dia.supplements[i.id] === true).length : 0;
  const pct = itens.length > 0 ? Math.round((feitos / itens.length) * 100) : 0;
  const { texto, Icone } = ehHoje ? TITULO[periodo] : { texto: "Rotina do dia", Icone: Sun };

  // Hoje: os remédios do período e os semanais do dia que ainda estavam
  // pendentes. Dia que já passou: tudo o que era daquele dia.
  const diaSemana = diaDaSemana(new Date(`${data}T00:00:00`));
  const remedios = ehHoje
    ? suplementosDoPeriodo(periodo, diaSemana).filter(
        (s) => !ehSemanal(s) || (atual?.semanaisPendentes.includes(s.id) ?? false),
      )
    : suplementosDoDia(diaSemana);
  const remediosFeitos = dia ? remedios.filter((s) => dia.supplements[s.id] === true).length : 0;

  if (itens.length === 0 && remedios.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <Eyebrow className="text-plum">{ehHoje ? "Para agora" : "O dia inteiro"}</Eyebrow>
            <CardTitle className="mt-1.5 flex items-center gap-2">
              <Icone className="h-4.5 w-4.5 text-plum" />
              {texto}
            </CardTitle>
          </div>
          {itens.length > 0 && (
            <div className="text-right">
              <p className="font-display text-2xl leading-none text-ink tabular">
                {feitos}
                <span className="text-ink-muted">/{itens.length}</span>
              </p>
              <p className="text-[0.625rem] tracking-wide text-ink-muted uppercase">feitos</p>
            </div>
          )}
        </div>
        {itens.length > 0 && (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line-soft">
            <div
              className="h-full rounded-full bg-plum transition-[width] duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-2">
        {atual?.erro && (
          <p role="alert" className="rounded-xl2 bg-danger-soft px-3.5 py-2.5 text-xs leading-relaxed text-danger">
            Não deu para carregar as marcas deste dia — o que aparece aqui pode não estar
            certo. Confira a internet e, antes de repetir um remédio, veja se já não tomou.
          </p>
        )}
        {itens.map((it) => (
          // A chave leva o dia: trocando de dia, a caixa de texto recomeça do zero.
          <Fragment key={`${data}:${it.id}`}>
            <RotinaItemRow
              item={it}
              checked={!!dia && dia.supplements[it.id] === true}
              onToggle={() => alternar(it.id, toggleRotina)}
              texto={dia ? getTextoDoDia(dia, it.id) : ""}
              onSalvarTexto={it.campo === "texto" ? (v) => handleTexto(it.id, v) : undefined}
              bloqueado={!atual || atual.erro}
              naoSalvo={it.campo === "texto" ? textoNaoSalvo(data, it.id) : undefined}
            />
            {falhou(it.id) && <NaoSalvou />}
          </Fragment>
        ))}

        {remedios.length > 0 && (
          <div className={cn("space-y-2", itens.length > 0 && "mt-1 border-t border-line/70 pt-3")}>
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-1.5 text-xs font-bold text-ink-soft">
                <Pill className="h-3.5 w-3.5 text-clay" /> Remédios e suplementos
              </p>
              <p className="text-xs font-bold text-ink tabular">
                {remediosFeitos}
                <span className="text-ink-muted">/{remedios.length}</span>
              </p>
            </div>
            {remedios.map((s) => {
              const marcado = !!dia && dia.supplements[s.id] === true;
              return (
                <Fragment key={s.id}>
                  <CheckRow
                    checked={marcado}
                    onToggle={() => alternar(s.id, toggleSupplement)}
                    label={`Marcar ${s.nome}`}
                  >
                    <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          marcado ? "text-ink-muted line-through" : "text-ink",
                        )}
                      >
                        {s.nome}
                      </span>
                      {ehSemanal(s) && (
                        <span className="rounded-full bg-gold-soft px-1.5 py-0.5 text-[0.625rem] font-bold text-gold">
                          semanal
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">
                      {s.dose}
                    </span>
                  </CheckRow>
                  {falhou(s.id) && <NaoSalvou />}
                </Fragment>
              );
            })}
          </div>
        )}

        <Button asChild variant="ghost" className="w-full">
          <Link href="/rotina">
            Ver a rotina completa <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
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
