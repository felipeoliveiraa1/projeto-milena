"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Dumbbell, Droplet, Flame, Utensils } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Ring } from "@/components/ui/ring";
import { PLANO } from "@/data/protocol";
import { EVENTO_DIA_GRAVADO, getDay, getStreak } from "@/lib/storage";
import { formatarAgua, resumoDoDia } from "@/lib/score";
import { dataExtenso } from "@/lib/date";
import { statusPlano, useInicio, usePlano } from "@/lib/protocol";
import { useRotina } from "@/lib/routine";
import { usePreferencias } from "@/lib/settings";
import { useAgoraVivo } from "@/lib/now";
import { useDia } from "@/components/day-context";

function saudacao(hora: number): string {
  // Até as 05:00 o dia do app ainda é o de ontem — de madrugada é noite.
  if (hora < 5) return "Boa noite";
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export function DailySummary() {
  const [pct, setPct] = useState(0);
  const [streak, setStreak] = useState(0);
  const [parciais, setParciais] = useState({
    refeicoes: 0,
    agua: 0,
    treino: false,
    rotina: 0,
  });
  const [hydrated, setHydrated] = useState(false);
  // Sobe a cada gravação do dia em tela: o anel acompanha o que ela marca nos
  // cards de baixo, sem precisar recarregar.
  const [versao, setVersao] = useState(0);
  const agora = useAgoraVivo();
  const planoHoje = usePlano();
  const inicio = useInicio();
  const { blocos } = useRotina();
  const { prefs } = usePreferencias();
  const metaAgua = prefs.aguaMetaMl;
  const { data, ehHoje } = useDia();
  // Lançando um dia anterior, a data e a semana são as daquele dia.
  const status = ehHoje ? planoHoje : statusPlano(inicio, data);

  useEffect(() => {
    const ouvir = (e: Event) => {
      if ((e as CustomEvent<string>).detail === data) setVersao((v) => v + 1);
    };
    window.addEventListener(EVENTO_DIA_GRAVADO, ouvir);
    return () => window.removeEventListener(EVENTO_DIA_GRAVADO, ouvir);
  }, [data]);

  useEffect(() => {
    const ids = blocos.flatMap((b) => b.itens.map((i) => i.id));
    // Cada gravação dispara uma busca nova: uma resposta antiga que chegue
    // depois não pode deixar o anel com o número velho.
    let valendo = true;
    Promise.all([getDay(data), getStreak()])
      .then(([day, streakValue]) => {
        if (!valendo) return;
        const resumo = resumoDoDia(day, { metaAgua, idsRotina: ids });
        setPct(resumo.pct);
        setParciais({
          refeicoes: resumo.refeicoes,
          agua: resumo.agua,
          treino: resumo.treino,
          rotina: resumo.rotina,
        });
        setStreak(streakValue);
        setHydrated(true);
      })
      .catch(() => {
        if (valendo) setHydrated(true);
      });
    return () => {
      valendo = false;
    };
  }, [blocos, metaAgua, data, versao]);

  const legenda = !status
    ? ""
    : status.naoComecou
      ? `${PLANO.nome} começa em breve`
      : `${PLANO.nome} · semana ${status.semana}`;

  return (
    <Card className="overflow-hidden border-brand-deep bg-brand-deep text-bone">
      <CardContent className="space-y-5 p-6">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0 pt-1">
            <p className="eyebrow text-bone/50">
              {agora ? dataExtenso(new Date(`${data}T00:00:00`)) : " "}
            </p>
            <h2 className="font-display mt-1.5 text-[2rem] leading-none text-bone">
              {ehHoje ? (
                <>
                  {agora ? saudacao(agora.getHours()) : "Olá"},<br />
                  <span className="italic">Milena</span>
                </>
              ) : (
                <>
                  Fechando
                  <br />
                  <span className="italic">esse dia</span>
                </>
              )}
            </h2>
            <p className="mt-3 text-sm text-bone/70">{legenda || " "}</p>
          </div>

          <Ring
            value={hydrated ? pct : 0}
            size={104}
            stroke={8}
            trackClassName="text-bone/15"
            barClassName="text-bone"
          >
            <span className="font-display text-2xl leading-none text-bone tabular">
              {hydrated ? pct : 0}%
            </span>
            <span className="mt-1 text-[0.625rem] font-semibold tracking-wider text-bone/50 uppercase">
              do dia
            </span>
          </Ring>
        </div>

        {/* Abaixo de 360 px, 2 × 2: em 4 colunas os rótulos vazavam da caixinha. */}
        <div className="grid grid-cols-2 gap-2 min-[360px]:grid-cols-4">
          <Mini
            icone={<Utensils className="h-3.5 w-3.5" />}
            valor={`${parciais.refeicoes}/4`}
            rotulo="refeições"
          />
          <Mini
            icone={<Droplet className="h-3.5 w-3.5" />}
            valor={formatarAgua(parciais.agua)}
            rotulo="água"
          />
          <Mini
            icone={<Dumbbell className="h-3.5 w-3.5" />}
            valor={parciais.treino ? "feito" : "—"}
            rotulo="treino"
          />
          <Mini
            icone={<Flame className="h-3.5 w-3.5" />}
            valor={`${streak}`}
            rotulo={streak === 1 ? "dia seguido" : "dias seguidos"}
          />
        </div>

        <Link
          href="/historico"
          className="flex items-center justify-between rounded-2xl bg-bone/10 px-4 py-3 text-sm font-semibold text-bone transition hover:bg-bone/15"
        >
          Ver tudo que já fiz
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

function Mini({
  icone,
  valor,
  rotulo,
}: {
  icone: React.ReactNode;
  valor: string;
  rotulo: string;
}) {
  return (
    <div className="rounded-2xl bg-bone/10 px-3 py-2.5">
      <span className="flex items-center gap-1 text-bone/50">{icone}</span>
      <p className="mt-1 whitespace-nowrap text-sm font-bold text-bone tabular">{valor}</p>
      <p className="text-[0.625rem] leading-tight text-bone/50">{rotulo}</p>
    </div>
  );
}
