import { createHash, timingSafeEqual } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import webpush from "web-push";

/**
 * Lembretes no celular — o lado do servidor. Só roda nas rotas de
 * app/api/lembretes: usa a chave secreta do Supabase e a chave privada VAPID,
 * que nunca podem ir para o navegador.
 */
if (typeof window !== "undefined") {
  throw new Error("lib/push-servidor.ts é só do servidor.");
}

/** Falta uma variável de ambiente: a rota responde 500 com esta mensagem. */
export class ErroDeConfiguracao extends Error {}

const SUBJECT_PADRAO = "https://projeto-milena-theta.vercel.app";

let admin: SupabaseClient | null = null;

/** Cliente com a chave secreta (service_role): passa por cima do RLS. */
export function clienteAdmin(): SupabaseClient {
  if (admin) return admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new ErroDeConfiguracao("falta NEXT_PUBLIC_SUPABASE_URL no servidor");
  if (!chave) {
    throw new ErroDeConfiguracao(
      "falta SUPABASE_SECRET_KEY (ou SUPABASE_SERVICE_ROLE_KEY) no servidor",
    );
  }
  admin = createClient(url, chave, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return admin;
}

let vapidPronto = false;

export function configurarWebPush(): void {
  if (vapidPronto) return;
  const publica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privada = process.env.VAPID_PRIVATE_KEY;
  if (!publica) throw new ErroDeConfiguracao("falta NEXT_PUBLIC_VAPID_PUBLIC_KEY no servidor");
  if (!privada) throw new ErroDeConfiguracao("falta VAPID_PRIVATE_KEY no servidor");
  try {
    webpush.setVapidDetails(process.env.VAPID_SUBJECT || SUBJECT_PADRAO, publica, privada);
  } catch {
    // A mensagem da biblioteca repete o valor recebido — não vai para a resposta.
    throw new ErroDeConfiguracao(
      "chaves VAPID ou VAPID_SUBJECT inválidos (o subject é https:// ou mailto:)",
    );
  }
  vapidPronto = true;
}

export type Agora = {
  /** Data do calendário em São Paulo, AAAA-MM-DD. */
  data: string;
  /** Minutos desde a meia-noite em São Paulo. */
  minutos: number;
  /** "HH:MM" em São Paulo. */
  hora: string;
};

const RELOGIO_SP = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** A hora de parede em São Paulo — o servidor da Vercel roda em UTC. */
export function agoraEmSaoPaulo(agora: Date = new Date()): Agora {
  const partes: Record<string, string> = {};
  for (const p of RELOGIO_SP.formatToParts(agora)) partes[p.type] = p.value;
  const h = Number(partes.hour) % 24; // alguns motores escrevem meia-noite como "24"
  const m = Number(partes.minute);
  const hora = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  return { data: `${partes.year}-${partes.month}-${partes.day}`, minutos: h * 60 + m, hora };
}

export type Inscricao = { endpoint: string; p256dh: string; auth: string };

export type Aviso = { title: string; body: string; tag: string; url: string };

/**
 * Serviços de push dos navegadores (Apple, Google, Mozilla, Microsoft). O
 * servidor só faz POST para eles — nunca para um endereço qualquer que alguém
 * tenha gravado no banco.
 */
const HOSTS_DE_PUSH = [
  "push.apple.com",
  "fcm.googleapis.com",
  "android.googleapis.com",
  "push.services.mozilla.com",
  "notify.windows.com",
];

const BASE64URL = /^[A-Za-z0-9_-]+=*$/;

/** Confere o formato de uma inscrição vinda do navegador ou do banco. */
export function inscricaoValida(valor: unknown): valor is Inscricao {
  if (!valor || typeof valor !== "object") return false;
  const v = valor as Record<string, unknown>;
  if (typeof v.endpoint !== "string" || v.endpoint.length > 2048) return false;
  if (typeof v.p256dh !== "string" || v.p256dh.length > 200 || !BASE64URL.test(v.p256dh)) {
    return false;
  }
  if (typeof v.auth !== "string" || v.auth.length > 100 || !BASE64URL.test(v.auth)) return false;
  let url: URL;
  try {
    url = new URL(v.endpoint);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  return HOSTS_DE_PUSH.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`));
}

export type ResultadoEnvio = "ok" | "expirada" | "erro";

/** Manda um aviso. 404/410 do serviço de push = a inscrição não existe mais. */
export async function enviar(sub: Inscricao, aviso: Aviso): Promise<ResultadoEnvio> {
  if (!inscricaoValida(sub)) return "erro";
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(aviso),
      {
        // Lembrete atrasado mais de meia hora já não serve: o serviço descarta.
        TTL: 30 * 60,
        urgency: "high",
        timeout: 10_000,
      },
    );
    return "ok";
  } catch (e) {
    const status = (e as { statusCode?: number }).statusCode;
    if (status === 404 || status === 410) return "expirada";
    // Sem o endereço da inscrição nem as chaves no log: eles funcionam como uma
    // senha do aparelho. O começo da resposta do serviço diz o motivo da recusa
    // (chave VAPID errada, aviso grande demais…) e não traz nada disso.
    const corpo = (e as { body?: unknown }).body;
    console.error(
      "[lembretes] envio recusado",
      status ?? (e instanceof Error ? e.message : e),
      typeof corpo === "string" ? corpo.slice(0, 200) : "",
    );
    return "erro";
  }
}

function resumo(texto: string): Buffer {
  return createHash("sha256").update(texto, "utf8").digest();
}

/**
 * O cabeçalho Authorization bate com `Bearer ${CRON_SECRET}`? Compara os
 * hashes em tempo constante, então nem o tamanho do segredo vaza.
 */
export function segredoConfere(cabecalho: string | null): boolean {
  const segredo = process.env.CRON_SECRET;
  if (!segredo || !cabecalho) return false;
  return timingSafeEqual(resumo(cabecalho), resumo(`Bearer ${segredo}`));
}
