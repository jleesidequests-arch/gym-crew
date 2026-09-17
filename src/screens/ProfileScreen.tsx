import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Pressable } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { FlameIcon, StarIcon, TrophyIcon } from '../components/icons';
import { useAuth } from '../context/AuthContext';
import { useCrew } from '../context/CrewContext';
import { useCrewLogsContext } from '../context/CrewLogsContext';
import { aggregateMembers } from '../utils/aggregate';
import { getInitials } from '../utils/initials';
import { computeBestStreak, lastNWeeksGrid } from '../utils/date';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { session } = useAuth();
  const { activeCrew, crews } = useCrew();
  const userId = session?.user.id ?? null;
  const { roster, logs } = useCrewLogsContext();

  const allStats = useMemo(() => aggregateMembers(roster, logs), [roster, logs]);
  const ranked = useMemo(() => [...allStats].sort((a, b) => b.allCount - a.allCount), [allStats]);
  const me = useMemo(() => allStats.find((m) => m.id === userId) ?? null, [allStats, userId]);
  const rank = useMemo(() => ranked.findIndex((m) => m.id === userId) + 1, [ranked, userId]);

  const displayName = me?.name ?? session?.user.email ?? 'You';
  const initials = getInitials(displayName);
  const allCount = me?.allCount ?? 0;
  const weekCount = me?.weekCount ?? 0;
  const streak = me?.streak ?? 0;
  const bestStreak = useMemo(() => (me ? computeBestStreak(me.dayKeys) : 0), [me]);
  const weeksGrid = useMemo(() => lastNWeeksGrid(4, me?.dayKeys ?? new Set()), [me]);

  const badges = [
    { id: 'b1', label: '7-day streak', color: colors.streak, icon: FlameIcon, earned: bestStreak >= 7 },
    { id: 'b2', label: '100 logs', color: colors.accent, icon: StarIcon, earned: allCount >= 100 },
    { id: 'b3', label: 'Top 3', color: colors.textSecondary, icon: TrophyIcon, earned: rank > 0 && rank <= 3 },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>You</Text>
            <Pressable onPress={() => navigation.navigate('CrewManage' as never)}>
              <Text style={styles.sub}>
                {activeCrew?.name ?? 'No crew'} · {rank > 0 ? `Rank #${rank}` : '—'}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.streakHero}>
          <View style={{ gap: 2 }}>
            <Text style={styles.heroLabel}>Current streak</Text>
            <View style={styles.streakInline}>
              <FlameIcon size={20} />
              <Text style={styles.heroNum}>{streak} days</Text>
            </View>
          </View>
          <View style={{ gap: 2, alignItems: 'flex-end' }}>
            <Text style={styles.heroLabel}>Best ever</Text>
            <Text style={styles.heroBest}>{bestStreak} days</Text>
          </View>
        </View>

        <View style={styles.statGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{allCount}</Text>
            <Text style={styles.statLabel}>Total logs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{weekCount}</Text>
            <Text style={styles.statLabel}>This week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{crews.length}</Text>
            <Text style={styles.statLabel}>Groups</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Last 4 weeks</Text>
        <View style={styles.heatmap}>
          {weeksGrid.map((row, ri) => (
            <View key={ri} style={styles.heatmapRow}>
              {row.map((on, ci) => (
                <View
                  key={ci}
                  style={[styles.heatCell, { backgroundColor: on ? colors.accent : colors.border }]}
                />
              ))}
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Badges</Text>
        <View style={styles.badgesRow}>
          {badges.map((b) => {
            const Icon = b.icon;
            return (
              <View key={b.id} style={[styles.badgeCard, !b.earned && styles.badgeCardMuted]}>
                <Icon size={22} color={b.earned ? b.color : colors.textMuted} />
                <Text style={[styles.badgeLabel, !b.earned && styles.badgeLabelMuted]}>{b.label}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 24 },
  header: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.num, fontSize: 20, color: colors.accentText },
  name: { fontFamily: fonts.num, fontSize: 22, color: colors.textPrimary },
  sub: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  streakHero: {
    marginHorizontal: 24,
    marginBottom: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
  streakInline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroNum: { fontFamily: fonts.num, fontSize: 30, color: colors.textPrimary },
  heroBest: { fontFamily: fonts.num, fontSize: 20, color: colors.accent },
  statGrid: { flexDirection: 'row', gap: 10, paddingHorizontal: 24, paddingBottom: 20 },
  statCard: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, gap: 2 },
  statNum: { fontFamily: fonts.num, fontSize: 20, color: colors.textPrimary },
  statLabel: { fontFamily: fonts.body, fontSize: 10.5, color: colors.textSecondary },
  sectionTitle: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.textPrimary, paddingHorizontal: 24, paddingBottom: 10 },
  heatmap: { paddingHorizontal: 24, gap: 6, marginBottom: 18 },
  heatmapRow: { flexDirection: 'row', gap: 6 },
  heatCell: { flex: 1, aspectRatio: 1, borderRadius: 6 },
  badgesRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 24 },
  badgeCard: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 10, alignItems: 'center', gap: 6 },
  badgeCardMuted: { opacity: 0.45 },
  badgeLabel: { fontFamily: fonts.bodySemibold, fontSize: 10.5, color: colors.avatarAltText, textAlign: 'center' },
  badgeLabelMuted: { color: colors.textMuted },
});
