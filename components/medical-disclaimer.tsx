import { ShieldAlert } from "lucide-react";

export function MedicalDisclaimer() {
  return (
    <div className="mx-auto mt-6 mb-24 flex max-w-3xl items-start gap-3 rounded-2xl border border-rose-100 bg-white/70 p-4 text-xs text-zinc-500 md:mb-8">
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
      <p>
        Plano de referência educacional, montado sobre o histórico fornecido (pós-parto, pressão alta gestacional, diabetes gestacional controlada, gordura no fígado).
        Sempre revise mudanças com seu médico/nutricionista. Em caso de mal-estar, dor anormal ou pressão alterada, suspenda treino/dieta e procure orientação.
      </p>
    </div>
  );
}
