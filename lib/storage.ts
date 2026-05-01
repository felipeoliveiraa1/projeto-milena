"use client";

import { getSupabase, type DailyCheckRow, type WeightRow } from "./supabase";
import { todayKey } from "./date";

export type DayCheck = {
  meals: Record<string, boolean>;
  water: number;
  workout: boolean;
  supplements: Record<string, boolean>;
};

export type WeightEntry = {
  date: string;
  weight: number;
};

const EMPTY_DAY: DayCheck = {
  meals: {},
  water: 0,
  workout: false,
  supplements: {},
};

function rowToDay(row: DailyCheckRow | null | undefined): DayCheck {
  if (!row) return { ...EMPTY_DAY };
  return {
    meals: row.meals ?? {},
    water: row.water ?? 0,
    workout: row.workout ?? false,
    supplements: row.supplements ?? {},
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

async function upsertDay(date: string, partial: Partial<DailyCheckRow>): Promise<DayCheck> {
  const current = await getDay(date);
  const merged: DailyCheckRow = {
    date,
    meals: current.meals,
    water: current.water,
    workout: current.workout,
    supplements: current.supplements,
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

export async function setWater(value: number, date: string = todayKey()): Promise<DayCheck> {
  const water = Math.max(0, Math.min(value, 2));
  return upsertDay(date, { water });
}

export async function toggleWorkout(date: string = todayKey()): Promise<DayCheck> {
  const current = await getDay(date);
  return upsertDay(date, { workout: !current.workout });
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
    const adherent = row
      ? Object.values(row.meals ?? {}).filter(Boolean).length >= 4 ||
        (row.water ?? 0) >= 1 ||
        !!row.workout
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
