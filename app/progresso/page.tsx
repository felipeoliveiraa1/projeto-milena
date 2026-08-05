"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, HeartPulse, Plus, Ruler, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Eyebrow,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WeightChart } from "@/components/weight-chart";
import { addWeight, getWeights, removeWeight, type WeightEntry } from "@/lib/storage";
import { todayKey, dataCurta } from "@/lib/date";
import { PROTOCOLO } from "@/data/protocol";
import { useProtocolo } from "@/lib/protocol";

const PESO_INICIAL = 84;
const META = 70;

export default function ProgressoPage() {
  const [list, setList] = useState<WeightEntry[]>([]);
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(todayKey());
  const [hydrated, setHydrated] = useState(false);
  const status = useProtocolo();

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

  const ultimo = list.at(-1)?.weight ?? PESO_INICIAL;
  const primeiro = list[0]?.weight ?? PESO_INICIAL;
  const variacao = ultimo - primeiro;
  const faltam = Math.max(0, ultimo - META);

  return (
    <div className="stagger space-y-5">
      <header>
        <Eyebrow className="text-ink-muted">Progresso</Eyebrow>
        <h2 className="font-display mt-2 text-4xl leading-none text-ink">Sua jornada</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Pese 1 a 2 vezes por semana, sempre no mesmo horário: de manhã, em jejum, depois do
          banheiro.
        </p>
      </header>

      <Card className="border-brand-deep bg-brand-deep text-bone">
        <CardContent className="p-6">
          <Eyebrow className="text-bone/50">Peso de hoje</Eyebrow>
          <p className="font-display mt-2 text-6xl leading-none text-bone tabular">
            {ultimo.toFixed(1).replace(".", ",")}
            <span className="text-2xl text-bone/60"> kg</span>
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <Stat rotulo="Variação" valor={
              hydrated ? `${variacao > 0 ? "+" : ""}${variacao.toFixed(1).replace(".", ",")} kg` : "—"
            } />
            <Stat rotulo="Faltam" valor={`${faltam.toFixed(1).replace(".", ",")} kg`} />
            <Stat rotulo="Meta" valor={`${META} kg`} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Eyebrow className="text-plum">{PROTOCOLO.nome}</Eyebrow>
          <CardTitle className="mt-1.5 flex items-center gap-2">
            <Camera className="h-4.5 w-4.5 text-plum" /> Marcos do protocolo
          </CardTitle>
          <CardDescription>
            {status && !status.naoComecou && !status.concluido
              ? `Você está no dia ${status.dia} de ${status.total}.`
              : "O resultado se mede por foto, medidas e peso — não só pela balança."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Marco icone={<Camera className="h-4 w-4" />}>
            <strong className="text-ink">Foto de frente, lado e costas</strong> no dia 1 e no dia{" "}
            {PROTOCOLO.duracaoDias}, mesma roupa e mesma luz.
          </Marco>
          <Marco icone={<Ruler className="h-4 w-4" />}>
            <strong className="text-ink">Medidas</strong> de cintura, abdômen, quadril e braço — a
            fita costuma mudar antes da balança.
          </Marco>
          <Marco icone={<HeartPulse className="h-4 w-4" />}>
            <strong className="text-ink">Sintomas e evacuação</strong> ficam no checklist diário, na{" "}
            <Link href="/rotina" className="font-semibold text-plum underline underline-offset-2">
              aba Rotina
            </Link>
            .
          </Marco>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Eyebrow className="text-ink-muted">Evolução</Eyebrow>
          <CardTitle className="mt-1.5">Gráfico</CardTitle>
          <CardDescription>Linha escura = você · linha tracejada = meta</CardDescription>
        </CardHeader>
        <CardContent>
          <WeightChart entries={list} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Eyebrow className="text-ink-muted">Balança</Eyebrow>
          <CardTitle className="mt-1.5">Registrar peso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <p className="text-sm text-ink-muted">Nenhum registro ainda.</p>
          )}

          <ul className="divide-y divide-line">
            {[...list].reverse().map((e) => (
              <li key={e.date} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-bold text-ink tabular">
                    {e.weight.toFixed(1).replace(".", ",")} kg
                  </p>
                  <p className="text-xs text-ink-muted tabular">
                    {dataCurta(new Date(e.date + "T00:00:00"))}
                  </p>
                </div>
                <button
                  onClick={() => del(e.date)}
                  className="rounded-full p-2.5 text-ink-muted transition hover:bg-danger-soft hover:text-danger"
                  aria-label={`Remover registro de ${dataCurta(new Date(e.date + "T00:00:00"))}`}
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

function Stat({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-2xl bg-bone/10 px-3 py-2.5">
      <p className="text-[0.625rem] tracking-wide text-bone/50 uppercase">{rotulo}</p>
      <p className="mt-0.5 text-sm font-bold text-bone tabular">{valor}</p>
    </div>
  );
}

function Marco({ icone, children }: { icone: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl2 border border-line bg-bone/40 p-3.5">
      <span className="mt-0.5 shrink-0 text-plum">{icone}</span>
      <p className="text-sm leading-relaxed text-ink-muted">{children}</p>
    </div>
  );
}
