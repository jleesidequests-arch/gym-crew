import { createContext, ReactNode, useContext } from 'react';
import { useCrewLogs } from '../hooks/useCrewLogs';
import { useAuth } from './AuthContext';
import { useCrew } from './CrewContext';

type CrewLogsValue = ReturnType<typeof useCrewLogs>;

const CrewLogsContext = createContext<CrewLogsValue | undefined>(undefined);

// One shared realtime subscription + data fetch for the active crew, reused by every
// screen. Bottom-tab screens all stay mounted at once, so if each screen called
// useCrewLogs itself, they'd each open a duplicate Supabase channel for the same crew.
export function CrewLogsProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const { activeCrew } = useCrew();
  const value = useCrewLogs(activeCrew?.id ?? null, session?.user.id ?? null);

  return <CrewLogsContext.Provider value={value}>{children}</CrewLogsContext.Provider>;
}

export function useCrewLogsContext(): CrewLogsValue {
  const ctx = useContext(CrewLogsContext);
  if (!ctx) throw new Error('useCrewLogsContext must be used within CrewLogsProvider');
  return ctx;
}
