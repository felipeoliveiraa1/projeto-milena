"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Moon, Sun, Sunrise } from "lucide-react";
import { ROTINA } from "@/data/protocol";
import { Card, CardContent, CardHeader, CardTitle, Eyebrow } from "@/components/ui/card";
import { CheckRow } from "@/components/check-row";
import { Button } from "@/components/ui/button";
import { getDay, toggleRotina } from "@/lib/storage";
import { usePeriodoAgora } from "@/lib/protocol";
import { cn } from "@/lib/utils";

const TITULO = {
  manha: { texto: "Rotina da manhã", Icone: Sunrise },
  dia: { texto: "Rotina do dia", Icone: Sun },
  noite: { texto: "Rotina da noite", Icone: Moon },
};

/** Mostra na tela inicial só o bloco da rotina que faz sentido para a hora atual. */
export function RoutineNow() {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);
  const periodo = usePeriodoAgora() ?? "manha";

  useEffect(() => {
    getDay().then((d) => {
      setChecks(d.supplements);
      setHydrated(true);
    });
  }, []);

  async function handleToggle(id: string) {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
    const next = await toggleRotina(id);
    setChecks({ ...next.supplements });
  }

  const blocos = ROTINA.filter((b) => b.periodo === periodo);
  const itens = blocos.flatMap((b) => b.itens);
  const feitos = hydrated ? itens.filter((i) => checks[i.id]).length : 0;
  const pct = itens.length > 0 ? Math.round((feitos / itens.length) * 100) : 0;
  const { texto, Icone } = TITULO[periodo];

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
        {itens.map((it) => {
          const checked = hydrated && !!checks[it.id];
          return (
            <CheckRow
              key={it.id}
              checked={checked}
              onToggle={() => handleToggle(it.id)}
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
        <Button asChild variant="ghost" className="w-full">
          <Link href="/rotina">
            Ver a rotina completa <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
