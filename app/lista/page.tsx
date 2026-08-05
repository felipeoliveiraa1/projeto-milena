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
  Snowflake,
  Utensils,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Eyebrow,
} from "@/components/ui/card";
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
  congelar: "text-brand-mid",
  refrigerar: "text-brand",
  hora: "text-clay",
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

  /** Quais dias do cardápio entraram na lista. */
  const dias = useMemo(
    () =>
      CARDAPIO.filter((d) =>
        d.refeicoes.some((r) => r.itens.some((i) => state.selectedComponents[i.id])),
      ).map((d) => d.dia),
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

    const byCategory = new Map<string, NonNullable<ReturnType<typeof CATALOGO.get>>[]>();
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
        itens: itens.sort((a, b) => a.nome.localeCompare(b.nome)),
      }))
      .sort((a, b) => ordem.indexOf(a.categoria.id) - ordem.indexOf(b.categoria.id));
  }, [state.selectedComponents]);

  const totalIngredientes = grouped.reduce((s, g) => s + g.itens.length, 0);
  const comprados = grouped.reduce(
    (s, g) => s + g.itens.filter((i) => state.items[i.id]).length,
    0,
  );
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
    <div className="stagger space-y-5">
      <header>
        <Eyebrow className="text-brand">Mercado e cozinha</Eyebrow>
        <h2 className="font-display mt-2 text-4xl leading-none text-ink">Lista e preparo</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          A lista sai do que você marcou na dieta. O preparo diz o que congelar, o que só
          refrigerar e o que fazer na hora.
        </p>
      </header>

      <Tabs defaultValue="compras" className="w-full">
        <TabsList>
          <TabsTrigger value="compras" className="flex-1">
            Compras
          </TabsTrigger>
          <TabsTrigger value="preparo" className="flex-1">
            Preparo
          </TabsTrigger>
        </TabsList>

        {/* ---------------------------------------------------------------- */}
        <TabsContent value="compras" className="space-y-5">
          {!hydrated ? (
            <p className="text-sm text-ink-muted">Carregando...</p>
          ) : totalIngredientes === 0 ? (
            <Card>
              <CardContent className="space-y-4 p-8 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-bone-deep text-ink-muted">
                  <Utensils className="h-6 w-6" />
                </span>
                <p className="font-display text-2xl text-ink">Lista vazia</p>
                <p className="text-sm leading-relaxed text-ink-muted">
                  Escolha os dias na aba Dieta — dá para marcar a semana inteira de uma vez — e os
                  ingredientes aparecem aqui.
                </p>
                <Button asChild>
                  <Link href="/dieta">Escolher os dias</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <Eyebrow className="text-ink-muted">Progresso</Eyebrow>
                      <p className="font-display mt-1 text-4xl leading-none text-ink tabular">
                        {comprados}
                        <span className="text-xl text-ink-muted">/{totalIngredientes}</span>
                      </p>
                      <p className="mt-1 text-xs text-ink-muted">
                        {totalIngredientes - comprados} faltam comprar
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          if (!confirm("Desmarcar todos os 'já comprados'?")) return;
                          setState(await clearShoppingChecked());
                        }}
                        disabled={comprados === 0}
                      >
                        <Eraser className="h-3.5 w-3.5" /> Desmarcar
                      </Button>
                    </div>
                  </div>
                  <Progress value={pct} />
                  {dias.length > 0 && (
                    <p className="text-xs text-ink-muted">
                      Dias no carrinho: <strong className="text-ink">{dias.join(", ")}</strong>
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 border-t border-line pt-4">
                    <Button
                      onClick={() =>
                        window.open(
                          `https://wa.me/?text=${encodeURIComponent(buildShareText())}`,
                          "_blank",
                        )
                      }
                    >
                      <MessageCircle className="h-4 w-4" /> WhatsApp
                    </Button>
                    <Button onClick={compartilhar} variant="outline">
                      <Share2 className="h-4 w-4" /> Compartilhar
                    </Button>
                    <Button onClick={() => copiar()} variant="ghost">
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-brand" /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" /> Copiar
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-ink-muted"
                      onClick={async () => {
                        if (!confirm("Limpar tudo? Desmarca os dias escolhidos e os comprados."))
                          return;
                        setState(await clearSelectedComponents());
                      }}
                    >
                      Limpar tudo
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {grouped.map(({ categoria, itens }) => {
                const feitos = itens.filter((i) => state.items[i.id]).length;
                const completa = feitos === itens.length;
                return (
                  <Card key={categoria.id} className={cn(completa && "opacity-60")}>
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="flex items-center gap-2.5">
                          <span className="text-lg">{categoria.icone}</span>
                          {categoria.nome}
                        </CardTitle>
                        <span className="shrink-0 text-sm font-bold text-ink tabular">
                          {feitos}
                          <span className="text-ink-muted">/{itens.length}</span>
                        </span>
                      </div>
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
                          >
                            <p
                              className={cn(
                                "text-sm font-semibold",
                                checked ? "text-ink-muted line-through" : "text-ink",
                              )}
                            >
                              {item.nome}
                            </p>
                            <p className="text-xs text-ink-muted">{item.quantidade}</p>
                            {item.nota && (
                              <p className="mt-1.5 rounded-lg bg-gold-soft px-2.5 py-1.5 text-[0.6875rem] leading-relaxed text-gold">
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

          <Card className="bg-bone-deep/40">
            <CardContent className="space-y-2.5 p-5">
              <Eyebrow className="text-ink-soft">Na hora de comprar</Eyebrow>
              <ul className="space-y-1.5 text-xs leading-relaxed text-ink-soft">
                <li>Feira e sacolão antes do supermercado.</li>
                <li>Rótulo curto: se tem muita coisa escrita, não vai pro carrinho.</li>
                <li>
                  Aveia só com selo <strong>sem glúten</strong>.
                </li>
                <li>Atum em óleo, nunca ao molho de tomate — e escorra todo o óleo.</li>
                <li>Quanto mais cor no carrinho, melhor o prato.</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------------------- */}
        <TabsContent value="preparo" className="space-y-5">
          <Card className="border-brand/20 bg-brand-soft/40">
            <CardHeader>
              <Eyebrow className="text-brand">Estratégia</Eyebrow>
              <CardTitle className="mt-1.5">{ESTRATEGIA.titulo}</CardTitle>
              <CardDescription className="text-ink-soft">{ESTRATEGIA.texto}</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2.5">
                {ESTRATEGIA.passos.map((p, i) => (
                  <li key={p} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-[0.6875rem] font-bold text-bone">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-ink-soft">{p}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {PREPARO.map((grupo) => {
            const Icone = ICONE_PREPARO[grupo.icone];
            return (
              <Card key={grupo.id}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2">
                      <Icone className={cn("h-4.5 w-4.5", COR_PREPARO[grupo.id])} />
                      {grupo.titulo}
                    </CardTitle>
                    <span className="shrink-0 text-sm font-bold text-ink-muted tabular">
                      {grupo.itens.length}
                    </span>
                  </div>
                  <CardDescription>{grupo.descricao}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {grupo.itens.map((it) => (
                    <div
                      key={it.id}
                      className="rounded-xl2 border border-line bg-bone/40 p-3.5"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-ink">{it.nome}</p>
                        {it.validade && (
                          <span className="rounded-full bg-line-soft px-2 py-0.5 text-[0.625rem] font-bold text-ink-muted">
                            {it.validade}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-ink-muted">{it.como}</p>
                      {it.alerta && (
                        <p className="mt-2 rounded-lg bg-gold-soft px-2.5 py-1.5 text-[0.6875rem] leading-relaxed text-gold">
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
