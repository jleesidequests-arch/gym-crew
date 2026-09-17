import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useCrew } from '../context/CrewContext';
import { useCrewLogsContext } from '../context/CrewLogsContext';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export default function CrewManageScreen() {
  const navigation = useNavigation();
  const { session, signOut } = useAuth();
  const { crews, activeCrew, switchCrew, createCrew, joinCrew, leaveCrew } = useCrew();
  const { roster } = useCrewLogsContext();

  const [copied, setCopied] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addMode, setAddMode] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const copyCode = async () => {
    if (!activeCrew) return;
    await Clipboard.setStringAsync(activeCrew.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const submitAdd = async () => {
    setError(null);
    setBusy(true);
    const result = addMode === 'create' ? await createCrew(name) : await joinCrew(code);
    setBusy(false);
    if (result) {
      setError(result);
    } else {
      setName('');
      setCode('');
      setShowAdd(false);
    }
  };

  const handleLeave = async () => {
    if (!activeCrew) return;
    setBusy(true);
    await leaveCrew(activeCrew.id);
    setBusy(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Your crew</Text>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>

        {activeCrew && (
          <>
            <View style={styles.card}>
              <Text style={styles.crewName}>{activeCrew.name}</Text>
              <Text style={styles.label}>Invite code</Text>
              <Pressable onPress={copyCode} style={styles.codeRow}>
                <Text style={styles.codeText}>{activeCrew.invite_code}</Text>
                <Text style={styles.copyText}>{copied ? 'Copied!' : 'Copy'}</Text>
              </Pressable>
              <Text style={styles.hint}>Share this code so friends can join.</Text>
            </View>

            <Text style={styles.sectionTitle}>Members ({roster.length})</Text>
            <View style={styles.card}>
              {roster.map((m, i) => (
                <Text key={m.id} style={[styles.memberRow, i > 0 && styles.memberRowDivider]}>
                  {m.name}
                  {m.id === session?.user.id ? '  (you)' : ''}
                </Text>
              ))}
            </View>
          </>
        )}

        {crews.length > 1 && (
          <>
            <Text style={styles.sectionTitle}>Switch crew</Text>
            <View style={styles.card}>
              {crews.map((c, i) => (
                <Pressable
                  key={c.id}
                  onPress={() => switchCrew(c.id)}
                  style={[styles.memberRowTouchable, i > 0 && styles.memberRowDivider]}
                >
                  <Text style={styles.crewSwitchName}>{c.name}</Text>
                  {c.id === activeCrew?.id && <Text style={styles.activeDot}>●</Text>}
                </Pressable>
              ))}
            </View>
          </>
        )}

        {showAdd ? (
          <View style={styles.card}>
            <View style={styles.tabs}>
              <Pressable
                onPress={() => setAddMode('create')}
                style={[styles.tabButton, addMode === 'create' && styles.tabButtonActive]}
              >
                <Text style={[styles.tabText, addMode === 'create' && styles.tabTextActive]}>Create</Text>
              </Pressable>
              <Pressable
                onPress={() => setAddMode('join')}
                style={[styles.tabButton, addMode === 'join' && styles.tabButtonActive]}
              >
                <Text style={[styles.tabText, addMode === 'join' && styles.tabTextActive]}>Join</Text>
              </Pressable>
            </View>
            {addMode === 'create' ? (
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Crew name"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            ) : (
              <TextInput
                value={code}
                onChangeText={(t) => setCode(t.toUpperCase())}
                placeholder="Invite code"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.codeInput]}
                autoCapitalize="characters"
                maxLength={8}
              />
            )}
            {error && <Text style={styles.error}>{error}</Text>}
            <Pressable style={styles.primaryButton} onPress={submitAdd} disabled={busy}>
              {busy ? <ActivityIndicator color={colors.accentText} /> : <Text style={styles.primaryText}>Confirm</Text>}
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setShowAdd(true)} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>+ Add another crew</Text>
          </Pressable>
        )}

        {activeCrew && (
          <Pressable onPress={handleLeave} style={styles.secondaryButton}>
            <Text style={styles.leaveText}>Leave {activeCrew.name}</Text>
          </Pressable>
        )}

        <Pressable onPress={signOut} style={styles.secondaryButton}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, gap: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  title: { fontFamily: fonts.num, fontSize: 26, color: colors.textPrimary },
  closeText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.accent },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, gap: 6 },
  crewName: { fontFamily: fonts.num, fontSize: 20, color: colors.textPrimary, marginBottom: 4 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.textSecondary },
  codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  codeText: { fontFamily: fonts.num, fontSize: 26, letterSpacing: 3, color: colors.accent },
  copyText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.textSecondary },
  hint: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  sectionTitle: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.textPrimary, marginTop: 4 },
  memberRow: { fontFamily: fonts.body, fontSize: 14, color: colors.textPrimary, paddingVertical: 8 },
  memberRowTouchable: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  memberRowDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  crewSwitchName: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.textPrimary },
  activeDot: { color: colors.accent, fontSize: 10 },
  tabs: { flexDirection: 'row', backgroundColor: colors.background, borderRadius: 12, padding: 4, marginBottom: 4 },
  tabButton: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center' },
  tabButtonActive: { backgroundColor: colors.accent },
  tabText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.textSecondary },
  tabTextActive: { color: colors.accentText },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textPrimary,
  },
  codeInput: { fontFamily: fonts.num, letterSpacing: 2 },
  error: { fontFamily: fonts.body, fontSize: 12, color: colors.streak },
  primaryButton: { backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  primaryText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.accentText },
  secondaryButton: { alignItems: 'center', paddingVertical: 10 },
  secondaryText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.accent },
  leaveText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.textSecondary },
  signOutText: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
});
