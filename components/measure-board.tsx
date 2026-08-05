"use client";

import { useEffect, useState } from "react";
import { Plus, Ruler, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Eyebrow } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CAMPOS_MEDIDAS,
  getMedidas,
  removerMedidas,
  salvarMedidas,
  type Medidas,
} from "@/lib/storage";
import { todayKey, dataCurta } from "@/lib/date";
import { cn } from "@/lib/utils";

type Rascunho = Record<string, string>;

export function MeasureBoard() {
  const [lista, setLista] = useState<Medidas[]>([]);
  const [data, setData] = useState(todayKey());
  const [rascunho, setRascunho] = useState<Rascunho>({});
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    getMedidas()
      .then(setLista)
      .finally(() => setCarregando(false));
  }, []);

  function numero(valor: string): number | null {
    const n = parseFloat(valor.replace(",", "."));
    return isNaN(n) ? null : n;
  }

  async function salvar() {
    const registro: Medidas = {
      date: data,
      cintura: numero(rascunho.cintura ?? ""),
      abdomen: numero(rascunho.abdomen ?? ""),
      quadril: numero(rascunho.quadril ?? ""),
      braco: numero(rascunho.braco ?? ""),
      coxa: numero(rascunho.coxa ?? ""),
    };
    const algum = CAMPOS_MEDIDAS.some((c) => registro[c.chave] !== null);
    if (!algum) return;
    setLista(await salvarMedidas(registro));
    setRascunho({});
  }

  const primeira = lista[0];
  const ultima = lista.length > 1 ? lista[lista.length - 1] : undefined;

  return (
    <div className="space-y-5">
      {primeira && ultima && (
        <Card>
          <CardHeader>
            <Eyebrow className="text-brand">Da primeira até a última</Eyebrow>
            <CardTitle className="mt-1.5">Quanto a fita já mudou</CardTitle>
            <CardDescription>
              {dataCurta(new Date(primeira.date + "T00:00:00"))} →{" "}
              {dataCurta(new Date(ultima.date + "T00:00:00"))}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CAMPOS_MEDIDAS.map((c) => {
                const de = primeira[c.chave];
                const para = ultima[c.chave];
                if (de === null || para === null) return null;
                const delta = para - de;
                return (
                  <div key={c.chave} className="rounded-xl2 border border-line bg-bone/50 p-3">
                    <p className="text-[0.625rem] tracking-wide text-ink-muted uppercase">
                      {c.rotulo}
                    </p>
                    <p className="font-display mt-0.5 text-2xl leading-none text-ink tabular">
                      {para.toFixed(1).replace(".", ",")}
                      <span className="text-sm text-ink-muted"> cm</span>
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-xs font-bold tabular",
                        delta < 0 ? "text-brand" : delta > 0 ? "text-clay" : "text-ink-muted",
                      )}
                    >
                      {delta > 0 ? "+" : ""}
                      {delta.toFixed(1).replace(".", ",")} cm
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <Eyebrow className="text-ink-muted">Fita métrica</Eyebrow>
          <CardTitle className="mt-1.5 flex items-center gap-2">
            <Ruler className="h-4.5 w-4.5 text-brand" /> Registrar medidas
          </CardTitle>
          <CardDescription>
            Em centímetros. Meça sempre no mesmo horário, sem apertar a fita.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input type="date" value={data} max={todayKey()} onChange={(e) => setData(e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            {CAMPOS_MEDIDAS.map((c) => (
              <label key={c.chave} className="space-y-1">
                <span className="text-xs font-semibold text-ink-soft">{c.rotulo}</span>
                <Input
                  inputMode="decimal"
                  placeholder="cm"
                  value={rascunho[c.chave] ?? ""}
                  onChange={(e) => setRascunho((r) => ({ ...r, [c.chave]: e.target.value }))}
                />
              </label>
            ))}
          </div>
          <Button onClick={salvar} className="w-full">
            <Plus className="h-4 w-4" /> Salvar medidas
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Eyebrow className="text-ink-muted">Histórico</Eyebrow>
          <CardTitle className="mt-1.5">Registros</CardTitle>
        </CardHeader>
        <CardContent>
          {carregando ? (
            <p className="text-sm text-ink-muted">Carregando...</p>
          ) : lista.length === 0 ? (
            <p className="text-sm text-ink-muted">
              Nenhuma medida ainda. Comece hoje para ter o ponto de partida.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left">
                    <th className="py-2 pr-3 text-xs font-bold text-ink-muted">Data</th>
                    {CAMPOS_MEDIDAS.map((c) => (
                      <th key={c.chave} className="py-2 pr-3 text-xs font-bold text-ink-muted">
                        {c.rotulo}
                      </th>
                    ))}
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {[...lista].reverse().map((m) => (
                    <tr key={m.date} className="border-b border-line-soft last:border-0">
                      <td className="py-2.5 pr-3 text-xs font-semibold text-ink tabular">
                        {dataCurta(new Date(m.date + "T00:00:00"))}
                      </td>
                      {CAMPOS_MEDIDAS.map((c) => (
                        <td key={c.chave} className="py-2.5 pr-3 text-ink-soft tabular">
                          {m[c.chave] === null ? "—" : m[c.chave]!.toFixed(1).replace(".", ",")}
                        </td>
                      ))}
                      <td className="py-2.5 text-right">
                        <button
                          onClick={async () => {
                            if (!confirm("Apagar este registro?")) return;
                            setLista(await removerMedidas(m.date));
                          }}
                          aria-label={`Apagar medidas de ${m.date}`}
                          className="rounded-full p-2 text-ink-muted transition hover:bg-danger-soft hover:text-danger"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
