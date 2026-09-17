import { LogRow, RosterMember } from '../types/db';
import { computeCurrentStreak, dateKey, startOfWeek } from './date';

export type MemberStats = {
  id: string;
  name: string;
  weekCount: number;
  allCount: number;
  streak: number;
  dayKeys: Set<string>;
};

export function aggregateMembers(roster: RosterMember[], logs: LogRow[]): MemberStats[] {
  const weekStart = startOfWeek(new Date());

  return roster.map((member) => {
    const memberLogs = logs.filter((l) => l.user_id === member.id);
    const dayKeys = new Set(memberLogs.map((l) => dateKey(new Date(l.logged_at))));
    const weekCount = memberLogs.filter((l) => new Date(l.logged_at) >= weekStart).length;

    return {
      id: member.id,
      name: member.name,
      weekCount,
      allCount: memberLogs.length,
      streak: computeCurrentStreak(dayKeys),
      dayKeys,
    };
  });
}
