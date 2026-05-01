import { Apple, Ban, Clock, Replace } from "lucide-react";
import { ALIMENTOS_EVITAR, MEALS, SUBSTITUICOES_GERAIS, TOTAL_MACROS } from "@/data/meals";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function DietaPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-500">Plano alimentar</p>
        <h2 className="text-2xl font-bold text-zinc-900">Sua dieta completa</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Foco em emagrecer com saúde, ganhar massa magra e definir braços/abdômen — respeitando
          pós-parto, fígado gorduroso e pressão.
        </p>
      </div>

      <Card className="bg-linear-to-br from-emerald-50 to-rose-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-800">Total do dia</CardTitle>
          <CardDescription>Distribuídos nas 6–7 refeições abaixo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3 text-center">
            <Macro label="Kcal" value={TOTAL_MACROS.kcal.toString()} unit="" />
            <Macro label="Proteína" value={TOTAL_MACROS.proteina.toString()} unit="g" />
            <Macro label="Carbo" value={TOTAL_MACROS.carbo.toString()} unit="g" />
            <Macro label="Gordura" value={TOTAL_MACROS.gordura.toString()} unit="g" />
          </div>
        </CardContent>
      </Card>

      {MEALS.map((meal) => (
        <Card key={meal.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Apple className="h-5 w-5 text-rose-500" />
              {meal.nome}
            </CardTitle>
            <p className="flex items-center gap-1 text-xs text-zinc-500">
              <Clock className="h-3 w-3" />
              {meal.hora} · {meal.macros.kcal} kcal · P {meal.macros.proteina}g · C {meal.macros.carbo}g · G {meal.macros.gordura}g
            </p>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ul className="list-inside list-disc space-y-1 text-zinc-800">
              {meal.alimentos.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
              <strong className="block text-amber-700">Por que comer:</strong>
              {meal.porQue}
            </div>
            {meal.substituicoes && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
                  Substituições com quantidade certa
                </p>
                <div className="space-y-2">
                  {meal.substituicoes.map((s, i) => (
                    <div
                      key={`${s.trocar}-${s.por}-${i}`}
                      className="rounded-xl bg-rose-50 p-3"
                    >
                      <p className="text-sm font-semibold text-rose-900">
                        {s.trocar} → {s.por}
                      </p>
                      <p className="mt-0.5 text-xs text-rose-700">{s.quantidade}</p>
                      <p className="mt-1 text-[11px] text-zinc-600">
                        {s.macros.kcal} kcal · P {s.macros.proteina}g · C {s.macros.carbo}g · G {s.macros.gordura}g
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Replace className="h-5 w-5 text-rose-500" /> Substituições gerais
          </CardTitle>
          <CardDescription>
            Tabela de equivalência com porção e macros — use para variar sem perder o equilíbrio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 text-sm">
          {SUBSTITUICOES_GERAIS.map((g) => (
            <div key={g.grupo} className="space-y-2">
              <div>
                <p className="font-semibold text-zinc-900">{g.grupo}</p>
                {g.nota && <p className="text-xs text-zinc-500">{g.nota}</p>}
              </div>
              <div className="overflow-x-auto rounded-xl border border-rose-100">
                <table className="w-full text-xs">
                  <thead className="bg-rose-50 text-rose-700">
                    <tr>
                      <th className="px-2 py-2 text-left font-semibold">Alimento</th>
                      <th className="px-2 py-2 text-left font-semibold">Porção</th>
                      <th className="px-2 py-2 text-right font-semibold">kcal</th>
                      <th className="px-2 py-2 text-right font-semibold">P</th>
                      <th className="px-2 py-2 text-right font-semibold">C</th>
                      <th className="px-2 py-2 text-right font-semibold">G</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-50">
                    {g.opcoes.map((o) => (
                      <tr key={o.nome}>
                        <td className="px-2 py-2 font-medium text-zinc-800">{o.nome}</td>
                        <td className="px-2 py-2 text-zinc-600">{o.quantidade}</td>
                        <td className="px-2 py-2 text-right text-zinc-700">{o.macros.kcal}</td>
                        <td className="px-2 py-2 text-right text-zinc-700">{o.macros.proteina}</td>
                        <td className="px-2 py-2 text-right text-zinc-700">{o.macros.carbo}</td>
                        <td className="px-2 py-2 text-right text-zinc-700">{o.macros.gordura}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Ban className="h-5 w-5" /> Evitar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-1 text-sm text-zinc-700">
            {ALIMENTOS_EVITAR.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function Macro({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-2xl bg-white/80 p-3">
      <p className="text-2xl font-bold text-zinc-900">
        {value}
        <span className="text-xs font-medium text-zinc-500">{unit}</span>
      </p>
      <p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
    </div>
  );
}
