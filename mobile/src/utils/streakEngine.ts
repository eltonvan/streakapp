interface HabitLike {
  type: string;
}

interface LogLike {
  date: string;
  status: string;
}

function daysBetween(earlier: string, later: string): number {
  return Math.round(
    (new Date(later).getTime() - new Date(earlier).getTime()) / (1000 * 60 * 60 * 24),
  );
}

export function calculateCurrentStreak(habit: HabitLike, logs: LogLike[]): number {
  if (logs.length === 0) return 0;

  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));

  let streak = 0;
  let prevDate = sorted[0].date;

  if (sorted[0].status === 'failed' || sorted[0].status === 'skipped') return 0;
  if (sorted[0].status === 'completed') streak = 1;

  const maxGap = habit.type === 'stretched' ? 2 : 1;

  for (let i = 1; i < sorted.length; i++) {
    const { date, status } = sorted[i];
    const gap = daysBetween(date, prevDate);

    if (gap > maxGap) break;
    if (status === 'failed' || status === 'skipped') break;
    if (status === 'completed') streak++;

    prevDate = date;
  }

  return streak;
}