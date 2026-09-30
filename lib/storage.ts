"use client";

import { getSupabase, type DailyCheckRow, type WeightRow } from "./supabase";
import { hojeKey, todayKey } from "./date";

export type DayCheck = {
  meals: Record<string, boolean>;
  /** Água do dia em MILILITROS. */
  water: number;
  workout: boolean;
  /**
   * Guarda três tipos de registro, distinguidos pelo id:
   * - remédios e suplementos (mounjaro, b12, colageno, ...) — data/supplements.ts
   * - itens da rotina (r-m-agua, r-n-dormir, ...) — data/protocol.ts
   * - textos do dia (txt:gratidao, txt:sintomas), que guardam string
   *
   * Os três moram na mesma coluna `supplements` do Supabase de propósito: são
   * registros do mesmo dia, e assim rotina e campos de texto funcionam sem
   * precisar de migração de schema.
   */
  supplements: Record<string, boolean | string>;
  exercises: Record<string, boolean>;
};

/**
 * Registros antigos guardavam garrafas de 1,2 L (0, 1 ou 2) em vez de ml.
 * Qualquer valor até 3 é lido como garrafa para o histórico não virar 2 ml.
 */
export function aguaEmMl(valorBruto: number): number {
  if (valorBruto <= 3) return valorBruto * 1200;
  return valorBruto;
}

export type WeightEntry = {
  date: string;
  weight: number;
};

const EMPTY_DAY: DayCheck = {
  meals: {},
  water: 0,
  workout: false,
  supplements: {},
  exercises: {},
};

function rowToDay(row: DailyCheckRow | null | undefined): DayCheck {
  if (!row) return { ...EMPTY_DAY, meals: {}, supplements: {}, exercises: {} };
  return {
    meals: row.meals ?? {},
    water: aguaEmMl(row.water ?? 0),
    workout: row.workout ?? false,
    supplements: row.supplements ?? {},
    exercises: row.exercises ?? {},
  };
}

export async function getDay(date: string = hojeKey()): Promise<DayCheck> {
  const { data, error } = await getSupabase()
    .from("daily_checks")
    .select("*")
    .eq("date", date)
    .maybeSingle();
  if (error) {
    console.error("getDay error", error);
    return { ...EMPTY_DAY };
  }
  return rowToDay(data as DailyCheckRow | null);
}

/**
 * Como getDay, mas conta quando a leitura falhou. Um dia que não carregou não
 * é um dia em branco: a tela avisa, em vez de mostrar o Mounjaro como pendente
 * quando ele pode já ter sido aplicado.
 */
export async function getDayComErro(
  date: string = hojeKey(),
): Promise<{ dia: DayCheck; erro: boolean }> {
  const { data, error } = await getSupabase()
    .from("daily_checks")
    .select("*")
    .eq("date", date)
    .maybeSingle();
  if (error) {
    console.error("getDay error", error);
    return { dia: { ...EMPTY_DAY, meals: {}, supplements: {}, exercises: {} }, erro: true };
  }
  return { dia: rowToDay(data as DailyCheckRow | null), erro: false };
}

/** Todos os dias de um intervalo, em uma consulta só — usado pelo histórico. */
export async function getPeriodo(
  inicio: string,
  fim: string,
): Promise<Record<string, DayCheck>> {
  const { data, error } = await getSupabase()
    .from("daily_checks")
    .select("*")
    .gte("date", inicio)
    .lte("date", fim)
    .order("date", { ascending: true });
  if (error || !data) {
    if (error) console.error("getPeriodo error", error);
    return {};
  }
  const mapa: Record<string, DayCheck> = {};
  for (const row of data as DailyCheckRow[]) mapa[row.date] = rowToDay(row);
  return mapa;
}

/**
 * Lê o dia para gravar em cima. Diferente de getDay, aqui erro não vira "dia
 * vazio": se a leitura falha e a gravação passa, a linha do dia seria trocada
 * por uma quase vazia — e iam embora as marcações, os sintomas e a gratidão.
 * Melhor não gravar aquele toque do que apagar o dia.
 */
async function lerDiaParaGravar(date: string): Promise<DayCheck> {
  // Sem as novas tentativas automáticas do supabase-js (1 s + 2 s + 4 s): num
  // toque, é melhor ela saber em 1 segundo que não salvou do que em 7.
  const { data, error } = await getSupabase()
    .from("daily_checks")
    .select("*")
    .eq("date", date)
    .maybeSingle()
    .retry(false);
  if (error) throw new Error(`Não deu para ler ${date} antes de gravar: ${error.message}`);
  return rowToDay(data as DailyCheckRow | null);
}

/**
 * Gravações do mesmo dia entram numa fila, uma de cada vez. Cada gravação lê o
 * dia e grava a linha inteira; se duas se cruzassem (a água e uma refeição
 * tocadas juntas na tela inicial), a segunda gravaria por cima da primeira com
 * o dia que leu antes — e a primeira marca sumiria.
 */
const filaPorDia = new Map<string, Promise<unknown>>();

function naFila<T>(date: string, tarefa: () => Promise<T>): Promise<T> {
  const anterior = filaPorDia.get(date) ?? Promise.resolve();
  // Roda depois da anterior terminar, tenha ela dado certo ou não.
  const atual = anterior.then(tarefa, tarefa);
  // O que fica na fila nunca rejeita: o erro é de quem chamou, não da fila.
  const fim = atual.then(
    () => undefined,
    () => undefined,
  );
  filaPorDia.set(date, fim);
  void fim.then(() => {
    if (filaPorDia.get(date) === fim) filaPorDia.delete(date);
  });
  return atual;
}

/** Evento que avisa a tela de que um dia foi gravado (o resumo do topo escuta). */
export const EVENTO_DIA_GRAVADO = "mais-leve:dia-gravado";

async function upsertDay(
  date: string,
  partial: Partial<DailyCheckRow>,
  atual?: DayCheck,
): Promise<DayCheck> {
  const current = atual ?? (await lerDiaParaGravar(date));
  const merged: DailyCheckRow = {
    date,
    meals: current.meals,
    water: current.water,
    workout: current.workout,
    supplements: current.supplements,
    exercises: current.exercises,
    ...partial,
  };
  const { error } = await getSupabase().from("daily_checks").upsert(merged);
  // A gravação que falha precisa chegar à tela: é o caso mais comum em rede
  // ruim, porque o supabase-js repete a leitura, mas nunca a gravação.
  if (error) throw new Error(`Não deu para gravar ${date}: ${error.message}`);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVENTO_DIA_GRAVADO, { detail: date }));
  }
  return rowToDay(merged);
}

/*
 * Os toques recebem o valor que a tela quer gravar (`valor`). Inverter o que
 * está no banco dava errado quando a tela mostrava outra coisa — um dia que não
 * carregou, por exemplo: o toque para "marcar" desmarcava. Sem `valor`, inverte.
 */

export async function toggleMeal(
  mealId: string,
  date: string = hojeKey(),
  valor?: boolean,
): Promise<DayCheck> {
  return naFila(date, async () => {
    const current = await lerDiaParaGravar(date);
    const meals = { ...current.meals, [mealId]: valor ?? !current.meals[mealId] };
    return upsertDay(date, { meals }, current);
  });
}

export async function toggleSupplement(
  suppId: string,
  date: string = hojeKey(),
  valor?: boolean,
): Promise<DayCheck> {
  return naFila(date, async () => {
    const current = await lerDiaParaGravar(date);
    const supplements = {
      ...current.supplements,
      [suppId]: valor ?? !current.supplements[suppId],
    };
    return upsertDay(date, { supplements }, current);
  });
}

/** Item da rotina. Mesma coluna dos suplementos — ver DayCheck. */
export async function toggleRotina(
  itemId: string,
  date: string = hojeKey(),
  valor?: boolean,
): Promise<DayCheck> {
  return toggleSupplement(itemId, date, valor);
}

/** Define a água do dia em mililitros (usado para zerar). */
export async function setWater(ml: number, date: string = hojeKey()): Promise<DayCheck> {
  const water = Math.max(0, Math.min(Math.round(ml), 6000));
  return naFila(date, () => upsertDay(date, { water }));
}

/**
 * Soma (ou tira, com número negativo) água ao que está gravado. O "+200" não
 * pode mandar o total que a tela calculou: com a tela ainda carregando, ou
 * depois de uma leitura que falhou, ela acha que são 0 ml — e 1,4 L virava 200.
 */
export async function somarAgua(delta: number, date: string = hojeKey()): Promise<DayCheck> {
  return naFila(date, async () => {
    const current = await lerDiaParaGravar(date);
    const water = Math.max(0, Math.min(Math.round(current.water + delta), 6000));
    return upsertDay(date, { water }, current);
  });
}

/**
 * Textos que não gravaram, por "dia:id". Vive no módulo, não na tela: se ela
 * digitou e saiu da página (ou trocou de dia) com a gravação falhando, a caixa
 * volta com o que ela escreveu e o aviso — em vez de o texto sumir calado.
 */
const textosNaoSalvos = new Map<string, string>();

/** O texto que ela digitou e não gravou nesse dia, se houver. */
export function textoNaoSalvo(date: string, id: string): string | undefined {
  return textosNaoSalvos.get(`${date}:${id}`);
}

/** Texto salvo por dia (gratidão, sintomas, carga). Fica na mesma coluna — ver DayCheck. */
export async function setTextoDoDia(
  id: string,
  valor: string,
  date: string = hojeKey(),
): Promise<DayCheck> {
  const chave = `${date}:${id}`;
  try {
    const novo = await naFila(date, async () => {
      const current = await lerDiaParaGravar(date);
      const supplements = { ...current.supplements, [`txt:${id}`]: valor };
      return upsertDay(date, { supplements }, current);
    });
    textosNaoSalvos.delete(chave);
    return novo;
  } catch (err) {
    textosNaoSalvos.set(chave, valor);
    throw err;
  }
}

export function getTextoDoDia(dia: DayCheck, id: string): string {
  const valor = dia.supplements[`txt:${id}`];
  return typeof valor === "string" ? valor : "";
}

export async function toggleWorkout(
  date: string = hojeKey(),
  valor?: boolean,
): Promise<DayCheck> {
  return naFila(date, async () => {
    const current = await lerDiaParaGravar(date);
    return upsertDay(date, { workout: valor ?? !current.workout }, current);
  });
}

export async function toggleExercise(
  exerciseId: string,
  date: string = hojeKey(),
  valor?: boolean,
): Promise<DayCheck> {
  return naFila(date, async () => {
    const current = await lerDiaParaGravar(date);
    const exercises = {
      ...current.exercises,
      [exerciseId]: valor ?? !current.exercises[exerciseId],
    };
    return upsertDay(date, { exercises }, current);
  });
}

export async function getWeights(): Promise<WeightEntry[]> {
  const { data, error } = await getSupabase()
    .from("weights")
    .select("date, weight")
    .order("date", { ascending: true });
  if (error) {
    console.error("getWeights error", error);
    return [];
  }
  return (data as WeightRow[]).map((r) => ({ date: r.date, weight: Number(r.weight) }));
}

/** Grava a pesagem. Se não gravar, lança — a tela avisa e guarda o que ela digitou. */
export async function addWeight(entry: WeightEntry): Promise<WeightEntry[]> {
  const { error } = await getSupabase().from("weights").upsert(entry);
  if (error) throw new Error(`Não deu para gravar o peso de ${entry.date}: ${error.message}`);
  return getWeights();
}

/** Apaga a pesagem. Se não apagar, lança — a tela avisa e a pesagem continua na lista. */
export async function removeWeight(date: string): Promise<WeightEntry[]> {
  const { error } = await getSupabase().from("weights").delete().eq("date", date);
  if (error) throw new Error(`Não deu para apagar o peso de ${date}: ${error.message}`);
  return getWeights();
}

/* -------------------------------------------------------------------------- */
/* Medidas corporais                                                          */
/* -------------------------------------------------------------------------- */

export type Medidas = {
  date: string;
  cintura: number | null;
  abdomen: number | null;
  quadril: number | null;
  braco: number | null;
  coxa: number | null;
};

export const CAMPOS_MEDIDAS = [
  { chave: "cintura", rotulo: "Cintura" },
  { chave: "abdomen", rotulo: "Abdômen" },
  { chave: "quadril", rotulo: "Quadril" },
  { chave: "braco", rotulo: "Braço" },
  { chave: "coxa", rotulo: "Coxa" },
] as const;

const CHAVE_MEDIDAS = "desinflama-medidas";

function medidasLocais(): Medidas[] {
  if (typeof window === "undefined") return [];
  try {
    const cru = window.localStorage.getItem(CHAVE_MEDIDAS);
    const lista = cru ? JSON.parse(cru) : [];
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

function gravarMedidasLocais(lista: Medidas[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAVE_MEDIDAS, JSON.stringify(lista));
  } catch {
    // sem espaço — segue só com a nuvem
  }
}

/**
 * Medidas do antes e depois. Usa a tabela `measurements` quando ela existe;
 * enquanto não existir, guarda no próprio aparelho para nada se perder.
 */
export async function getMedidas(): Promise<Medidas[]> {
  try {
    const { data, error } = await getSupabase()
      .from("measurements")
      .select("date, cintura, abdomen, quadril, braco, coxa")
      .order("date", { ascending: true });
    if (!error && data) {
      const lista = data as Medidas[];
      gravarMedidasLocais(lista);
      return lista;
    }
  } catch {
    // tabela ausente ou sem rede
  }
  return medidasLocais().sort((a, b) => a.date.localeCompare(b.date));
}

export async function salvarMedidas(medida: Medidas): Promise<Medidas[]> {
  const local = medidasLocais().filter((m) => m.date !== medida.date);
  gravarMedidasLocais([...local, medida].sort((a, b) => a.date.localeCompare(b.date)));
  try {
    const { error } = await getSupabase().from("measurements").upsert(medida);
    if (error) console.warn("medidas: salvando só no aparelho", error.message);
  } catch {
    // segue no aparelho
  }
  return getMedidas();
}

export async function removerMedidas(date: string): Promise<Medidas[]> {
  gravarMedidasLocais(medidasLocais().filter((m) => m.date !== date));
  try {
    await getSupabase().from("measurements").delete().eq("date", date);
  } catch {
    // segue no aparelho
  }
  return getMedidas();
}

export type ShoppingState = {
  items: Record<string, boolean>;
  selectedComponents: Record<string, boolean>;
};

const EMPTY_SHOPPING: ShoppingState = { items: {}, selectedComponents: {} };

export async function getShoppingState(): Promise<ShoppingState> {
  const { data, error } = await getSupabase()
    .from("shopping_state")
    .select("items, selected_components")
    .eq("id", 1)
    .maybeSingle();
  if (error) {
    console.error("getShoppingState error", error);
    return { ...EMPTY_SHOPPING };
  }
  return {
    items: (data?.items as Record<string, boolean> | null) ?? {},
    selectedComponents:
      (data?.selected_components as Record<string, boolean> | null) ?? {},
  };
}

async function setShoppingState(
  partial: Partial<{
    items: Record<string, boolean>;
    selected_components: Record<string, boolean>;
  }>,
): Promise<ShoppingState> {
  const current = await getShoppingState();
  const merged = {
    id: 1,
    items: partial.items ?? current.items,
    selected_components: partial.selected_components ?? current.selectedComponents,
    updated_at: new Date().toISOString(),
  };
  const { error } = await getSupabase().from("shopping_state").upsert(merged);
  if (error) console.error("setShoppingState error", error);
  return {
    items: merged.items,
    selectedComponents: merged.selected_components,
  };
}

export async function toggleShoppingItem(itemId: string): Promise<ShoppingState> {
  const current = await getShoppingState();
  const items = { ...current.items, [itemId]: !current.items[itemId] };
  return setShoppingState({ items });
}

export async function toggleComponentSelection(
  componentId: string,
): Promise<ShoppingState> {
  const current = await getShoppingState();
  const selected_components = {
    ...current.selectedComponents,
    [componentId]: !current.selectedComponents[componentId],
  };
  return setShoppingState({ selected_components });
}

/** Marca ou desmarca vários itens do cardápio de uma vez (ex.: "selecionar o dia todo"). */
export async function setComponentsSelection(
  ids: string[],
  value: boolean,
): Promise<ShoppingState> {
  const current = await getShoppingState();
  const selected_components = { ...current.selectedComponents };
  for (const id of ids) selected_components[id] = value;
  return setShoppingState({ selected_components });
}

export async function clearShoppingChecked(): Promise<ShoppingState> {
  return setShoppingState({ items: {} });
}

export async function clearSelectedComponents(): Promise<ShoppingState> {
  return setShoppingState({ selected_components: {}, items: {} });
}

// Compat
export async function getShopping(): Promise<Record<string, boolean>> {
  const s = await getShoppingState();
  return s.items;
}

export async function getStreak(): Promise<number> {
  const today = new Date(`${hojeKey()}T12:00:00`);
  const start = new Date(today);
  start.setDate(start.getDate() - 60);
  const { data, error } = await getSupabase()
    .from("daily_checks")
    .select("*")
    .gte("date", todayKey(start))
    .lte("date", todayKey(today))
    .order("date", { ascending: false });
  if (error || !data) return 0;
  const rows = data as DailyCheckRow[];
  const byDate = new Map(rows.map((r) => [r.date, r]));

  let streak = 0;
  const cursor = new Date(today);
  for (let i = 0; i < 60; i++) {
    const key = todayKey(cursor);
    const row = byDate.get(key);
    // Dia conta na sequência se ela cumpriu alguma parte relevante do plano:
    // metade das refeições, a água, o treino ou boa parte da rotina.
    const rotinaMarcada = Object.entries(row?.supplements ?? {}).filter(
      ([id, v]) => v && id.startsWith("r-"),
    ).length;
    const adherent = row
      ? Object.values(row.meals ?? {}).filter(Boolean).length >= 2 ||
        aguaEmMl(row.water ?? 0) >= 300 ||
        !!row.workout ||
        rotinaMarcada >= 5
      : false;
    if (i === 0 && !adherent) {
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    if (!adherent) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
