import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  configurarWebPush,
  enviar,
  ErroDeConfiguracao,
  inscricaoValida,
} from "@/lib/push-servidor";

/**
 * "Enviar um teste" de Ajustes → Lembretes no celular. Manda um aviso só para
 * o aparelho que pediu. Precisa do login de quem está na lista
 * (allowed_users): o token da sessão vem no Authorization e o Supabase
 * confere a pessoa e o is_allowed().
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function resposta(status: number, corpo: unknown): Response {
  return Response.json(corpo, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest): Promise<Response> {
  const cabecalho = req.headers.get("authorization") ?? "";
  const token = cabecalho.startsWith("Bearer ") ? cabecalho.slice(7).trim() : "";
  if (!token) return resposta(401, { erro: "Entre no app de novo para mandar o teste." });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !chave) {
    return resposta(500, { erro: "falta NEXT_PUBLIC_SUPABASE_URL ou a chave pública no servidor" });
  }

  // Cliente com a chave pública e o token dela: o banco enxerga a pessoa
  // logada, com o mesmo RLS do app.
  const supabase = createClient(url, chave, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: usuario, error: erroUsuario } = await supabase.auth.getUser(token);
  if (erroUsuario || !usuario.user) {
    return resposta(401, { erro: "Sessão vencida. Saia e entre de novo no app." });
  }
  const { data: liberado, error: erroLista } = await supabase.rpc("is_allowed");
  if (erroLista || liberado !== true) {
    return resposta(403, { erro: "Esta conta não tem acesso aos lembretes." });
  }

  const corpo = (await req.json().catch(() => null)) as {
    subscription?: { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
  } | null;
  const sub = {
    endpoint: corpo?.subscription?.endpoint,
    p256dh: corpo?.subscription?.keys?.p256dh,
    auth: corpo?.subscription?.keys?.auth,
  };
  if (!inscricaoValida(sub)) {
    return resposta(400, { erro: "A inscrição deste celular veio incompleta. Desative e ative de novo." });
  }

  try {
    configurarWebPush();
  } catch (e) {
    if (e instanceof ErroDeConfiguracao) return resposta(500, { erro: e.message });
    throw e;
  }

  const resultado = await enviar(sub, {
    title: "Mais Leve · teste",
    body: "Os lembretes estão funcionando neste celular.",
    tag: "mais-leve-teste",
    url: "/ajustes",
  });
  if (resultado === "ok") return resposta(200, { ok: true });
  if (resultado === "expirada") {
    return resposta(410, { erro: "Esta inscrição expirou. Desative e ative de novo neste celular." });
  }
  return resposta(502, { erro: "O serviço de notificações recusou o envio. Tente de novo daqui a pouco." });
}
