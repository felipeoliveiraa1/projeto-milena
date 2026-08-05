import { ShieldAlert } from "lucide-react";

export function MedicalDisclaimer() {
  return (
    <div className="mx-auto mt-6 mb-24 max-w-3xl space-y-2 rounded-2xl border border-rose-100 bg-white/70 p-4 text-xs text-zinc-500 md:mb-8">
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
        <p>
          Plano de referência educacional, montado sobre o histórico fornecido (pós-parto, pressão alta
          gestacional, diabetes gestacional controlada, gordura no fígado) e adaptado ao protocolo
          Desinflama-se. Sempre revise mudanças com seu médico e nutricionista. Em caso de mal-estar,
          dor anormal ou pressão alterada, suspenda treino e dieta e procure orientação.
        </p>
      </div>
      <p className="rounded-xl bg-red-50 p-3 text-red-800">
        <strong>Nenhum medicamento é suspenso ou ajustado sem o médico que receitou</strong> — mesmo
        que a pressão ou a glicemia melhorem durante o protocolo.
      </p>
    </div>
  );
}
