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

/* Cores do sistema — mantidas em sincronia com app/globals.css. */
const COR = {
  linha: "#14503f",
  meta: "#c0623a",
  grade: "#e9dfd2",
  texto: "#8b7f72",
  superficie: "#ffffff",
};

export function WeightChart({
  entries,
  pesoInicial,
  meta,
}: {
  entries: WeightEntry[];
  pesoInicial: number;
  meta: number;
}) {
  const data = useMemo(() => {
    const first: { date: string; weight: number }[] = [];
    if (entries.length === 0 || entries[0].weight !== pesoInicial) {
      first.push({ date: "Início", weight: pesoInicial });
    }
    return [
      ...first,
      ...entries.map((e) => ({
        date: dataCurta(new Date(e.date + "T00:00:00")),
        weight: e.weight,
      })),
    ];
  }, [entries, pesoInicial]);

  if (data.length < 2) {
    return (
      <div className="rounded-xl2 border border-line bg-bone/50 p-8 text-center text-sm text-ink-muted">
        Registre pelo menos 2 pesos para ver o gráfico.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 6" stroke={COR.grade} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: COR.texto }}
            axisLine={{ stroke: COR.grade }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: COR.texto }}
            axisLine={false}
            tickLine={false}
            domain={[meta - 2, "dataMax + 2"]}
          />
          <Tooltip
            cursor={{ stroke: COR.grade }}
            contentStyle={{
              borderRadius: 14,
              border: `1px solid ${COR.grade}`,
              background: COR.superficie,
              fontSize: 12,
              boxShadow: "0 12px 28px -18px rgba(25,21,18,0.4)",
            }}
            labelStyle={{ color: COR.texto, fontWeight: 600 }}
            formatter={(value) => [`${Number(value).toFixed(1).replace(".", ",")} kg`, "Peso"]}
          />
          <ReferenceLine
            y={meta}
            stroke={COR.meta}
            strokeDasharray="4 4"
            label={{
              value: `Meta ${meta} kg`,
              fontSize: 10,
              fontWeight: 700,
              fill: COR.meta,
              // dentro do gráfico: em "right" o rótulo era cortado na borda
              position: "insideTopRight",
            }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke={COR.linha}
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: COR.linha, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: COR.linha, stroke: COR.superficie, strokeWidth: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
