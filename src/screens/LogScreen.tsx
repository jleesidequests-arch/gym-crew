import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { activityNames, dayLabels } from '../data/constants';
import { FlameIcon, PlusIcon } from '../components/icons';
import StreakCelebration from '../components/StreakCelebration';
import { useAuth } from '../context/AuthContext';
import { useCrewLogsContext } from '../context/CrewLogsContext';
import { aggregateMembers } from '../utils/aggregate';
import { dateKey, addDays } from '../utils/date';

export default function LogScreen() {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const { roster, logs, loggedToday, logActivity } = useCrewLogsContext();

  const [activity, setActivity] = useState(activityNames[0]);
  const [logging, setLogging] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [celebrationStreak, setCelebrationStreak] = useState(0);
  const justLoggedRef = useRef(false);

  const myStats = useMemo(() => {
    const stats = aggregateMembers(roster, logs);
    return stats.find((m) => m.id === userId) ?? null;
  }, [roster, logs, userId]);

  const weekCount = myStats?.weekCount ?? 0;
  const streak = myStats?.streak ?? 0;
  const totalCount = myStats?.allCount ?? 0;
  const dayKeys = myStats?.dayKeys ?? new Set<string>();

  // logIt's own closure captures a stale `streak` from the render it was called
  // in, so the fresh post-log value is picked up here once the next render
  // (triggered by the optimistic log update) actually has it.
  useEffect(() => {
    if (!justLoggedRef.current) return;
    justLoggedRef.current = false;
    setCelebrationStreak(streak);
    setCelebrating(true);
  }, [streak]);

  const doneMask = useMemo(() => {
    const today = new Date();
    const mondayOffset = today.getDay() === 0 ? -6 : 1 - today.getDay();
    const monday = addDays(today, mondayOffset);
    return Array.from({ length: 7 }, (_, i) => dayKeys.has(dateKey(addDays(monday, i))));
  }, [dayKeys]);

  const logIt = async () => {
    if (loggedToday || logging) return;
    setLogging(true);
    // logActivity updates `logs` optimistically before the network call resolves,
    // so the flag has to be set before awaiting it, not after.
    justLoggedRef.current = true;
    const error = await logActivity(activity);
    setLogging(false);
    if (error) justLoggedRef.current = false;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Gym Crew</Text>
        <Text style={styles.title}>{activity}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chipsRow}
      >
        {activityNames.map((name) => {
          const active = name === activity;
          return (
            <Pressable
              key={name}
              onPress={() => setActivity(name)}
              style={[
                styles.chip,
                { backgroundColor: active ? colors.accent : 'transparent' },
                { borderColor: active ? colors.accent : colors.avatarAlt },
              ]}
            >
              <Text
                numberOfLines={1}
                style={[styles.chipText, { color: active ? colors.accentText : colors.textSecondary }]}
              >
                {name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.logArea}>
        <Pressable onPress={logIt} style={[styles.logButton, loggedToday && styles.logButtonDone]}>
          <PlusIcon />
          <Text style={styles.logButtonText}>{loggedToday ? 'Logged' : 'Log it'}</Text>
        </Pressable>
        <Text style={[styles.hint, { color: loggedToday ? colors.accent : colors.textMuted }]}>
          {loggedToday ? 'Logged for today — nice work' : "Tap to log today's session"}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{weekCount}</Text>
          <Text style={styles.statLabel}>This week</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.streakInline}>
            <FlameIcon size={14} />
            <Text style={styles.statNum}>{streak}</Text>
          </View>
          <Text style={styles.statLabel}>Day streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{totalCount}</Text>
          <Text style={styles.statLabel}>All time</Text>
        </View>
      </View>

      <View style={styles.daysRow}>
        {dayLabels.map((label, i) => (
          <View key={i} style={styles.dayCol}>
            <View
              style={[
                styles.dayDot,
                { backgroundColor: doneMask[i] ? colors.accent : 'transparent' },
                { borderColor: doneMask[i] ? colors.accent : colors.avatarAlt },
              ]}
            />
            <Text style={styles.dayLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <StreakCelebration
        visible={celebrating}
        streak={celebrationStreak}
        onDone={() => setCelebrating(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4 },
  eyebrow: {
    fontFamily: fonts.bodySemibold,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.accent,
  },
  title: { fontFamily: fonts.num, fontSize: 30, color: colors.textPrimary, marginTop: 2 },
  chipsScroll: { flexGrow: 0, marginTop: 18, marginBottom: 4 },
  chipsRow: { gap: 8, paddingHorizontal: 24, alignItems: 'center' },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center', justifyContent: 'center' },
  chipText: { fontFamily: fonts.bodySemibold, fontSize: 13 },
  logArea: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 },
  logButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: colors.accent,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  logButtonDone: { opacity: 0.6 },
  logButtonText: { fontFamily: fonts.num, fontSize: 16, color: colors.accentText },
  hint: { fontFamily: fonts.body, fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 24, paddingBottom: 18 },
  statCard: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, gap: 2 },
  streakInline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statNum: { fontFamily: fonts.num, fontSize: 22, color: colors.textPrimary },
  statLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.textSecondary },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 20 },
  dayCol: { alignItems: 'center', gap: 6 },
  dayDot: { width: 30, height: 30, borderRadius: 15, borderWidth: 1 },
  dayLabel: { fontFamily: fonts.body, fontSize: 10, color: colors.textMuted },
});
