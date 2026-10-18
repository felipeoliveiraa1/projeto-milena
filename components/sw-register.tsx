"use client";

import { useEffect } from "react";
import { registrarSW, ressalvarInscricao } from "@/lib/push-cliente";

/**
 * Registra o service worker dos lembretes (public/sw.js) e, se este aparelho
 * já tinha ativado os lembretes, regrava a inscrição no banco em silêncio.
 * Nunca pede permissão sozinho — isso só acontece no botão de Ajustes.
 */
export function SwRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    registrarSW()
      .then(() => ressalvarInscricao())
      .catch(() => {
        // sem service worker o app segue igual, só sem lembretes
      });
  }, []);

  return null;
}
