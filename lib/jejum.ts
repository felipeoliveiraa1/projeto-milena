"use client";

import { useMemo } from "react";
import { useAgoraVivo } from "./now";
import { usePreferencias } from "./settings";
import { statusJanela, type Janela, type StatusJanela } from "./janela";

/**
 * Janela alimentar e jejum noturno, para as telas. A conta de relógio mora em
 * lib/janela.ts (sem React, para servir também ao servidor dos lembretes) e é
 * reexportada daqui. A janela é uma preferência — ela ajusta em /ajustes.
 */

export {
  duracaoJanela,
  formatarDuracao,
  horariosDaJanela,
  paraHHMM,
  paraMinutos,
  statusJanela,
} from "./janela";
export type { Janela, StatusJanela } from "./janela";

/**
 * Janela configurada e o estado dela agora, andando com o relógio.
 * `status` é `null` no servidor, no primeiro render e enquanto as preferências
 * carregam — até lá `janela` ainda é a de fábrica, e mostrar "fecha às 18:00"
 * para quem mudou para as 17:00 seria errado. `carregando` avisa quem mostra
 * horários derivados da janela.
 */
export function useJanela(): { janela: Janela; status: StatusJanela | null; carregando: boolean } {
  const { prefs, carregando } = usePreferencias();
  const agora = useAgoraVivo();
  const janela = useMemo(
    () => ({ inicio: prefs.janelaInicio, fim: prefs.janelaFim }),
    [prefs.janelaInicio, prefs.janelaFim],
  );
  const status = useMemo(
    () => (agora && !carregando ? statusJanela(janela, agora) : null),
    [agora, janela, carregando],
  );
  return { janela, status, carregando };
}
