import { DailySummary } from "@/components/daily-summary";
import { WorkoutOfDay } from "@/components/workout-of-day";
import { MealChecklist } from "@/components/meal-checklist";
import { WaterTracker } from "@/components/water-tracker";
import { WeightQuickInput } from "@/components/weight-quick-input";

export default function HomePage() {
  return (
    <div className="space-y-4">
      <DailySummary />
      <WorkoutOfDay />
      <MealChecklist />
      <WaterTracker />
      <WeightQuickInput />
    </div>
  );
}
