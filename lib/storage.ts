"use client";

import { getSupabase, type DailyCheckRow, type WeightRow } from "./supabase";
import { todayKey } from "./date";

export type DayCheck = {
  meals: Record<string, boolean>;
  /** Água do dia em MILILITROS. */
  water: number;
  workout: boolean;
  /**
   * Guarda três tipos de registro, distinguidos pelo id:
   * - suplementos (nac, omega3, colageno, ...) — data/supplements.ts
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

export async function getDay(date: string = todayKey()): Promise<DayCheck> {
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

async function upsertDay(date: string, partial: Partial<DailyCheckRow>): Promise<DayCheck> {
  const current = await getDay(date);
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
  if (error) console.error("upsertDay error", error);
  return rowToDay(merged);
}

export async function toggleMeal(
  mealId: string,
  date: string = todayKey(),
): Promise<DayCheck> {
  const current = await getDay(date);
  const meals = { ...current.meals, [mealId]: !current.meals[mealId] };
  return upsertDay(date, { meals });
}

export async function toggleSupplement(
  suppId: string,
  date: string = todayKey(),
): Promise<DayCheck> {
  const current = await getDay(date);
  const supplements = { ...current.supplements, [suppId]: !current.supplements[suppId] };
  return upsertDay(date, { supplements });
}

/** Item da rotina do protocolo. Mesma coluna dos suplementos — ver DayCheck. */
export async function toggleRotina(
  itemId: string,
  date: string = todayKey(),
): Promise<DayCheck> {
  return toggleSupplement(itemId, date);
}

/** Define a água do dia em mililitros. */
export async function setWater(ml: number, date: string = todayKey()): Promise<DayCheck> {
  const water = Math.max(0, Math.min(Math.round(ml), 6000));
  return upsertDay(date, { water });
}

/** Texto salvo por dia (gratidão, sintomas). Fica na mesma coluna — ver DayCheck. */
export async function setTextoDoDia(
  id: string,
  valor: string,
  date: string = todayKey(),
): Promise<DayCheck> {
  const current = await getDay(date);
  const supplements = { ...current.supplements, [`txt:${id}`]: valor };
  return upsertDay(date, { supplements });
}

export function getTextoDoDia(dia: DayCheck, id: string): string {
  const valor = dia.supplements[`txt:${id}`];
  return typeof valor === "string" ? valor : "";
}

export async function toggleWorkout(date: string = todayKey()): Promise<DayCheck> {
  const current = await getDay(date);
  return upsertDay(date, { workout: !current.workout });
}

export async function toggleExercise(
  exerciseId: string,
  date: string = todayKey(),
): Promise<DayCheck> {
  const current = await getDay(date);
  const exercises = { ...current.exercises, [exerciseId]: !current.exercises[exerciseId] };
  return upsertDay(date, { exercises });
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

export async function addWeight(entry: WeightEntry): Promise<WeightEntry[]> {
  const { error } = await getSupabase().from("weights").upsert(entry);
  if (error) console.error("addWeight error", error);
  return getWeights();
}

export async function removeWeight(date: string): Promise<WeightEntry[]> {
  const { error } = await getSupabase().from("weights").delete().eq("date", date);
  if (error) console.error("removeWeight error", error);
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
  const today = new Date();
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
    // Dia conta na sequência se ela cumpriu alguma parte relevante do protocolo:
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
