"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Moon, Sun, Sunrise } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Eyebrow } from "@/components/ui/card";
import { RotinaItemRow } from "@/components/routine-item";
import { Button } from "@/components/ui/button";
import { getDay, getTextoDoDia, setTextoDoDia, toggleRotina, type DayCheck } from "@/lib/storage";
import { usePeriodoAgora } from "@/lib/protocol";
import { useRotina } from "@/lib/routine";

const TITULO = {
  manha: { texto: "Rotina da manhã", Icone: Sunrise },
  dia: { texto: "Rotina do dia", Icone: Sun },
  noite: { texto: "Rotina da noite", Icone: Moon },
};

/** Mostra na tela inicial só o bloco da rotina que faz sentido para a hora atual. */
export function RoutineNow() {
  const [dia, setDia] = useState<DayCheck | null>(null);
  const periodo = usePeriodoAgora() ?? "manha";
  const { blocos } = useRotina();

  useEffect(() => {
    getDay().then(setDia);
  }, []);

  async function handleToggle(id: string) {
    setDia((prev) =>
      prev ? { ...prev, supplements: { ...prev.supplements, [id]: !prev.supplements[id] } } : prev,
    );
    setDia(await toggleRotina(id));
  }

  async function handleTexto(id: string, valor: string) {
    setDia(await setTextoDoDia(id, valor));
  }

  const doPeriodo = blocos.filter((b) => b.periodo === periodo);
  const itens = doPeriodo.flatMap((b) => b.itens);
  const feitos = dia ? itens.filter((i) => dia.supplements[i.id] === true).length : 0;
  const pct = itens.length > 0 ? Math.round((feitos / itens.length) * 100) : 0;
  const { texto, Icone } = TITULO[periodo];

  if (itens.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <Eyebrow className="text-plum">Protocolo</Eyebrow>
            <CardTitle className="mt-1.5 flex items-center gap-2">
              <Icone className="h-4.5 w-4.5 text-plum" />
              {texto}
            </CardTitle>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl leading-none text-ink tabular">
              {feitos}
              <span className="text-ink-muted">/{itens.length}</span>
            </p>
            <p className="text-[0.625rem] tracking-wide text-ink-muted uppercase">feitos</p>
          </div>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line-soft">
          <div
            className="h-full rounded-full bg-plum transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {itens.map((it) => (
          <RotinaItemRow
            key={it.id}
            item={it}
            checked={!!dia && dia.supplements[it.id] === true}
            onToggle={() => handleToggle(it.id)}
            texto={dia ? getTextoDoDia(dia, it.id) : ""}
            onSalvarTexto={it.campo === "texto" ? (v) => handleTexto(it.id, v) : undefined}
          />
        ))}
        <Button asChild variant="ghost" className="w-full">
          <Link href="/rotina">
            Ver a rotina completa <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
