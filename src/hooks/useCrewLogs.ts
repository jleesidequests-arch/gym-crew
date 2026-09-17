import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogRow, RosterMember } from '../types/db';
import { uuidv4 } from '../utils/uuid';

const HISTORY_DAYS = 90;

export function useCrewLogs(crewId: string | null, userId: string | null) {
  const [roster, setRoster] = useState<RosterMember[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const seenIds = useRef<Set<string>>(new Set());

  async function loadAll() {
    if (!crewId) {
      setRoster([]);
      setLogs([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const [{ data: memberRows, error: memberError }, { data: logRows, error: logError }] = await Promise.all([
      supabase.from('crew_members').select('user_id, profiles(display_name)').eq('crew_id', crewId),
      supabase
        .from('activity_logs')
        .select('id, crew_id, user_id, activity, logged_at')
        .eq('crew_id', crewId)
        .gte('logged_at', new Date(Date.now() - HISTORY_DAYS * 86400000).toISOString())
        .order('logged_at', { ascending: false })
        .limit(3000),
    ]);

    if (memberError) console.warn('Failed to load crew roster', memberError.message);
    if (logError) console.warn('Failed to load crew logs', logError.message);

    const loadedRoster: RosterMember[] = (memberRows ?? []).map((row: any) => ({
      id: row.user_id,
      name: row.profiles?.display_name ?? 'Crew member',
    }));
    setRoster(loadedRoster);

    const loadedLogs = (logRows ?? []) as LogRow[];
    seenIds.current = new Set(loadedLogs.map((l) => l.id));
    setLogs(loadedLogs);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crewId]);

  useEffect(() => {
    if (!crewId) return;
    const channel = supabase
      .channel(`activity_logs:${crewId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_logs', filter: `crew_id=eq.${crewId}` },
        (payload) => {
          const row = payload.new as LogRow;
          if (seenIds.current.has(row.id)) return;
          seenIds.current.add(row.id);
          setLogs((prev) => [row, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [crewId]);

  const loggedToday = useMemo(() => {
    if (!userId) return false;
    const today = new Date();
    return logs.some((l) => l.user_id === userId && sameDay(new Date(l.logged_at), today));
  }, [logs, userId]);

  async function logActivity(activity: string) {
    if (!crewId || !userId) return 'Not ready yet';
    const id = uuidv4();
    const logged_at = new Date().toISOString();

    // Optimistic: show it immediately, the realtime insert event will dedupe by id.
    seenIds.current.add(id);
    setLogs((prev) => [{ id, crew_id: crewId, user_id: userId, activity, logged_at }, ...prev]);

    const { error } = await supabase
      .from('activity_logs')
      .insert({ id, crew_id: crewId, user_id: userId, activity, logged_at });

    if (error) {
      seenIds.current.delete(id);
      setLogs((prev) => prev.filter((l) => l.id !== id));
      return error.message;
    }
    return null;
  }

  return { roster, logs, loading, loggedToday, logActivity, refresh: loadAll };
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
