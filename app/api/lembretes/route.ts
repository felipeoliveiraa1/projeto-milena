import type { NextRequest } from "next/server";
import { agendaDoDia, tituloDosRemedios, type Lembrete } from "@/lib/lembretes";
import { lerPreferencias } from "@/lib/preferencias";
import { HORA_VIRADA_DO_DIA } from "@/lib/date";
import { paraMinutos } from "@/lib/janela";
import {
  agoraEmSaoPaulo,
  clienteAdmin,
  configurarWebPush,
  enviar,
  ErroDeConfiguracao,
  inscricaoValida,
  segredoConfere,
  type Inscricao,
} from "@/lib/push-servidor";

/**
 * Disparo dos lembretes. O pg_cron do Supabase chama esta rota a cada minuto
 * (supabase/migrations/0007_lembretes.sql) com `Authorization: Bearer
 * CRON_SECRET`. Ela olha a agenda do dia (lib/lembretes.ts), separa o que
 * venceu nos últimos 15 minutos, pula o que a Milena já marcou no app e manda
 * o resto para cada aparelho inscrito — uma vez só por lembrete e por dia.
 *
 * `?dry=1` mostra o que sairia agora, sem gravar e sem mandar nada.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Um cron que falhou ou atrasou não perde o lembrete: o seguinte, dentro de
 * 15 minutos, ainda manda. O registro em push_envios impede o aviso em dobro.
 */
const JANELA_MINUTOS = 15;

function resposta(status: number, corpo: unknown): Response {
  return Response.json(corpo, { status, headers: { "Cache-Control": "no-store" } });
}

/** Mesma regra de lib/storage.ts: até 3 são garrafas antigas de 1,2 L. */
function aguaEmMl(valor: unknown): number {
  const n = typeof valor === "number" ? valor : Number(valor);
  if (!isFinite(n) || n <= 0) return 0;
  return n <= 3 ? n * 1200 : n;
}

type Marcados = { supplements: Record<string, unknown>; water: number };

/**
 * Tira do lembrete o que ela já marcou. Remédio: some a linha de cada item já
 * marcado; todos marcados, o lembrete inteiro sai. Água: sai quando o que ela
 * bebeu já chega ao esperado depois daquele copo.
 */
function semOQueJaFoiFeito(l: Lembrete, dia: Marcados | null): Lembrete | null {
  if (!dia) return l;
  if (l.tipo === "agua") {
    return l.aguaAteMl !== undefined && dia.water >= l.aguaAteMl ? null : l;
  }
  const ids = l.suplementos ?? [];
  if (ids.length === 0) return l;
  const feito = ids.map((id) => dia.supplements[id] === true);
  if (feito.every(Boolean)) return null;
  if (!feito.some(Boolean)) return l;
  // Uma linha por remédio, na mesma ordem de `suplementos` (lib/lembretes.ts:
  // o semanal primeiro, linhas e ids da mesma lista). Se um dia isso deixar de
  // bater, manda o texto inteiro em vez de errar a linha.
  const linhas = l.corpo.split("\n");
  if (linhas.length !== ids.length) return l;
  const faltam = ids.filter((_, i) => !feito[i]);
  return {
    ...l,
    // Mounjaro já marcado sai do título também, não só da linha.
    titulo: tituloDosRemedios(l.hora, faltam),
    corpo: linhas.filter((_, i) => !feito[i]).join("\n"),
    suplementos: faltam,
  };
}

async function disparar(req: NextRequest): Promise<Response> {
  if (!process.env.CRON_SECRET) {
    return resposta(500, { erro: "falta CRON_SECRET no servidor" });
  }
  if (!segredoConfere(req.headers.get("authorization"))) {
    return resposta(401, { erro: "não autorizado" });
  }
  const dry = req.nextUrl.searchParams.get("dry") === "1";

  try {
    const db = clienteAdmin();
    if (!dry) configurarWebPush();

    const agora = agoraEmSaoPaulo();

    const { data: config, error: erroConfig } = await db
      .from("app_config")
      .select("preferencias")
      .eq("id", 1)
      .maybeSingle();
    if (erroConfig) throw new Error(`app_config: ${erroConfig.message}`);
    const prefs = lerPreferencias(config?.preferencias);

    // Diagnóstico (só com a senha): a agenda inteira de hoje do jeito que o
    // servidor enxerga, sem gravar nem mandar nada. Serve para conferir de
    // fora por que um lembrete não chegou.
    if (req.nextUrl.searchParams.get("agenda") === "1") {
      return resposta(200, {
        agora: { data: agora.data, hora: agora.hora },
        lembretes: { remedios: prefs.lembretesRemedios, agua: prefs.lembretesAgua },
        agua: {
          metaMl: prefs.aguaMetaMl,
          copoMl: prefs.aguaCopoMl,
          inicio: prefs.aguaInicio,
          fim: prefs.aguaFim,
        },
        janela: { inicio: prefs.janelaInicio, fim: prefs.janelaFim },
        acordar: prefs.horaAcordar,
        dormir: prefs.horaDormir,
        horariosEditados: prefs.horariosRemedios,
        // O que ela pausou na Farmácia (o psyllium): fica fora da agenda abaixo.
        pausados: prefs.remediosPausados,
        agenda: agendaDoDia(prefs, agora.data).map((l) => ({ id: l.id, hora: l.hora, titulo: l.titulo })),
      });
    }

    const vencidos = agendaDoDia(prefs, agora.data).filter((l) => {
      const m = paraMinutos(l.hora);
      return m > agora.minutos - JANELA_MINUTOS && m <= agora.minutos;
    });

    // Antes das 05:00 o app ainda grava no dia anterior (lib/date.ts), e a
    // marca de ontem não diz nada sobre o remédio de hoje: aí manda sem pular.
    let dia: Marcados | null = null;
    if (vencidos.length > 0 && agora.minutos >= HORA_VIRADA_DO_DIA * 60) {
      const { data: linha, error: erroDia } = await db
        .from("daily_checks")
        .select("supplements, water")
        .eq("date", agora.data)
        .maybeSingle();
      if (erroDia) throw new Error(`daily_checks: ${erroDia.message}`);
      dia = {
        supplements: (linha?.supplements as Record<string, unknown> | null) ?? {},
        water: aguaEmMl(linha?.water),
      };
    }

    const pendentes = vencidos
      .map((l) => semOQueJaFoiFeito(l, dia))
      .filter((l): l is Lembrete => l !== null);
    const pulados = vencidos.filter((v) => !pendentes.some((p) => p.id === v.id)).map((v) => v.id);

    const { data: linhas, error: erroInscricoes } = await db
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth");
    if (erroInscricoes) throw new Error(`push_subscriptions: ${erroInscricoes.message}`);
    const inscricoes = (linhas ?? []).filter(inscricaoValida) as Inscricao[];

    const base = {
      agora: { data: agora.data, hora: agora.hora },
      devidos: pendentes.map((l) => ({ id: l.id, hora: l.hora, titulo: l.titulo, corpo: l.corpo })),
      pulados,
      assinaturas: inscricoes.length,
    };

    if (dry) return resposta(200, { ...base, dry: true, enviados: 0, expiradas: 0 });
    if (pendentes.length === 0 || inscricoes.length === 0) {
      return resposta(200, { ...base, enviados: 0, expiradas: 0 });
    }

    // Reserva cada lembrete do dia antes de mandar: se dois disparos se
    // cruzarem, só um recebe a chave de volta e só ele manda.
    const { data: reservadas, error: erroReserva } = await db
      .from("push_envios")
      .upsert(
        pendentes.map((l) => ({ chave: `${agora.data}|${l.id}` })),
        { onConflict: "chave", ignoreDuplicates: true },
      )
      .select("chave");
    if (erroReserva) throw new Error(`push_envios: ${erroReserva.message}`);
    const novas = new Set((reservadas ?? []).map((r: { chave: string }) => r.chave));
    const aMandar = pendentes.filter((l) => novas.has(`${agora.data}|${l.id}`));

    const envios = aMandar.flatMap((l) =>
      inscricoes.map(async (sub) => ({
        id: l.id,
        endpoint: sub.endpoint,
        resultado: await enviar(sub, {
          title: l.titulo,
          body: l.corpo,
          tag: `${agora.data}|${l.id}`,
          url: l.url,
        }),
      })),
    );
    const resultados = await Promise.all(envios);

    // Lembrete que não chegou a aparelho nenhum por falha do envio (não por
    // inscrição vencida) solta a reserva: o disparo do minuto seguinte tenta de
    // novo, ainda dentro dos 15 minutos. Se chegou a um aparelho, fica reservado
    // — mandar de novo daria aviso em dobro nesse aparelho.
    const liberados = aMandar
      .filter((l) => {
        const deste = resultados.filter((r) => r.id === l.id);
        return (
          !deste.some((r) => r.resultado === "ok") && deste.some((r) => r.resultado === "erro")
        );
      })
      .map((l) => l.id);
    if (liberados.length > 0) {
      console.error("[lembretes] nenhum aparelho recebeu, tenta de novo:", liberados.join(", "));
      const { error: erroLiberar } = await db
        .from("push_envios")
        .delete()
        .in(
          "chave",
          liberados.map((id) => `${agora.data}|${id}`),
        );
      if (erroLiberar) console.error("[lembretes] liberar reserva:", erroLiberar.message);
    }

    const expiradas = [
      ...new Set(resultados.filter((r) => r.resultado === "expirada").map((r) => r.endpoint)),
    ];
    if (expiradas.length > 0) {
      const { error: erroLimpeza } = await db
        .from("push_subscriptions")
        .delete()
        .in("endpoint", expiradas);
      if (erroLimpeza) console.error("[lembretes] limpeza:", erroLimpeza.message);
    }

    return resposta(200, {
      ...base,
      // O que saiu nesta chamada; o resto de `devidos` já tinha saído antes.
      novos: aMandar.map((l) => l.id),
      enviados: resultados.filter((r) => r.resultado === "ok").length,
      erros: resultados.filter((r) => r.resultado === "erro").length,
      expiradas: expiradas.length,
      // Os que voltaram para a fila: o próximo minuto tenta mandar de novo.
      liberados,
    });
  } catch (e) {
    if (e instanceof ErroDeConfiguracao) return resposta(500, { erro: e.message });
    console.error("[lembretes]", e instanceof Error ? e.message : e);
    return resposta(500, { erro: "falha ao montar os lembretes — veja o log da função" });
  }
}

export function GET(req: NextRequest) {
  return disparar(req);
}

export function POST(req: NextRequest) {
  return disparar(req);
}
