export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

// Monday-start week.
export function startOfWeek(d: Date): Date {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = copy.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(copy, diff);
}

/** Current streak of consecutive days logged, counting back from today.
 * Today doesn't have to be logged yet — yesterday keeps the streak alive. */
export function computeCurrentStreak(dayKeys: Set<string>): number {
  const today = new Date();
  let cursor = dayKeys.has(dateKey(today)) ? today : addDays(today, -1);
  if (!dayKeys.has(dateKey(cursor))) return 0;
  let streak = 0;
  while (dayKeys.has(dateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Longest run of consecutive days anywhere in the given set. */
export function computeBestStreak(dayKeys: Set<string>): number {
  if (dayKeys.size === 0) return 0;
  const sorted = Array.from(dayKeys)
    .map((k) => new Date(k + 'T00:00:00'))
    .sort((a, b) => a.getTime() - b.getTime());

  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diffDays = Math.round((sorted[i].getTime() - sorted[i - 1].getTime()) / 86400000);
    run = diffDays === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return best;
}

/** Last `weeks * 7` days, oldest first, chunked into weeks of 7 for a heatmap grid. */
export function lastNWeeksGrid(weeks: number, dayKeys: Set<string>): boolean[][] {
  const today = new Date();
  const days: boolean[] = [];
  for (let i = weeks * 7 - 1; i >= 0; i--) {
    days.push(dayKeys.has(dateKey(addDays(today, -i))));
  }
  const grid: boolean[][] = [];
  for (let i = 0; i < weeks; i++) {
    grid.push(days.slice(i * 7, i * 7 + 7));
  }
  return grid;
}
