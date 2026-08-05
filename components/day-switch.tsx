"use client";

import { useState } from "react";
import { CalendarDays, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDia } from "@/components/day-context";
import { todayKey, dataExtenso } from "@/lib/date";

/** Troca o dia que está sendo preenchido — serve para lançar dias anteriores. */
export function DaySwitch() {
  const { data, ehHoje, definir, voltarParaHoje } = useDia();
  const [aberto, setAberto] = useState(false);

  if (!ehHoje) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-xl2 border border-clay/30 bg-clay-soft px-4 py-3">
        <CalendarDays className="h-4 w-4 shrink-0 text-clay-deep" />
        <p className="flex-1 text-xs font-semibold text-clay-deep">
          Preenchendo {dataExtenso(new Date(data + "T00:00:00"))} — tudo que marcar vai para
          este dia.
        </p>
        <Button size="sm" variant="outline" onClick={voltarParaHoje}>
          <X className="h-3.5 w-3.5" /> Voltar para hoje
        </Button>
      </div>
    );
  }

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted transition hover:text-ink"
      >
        <CalendarDays className="h-3.5 w-3.5" />
        Lançar um dia anterior
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        type="date"
        max={todayKey()}
        defaultValue={data}
        onChange={(e) => {
          if (e.target.value) {
            definir(e.target.value);
            setAberto(false);
          }
        }}
        className="max-w-45"
      />
      <Button size="sm" variant="ghost" onClick={() => setAberto(false)}>
        Cancelar
      </Button>
    </div>
  );
}
