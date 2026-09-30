"use client";

import { getSupabase } from "./supabase";
import { BUCKET } from "./photos";
import { setInicio } from "./protocol";
import { TABELA_BIOIMPEDANCIA, limparExamesLocais } from "./bioimpedancia";

/**
 * Recomeçar do zero.
 *
 * Cada parte é opcional de propósito: quase sempre o que se quer apagar é o
 * progresso (dias, pesagens, medidas, fotos, exames), e não a configuração —
 * metas, janela do jejum, fase do treino e a rotina que ela montou continuam
 * de pé, a não ser que ela peça.
 *
 * Não tem desfazer. Quem chama isto já confirmou.
 */
export type EscopoReset = {
  dias: boolean;
  pesagens: boolean;
  medidas: boolean;
  fotos: boolean;
  /**
   * Exames de bioimpedância registrados no app. O de partida (12/08) fica: ele
   * mora no código, em data/bioimpedancia.ts.
   */
  bioimpedancia: boolean;
  compras: boolean;
  /** Nova data de início da jornada (AAAA-MM-DD). Vazio = não mexe. */
  novoInicio?: string;
};

export type ResultadoReset = {
  apagados: string[];
  erros: string[];
};

/** Filtro que pega todas as linhas — o PostgREST exige algum where no delete. */
const TODAS_AS_DATAS = "1900-01-01";

/**
 * Tabela que ainda não foi criada no Supabase não é erro para quem nunca usou.
 * O Postgres responde 42P01; o PostgREST mais novo, PGRST205 ("schema cache").
 */
function tabelaAusente(error: { code?: string; message: string }): boolean {
  const mensagem = error.message.toLowerCase();
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    mensagem.includes("does not exist") ||
    mensagem.includes("schema cache")
  );
}

export async function resetar(escopo: EscopoReset): Promise<ResultadoReset> {
  const supabase = getSupabase();
  const apagados: string[] = [];
  const erros: string[] = [];

  if (escopo.dias) {
    const { error } = await supabase
      .from("daily_checks")
      .delete()
      .gte("date", TODAS_AS_DATAS);
    if (error) erros.push(`dias registrados: ${error.message}`);
    else apagados.push("dias registrados");
  }

  if (escopo.pesagens) {
    const { error } = await supabase
      .from("weights")
      .delete()
      .gte("date", TODAS_AS_DATAS);
    if (error) erros.push(`pesagens: ${error.message}`);
    else apagados.push("pesagens");
  }

  if (escopo.medidas) {
    const { error } = await supabase
      .from("measurements")
      .delete()
      .gte("date", TODAS_AS_DATAS);
    if (error && !tabelaAusente(error)) {
      erros.push(`medidas: ${error.message}`);
    } else {
      apagados.push("medidas");
    }
  }

  if (escopo.fotos) {
    const caminhos: string[] = [];
    for (const pasta of ["frente", "lado", "costas"]) {
      const { data } = await supabase.storage
        .from(BUCKET)
        .list(pasta, { limit: 500 });
      for (const arquivo of data ?? [])
        caminhos.push(`${pasta}/${arquivo.name}`);
    }
    if (caminhos.length > 0) {
      const { error } = await supabase.storage.from(BUCKET).remove(caminhos);
      if (error) erros.push(`fotos: ${error.message}`);
      else apagados.push(`fotos (${caminhos.length})`);
    } else {
      apagados.push("fotos");
    }
  }

  if (escopo.bioimpedancia) {
    const { error } = await supabase
      .from(TABELA_BIOIMPEDANCIA)
      .delete()
      .gte("date", TODAS_AS_DATAS);
    // O aparelho também guarda cópia, os exames que ainda não subiram e as
    // exclusões na fila: sem limpar aqui, os exames voltariam na próxima
    // abertura da aba.
    limparExamesLocais();
    if (error && !tabelaAusente(error)) {
      erros.push(`exames de bioimpedância: ${error.message}`);
    } else {
      apagados.push("exames de bioimpedância");
    }
  }

  if (escopo.compras) {
    const { error } = await supabase
      .from("shopping_state")
      .upsert({
        id: 1,
        items: {},
        selected_components: {},
        updated_at: new Date().toISOString(),
      });
    if (error) erros.push(`lista de compras: ${error.message}`);
    else apagados.push("lista de compras");
  }

  if (escopo.novoInicio && /^\d{4}-\d{2}-\d{2}$/.test(escopo.novoInicio)) {
    setInicio(escopo.novoInicio);
    apagados.push(
      `início da jornada em ${escopo.novoInicio.split("-").reverse().join("/")}`,
    );
  }

  return { apagados, erros };
}
