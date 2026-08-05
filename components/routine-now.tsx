"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, ListChecks, Moon, Sun, Sunrise } from "lucide-react";
import { ROTINA } from "@/data/protocol";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckRow } from "@/components/check-row";
import { Progress } from "@/components/ui/progress";
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
    <Card className="border-violet-200 bg-linear-to-br from-violet-50 to-white">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icone className="h-5 w-5 text-violet-500" />
              {texto}
            </CardTitle>
            <p className="text-xs text-zinc-500">Protocolo Desinflama-se</p>
          </div>
          <span className="shrink-0 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800">
            {feitos}/{itens.length}
          </span>
        </div>
        <div className="mt-2">
          <Progress value={pct} indicatorClassName="bg-violet-500" />
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
        <Button asChild variant="outline" className="w-full">
          <Link href="/rotina">
            <ListChecks className="h-4 w-4" /> Ver a rotina completa
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
