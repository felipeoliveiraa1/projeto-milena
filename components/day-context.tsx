"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { hojeKey } from "@/lib/date";
import { useAgoraVivo } from "@/lib/now";

type DiaContexto = {
  /** Dia que está sendo preenchido, no formato AAAA-MM-DD. */
  data: string;
  ehHoje: boolean;
  definir: (data: string) => void;
  voltarParaHoje: () => void;
};

const Contexto = createContext<DiaContexto | null>(null);

/**
 * Permite preencher um dia que já passou — ela começou o protocolo antes do app
 * existir e precisava lançar o que fez. Vale para toda a tela: refeições, água,
 * treino, rotina e suplementos passam a gravar na data escolhida.
 *
 * O estado é de memória: recarregar a página volta para hoje, que é o padrão
 * seguro para não registrar coisa no dia errado sem perceber.
 *
 * O "hoje" anda com o relógio: no celular o PWA volta da memória sem
 * recarregar, e um app aberto na quarta à noite precisa amanhecer na quinta —
 * com o cardápio, a rotina e o Mounjaro da quinta. O dia vira às 05:00
 * (ver hojeKey em lib/date.ts).
 */
export function DiaProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<string | null>(null);
  const agora = useAgoraVivo();
  // Só a string do dia entra no memo: o relógio anda a cada 30 s, mas a tela
  // só renderiza de novo quando o dia muda de fato.
  const hoje = agora ? hojeKey(agora) : hojeKey();

  const definir = useCallback((nova: string) => {
    setData(/^\d{4}-\d{2}-\d{2}$/.test(nova) ? nova : null);
  }, []);

  const voltarParaHoje = useCallback(() => setData(null), []);

  const valor = useMemo<DiaContexto>(
    () => ({
      data: data ?? hoje,
      ehHoje: data === null || data === hoje,
      definir,
      voltarParaHoje,
    }),
    [data, hoje, definir, voltarParaHoje],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useDia(): DiaContexto {
  const ctx = useContext(Contexto);
  if (ctx) return ctx;
  // Fora do provider (ex.: render no servidor) o dia é hoje e não dá para trocar.
  return {
    data: hojeKey(),
    ehHoje: true,
    definir: () => {},
    voltarParaHoje: () => {},
  };
}
