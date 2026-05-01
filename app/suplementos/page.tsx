"use client";

import { useEffect, useState } from "react";
import { Pill, Clock, CheckCircle2 } from "lucide-react";
import { SUPPLEMENTS } from "@/data/supplements";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { getDay, toggleSupplement } from "@/lib/storage";

export default function SuplementosPage() {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    getDay().then((d) => {
      setChecks(d.supplements);
      setHydrated(true);
    });
  }, []);

  async function handle(id: string) {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
    const next = await toggleSupplement(id);
    setChecks({ ...next.supplements });
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-500">Suplementação</p>
        <h2 className="text-2xl font-bold text-zinc-900">Seus suplementos</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Marque cada um conforme tomar. Eles ajudam a potencializar o resultado, mas não substituem comida de verdade.
        </p>
      </div>

      {SUPPLEMENTS.map((s) => {
        const checked = hydrated && !!checks[s.id];
        return (
          <Card key={s.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-rose-500" />
                    {s.nome}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {s.dose} · <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {s.horario}</span>
                  </CardDescription>
                </div>
                <button
                  onClick={() => handle(s.id)}
                  className="flex flex-col items-center gap-1 text-xs text-zinc-500"
                  aria-label={`Marcar ${s.nome}`}
                >
                  <Checkbox checked={checked} onCheckedChange={() => handle(s.id)} />
                  <span>{checked ? "Tomado" : "Tomar"}</span>
                </button>
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
    </div>
  );
}
