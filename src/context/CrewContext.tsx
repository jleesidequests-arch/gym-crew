import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Crew } from '../types/db';
import { generateInviteCode } from '../utils/inviteCode';
import { useAuth } from './AuthContext';

const ACTIVE_CREW_KEY = 'gym-crew:active-crew-id';

type CrewContextValue = {
  crews: Crew[];
  activeCrew: Crew | null;
  loading: boolean;
  switchCrew: (crewId: string) => void;
  createCrew: (name: string) => Promise<string | null>;
  joinCrew: (code: string) => Promise<string | null>;
  leaveCrew: (crewId: string) => Promise<string | null>;
  refresh: () => Promise<void>;
};

const CrewContext = createContext<CrewContextValue | undefined>(undefined);

export function CrewProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;

  const [crews, setCrews] = useState<Crew[]>([]);
  const [activeCrewId, setActiveCrewId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    if (!userId) {
      setCrews([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('crew_members')
      .select('crews(id, name, invite_code, created_by, created_at)')
      .eq('user_id', userId);

    if (error) {
      console.warn('Failed to load crews', error.message);
      setLoading(false);
      return;
    }

    const loaded = (data ?? [])
      .map((row: any) => row.crews as Crew)
      .filter(Boolean)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
    setCrews(loaded);

    const stored = await AsyncStorage.getItem(ACTIVE_CREW_KEY);
    const stillValid = loaded.some((c) => c.id === stored);
    setActiveCrewId(stillValid ? stored : loaded[0]?.id ?? null);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  function switchCrew(crewId: string) {
    setActiveCrewId(crewId);
    AsyncStorage.setItem(ACTIVE_CREW_KEY, crewId).catch(() => {});
  }

  async function createCrew(name: string) {
    if (!userId) return 'Not signed in';
    const trimmed = name.trim();
    if (!trimmed) return 'Give your crew a name';

    for (let attempt = 0; attempt < 5; attempt++) {
      const inviteCode = generateInviteCode();
      const { data, error } = await supabase
        .from('crews')
        .insert({ name: trimmed, invite_code: inviteCode, created_by: userId })
        .select('id')
        .single();

      if (!error && data) {
        const { error: memberError } = await supabase
          .from('crew_members')
          .insert({ crew_id: data.id, user_id: userId });
        if (memberError) return memberError.message;
        await refresh();
        switchCrew(data.id);
        return null;
      }

      // 23505 = unique_violation on the invite code; retry with a new one.
      if (error && error.code !== '23505') return error.message;
    }
    return 'Could not generate a unique invite code, try again';
  }

  async function joinCrew(code: string) {
    if (!userId) return 'Not signed in';
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return 'Enter an invite code';

    const { data: crew, error: findError } = await supabase
      .from('crews')
      .select('id')
      .eq('invite_code', trimmed)
      .maybeSingle();

    if (findError) return findError.message;
    if (!crew) return "That invite code doesn't match a crew";

    const { error: joinError } = await supabase
      .from('crew_members')
      .insert({ crew_id: crew.id, user_id: userId });

    // 23505 = unique_violation: already a member, not really an error.
    if (joinError && joinError.code !== '23505') return joinError.message;

    await refresh();
    switchCrew(crew.id);
    return null;
  }

  async function leaveCrew(crewId: string) {
    if (!userId) return 'Not signed in';
    const { error } = await supabase
      .from('crew_members')
      .delete()
      .eq('crew_id', crewId)
      .eq('user_id', userId);
    if (error) return error.message;
    await refresh();
    return null;
  }

  const activeCrew = useMemo(
    () => crews.find((c) => c.id === activeCrewId) ?? null,
    [crews, activeCrewId]
  );

  return (
    <CrewContext.Provider
      value={{ crews, activeCrew, loading, switchCrew, createCrew, joinCrew, leaveCrew, refresh }}
    >
      {children}
    </CrewContext.Provider>
  );
}

export function useCrew(): CrewContextValue {
  const ctx = useContext(CrewContext);
  if (!ctx) throw new Error('useCrew must be used within CrewProvider');
  return ctx;
}
