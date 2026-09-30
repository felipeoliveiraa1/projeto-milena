import { ShieldAlert } from "lucide-react";

export function MedicalDisclaimer() {
  return (
    <div className="mx-auto mt-8 mb-6 max-w-3xl space-y-2.5 rounded-card border border-line bg-bone-deep/50 p-5 text-xs leading-relaxed text-ink-muted">
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" />
        <p>
          Plano de referência educacional, montado sobre o histórico fornecido (pós-parto, pressão alta
          gestacional, diabetes gestacional controlada, gordura no fígado e diástase abdominal), o resumo
          de alimentação para recomposição corporal e as orientações do médico para o treino. Sempre
          revise mudanças com seu médico e nutricionista — ainda mais durante o uso do Mounjaro e na
          preparação para a cirurgia plástica. Em caso de mal-estar, dor anormal ou pressão alterada,
          suspenda treino e jejum e procure orientação.
        </p>
      </div>
      <p className="rounded-xl2 bg-danger-soft p-3.5 text-danger">
        <strong>Nenhum medicamento é suspenso ou ajustado sem o médico que receitou</strong> —
        Mounjaro, testosterona e fórmula inclusive, mesmo que o peso, a pressão ou a glicemia melhorem.
      </p>
    </div>
  );
}
