"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Check, Eraser } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { SHOPPING_LIST, TOTAL_ITENS } from "@/data/shopping";
import { clearShoppingChecked, getShopping, toggleShoppingItem } from "@/lib/storage";
import { cn } from "@/lib/utils";

export default function ListaPage() {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    getShopping().then((c) => {
      setChecks(c);
      setHydrated(true);
    });
  }, []);

  async function handle(id: string) {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
    const next = await toggleShoppingItem(id);
    setChecks(next);
  }

  async function clear() {
    if (!confirm("Limpar TODOS os itens marcados? Isso desfaz os checks da lista inteira.")) return;
    setChecks({});
    setChecks(await clearShoppingChecked());
  }

  const marcados = hydrated ? Object.values(checks).filter(Boolean).length : 0;
  const pct = Math.round((marcados / TOTAL_ITENS) * 100);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-500">
          Mercado
        </p>
        <h2 className="text-2xl font-bold text-zinc-900">Lista de compras</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Médico recomenda comprar na <strong>feira/sacolão</strong> sempre que der. Itens divididos
          por categoria — vai marcando enquanto faz o mercado.
        </p>
      </div>

      <Card className="border-emerald-200 bg-linear-to-br from-emerald-50 to-rose-50">
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-emerald-700">Progresso</p>
              <p className="text-2xl font-bold text-zinc-900">
                {marcados}
                <span className="text-base font-medium text-zinc-500">
                  {" "}
                  / {TOTAL_ITENS} itens
                </span>
              </p>
            </div>
            <Button onClick={clear} variant="outline" size="sm" disabled={marcados === 0}>
              <Eraser className="h-4 w-4" /> Limpar
            </Button>
          </div>
          <Progress value={pct} indicatorClassName="bg-emerald-500" />
        </CardContent>
      </Card>

      {SHOPPING_LIST.map((cat) => {
        const totalCat = cat.itens.length;
        const doneCat = cat.itens.filter((i) => hydrated && !!checks[i.id]).length;
        return (
          <Card key={cat.id} className={cn("bg-linear-to-br border-2", cat.cor)}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <span className="text-xl">{cat.icone}</span>
                  <span>{cat.nome}</span>
                </span>
                <span className="text-xs font-semibold text-zinc-600">
                  {doneCat}/{totalCat}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {cat.itens.map((item) => {
                const checked = hydrated && !!checks[item.id];
                return (
                  <button
                    key={item.id}
                    onClick={() => handle(item.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border bg-white/80 p-3 text-left transition active:scale-[0.99]",
                      checked
                        ? "border-emerald-200 bg-emerald-50/60"
                        : "border-zinc-100 hover:bg-white",
                    )}
                  >
                    <Checkbox checked={checked} onCheckedChange={() => handle(item.id)} />
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "font-medium",
                          checked ? "text-zinc-400 line-through" : "text-zinc-900",
                        )}
                      >
                        {item.nome}
                      </p>
                      <p className="text-xs text-zinc-500">{item.quantidade}</p>
                    </div>
                    {checked && <Check className="h-5 w-5 shrink-0 text-emerald-500" />}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      <Card className="border-sky-200 bg-sky-50/50">
        <CardContent className="space-y-2 p-4 text-sm text-sky-900">
          <p className="flex items-center gap-2 font-semibold">
            <ShoppingCart className="h-4 w-4" /> Dicas do médico
          </p>
          <ul className="ml-4 list-disc space-y-1 text-xs text-zinc-700">
            <li>Prefira FEIRA/SACOLÃO ao supermercado quando possível.</li>
            <li>Evite enlatados, embutidos, congelados prontos e tudo com farinha branca / açúcar.</li>
            <li>Leia o rótulo: quanto MENOS ingredientes, melhor.</li>
            <li>Quanto mais cores no carrinho (vermelho, verde, laranja), melhor.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
