"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  Eraser,
  Flame,
  MessageCircle,
  Refrigerator,
  Share2,
  ShoppingCart,
  Snowflake,
  Utensils,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckRow } from "@/components/check-row";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CARDAPIO } from "@/data/meals";
import { CATALOGO, ESSENCIAIS, SHOPPING_LIST } from "@/data/shopping";
import { ESTRATEGIA, PREPARO } from "@/data/prep";
import {
  clearSelectedComponents,
  clearShoppingChecked,
  getShoppingState,
  toggleShoppingItem,
  type ShoppingState,
} from "@/lib/storage";
import { cn } from "@/lib/utils";

const ICONE_PREPARO = { snow: Snowflake, fridge: Refrigerator, flame: Flame };

const COR_PREPARO = {
  congelar: "border-sky-200 bg-linear-to-br from-sky-50 to-white",
  refrigerar: "border-emerald-200 bg-linear-to-br from-emerald-50 to-white",
  hora: "border-orange-200 bg-linear-to-br from-orange-50 to-white",
};

export default function ListaPage() {
  const [state, setState] = useState<ShoppingState>({ items: {}, selectedComponents: {} });
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getShoppingState().then((s) => {
      setState(s);
      setHydrated(true);
    });
  }, []);

  /** Quantos itens do cardápio ela marcou em cada dia. */
  const porDia = useMemo(
    () =>
      CARDAPIO.map((d) => {
        const ids = d.refeicoes.flatMap((r) => r.itens.map((i) => i.id));
        return { dia: d.dia, total: ids.length, marcados: ids.filter((i) => state.selectedComponents[i]).length };
      }).filter((d) => d.marcados > 0),
    [state.selectedComponents],
  );

  /** Ingredientes únicos dos itens marcados + os essenciais de despensa. */
  const grouped = useMemo(() => {
    const ids = new Set<string>();
    let temSelecao = false;
    for (const dia of CARDAPIO) {
      for (const refeicao of dia.refeicoes) {
        for (const it of refeicao.itens) {
          if (state.selectedComponents[it.id]) {
            temSelecao = true;
            it.ingredientes.forEach((i) => ids.add(i));
          }
        }
      }
    }
    if (temSelecao) ESSENCIAIS.forEach((i) => ids.add(i));

    const byCategory = new Map<string, ReturnType<typeof CATALOGO.get>[]>();
    for (const id of ids) {
      const item = CATALOGO.get(id);
      if (!item) continue;
      if (!byCategory.has(item.categoriaId)) byCategory.set(item.categoriaId, []);
      byCategory.get(item.categoriaId)!.push(item);
    }
    const ordem = SHOPPING_LIST.map((c) => c.id);
    return Array.from(byCategory.entries())
      .map(([catId, itens]) => ({
        categoria: SHOPPING_LIST.find((c) => c.id === catId)!,
        itens: itens
          .filter((i): i is NonNullable<typeof i> => Boolean(i))
          .sort((a, b) => a.nome.localeCompare(b.nome)),
      }))
      .sort((a, b) => ordem.indexOf(a.categoria.id) - ordem.indexOf(b.categoria.id));
  }, [state.selectedComponents]);

  const totalIngredientes = grouped.reduce((s, g) => s + g.itens.length, 0);
  const comprados = grouped.reduce(
    (s, g) => s + g.itens.filter((i) => state.items[i.id]).length,
    0,
  );
  const restantes = totalIngredientes - comprados;
  const pct = totalIngredientes > 0 ? Math.round((comprados / totalIngredientes) * 100) : 0;

  async function handleToggle(id: string) {
    setState((prev) => ({ ...prev, items: { ...prev.items, [id]: !prev.items[id] } }));
    setState(await toggleShoppingItem(id));
  }

  function buildShareText(): string {
    const lines: string[] = ["🛒 *Lista de compras — Desinflama-se*", ""];
    let total = 0;
    for (const g of grouped) {
      const itens = g.itens.filter((i) => !state.items[i.id]);
      if (itens.length === 0) continue;
      lines.push(`${g.categoria.icone} *${g.categoria.nome}*`);
      for (const it of itens) {
        lines.push(`• ${it.nome} — ${it.quantidade}`);
        total++;
      }
      lines.push("");
    }
    if (total === 0) return "🛒 Lista de compras: tudo já comprado! 🎉";
    lines.push(`_Total: ${total} ${total === 1 ? "item" : "itens"}_`);
    return lines.join("\n");
  }

  async function copiar(texto?: string) {
    const text = texto ?? buildShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Não consegui copiar. Tente o botão Compartilhar.");
    }
  }

  async function compartilhar() {
    const text = buildShareText();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Lista de compras", text });
        return;
      } catch {
        // cancelado — cai pro clipboard
      }
    }
    await copiar(text);
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-500">Mercado e cozinha</p>
        <h2 className="text-2xl font-bold text-zinc-900">Lista e preparo</h2>
        <p className="mt-1 text-sm text-zinc-600">
          A lista sai do que você marcou em <strong>/dieta</strong>. O preparo diz o que congelar,
          o que só refrigerar e o que fazer na hora.
        </p>
      </div>

      <Tabs defaultValue="compras" className="w-full">
        <TabsList>
          <TabsTrigger value="compras">Compras</TabsTrigger>
          <TabsTrigger value="preparo">Preparo</TabsTrigger>
        </TabsList>

        {/* ---------------------------------------------------------------- */}
        <TabsContent value="compras" className="space-y-5">
          {!hydrated ? (
            <p className="text-sm text-zinc-500">Carregando...</p>
          ) : totalIngredientes === 0 ? (
            <Card className="border-rose-200 bg-rose-50/40">
              <CardContent className="space-y-3 p-6 text-center">
                <Utensils className="mx-auto h-12 w-12 text-rose-300" />
                <p className="font-semibold text-zinc-900">Nada selecionado ainda</p>
                <p className="text-sm text-zinc-600">
                  Vá em <strong>/dieta</strong> e marque os dias que você vai fazer. Dá para
                  selecionar a semana inteira de uma vez.
                </p>
                <Button asChild>
                  <Link href="/dieta">Escolher os dias</Link>
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
                          {" "}/ {totalIngredientes} itens
                        </span>
                      </p>
                      <p className="text-xs text-zinc-600">{restantes} faltam comprar</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          if (!confirm("Desmarcar todos os 'já comprados'?")) return;
                          setState(await clearShoppingChecked());
                        }}
                        disabled={comprados === 0}
                      >
                        <Eraser className="h-4 w-4" /> Desmarcar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          if (!confirm("Limpar tudo? Desmarca os dias escolhidos e os comprados."))
                            return;
                          setState(await clearSelectedComponents());
                        }}
                      >
                        Limpar tudo
                      </Button>
                    </div>
                  </div>
                  <Progress value={pct} indicatorClassName="bg-emerald-500" />
                  {porDia.length > 0 && (
                    <p className="text-xs text-emerald-800">
                      Dias no carrinho:{" "}
                      <strong>{porDia.map((d) => d.dia).join(", ")}</strong>
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-rose-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-rose-700">
                    <Share2 className="h-5 w-5" /> Compartilhar
                  </CardTitle>
                  <CardDescription>Envia só o que ainda não foi comprado.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Button
                    onClick={() =>
                      window.open(
                        `https://wa.me/?text=${encodeURIComponent(buildShareText())}`,
                        "_blank",
                      )
                    }
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
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
                </CardContent>
              </Card>

              {grouped.map(({ categoria, itens }) => {
                const feitos = itens.filter((i) => state.items[i.id]).length;
                return (
                  <Card key={categoria.id} className={cn("bg-linear-to-br border-2", categoria.cor)}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2">
                          <span className="text-xl">{categoria.icone}</span>
                          <span>{categoria.nome}</span>
                        </span>
                        <span className="text-xs font-semibold text-zinc-600">
                          {feitos}/{itens.length}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {itens.map((item) => {
                        const checked = !!state.items[item.id];
                        return (
                          <CheckRow
                            key={item.id}
                            checked={checked}
                            onToggle={() => handleToggle(item.id)}
                            label={item.nome}
                            className={cn(
                              "bg-white/80",
                              checked
                                ? "border-emerald-200 bg-emerald-50/60"
                                : "border-zinc-100 hover:bg-white",
                            )}
                          >
                            <p
                              className={cn(
                                "font-medium",
                                checked ? "text-zinc-400 line-through" : "text-zinc-900",
                              )}
                            >
                              {item.nome}
                            </p>
                            <p className="text-xs text-zinc-500">{item.quantidade}</p>
                            {item.nota && (
                              <p className="mt-1 rounded-lg bg-amber-50 px-2 py-1 text-[11px] text-amber-900">
                                {item.nota}
                              </p>
                            )}
                          </CheckRow>
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
                <ShoppingCart className="h-4 w-4" /> Na hora de comprar
              </p>
              <ul className="ml-4 list-disc space-y-1 text-xs text-zinc-700">
                <li>Feira e sacolão antes do supermercado.</li>
                <li>Rótulo curto: se tem muita coisa escrita, não vai pro carrinho.</li>
                <li>Aveia só com selo <strong>sem glúten</strong>.</li>
                <li>Atum em óleo, nunca ao molho de tomate — e escorra todo o óleo.</li>
                <li>Quanto mais cor no carrinho, melhor o prato.</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------------------- */}
        <TabsContent value="preparo" className="space-y-5">
          <Card className="border-violet-200 bg-linear-to-br from-violet-50 to-white">
            <CardHeader>
              <CardTitle className="text-violet-900">{ESTRATEGIA.titulo}</CardTitle>
              <CardDescription>{ESTRATEGIA.texto}</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm">
                {ESTRATEGIA.passos.map((p, i) => (
                  <li key={p} className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500 text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="text-zinc-700">{p}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {PREPARO.map((grupo) => {
            const Icone = ICONE_PREPARO[grupo.icone];
            return (
              <Card key={grupo.id} className={cn("border-2", COR_PREPARO[grupo.id])}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icone className="h-5 w-5 text-zinc-600" />
                    {grupo.titulo}
                    <span className="ml-auto text-xs font-semibold text-zinc-500">
                      {grupo.itens.length}
                    </span>
                  </CardTitle>
                  <CardDescription>{grupo.descricao}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {grupo.itens.map((it) => (
                    <div key={it.id} className="rounded-2xl bg-white/80 p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-zinc-900">{it.nome}</p>
                        {it.validade && (
                          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600">
                            {it.validade}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-zinc-600">{it.como}</p>
                      {it.alerta && (
                        <p className="mt-2 rounded-lg bg-amber-50 px-2 py-1 text-[11px] text-amber-900">
                          {it.alerta}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
