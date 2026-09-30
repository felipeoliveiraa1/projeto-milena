"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Droplet,
  ListChecks,
  LogOut,
  Plus,
  RotateCcw,
  Scale,
  Smartphone,
  Timer,
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
import { ehJanelaValida, usePreferencias, type Preferencias } from "@/lib/settings";
import { duracaoJanela, formatarDuracao } from "@/lib/jejum";
import { emailDaSessao, sair, useSessao } from "@/lib/auth";
import { ResetCard } from "@/components/reset-card";
import { cn } from "@/lib/utils";

export default function AjustesPage() {
  const { prefs, origem, carregando, salvar, restaurar } = usePreferencias();
  const { sessao } = useSessao();
  const [rascunho, setRascunho] = useState<Preferencias | null>(null);
  const [salvo, setSalvo] = useState(false);

  const atual = rascunho ?? prefs;
  const mudou =
    rascunho !== null && JSON.stringify(rascunho) !== JSON.stringify(prefs);
  // Janela inválida não salva: o normalizador voltaria sozinho para o padrão,
  // e ela acharia que salvou o horário que digitou.
  const janelaOk = ehJanelaValida(atual.janelaInicio, atual.janelaFim);
  const horas = janelaOk
    ? duracaoJanela({ inicio: atual.janelaInicio, fim: atual.janelaFim })
    : null;

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
        <h2 className="font-display mt-2 text-4xl leading-none text-ink">
          Do seu jeito
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Metas, medidas e a janela do jejum. Muda aqui e vale no app inteiro —
          sem depender de atualização.
        </p>
      </header>

      {origem === "aparelho" && (
        <p className="flex items-center gap-2 rounded-xl2 bg-gold-soft px-4 py-3 text-xs font-semibold text-gold">
          <Smartphone className="h-3.5 w-3.5 shrink-0" />
          Salvo só neste aparelho: a nuvem não respondeu agora — sem internet
          ou com a sincronização ainda não configurada.
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
            A meta e os botões de registro rápido da tela inicial. O médico
            pediu 200 ml por hora — um toque no botão de 200 a cada hora.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-ink-soft">
              Meta do dia (ml)
            </span>
            <Input
              disabled={carregando}
              inputMode="numeric"
              value={String(atual.aguaMetaMl)}
              onChange={(e) =>
                editar({
                  aguaMetaMl: Number(e.target.value.replace(/\D/g, "")) || 0,
                })
              }
            />
            <span className="block text-xs text-ink-muted tabular">
              = {(atual.aguaMetaMl / 1000).toFixed(1).replace(".", ",")} L por
              dia
            </span>
          </label>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-ink-soft">
              Botões de registro (ml)
            </span>
            {atual.aguaPorcoes.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  disabled={carregando}
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
                  disabled={carregando || atual.aguaPorcoes.length <= 1}
                  onClick={() =>
                    editar({
                      aguaPorcoes: atual.aguaPorcoes.filter((_, k) => k !== i),
                    })
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
                disabled={carregando}
                onClick={() =>
                  editar({ aguaPorcoes: [...atual.aguaPorcoes, 500] })
                }
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
            O peso de partida só vale enquanto não houver pesagem registrada —
            com pesagens, a referência é a primeira delas.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-ink-soft">
              Peso inicial (kg)
            </span>
            <Input
              disabled={carregando}
              inputMode="decimal"
              value={String(atual.pesoInicial).replace(".", ",")}
              onChange={(e) =>
                editar({
                  pesoInicial: Number(e.target.value.replace(",", ".")) || 0,
                })
              }
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-ink-soft">
              Meta (kg)
            </span>
            <Input
              disabled={carregando}
              inputMode="decimal"
              value={String(atual.pesoMeta).replace(".", ",")}
              onChange={(e) =>
                editar({
                  pesoMeta: Number(e.target.value.replace(",", ".")) || 0,
                })
              }
            />
          </label>
        </CardContent>
      </Card>

      {/* Janela alimentar ---------------------------------------------------- */}
      <Card>
        <CardHeader>
          <Eyebrow className="text-plum">Jejum</Eyebrow>
          <CardTitle className="mt-1.5 flex items-center gap-2">
            <Timer className="h-4.5 w-4.5 text-plum" /> Janela alimentar
          </CardTitle>
          <CardDescription>
            A primeira refeição abre a janela; a última vem meia hora antes de
            ela fechar. Fora dela, só água, chá ou café sem açúcar — e os
            comprimidos da noite. Os horários das refeições se ajustam sozinhos
            a ela.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-ink-soft">
                Abre às
              </span>
              <Input
                disabled={carregando}
                type="time"
                value={atual.janelaInicio}
                onChange={(e) => editar({ janelaInicio: e.target.value })}
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-ink-soft">
                Fecha às
              </span>
              <Input
                disabled={carregando}
                type="time"
                value={atual.janelaFim}
                onChange={(e) => editar({ janelaFim: e.target.value })}
              />
            </label>
          </div>
          {horas ? (
            <p className="text-xs text-ink-muted tabular">
              = {formatarDuracao(horas.comendo)} comendo ·{" "}
              <strong className="text-ink-soft">
                {formatarDuracao(horas.jejum)} de jejum
              </strong>
            </p>
          ) : (
            <p className="rounded-xl2 bg-danger-soft px-3.5 py-2.5 text-xs leading-relaxed text-danger">
              A janela precisa fechar depois de abrir, no mesmo dia, e ter
              entre 4 e 18 horas.
            </p>
          )}
          {horas && horas.jejum > 16 * 60 && (
            <p className="rounded-xl2 bg-gold-soft px-3.5 py-2.5 text-xs leading-relaxed text-gold">
              Mais de 16 horas de jejum aperta a janela a ponto de a proteína
              do dia não caber — e com o Mounjaro a fome já é pouca. Converse
              com o médico antes de esticar.
            </p>
          )}
          <p className="text-xs leading-relaxed text-ink-muted">
            O padrão é das 08:00 às 18:00: 10 horas comendo e 14 de jejum. A data
            de início da jornada você ajusta na aba Rotina.
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
            Manhã, movimento, acompanhamento, noite — tudo editável, com blocos
            novos se quiser.
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

      {/* Conta -------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <Eyebrow className="text-ink-muted">Conta</Eyebrow>
          <CardTitle className="mt-1.5">Acesso</CardTitle>
          <CardDescription>
            {sessao ? emailDaSessao(sessao) : "—"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" onClick={() => sair()}>
            <LogOut className="h-4 w-4" /> Sair desta conta
          </Button>
        </CardContent>
      </Card>

      <ResetCard />

      {/* Ações -------------------------------------------------------------- */}
      <div
        className={cn(
          "sticky bottom-28 flex flex-wrap items-center gap-2 rounded-card border border-line bg-surface/95 p-3 backdrop-blur md:bottom-4",
          !mudou && "border-dashed bg-transparent",
        )}
      >
        <Button onClick={aplicar} disabled={carregando || !mudou || !janelaOk} className="flex-1">
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
          disabled={carregando}
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
