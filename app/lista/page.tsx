"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  CalendarDays,
  Check,
  Copy,
  Eraser,
  Flame,
  MessageCircle,
  Minus,
  Plus,
  Refrigerator,
  Scale,
  Share2,
  Snowflake,
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
import { REFEICOES_META, REFEICOES_ORDEM, refeicaoDoPlano, type RefeicaoPlanoId } from "@/data/meals";
import {
  CHAVE_DIAS_LISTA,
  DIAS_PADRAO,
  listaDaSemana,
  normalizaDias,
  type DiasDaOpcao1,
} from "@/data/shopping";
import { ESTRATEGIA, PREPARO } from "@/data/prep";
import {
  clearShoppingChecked,
  getShoppingState,
  toggleShoppingItem,
  type ShoppingState,
} from "@/lib/storage";
import { cn, juntarUnidades } from "@/lib/utils";

const ICONE_PREPARO = { snow: Snowflake, fridge: Refrigerator, flame: Flame };

const COR_PREPARO = {
  congelar: "text-brand-mid",
  refrigerar: "text-brand",
  hora: "text-clay",
};

/* -------------------------------------------------------------------------- */
/* Divisão da semana, guardada no aparelho                                    */
/* -------------------------------------------------------------------------- */

// Quantos dias de cada opção é escolha de compra, não registro do dia: fica no
// aparelho (localStorage), como a data de início em lib/protocol.ts. A leitura
// é por useSyncExternalStore: no servidor (e no primeiro render) vale a divisão
// padrão, e o valor do aparelho entra logo depois, sem setState em efeito.
// Se o navegador não deixar gravar (aba anônima, sem espaço), a escolha vale
// até fechar a página — o valor fica na memória.
let diasNaMemoria: string | null = null;
const ouvintesDias = new Set<() => void>();

function lerDiasCru(): string | null {
  if (diasNaMemoria !== null) return diasNaMemoria;
  try {
    return window.localStorage.getItem(CHAVE_DIAS_LISTA);
  } catch {
    return null;
  }
}

function assinarDias(callback: () => void): () => void {
  // Outra aba mudou a divisão: vale o que ela gravou, não a cópia da memória.
  const deOutraAba = (e: StorageEvent) => {
    if (e.key !== CHAVE_DIAS_LISTA) return;
    diasNaMemoria = null;
    callback();
  };
  ouvintesDias.add(callback);
  window.addEventListener("storage", deOutraAba);
  return () => {
    ouvintesDias.delete(callback);
    window.removeEventListener("storage", deOutraAba);
  };
}

function gravarDias(dias: DiasDaOpcao1): void {
  const cru = JSON.stringify(dias);
  diasNaMemoria = cru;
  try {
    window.localStorage.setItem(CHAVE_DIAS_LISTA, cru);
  } catch {
    // sem localStorage — segue com a memória
  }
  ouvintesDias.forEach((l) => l());
}

function useDiasDaLista(): DiasDaOpcao1 {
  const cru = useSyncExternalStore(assinarDias, lerDiasCru, () => null);
  return useMemo(() => {
    if (!cru) return DIAS_PADRAO;
    try {
      return normalizaDias(JSON.parse(cru));
    } catch {
      return DIAS_PADRAO;
    }
  }, [cru]);
}

const diasTexto = (n: number) => `${n} ${n === 1 ? "dia" : "dias"}`;

/** A divisão numa linha, para o cabeçalho da mensagem do WhatsApp. */
function resumoDaDivisao(dias: DiasDaOpcao1): string {
  const valores = REFEICOES_ORDEM.map((id) => dias[id]);
  if (valores.every((n) => n === valores[0])) {
    return `opção 1 em ${diasTexto(valores[0])}, opção 2 em ${diasTexto(7 - valores[0])}`;
  }
  const curto: Record<RefeicaoPlanoId, string> = { cafe: "café", almoco: "almoço", lanche: "lanche" };
  return `opção 1 — ${REFEICOES_ORDEM.map((id) => `${curto[id]} ${diasTexto(dias[id])}`).join(", ")}`;
}

/* -------------------------------------------------------------------------- */
/* Página                                                                     */
/* -------------------------------------------------------------------------- */

export default function ListaPage() {
  const [state, setState] = useState<ShoppingState>({ items: {}, selectedComponents: {} });
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const dias = useDiasDaLista();

  useEffect(() => {
    getShoppingState().then((s) => {
      setState(s);
      setHydrated(true);
    });
  }, []);

  /** A compra da semana: o que a divisão escolhida usa + os essenciais de despensa. */
  const grouped = useMemo(() => listaDaSemana(dias), [dias]);

  const totalIngredientes = grouped.reduce((s, g) => s + g.itens.length, 0);
  const comprados = grouped.reduce(
    (s, g) => s + g.itens.filter((l) => state.items[l.item.id]).length,
    0,
  );
  const pct = totalIngredientes > 0 ? Math.round((comprados / totalIngredientes) * 100) : 0;

  async function handleToggle(id: string) {
    setState((prev) => ({ ...prev, items: { ...prev.items, [id]: !prev.items[id] } }));
    setState(await toggleShoppingItem(id));
  }

  function mudarDias(id: RefeicaoPlanoId, n: number) {
    gravarDias({ ...dias, [id]: Math.max(0, Math.min(7, n)) });
  }

  function buildShareText(): string {
    const lines: string[] = ["🛒 *Lista de compras da semana*"];
    // Quem for ao mercado sabe de que divisão é a compra.
    lines.push(`_Plano da nutricionista · ${resumoDaDivisao(dias)}_`);
    lines.push("");
    let total = 0;
    for (const g of grouped) {
      const itens = g.itens.filter((l) => !state.items[l.item.id]);
      if (itens.length === 0) continue;
      lines.push(`${g.categoria.icone} *${g.categoria.nome}*`);
      for (const l of itens) {
        lines.push(`• ${l.item.nome} — ${l.quantidade}`);
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
          A lista sai do plano da nutricionista: escolha em quantos dias da semana vai comer a
          opção 1 de cada refeição, e as quantidades se ajustam. O preparo diz o que congelar, o
          que só refrigerar e o que fazer na hora.
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
          <Card>
            <CardHeader>
              <Eyebrow className="flex items-center gap-1.5 text-clay">
                <CalendarDays className="h-3 w-3" /> A semana
              </Eyebrow>
              <CardTitle className="mt-1.5">Dias de cada opção</CardTitle>
              <CardDescription>
                Os dias que não são da opção 1 ficam com a opção 2. Fica guardado neste aparelho.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {REFEICOES_ORDEM.map((id) => {
                const n = dias[id];
                const [o1, o2] = refeicaoDoPlano(id).opcoes;
                const nome = REFEICOES_META[id].nome;
                return (
                  // O nome divide a linha só com o − e o +; a divisão e os pratos
                  // vêm embaixo, na largura toda — em 320 px eles quebravam em
                  // três linhas e o nome do prato sumia nas reticências.
                  <div key={id} className="rounded-xl2 border border-line bg-bone/50 p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="min-w-0 text-sm font-bold text-ink">{nome}</p>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-10 w-10"
                          disabled={n <= 0}
                          onClick={() => mudarDias(id, n - 1)}
                          aria-label={`${nome}: um dia a menos da opção 1`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span
                          className="w-5 text-center text-sm font-bold text-ink tabular"
                          aria-hidden
                        >
                          {n}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-10 w-10"
                          disabled={n >= 7}
                          onClick={() => mudarDias(id, n + 1)}
                          aria-label={`${nome}: um dia a mais da opção 1`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {/* Anunciado a cada toque no − e no +: o número sozinho não diz nada. */}
                    <p className="mt-1.5 text-xs text-ink-muted tabular" aria-live="polite">
                      <span className="whitespace-nowrap">Opção 1: {diasTexto(n)}</span>
                      {" · "}
                      <span className="whitespace-nowrap">Opção 2: {diasTexto(7 - n)}</span>
                    </p>
                    <p className="mt-0.5 text-[0.6875rem] leading-relaxed text-ink-muted">
                      {o1.nome} · {o2.nome}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {!hydrated ? (
            <p className="text-sm text-ink-muted">Carregando...</p>
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
                  {/* WhatsApp na largura toda; os outros dois lado a lado (um
                      embaixo do outro abaixo de 360 px, onde não cabem). */}
                  <div className="grid gap-2 border-t border-line pt-4 min-[360px]:grid-cols-2">
                    <Button
                      className="min-[360px]:col-span-2"
                      onClick={() =>
                        window.open(
                          `https://wa.me/?text=${encodeURIComponent(buildShareText())}`,
                          "_blank",
                        )
                      }
                    >
                      <MessageCircle className="h-4 w-4" /> WhatsApp
                    </Button>
                    <Button onClick={compartilhar} variant="outline" className="px-3">
                      <Share2 className="h-4 w-4" /> Compartilhar
                    </Button>
                    <Button onClick={() => copiar()} variant="outline" className="px-3">
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
                  </div>
                </CardContent>
              </Card>

              {grouped.map(({ categoria, itens }) => {
                const feitos = itens.filter((l) => state.items[l.item.id]).length;
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
                      {itens.map(({ item, quantidade }) => {
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
                            <p className="text-xs text-ink-muted tabular">{juntarUnidades(quantidade)}</p>
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
                <li>
                  Queijo <strong>branco sem lactose</strong>: compare proteína, gordura saturada e
                  sódio na tabela.
                </li>
                <li>
                  Whey: <strong>isolado e sem lactose</strong>, 25–30 g por dose. Olhe quanto ainda
                  tem no pote antes de comprar outro.
                </li>
                <li>
                  Bebida vegetal: <strong>sem açúcar</strong> escrito na embalagem.
                </li>
                <li>
                  Kefir ou iogurte natural <strong>sem lactose</strong>: sem açúcar na lista de
                  ingredientes.
                </li>
                <li>
                  Linhaça: compre <strong>moída</strong> — inteira, ela passa direto. Depois de
                  aberta, na geladeira, em pote fechado.
                </li>
                <li>
                  Pasta de amendoim: <strong>só amendoim</strong> na lista de ingredientes.
                </li>
                <li>Amêndoas ou castanhas-do-pará: 5 por lanche — um pacote dura bastante.</li>
                <li>
                  Folhas: firmes e de verde vivo, sem partes amarelas ou murchas. Duram poucos dias:
                  compre metade agora e metade no meio da semana.
                </li>
                <li>Feira e sacolão antes do supermercado, como o Dr. Henry pede.</li>
                {/* Fica fora da lista da semana de propósito: não é comida do
                    plano, é o socorro do card do jejum (tremor, suor frio). */}
                <li>
                  Para o socorro do jejum, tenha em casa{" "}
                  <strong>sachês de açúcar ou uma caixinha de suco comum</strong> — não é
                  para o dia a dia.
                </li>
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
            <CardContent className="space-y-4">
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
              <p className="flex items-start gap-2 rounded-xl2 bg-surface/80 p-3.5 text-xs leading-relaxed text-ink-soft">
                <Scale className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                {ESTRATEGIA.dica}
              </p>
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
