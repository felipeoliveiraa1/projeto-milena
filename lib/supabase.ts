import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type DailyCheckRow = {
  date: string;
  meals: Record<string, boolean>;
  /** Mililitros. Valores <= 3 são registros antigos, em garrafas de 1,2 L. */
  water: number;
  workout: boolean;
  /** Suplementos, itens de rotina ("r-") e textos do dia ("txt:"). */
  supplements: Record<string, boolean | string>;
  exercises: Record<string, boolean>;
};

export type MeasurementRow = {
  date: string;
  cintura: number | null;
  abdomen: number | null;
  quadril: number | null;
  braco: number | null;
  coxa: number | null;
};

export type WeightRow = {
  date: string;
  weight: number;
};

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY em .env.local",
    );
  }
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}
