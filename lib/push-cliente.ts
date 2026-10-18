"use client";

import { getSupabase } from "./supabase";

/**
 * Lembretes no celular — o lado do aparelho.
 *
 * Cada aparelho que ativa os lembretes vira uma linha em push_subscriptions
 * (supabase/migrations/0007_lembretes.sql). O servidor (app/api/lembretes)
 * lê essas linhas a cada minuto e manda os avisos do horário.
 *
 * No iPhone, notificação só funciona com o app instalado na Tela de Início
 * (iOS 16.4 ou mais novo) e o pedido de permissão precisa sair de um toque.
 */

export type EstadoPush =
  /** iPhone/iPad abrindo pelo Safari: precisa instalar o app primeiro. */
  | "instalar-ios"
  /** Navegador sem notificação (ou iOS antigo). */
  | "sem-suporte"
  /** Falta a chave pública no deploy: o servidor ainda não foi configurado. */
  | "sem-chave"
  /** Ela negou a permissão — só volta pelos ajustes do aparelho. */
  | "bloqueado"
  /** Pode ativar: permissão ainda não pedida, ou dada mas sem inscrição. */
  | "desligado"
  /** Inscrito e com permissão: os lembretes chegam neste aparelho. */
  | "ativo";

/** Inlined no build — precisa ser lido assim, por extenso. */
const CHAVE_PUBLICA = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

export function temChavePublica(): boolean {
  return CHAVE_PUBLICA.trim().length > 0;
}

export function suportaPush(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function ehIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // O iPad novo se apresenta como Mac; o que entrega é a tela de toque.
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
}

/** Aberto pelo ícone da Tela de Início (ou instalado como app no computador). */
export function estaInstalado(): boolean {
  if (typeof window === "undefined") return false;
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return standalone || window.matchMedia("(display-mode: standalone)").matches;
}

let registro: Promise<ServiceWorkerRegistration> | null = null;

/** Registra public/sw.js uma vez por carregamento. */
export function registrarSW(): Promise<ServiceWorkerRegistration> {
  if (!registro) {
    registro = navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch((erro: unknown) => {
        registro = null; // deixa tentar de novo no próximo pedido
        throw erro;
      });
  }
  return registro;
}

async function inscricaoAtual(): Promise<PushSubscription | null> {
  const reg = (await navigator.serviceWorker.getRegistration("/")) ?? (await registrarSW());
  return reg.pushManager.getSubscription();
}

/** A chave pública em base64url, do jeito que o pushManager pede. */
function chaveEmBytes(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const cru = window.atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(new ArrayBuffer(cru.length));
  for (let i = 0; i < cru.length; i++) bytes[i] = cru.charCodeAt(i);
  return bytes;
}

/** A inscrição foi feita com a chave de hoje? Se a chave do servidor mudou, ela não recebe mais nada. */
function mesmaChave(sub: PushSubscription): boolean {
  const usada = sub.options?.applicationServerKey;
  if (!usada) return true; // navegador que não informa: confia
  const a = new Uint8Array(usada);
  const b = chaveEmBytes(CHAVE_PUBLICA.trim());
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

export async function estadoPush(): Promise<EstadoPush> {
  if (!suportaPush()) return ehIOS() && !estaInstalado() ? "instalar-ios" : "sem-suporte";
  if (!temChavePublica()) return "sem-chave";
  if (Notification.permission === "denied") return "bloqueado";
  if (Notification.permission !== "granted") return "desligado";
  try {
    const sub = await inscricaoAtual();
    return sub && mesmaChave(sub) ? "ativo" : "desligado";
  } catch {
    return "desligado";
  }
}

type Chaves = { endpoint: string; p256dh: string; auth: string };

function chavesDa(sub: PushSubscription): Chaves | null {
  const json = sub.toJSON();
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;
  if (!json.endpoint || !p256dh || !auth) return null;
  return { endpoint: json.endpoint, p256dh, auth };
}

/** Grava (ou atualiza) este aparelho em push_subscriptions. Devolve a mensagem de erro, ou null. */
async function salvarInscricao(sub: PushSubscription): Promise<string | null> {
  const chaves = chavesDa(sub);
  if (!chaves) return "O navegador não entregou as chaves da inscrição.";
  const { error } = await getSupabase()
    .from("push_subscriptions")
    .upsert(
      {
        ...chaves,
        user_agent: navigator.userAgent.slice(0, 300),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" },
    );
  return error ? error.message : null;
}

/**
 * Pede a permissão, inscreve o aparelho e guarda no banco. Chame direto do
 * toque no botão, sem nada esperando antes — o iPhone só mostra o pedido de
 * permissão dentro do gesto. Devolve a mensagem de erro, ou null.
 */
export async function ativarPush(): Promise<string | null> {
  if (!suportaPush()) return "Este navegador não recebe notificações.";
  if (!temChavePublica()) return "Os lembretes ainda não foram configurados no servidor.";

  // Primeira coisa do toque, antes de qualquer outra espera. Navegador antigo
  // ou pedido fora do gesto pode recusar com erro em vez de responder: aí ela
  // só precisa tocar de novo.
  let permissao: NotificationPermission;
  try {
    permissao = await Notification.requestPermission();
  } catch {
    return "Não deu para pedir a permissão. Toque de novo.";
  }
  if (permissao === "denied") {
    return "As notificações ficaram bloqueadas. No iPhone: Ajustes → Notificações → Mais Leve → ligue Permitir Notificações.";
  }
  if (permissao !== "granted") {
    return "A permissão não foi dada. Toque de novo e escolha Permitir.";
  }

  try {
    await registrarSW();
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (sub && !mesmaChave(sub)) {
      // Inscrição antiga, de outra chave: não recebe mais nada. Troca.
      const antiga = sub.endpoint;
      await sub.unsubscribe();
      await getSupabase().from("push_subscriptions").delete().eq("endpoint", antiga);
      sub = null;
    }
    sub ??= await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: chaveEmBytes(CHAVE_PUBLICA.trim()),
    });

    const erro = await salvarInscricao(sub);
    if (erro) {
      // Sem a linha no banco o servidor não acha o aparelho: desfaz para a
      // tela não dizer "ativo" à toa.
      await sub.unsubscribe().catch(() => {});
      return `Não deu para guardar este celular no servidor (${erro}). Tente de novo.`;
    }
    return null;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return `Não deu para ativar: ${msg}`;
  }
}

/** Cancela a inscrição deste aparelho e tira a linha do banco. Devolve a mensagem de erro, ou null. */
export async function desativarPush(): Promise<string | null> {
  try {
    const sub = await inscricaoAtual();
    if (!sub) return null;
    const endpoint = sub.endpoint;
    await sub.unsubscribe();
    // Se a remoção falhar (sem rede), o servidor apaga sozinho no próximo
    // envio: o serviço de push responde que a inscrição não existe mais.
    await getSupabase().from("push_subscriptions").delete().eq("endpoint", endpoint);
    return null;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return `Não deu para desativar: ${msg}`;
  }
}

/** Manda um aviso de teste só para este aparelho. Devolve a mensagem de erro, ou null. */
export async function enviarTeste(): Promise<string | null> {
  try {
    const { data } = await getSupabase().auth.getSession();
    const token = data.session?.access_token;
    if (!token) return "Entre no app de novo para mandar o teste.";
    const sub = await inscricaoAtual();
    if (!sub) return "Este celular não está inscrito. Ative os lembretes primeiro.";

    const resposta = await fetch("/api/lembretes/teste", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ subscription: sub.toJSON() }),
    });
    if (resposta.ok) return null;
    const corpo = (await resposta.json().catch(() => null)) as { erro?: string } | null;
    return corpo?.erro ?? `O servidor respondeu ${resposta.status}.`;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return `Não deu para mandar o teste: ${msg}`;
  }
}

let jaRessalvou = false;

/**
 * Uma vez por carregamento, regrava a inscrição deste aparelho — o navegador
 * pode trocar o endereço dela, e o banco precisa acompanhar. Nunca pede
 * permissão: só age se ela já ativou antes e está com login.
 *
 * A marca de "já fez" só vale depois que achou a sessão: aberto antes do
 * login, a chamada seguinte (já logada) ainda regrava.
 */
export async function ressalvarInscricao(): Promise<void> {
  if (jaRessalvou) return;
  if (!suportaPush() || !temChavePublica() || Notification.permission !== "granted") return;
  try {
    const { data } = await getSupabase().auth.getSession();
    if (!data.session) return;
    jaRessalvou = true;
    const sub = await inscricaoAtual();
    if (sub && mesmaChave(sub)) await salvarInscricao(sub);
  } catch {
    // em silêncio: a tela de Ajustes mostra o estado de verdade
  }
}
