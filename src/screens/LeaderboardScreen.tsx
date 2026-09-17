import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { FlameIcon } from '../components/icons';
import { useAuth } from '../context/AuthContext';
import { useCrew } from '../context/CrewContext';
import { useCrewLogsContext } from '../context/CrewLogsContext';
import { aggregateMembers } from '../utils/aggregate';
import { getInitials } from '../utils/initials';

type Tab = 'week' | 'all';

export default function LeaderboardScreen() {
  const navigation = useNavigation();
  const { session } = useAuth();
  const { activeCrew } = useCrew();
  const userId = session?.user.id ?? null;
  const { roster, logs, loading } = useCrewLogsContext();
  const [tab, setTab] = useState<Tab>('week');

  const members = useMemo(() => {
    const stats = aggregateMembers(roster, logs);
    return stats
      .map((m) => ({ ...m, count: tab === 'week' ? m.weekCount : m.allCount, isYou: m.id === userId }))
      .sort((a, b) => b.count - a.count)
      .map((m, i) => ({ ...m, rank: i + 1, initials: getInitials(m.name) }));
  }, [roster, logs, tab, userId]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Gym Crew</Text>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Leaderboard</Text>
          <Pressable onPress={() => navigation.navigate('CrewManage' as never)}>
            <Text style={styles.crewLink}>{activeCrew?.name ?? 'Crew'}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.tabs}>
        <Pressable
          onPress={() => setTab('week')}
          style={[styles.tabButton, tab === 'week' && styles.tabButtonActive]}
        >
          <Text style={[styles.tabText, tab === 'week' && styles.tabTextActive]}>This week</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('all')}
          style={[styles.tabButton, tab === 'all' && styles.tabButtonActive]}
        >
          <Text style={[styles.tabText, tab === 'all' && styles.tabTextActive]}>All time</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      ) : members.length === 0 ? (
        <Text style={styles.empty}>No crewmates yet — invite friends from the crew menu above.</Text>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View
              style={[
                styles.row,
                { backgroundColor: item.isYou ? colors.youRowBg : colors.card },
                { borderColor: item.isYou ? colors.youRowBorder : colors.border },
              ]}
            >
              <Text style={[styles.rank, { color: item.rank === 1 ? colors.accent : colors.textMuted }]}>
                {item.rank}
              </Text>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: item.isYou ? colors.accent : colors.avatarAlt },
                ]}
              >
                <Text style={[styles.avatarText, { color: item.isYou ? colors.accentText : colors.avatarAltText }]}>
                  {item.initials}
                </Text>
              </View>
              <View style={styles.rowMain}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.isYou ? 'You' : item.name}
                </Text>
                <View style={styles.streakRow}>
                  <FlameIcon size={13} />
                  <Text style={styles.streakText}>{item.streak} day streak</Text>
                </View>
              </View>
              <Text style={styles.count}>{item.count}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 20, gap: 4 },
  eyebrow: {
    fontFamily: fonts.bodySemibold,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.accent,
  },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  title: { fontFamily: fonts.num, fontSize: 30, color: colors.textPrimary, lineHeight: 34 },
  crewLink: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.textSecondary },
  tabs: {
    marginHorizontal: 24,
    marginBottom: 18,
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  tabButtonActive: { backgroundColor: colors.accent },
  tabText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.textSecondary },
  tabTextActive: { color: colors.accentText },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 40,
  },
  list: { paddingHorizontal: 20, paddingBottom: 20, gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  rank: { fontFamily: fonts.num, width: 22, fontSize: 16, textAlign: 'center' },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.num, fontSize: 15 },
  rowMain: { flex: 1, gap: 3 },
  name: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.textPrimary },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  streakText: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
  count: { fontFamily: fonts.num, fontSize: 20, color: colors.textPrimary },
});
