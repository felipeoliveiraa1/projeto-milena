"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  ClipboardList,
  Droplet,
  Egg,
  GitCompareArrows,
  Lightbulb,
  ShieldAlert,
  ShoppingBasket,
  Sparkles,
  Stethoscope,
  Tag,
  Target,
  TrendingDown,
  TrendingUp,
  Utensils,
} from "lucide-react";
import {
  OBSERVACOES_NUTRI,
  ORIENTACOES_MEDICO,
  PLANO_ALIMENTAR,
  type OpcaoRefeicao,
} from "@/data/meals";
import {
  ACOMPANHAMENTO,
  CRITERIOS_ROTULO,
  EVITAR,
  METAS,
  MUDANCAS,
  ORDEM_CONSUMO,
  SUGESTOES,
  type Meta,
  type Mudanca,
} from "@/data/alimentacao";
import { PLANO } from "@/data/protocol";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Eyebrow,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JejumCard } from "@/components/jejum-card";
import { horariosDaJanela, useJanela } from "@/lib/jejum";
import { usePreferencias } from "@/lib/settings";
import { formatarAgua } from "@/lib/score";
import { cn } from "@/lib/utils";

const BADGE_MUDANCA: Record<Mudanca["tipo"], { texto: string; classe: string }> = {
  // Terracota, a cor da nutrição: o plano da nutricionista é o que vale agora.
  plano: { texto: "Plano de 18/10", classe: "bg-clay-soft text-clay-deep" },
  ajuste: { texto: "Ajuste de 12/10", classe: "bg-brand-soft text-brand" },
  seguranca: { texto: "Segurança", classe: "bg-danger-soft text-danger" },
  resumo: { texto: "Plano de 29/09", classe: "bg-plum-soft text-plum" },
  medico: { texto: "Médico", classe: "bg-gold-soft text-gold" },
};

const ICONE_META: Record<Meta["id"], typeof Egg> = {
  proteina: Egg,
  agua: Droplet,
  ordem: Utensils,
};

const ATALHOS = [
  { href: "#metas", texto: "Metas" },
  { href: "#jejum", texto: "Jejum" },
  { href: "#plano", texto: "Plano alimentar" },
  { href: "#observacoes", texto: "Observações" },
  { href: "#evitar", texto: "O que evitar" },
  { href: "#mudancas", texto: "O que mudou" },
];

/** "09:00" → "9h", "21:30" → "21h30": como as metas escrevem a hora. */
function horaCurta(hhmm: string): string {
  const [h, m] = hhmm.split(":");
  return `${Number(h)}h${m === "00" ? "" : m}`;
}

export default function DietaPage() {
  const { janela, carregando } = useJanela();
  const horarios = horariosDaJanela(janela);
  const { prefs, carregando: carregandoPrefs } = usePreferencias();
  // Enquanto as preferências carregam, a janela e a água ainda são as de
  // fábrica: o lugar fica guardado, mas o valor só aparece quando chega o dela.
  const esperandoJanela = carregando && "invisible";
  const esperandoPrefs = carregandoPrefs && "invisible";

  // A água segue o que ela pôs em /ajustes: copo, horários e meta do dia.
  const aguaValor = `${prefs.aguaCopoMl} ml por vez, das ${horaCurta(prefs.aguaInicio)} às ${horaCurta(prefs.aguaFim)}`;
  const aguaDetalhe = `A meta do dia dividida em copos de ${prefs.aguaCopoMl} ml. No app, a meta está em ${formatarAgua(prefs.aguaMetaMl)} e os lembretes avisam a hora de cada copo.`;

  return (
    <div className="stagger space-y-5">
      <header>
        <Eyebrow className="text-clay">{PLANO.nome}</Eyebrow>
        <h2 className="font-display mt-2 text-4xl leading-none text-ink">
          Plano da nutricionista
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Três refeições — a última é o lanche da tarde, até as 17h–18h. Em cada uma, escolha a
          opção 1 ou a 2.
        </p>
        <nav aria-label="Nesta página" className="no-scrollbar -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1">
          {ATALHOS.map((a) => (
            <a
              key={a.href}
              href={a.href}
              className="shrink-0 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-bone"
            >
              {a.texto}
            </a>
          ))}
          <Link
            href="/lista"
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-clay/30 bg-clay-soft px-3 py-1.5 text-xs font-semibold text-clay-deep transition hover:bg-clay-soft/70"
          >
            <ShoppingBasket className="h-3.5 w-3.5" /> Lista de compras
          </Link>
        </nav>
      </header>

      {/* Metas do dia ------------------------------------------------------- */}
      <Card id="metas" className="scroll-mt-24">
        <CardHeader>
          <Eyebrow className="text-brand">Todo dia</Eyebrow>
          <CardTitle className="mt-1.5 flex items-center gap-2">
            <Target className="h-4.5 w-4.5 text-brand" /> Metas do dia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <ul className="space-y-3.5">
            {METAS.map((m) => {
              const Icone = ICONE_META[m.id];
              const agua = m.id === "agua";
              return (
                <li key={m.id} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                    <Icone className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink-muted">{m.titulo}</p>
                    <p className={cn("text-sm font-bold text-ink", agua && esperandoPrefs)}>
                      {agua ? aguaValor : m.valor}
                    </p>
                    <p
                      className={cn(
                        "mt-0.5 text-xs leading-relaxed text-ink-muted",
                        agua && esperandoPrefs,
                      )}
                    >
                      {agua ? aguaDetalhe : m.detalhe}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div>
            <Eyebrow className="mb-2.5 text-ink-muted">Ordem do prato</Eyebrow>
            <ol className="space-y-2.5">
              {ORDEM_CONSUMO.map((o) => (
                <li key={o.o} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-[0.6875rem] font-bold text-bone">
                    {o.passo}
                  </span>
                  <span>
                    <strong className="text-sm text-ink">{o.o}</strong>
                    <span className="block text-xs leading-relaxed text-ink-muted">{o.porque}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Jejum -------------------------------------------------------------- */}
      <JejumCard id="jejum" />

      {/* Plano alimentar ------------------------------------------------------ */}
      <section id="plano" className="scroll-mt-24 space-y-3">
        <div className="px-1">
          <Eyebrow className="text-clay">Prescrito em 18/10</Eyebrow>
          <h3 className="font-display mt-1.5 text-2xl leading-none text-ink">Plano alimentar</h3>
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">
            A proteína de cada opção é estimativa do app, feita com tabelas de alimentos comuns. A
            meta da nutricionista: 1,6–1,9 g por kg do peso ideal. Na tela inicial, você marca qual
            opção comeu.
          </p>
        </div>

        {PLANO_ALIMENTAR.map((refeicao) => (
          <Card key={refeicao.id}>
            <CardHeader>
              <div className="flex items-baseline justify-between gap-3">
                <CardTitle>{refeicao.nome}</CardTitle>
                <span
                  className={cn("shrink-0 text-sm font-semibold text-ink-muted tabular", esperandoJanela)}
                >
                  {horarios[refeicao.id]}
                </span>
              </div>
              {refeicao.nota && <CardDescription>{refeicao.nota}</CardDescription>}
            </CardHeader>
            <CardContent>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {refeicao.opcoes.map((o) => (
                  <OpcaoCard key={o.id} opcao={o} />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        <Button asChild variant="outline" size="sm">
          <Link href="/lista">
            <ShoppingBasket className="h-3.5 w-3.5" /> Lista de compras e preparo
          </Link>
        </Button>
      </section>

      {/* Observações da nutricionista ------------------------------------------ */}
      <Card id="observacoes" className="scroll-mt-24 border-clay/20 bg-clay-soft/40">
        <CardHeader>
          <Eyebrow className="text-clay">Junto com o plano</Eyebrow>
          <CardTitle className="mt-1.5 flex items-center gap-2">
            <ClipboardList className="h-4.5 w-4.5 text-clay" /> Observações da nutricionista
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5">
            {OBSERVACOES_NUTRI.map((o) => (
              <li key={o} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-soft">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Sugestões do app ------------------------------------------------------ */}
      <Card id="sugestoes" className="scroll-mt-24">
        <CardHeader>
          <Eyebrow className="text-brand">Com o Mounjaro</Eyebrow>
          <CardTitle className="mt-1.5 flex items-center gap-2">
            <Lightbulb className="h-4.5 w-4.5 text-brand" /> Sugestões para o dia a dia
          </CardTitle>
          <CardDescription>
            Do app, cada uma com o porquê. Não mudam o plano — quantidade e troca de alimento são
            com a nutricionista — e nenhuma mexe em remédio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {SUGESTOES.map((s, i) => (
            <div key={s.id} className="rounded-xl2 border border-line bg-bone/50 p-4">
              <div className="flex items-start gap-2.5">
                <span className="mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[0.6875rem] font-bold text-bone tabular">
                  {i + 1}
                </span>
                <p className="text-sm font-bold leading-snug text-ink">{s.titulo}</p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.texto}</p>
              <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                <span>
                  <strong className="text-ink-soft">Por quê:</strong> {s.porque}
                </span>
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Objetivo do acompanhamento ----------------------------------------------- */}
      <Card className="border-brand-deep bg-brand-deep text-bone">
        <CardContent className="space-y-4 p-6">
          <p className="eyebrow text-bone/50">Objetivo do acompanhamento</p>
          <div>
            <p className="text-sm text-bone/70">{ACOMPANHAMENTO.frase}</p>
            <p className="font-display mt-1.5 text-[1.625rem] leading-tight text-bone">
              {PLANO.objetivo}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {ACOMPANHAMENTO.sinais.map((s) => {
              const Icone = s.id === "forca" ? TrendingUp : TrendingDown;
              return (
                <Link
                  key={s.id}
                  href={s.href}
                  className="rounded-2xl bg-bone/10 px-3 py-2.5 transition hover:bg-bone/15"
                >
                  <Icone className="h-3.5 w-3.5 text-bone/60" />
                  <p className="mt-1 text-sm font-bold text-bone">{s.rotulo}</p>
                  <p className="text-[0.625rem] leading-tight text-bone/60">{s.direcao}</p>
                  <p className="mt-1 text-[0.625rem] leading-tight font-semibold text-bone/80">
                    {s.onde} →
                  </p>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* O que evitar --------------------------------------------------------- */}
      <Card id="evitar" className="scroll-mt-24">
        <CardHeader>
          <Eyebrow className="text-danger">No dia a dia</Eyebrow>
          <CardTitle className="mt-1.5 flex items-center gap-2">
            <Ban className="h-4.5 w-4.5 text-danger" /> O que evitar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2.5">
            {EVITAR.map((f) => (
              <li key={f.item} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                <span>
                  <strong className="text-sm text-ink">{f.item}</strong>
                  <span className="block text-xs leading-relaxed text-ink-muted">{f.detalhe}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="rounded-xl2 bg-bone-deep/60 p-4">
            <Eyebrow className="mb-2 flex items-center gap-1.5 text-ink-soft">
              <Tag className="h-3 w-3" /> Como ler o rótulo
            </Eyebrow>
            <ul className="space-y-1.5">
              {CRITERIOS_ROTULO.map((c) => (
                <li
                  key={c}
                  className="flex items-start gap-2 text-xs leading-relaxed text-ink-soft"
                >
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* O que mudou ------------------------------------------------------------ */}
      <Card id="mudancas" className="scroll-mt-24">
        <CardHeader>
          <Eyebrow className="text-plum">Revisão</Eyebrow>
          <CardTitle className="mt-1.5 flex items-center gap-2">
            <GitCompareArrows className="h-4.5 w-4.5 text-plum" /> O que mudou e por quê
          </CardTitle>
          <CardDescription>
            Em 29/09 veio o resumo de alimentação, em 12/10 os ajustes que você pediu e, em 18/10, o
            plano da nutricionista. Nada foi trocado em silêncio: o que segue valendo está aqui, o
            mais novo primeiro.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {MUDANCAS.map((m) => {
            const badge = BADGE_MUDANCA[m.tipo];
            return (
              <div
                key={m.id}
                className={cn(
                  "space-y-2.5 rounded-xl2 border p-4",
                  m.tipo === "seguranca"
                    ? "border-danger/25 bg-danger-soft/40"
                    : "border-line bg-bone/50",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  {m.tipo === "seguranca" && <ShieldAlert className="h-4 w-4 text-danger" />}
                  <p className="text-sm font-bold text-ink">{m.tema}</p>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[0.625rem] font-bold",
                      badge.classe,
                    )}
                  >
                    {badge.texto}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-ink-muted">
                  <strong className="text-ink-soft">Antes:</strong> {m.antes}
                </p>
                <p className="text-xs leading-relaxed text-ink-muted">
                  <strong className="text-ink-soft">Agora:</strong> {m.agora}
                </p>
                <p className="flex items-start gap-2 rounded-xl bg-surface p-3 text-xs leading-relaxed text-ink-soft">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                  <span>
                    <strong className="text-ink">Por quê:</strong> {m.porque}
                  </span>
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Médico ------------------------------------------------------------------ */}
      <Card>
        <CardHeader>
          <Eyebrow className="text-brand">Segue valendo</Eyebrow>
          <CardTitle className="mt-1.5 flex items-center gap-2">
            <Stethoscope className="h-4.5 w-4.5 text-brand" /> Orientações do médico
          </CardTitle>
          <CardDescription>
            {ORIENTACOES_MEDICO.medico} · {ORIENTACOES_MEDICO.especialidade}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2.5">
            {ORIENTACOES_MEDICO.pontos.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-soft">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          {ORIENTACOES_MEDICO.emConflito.map((c) => (
            <p key={c} className="flex gap-2.5 rounded-xl2 bg-gold-soft p-4 text-xs leading-relaxed text-gold">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{c}</span>
            </p>
          ))}
        </CardContent>
      </Card>

      <p className="px-1 text-[0.6875rem] leading-relaxed text-ink-muted">
        Plano alimentar prescrito pela nutricionista. Dúvida sobre quantidade ou troca de alimento:
        fale com ela.
      </p>
    </div>
  );
}

/** Uma opção da refeição: o nome, a proteína estimada e os itens da prescrição. */
function OpcaoCard({ opcao }: { opcao: OpcaoRefeicao }) {
  return (
    <div className="rounded-xl2 border border-line bg-bone/50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-clay px-2 py-0.5 text-[0.625rem] font-bold text-bone">
          Opção {opcao.numero}
        </span>
        <p className="text-sm font-bold text-ink">{opcao.nome}</p>
      </div>
      <p className="mt-1 text-xs text-ink-muted tabular">
        ~{opcao.proteina} g de proteína (estimativa)
      </p>
      <ul className="mt-2.5 space-y-1.5">
        {opcao.itens.map((it) => (
          <li key={it.texto} className="flex items-start gap-2 text-sm leading-relaxed text-ink-soft">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-clay" />
            {it.texto}
          </li>
        ))}
      </ul>
      {opcao.nota && <p className="mt-2.5 text-xs leading-relaxed text-ink-muted">{opcao.nota}</p>}
    </div>
  );
}
