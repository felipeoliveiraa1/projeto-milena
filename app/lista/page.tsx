"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Check,
  Eraser,
  Share2,
  Copy,
  MessageCircle,
  Utensils,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MEALS } from "@/data/meals";
import { SHOPPING_LIST } from "@/data/shopping";
import {
  clearSelectedMeals,
  clearShoppingChecked,
  getShoppingState,
  toggleShoppingItem,
  type ShoppingState,
} from "@/lib/storage";
import { cn } from "@/lib/utils";

type CatalogItem = {
  id: string;
  nome: string;
  quantidade: string;
  categoria: string;
  categoriaId: string;
  icone: string;
  cor: string;
};

const CATALOG: Map<string, CatalogItem> = new Map();
for (const cat of SHOPPING_LIST) {
  for (const item of cat.itens) {
    CATALOG.set(item.id, {
      ...item,
      categoria: cat.nome,
      categoriaId: cat.id,
      icone: cat.icone,
      cor: cat.cor,
    });
  }
}

export default function ListaPage() {
  const [state, setState] = useState<ShoppingState>({ items: {}, selectedMeals: {} });
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getShoppingState().then((s) => {
      setState(s);
      setHydrated(true);
    });
  }, []);

  const selectedMealsList = MEALS.filter((m) => state.selectedMeals[m.id]);

  // Calcula ingredientes únicos das refeições selecionadas
  const grouped = useMemo(() => {
    const ids = new Set<string>();
    for (const m of selectedMealsList) {
      for (const ingId of m.ingredientes) ids.add(ingId);
    }
    const byCategory = new Map<string, CatalogItem[]>();
    for (const id of ids) {
      const item = CATALOG.get(id);
      if (!item) continue;
      if (!byCategory.has(item.categoriaId)) byCategory.set(item.categoriaId, []);
      byCategory.get(item.categoriaId)!.push(item);
    }
    return Array.from(byCategory.entries())
      .map(([catId, items]) => {
        const cat = SHOPPING_LIST.find((c) => c.id === catId)!;
        return {
          categoria: cat,
          itens: items.sort((a, b) => a.nome.localeCompare(b.nome)),
        };
      })
      .sort((a, b) => {
        const order = SHOPPING_LIST.map((c) => c.id);
        return order.indexOf(a.categoria.id) - order.indexOf(b.categoria.id);
      });
  }, [selectedMealsList]);

  const totalIngredientes = grouped.reduce((s, g) => s + g.itens.length, 0);
  const comprados = hydrated ? Object.values(state.items).filter(Boolean).length : 0;
  const restantes = totalIngredientes - comprados;
  const pct = totalIngredientes > 0 ? Math.round((comprados / totalIngredientes) * 100) : 0;

  async function handleToggle(id: string) {
    setState((prev) => ({ ...prev, items: { ...prev.items, [id]: !prev.items[id] } }));
    const next = await toggleShoppingItem(id);
    setState(next);
  }

  function buildShareText(onlyNotBought = true): string {
    const lines: string[] = ["🛒 *Lista de compras*", ""];
    let total = 0;
    for (const g of grouped) {
      const items = onlyNotBought ? g.itens.filter((i) => !state.items[i.id]) : g.itens;
      if (items.length === 0) continue;
      lines.push(`${g.categoria.icone} *${g.categoria.nome}*`);
      for (const it of items) {
        lines.push(`• ${it.nome} — ${it.quantidade}`);
        total++;
      }
      lines.push("");
    }
    if (total === 0) {
      return "🛒 Lista de compras: tudo já comprado! 🎉";
    }
    lines.push(`_Total: ${total} ${total === 1 ? "item" : "itens"}_`);
    return lines.join("\n");
  }

  async function compartilhar() {
    const text = buildShareText(true);
    if (typeof navigator !== "undefined" && (navigator as Navigator).share) {
      try {
        await (navigator as Navigator).share({ title: "Lista de compras", text });
        return;
      } catch {
        // usuário cancelou ou erro → cai pro clipboard
      }
    }
    await copiar(text);
  }

  async function copiar(textOverride?: string) {
    const text = textOverride ?? buildShareText(true);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Não consegui copiar. Tente de novo ou use o botão Compartilhar.");
    }
  }

  function enviarWhatsApp() {
    const text = buildShareText(true);
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  async function limparTudo() {
    if (!confirm("Limpar tudo? Vai desmarcar refeições selecionadas e itens já comprados.")) return;
    setState(await clearSelectedMeals());
  }

  async function limparComprados() {
    if (!confirm("Desmarcar todos os itens como 'não comprados'?")) return;
    setState(await clearShoppingChecked());
  }

  if (!hydrated) {
    return (
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-rose-500">Mercado</p>
          <h2 className="text-2xl font-bold text-zinc-900">Lista de compras</h2>
          <p className="mt-1 text-sm text-zinc-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-500">Mercado</p>
        <h2 className="text-2xl font-bold text-zinc-900">Lista de compras</h2>
        <p className="mt-1 text-sm text-zinc-600">
          A lista é montada automaticamente a partir das <strong>refeições marcadas</strong> em /dieta.
          Marque o que já comprou e compartilhe a lista do que falta.
        </p>
      </div>

      {selectedMealsList.length === 0 ? (
        <Card className="border-rose-200 bg-rose-50/40">
          <CardContent className="space-y-3 p-6 text-center">
            <Utensils className="mx-auto h-12 w-12 text-rose-300" />
            <p className="font-semibold text-zinc-900">Nenhuma refeição selecionada ainda</p>
            <p className="text-sm text-zinc-600">
              Vai em <strong>/dieta</strong> e clica em <strong>+ Lista</strong> em cada refeição
              que quiser preparar. Os ingredientes aparecem aqui automaticamente.
            </p>
            <Button asChild>
              <Link href="/dieta">Escolher refeições</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-emerald-200 bg-linear-to-br from-emerald-50 to-rose-50">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-emerald-700">Progresso</p>
                  <p className="text-2xl font-bold text-zinc-900">
                    {comprados}
                    <span className="text-base font-medium text-zinc-500">
                      {" "}
                      / {totalIngredientes} itens
                    </span>
                  </p>
                  <p className="text-xs text-zinc-600">{restantes} faltam comprar</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="outline" onClick={limparComprados} disabled={comprados === 0}>
                    <Eraser className="h-4 w-4" /> Desmarcar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={limparTudo}>
                    Limpar tudo
                  </Button>
                </div>
              </div>
              <Progress value={pct} indicatorClassName="bg-emerald-500" />
            </CardContent>
          </Card>

          <Card className="border-rose-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-rose-700">
                <Share2 className="h-5 w-5" /> Compartilhar com o Felipe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-zinc-600">
                Envia só os itens que ainda <strong>não foram comprados</strong>.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={enviarWhatsApp} className="bg-emerald-500 hover:bg-emerald-600">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </Button>
                <Button onClick={compartilhar} variant="outline">
                  <Share2 className="h-4 w-4" /> Compartilhar
                </Button>
                <Button onClick={() => copiar()} variant="ghost">
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-500" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> Copiar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-rose-500" /> Refeições selecionadas
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {selectedMealsList.map((m) => (
                <span
                  key={m.id}
                  className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-800"
                >
                  {m.nome}
                </span>
              ))}
            </CardContent>
          </Card>

          {grouped.map(({ categoria, itens }) => {
            const doneCat = itens.filter((i) => state.items[i.id]).length;
            return (
              <Card key={categoria.id} className={cn("bg-linear-to-br border-2", categoria.cor)}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <span className="text-xl">{categoria.icone}</span>
                      <span>{categoria.nome}</span>
                    </span>
                    <span className="text-xs font-semibold text-zinc-600">
                      {doneCat}/{itens.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {itens.map((item) => {
                    const checked = !!state.items[item.id];
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleToggle(item.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-2xl border bg-white/80 p-3 text-left transition active:scale-[0.99]",
                          checked
                            ? "border-emerald-200 bg-emerald-50/60"
                            : "border-zinc-100 hover:bg-white",
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => handleToggle(item.id)}
                        />
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
        </>
      )}

      <Card className="border-sky-200 bg-sky-50/50">
        <CardContent className="space-y-2 p-4 text-sm text-sky-900">
          <p className="flex items-center gap-2 font-semibold">
            <ShoppingCart className="h-4 w-4" /> Dicas do médico
          </p>
          <ul className="ml-4 list-disc space-y-1 text-xs text-zinc-700">
            <li>Prefira <strong>feira/sacolão</strong> ao supermercado.</li>
            <li>Evite enlatados, embutidos, congelados prontos e tudo com farinha branca / açúcar.</li>
            <li>Leia o rótulo: quanto menos ingredientes, melhor.</li>
            <li>Quanto mais cores no carrinho, melhor a refeição.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
