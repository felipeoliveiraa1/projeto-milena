"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeightEntry } from "@/lib/storage";
import { dataCurta } from "@/lib/date";

const PESO_INICIAL = 84;
const META = 70;

export function WeightChart({ entries }: { entries: WeightEntry[] }) {
  const data = useMemo(() => {
    const first: { date: string; weight: number }[] = [];
    if (entries.length === 0 || entries[0].weight !== PESO_INICIAL) {
      first.push({ date: "Início", weight: PESO_INICIAL });
    }
    return [
      ...first,
      ...entries.map((e) => ({
        date: dataCurta(new Date(e.date + "T00:00:00")),
        weight: e.weight,
      })),
    ];
  }, [entries]);

  if (data.length < 2) {
    return (
      <div className="rounded-2xl bg-rose-50/60 p-6 text-center text-sm text-zinc-500">
        Registre pelo menos 2 pesos para ver o gráfico.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#fde4eb" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#71717a" }} />
          <YAxis
            tick={{ fontSize: 11, fill: "#71717a" }}
            domain={[META - 2, "dataMax + 2"]}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #fecdd3",
              fontSize: 12,
            }}
            formatter={(value) => [`${Number(value).toFixed(1)} kg`, "Peso"]}
          />
          <ReferenceLine
            y={META}
            stroke="#10b981"
            strokeDasharray="4 4"
            label={{ value: "Meta 70 kg", fontSize: 10, fill: "#059669", position: "right" }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#f43f5e"
            strokeWidth={3}
            dot={{ r: 4, fill: "#f43f5e" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
