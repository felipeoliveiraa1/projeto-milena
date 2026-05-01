"use client";

import { useEffect, useState } from "react";
import { HeartPulse, Plus, Trash2, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WeightChart } from "@/components/weight-chart";
import { addWeight, getWeights, removeWeight, type WeightEntry } from "@/lib/storage";
import { todayKey, dataCurta } from "@/lib/date";

export default function ProgressoPage() {
  const [list, setList] = useState<WeightEntry[]>([]);
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(todayKey());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    getWeights().then((l) => {
      setList(l);
      setHydrated(true);
    });
  }, []);

  async function save() {
    const w = parseFloat(weight.replace(",", "."));
    if (isNaN(w) || w < 30 || w > 200) return;
    setWeight("");
    setList(await addWeight({ date, weight: w }));
  }

  async function del(d: string) {
    setList(await removeWeight(d));
  }

  const ultimo = list.at(-1)?.weight ?? 84;
  const primeiro = list[0]?.weight ?? 84;
  const variacao = ultimo - primeiro;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-500">Progresso</p>
        <h2 className="text-2xl font-bold text-zinc-900">Sua jornada</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Registre seu peso 1–2x por semana, sempre no mesmo horário (de manhã, em jejum, depois do banheiro).
        </p>
      </div>

      <Card className="bg-linear-to-br from-emerald-50 to-rose-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-800">
            <TrendingDown className="h-5 w-5" /> Resumo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label="Hoje" value={`${ultimo.toFixed(1)} kg`} />
            <Stat
              label="Variação"
              value={hydrated ? `${variacao > 0 ? "+" : ""}${variacao.toFixed(1)} kg` : "—"}
              accent={variacao < 0 ? "text-emerald-600" : "text-zinc-700"}
            />
            <Stat label="Meta" value="70,0 kg" accent="text-emerald-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gráfico</CardTitle>
          <CardDescription>Linha rosa = você · linha verde = meta</CardDescription>
        </CardHeader>
        <CardContent>
          <WeightChart entries={list} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-rose-500" /> Registrar peso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={todayKey()}
            />
            <Input
              inputMode="decimal"
              placeholder="Peso (kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
            <Button onClick={save}>
              <Plus className="h-4 w-4" /> Salvar
            </Button>
          </div>

          {hydrated && list.length === 0 && (
            <p className="text-sm text-zinc-500">Nenhum registro ainda.</p>
          )}

          <ul className="divide-y divide-rose-50">
            {[...list].reverse().map((e) => (
              <li key={e.date} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-zinc-900">{e.weight.toFixed(1)} kg</p>
                  <p className="text-xs text-zinc-500">
                    {dataCurta(new Date(e.date + "T00:00:00"))}
                  </p>
                </div>
                <button
                  onClick={() => del(e.date)}
                  className="rounded-full p-2 text-zinc-400 transition hover:bg-rose-50 hover:text-rose-500"
                  aria-label="Remover"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = "text-zinc-900",
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl bg-white/80 p-3">
      <p className={`text-xl font-bold ${accent}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
    </div>
  );
}
