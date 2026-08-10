"use client";

import { useState } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Eyebrow,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckRow } from "@/components/check-row";
import { resetar, type EscopoReset } from "@/lib/reset";
import { todayKey } from "@/lib/date";

const PARTES = [
  {
    chave: "dias" as const,
    titulo: "Dias registrados",
    detalhe:
      "Refeições, água, treino, rotina, suplementos, sintomas e gratidão.",
  },
  {
    chave: "pesagens" as const,
    titulo: "Pesagens",
    detalhe: "Todo o histórico da balança.",
  },
  {
    chave: "medidas" as const,
    titulo: "Medidas",
    detalhe: "Cintura, abdômen, quadril, braço e coxa.",
  },
  {
    chave: "fotos" as const,
    titulo: "Fotos",
    detalhe: "O álbum inteiro do antes e depois.",
  },
  {
    chave: "compras" as const,
    titulo: "Lista de compras",
    detalhe: "Os dias escolhidos na dieta e os itens já comprados.",
  },
];

/** Recomeçar do zero, com o escopo na mão dela. Não tem desfazer. */
export function ResetCard() {
  const [escopo, setEscopo] = useState<EscopoReset>({
    dias: true,
    pesagens: true,
    medidas: true,
    fotos: true,
    compras: true,
  });
  const [novoInicio, setNovoInicio] = useState(todayKey());
  const [rodando, setRodando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);

  const selecionadas = PARTES.filter((p) => escopo[p.chave]);

  async function executar() {
    if (selecionadas.length === 0) return;
    const lista = selecionadas.map((p) => `• ${p.titulo}`).join("\n");
    const ok = confirm(
      `Isso apaga de vez, sem desfazer:\n\n${lista}\n\nE recomeça o protocolo em ${novoInicio
        .split("-")
        .reverse()
        .join("/")}.\n\nTem certeza?`,
    );
    if (!ok) return;

    setRodando(true);
    setResultado(null);
    const { apagados, erros } = await resetar({ ...escopo, novoInicio });
    setRodando(false);

    if (erros.length > 0) {
      setResultado(`Deu problema em: ${erros.join(" · ")}`);
      return;
    }
    setResultado(`Pronto: ${apagados.join(", ")}. Recarregando...`);
    setTimeout(() => window.location.assign("/"), 1600);
  }

  return (
    <Card className="border-danger/25 bg-danger-soft/30">
      <CardHeader>
        <Eyebrow className="text-danger">Zona de risco</Eyebrow>
        <CardTitle className="mt-1.5 flex items-center gap-2 text-danger">
          <RotateCcw className="h-4.5 w-4.5" /> Recomeçar do zero
        </CardTitle>
        <CardDescription>
          Apaga o que você escolher e reinicia a contagem do protocolo. As suas
          configurações — metas, fase do treino e a rotina que você montou —
          continuam como estão.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {PARTES.map((p) => (
          <CheckRow
            key={p.chave}
            checked={escopo[p.chave]}
            onToggle={() =>
              setEscopo((e) => ({ ...e, [p.chave]: !e[p.chave] }))
            }
            label={p.titulo}
            className={
              escopo[p.chave] ? "border-danger/25 bg-danger-soft/40" : undefined
            }
          >
            <span className="block text-sm font-semibold text-ink">
              {p.titulo}
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">
              {p.detalhe}
            </span>
          </CheckRow>
        ))}

        <label className="block space-y-1.5 pt-1">
          <span className="text-xs font-semibold text-ink-soft">
            Recomeçar o protocolo em
          </span>
          <Input
            type="date"
            value={novoInicio}
            max={todayKey()}
            onChange={(e) => setNovoInicio(e.target.value)}
            className="max-w-45"
          />
        </label>

        <p className="flex items-start gap-2 rounded-xl2 bg-surface p-3.5 text-xs leading-relaxed text-ink-soft">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger" />
          Não tem como desfazer. Se quiser guardar as fotos antes, baixe do
          álbum.
        </p>

        {resultado && (
          <p className="rounded-xl2 bg-surface p-3.5 text-xs font-semibold text-ink">
            {resultado}
          </p>
        )}

        <Button
          onClick={executar}
          disabled={rodando || selecionadas.length === 0}
          className="w-full bg-danger text-bone hover:bg-danger/90"
        >
          <RotateCcw className="h-4 w-4" />
          {rodando
            ? "Apagando..."
            : `Apagar ${selecionadas.length} ${selecionadas.length === 1 ? "item" : "itens"} e recomeçar`}
        </Button>
      </CardContent>
    </Card>
  );
}
