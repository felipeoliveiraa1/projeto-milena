"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Droplet,
  ListChecks,
  Plus,
  RotateCcw,
  Scale,
  Smartphone,
  Trash2,
} from "lucide-react";
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
import { usePreferencias, type Preferencias } from "@/lib/settings";
import { cn } from "@/lib/utils";

export default function AjustesPage() {
  const { prefs, origem, salvar, restaurar } = usePreferencias();
  const [rascunho, setRascunho] = useState<Preferencias | null>(null);
  const [salvo, setSalvo] = useState(false);

  const atual = rascunho ?? prefs;
  const mudou = rascunho !== null && JSON.stringify(rascunho) !== JSON.stringify(prefs);

  function editar(patch: Partial<Preferencias>) {
    setRascunho({ ...atual, ...patch });
    setSalvo(false);
  }

  async function aplicar() {
    if (!rascunho) return;
    await salvar(rascunho);
    setRascunho(null);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  }

  return (
    <div className="stagger space-y-5">
      <header>
        <Eyebrow className="text-ink-muted">Ajustes</Eyebrow>
        <h2 className="font-display mt-2 text-4xl leading-none text-ink">Do seu jeito</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Metas, medidas e o tamanho do ciclo. Muda aqui e vale no app inteiro — sem depender de
          atualização.
        </p>
      </header>

      {origem === "aparelho" && (
        <p className="flex items-center gap-2 rounded-xl2 bg-gold-soft px-4 py-3 text-xs font-semibold text-gold">
          <Smartphone className="h-3.5 w-3.5 shrink-0" />
          Salvo neste aparelho. Para sincronizar com outros, rode o SQL de supabase/schema.sql.
        </p>
      )}

      {/* Água -------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <Eyebrow className="text-brand-mid">Hidratação</Eyebrow>
          <CardTitle className="mt-1.5 flex items-center gap-2">
            <Droplet className="h-4.5 w-4.5 text-brand-mid" /> Água
          </CardTitle>
          <CardDescription>
            A meta e os botões de registro rápido da tela inicial.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-ink-soft">Meta do dia (ml)</span>
            <Input
              inputMode="numeric"
              value={String(atual.aguaMetaMl)}
              onChange={(e) => editar({ aguaMetaMl: Number(e.target.value.replace(/\D/g, "")) || 0 })}
            />
            <span className="block text-xs text-ink-muted tabular">
              = {(atual.aguaMetaMl / 1000).toFixed(1).replace(".", ",")} L por dia
            </span>
          </label>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-ink-soft">Botões de registro (ml)</span>
            {atual.aguaPorcoes.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  inputMode="numeric"
                  value={String(p)}
                  onChange={(e) => {
                    const novo = [...atual.aguaPorcoes];
                    novo[i] = Number(e.target.value.replace(/\D/g, "")) || 0;
                    editar({ aguaPorcoes: novo });
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remover botão de ${p} ml`}
                  disabled={atual.aguaPorcoes.length <= 1}
                  onClick={() =>
                    editar({ aguaPorcoes: atual.aguaPorcoes.filter((_, k) => k !== i) })
                  }
                >
                  <Trash2 className="h-4 w-4 text-ink-muted" />
                </Button>
              </div>
            ))}
            {atual.aguaPorcoes.length < 4 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => editar({ aguaPorcoes: [...atual.aguaPorcoes, 500] })}
              >
                <Plus className="h-4 w-4" /> Adicionar botão
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Peso -------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <Eyebrow className="text-brand">Balança</Eyebrow>
          <CardTitle className="mt-1.5 flex items-center gap-2">
            <Scale className="h-4.5 w-4.5 text-brand" /> Peso
          </CardTitle>
          <CardDescription>
            O peso de partida é a referência de todas as comparações do app.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-ink-soft">Peso inicial (kg)</span>
            <Input
              inputMode="decimal"
              value={String(atual.pesoInicial).replace(".", ",")}
              onChange={(e) =>
                editar({ pesoInicial: Number(e.target.value.replace(",", ".")) || 0 })
              }
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-ink-soft">Meta (kg)</span>
            <Input
              inputMode="decimal"
              value={String(atual.pesoMeta).replace(".", ",")}
              onChange={(e) => editar({ pesoMeta: Number(e.target.value.replace(",", ".")) || 0 })}
            />
          </label>
        </CardContent>
      </Card>

      {/* Ciclo ------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <Eyebrow className="text-plum">Protocolo</Eyebrow>
          <CardTitle className="mt-1.5 flex items-center gap-2">
            <CalendarDays className="h-4.5 w-4.5 text-plum" /> Duração do ciclo
          </CardTitle>
          <CardDescription>
            O padrão do Desinflama-se é 15 dias. Se quiser emendar um ciclo maior, é aqui.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-ink-soft">Dias</span>
            <Input
              inputMode="numeric"
              value={String(atual.cicloDias)}
              onChange={(e) => editar({ cicloDias: Number(e.target.value.replace(/\D/g, "")) || 0 })}
            />
          </label>
          <p className="text-xs leading-relaxed text-ink-muted">
            O cardápio tem 15 dias montados; passando disso ele recomeça do dia 1. A data de início
            do ciclo você ajusta na aba Rotina.
          </p>
        </CardContent>
      </Card>

      {/* Rotina ------------------------------------------------------------ */}
      <Card>
        <CardHeader>
          <Eyebrow className="text-plum">Rotina</Eyebrow>
          <CardTitle className="mt-1.5 flex items-center gap-2">
            <ListChecks className="h-4.5 w-4.5 text-plum" /> Blocos e itens
          </CardTitle>
          <CardDescription>
            Manhã, movimento, acompanhamento, noite — tudo editável, com blocos novos se quiser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="w-full">
            <Link href="/rotina">
              Editar a rotina <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Ações -------------------------------------------------------------- */}
      <div
        className={cn(
          "sticky bottom-28 flex flex-wrap items-center gap-2 rounded-card border border-line bg-surface/95 p-3 backdrop-blur md:bottom-4",
          !mudou && "border-dashed bg-transparent",
        )}
      >
        <Button onClick={aplicar} disabled={!mudou} className="flex-1">
          <CheckCircle2 className="h-4 w-4" /> Salvar ajustes
        </Button>
        {mudou && (
          <Button variant="ghost" onClick={() => setRascunho(null)}>
            Cancelar
          </Button>
        )}
        {salvo && (
          <span className="flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-bold text-brand">
            <CheckCircle2 className="h-3.5 w-3.5" /> salvo
          </span>
        )}
        <Button
          variant="ghost"
          className="text-ink-muted"
          onClick={async () => {
            if (!confirm("Voltar todos os ajustes para o padrão?")) return;
            await restaurar();
            setRascunho(null);
          }}
        >
          <RotateCcw className="h-4 w-4" /> Padrão
        </Button>
      </div>
    </div>
  );
}
