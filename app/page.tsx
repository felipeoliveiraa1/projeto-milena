import { DaySwitch } from "@/components/day-switch";
import { DailySummary } from "@/components/daily-summary";
import { WorkoutOfDay } from "@/components/workout-of-day";
import { MealChecklist } from "@/components/meal-checklist";
import { RoutineNow } from "@/components/routine-now";
import { WaterTracker } from "@/components/water-tracker";
import { WeightQuickInput } from "@/components/weight-quick-input";

export default function HomePage() {
  return (
    <div className="stagger space-y-4">
      <DaySwitch />
      <DailySummary />
      <RoutineNow />
      <MealChecklist />
      <WorkoutOfDay />
      <WaterTracker />
      <WeightQuickInput />
    </div>
  );
}
