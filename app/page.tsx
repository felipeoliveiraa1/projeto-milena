import { DaySwitch } from "@/components/day-switch";
import { ContagemRegressiva } from "@/components/contagem";
import { DailySummary } from "@/components/daily-summary";
import { MealChecklist } from "@/components/meal-checklist";
import { RoutineNow } from "@/components/routine-now";
import { WaterTracker } from "@/components/water-tracker";
import { WeightQuickInput } from "@/components/weight-quick-input";

// O treino saiu da tela inicial em 18/10: virou o item "Fazer a atividade
// física do dia" da rotina, que aparece em "Para agora".
export default function HomePage() {
  return (
    <div className="stagger space-y-4">
      <DaySwitch />
      <ContagemRegressiva />
      <DailySummary />
      <RoutineNow />
      <MealChecklist />
      <WaterTracker />
      <WeightQuickInput />
    </div>
  );
}
