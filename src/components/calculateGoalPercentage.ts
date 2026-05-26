export function calculateGoalPercentage(current: number, goal: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(goal)) return 0;
  if (current < 0 || goal <= 0) return 0;

  const percentage = current / goal;

  if (!Number.isFinite(percentage)) return 0;

  return Math.min(percentage, 1);
}
