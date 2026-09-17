import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useCrew } from '../context/CrewContext';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export default function CrewSetupScreen() {
  const { createCrew, joinCrew } = useCrew();
  const { signOut } = useAuth();
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    setBusy(true);
    const result = mode === 'create' ? await createCrew(name) : await joinCrew(code);
    setBusy(false);
    if (result) setError(result);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>Gym Crew</Text>
        <Text style={styles.title}>Get your crew set up</Text>
        <Text style={styles.subtitle}>Start a new crew or join one with an invite code.</Text>

        <View style={styles.tabs}>
          <Pressable
            onPress={() => {
              setMode('create');
              setError(null);
            }}
            style={[styles.tabButton, mode === 'create' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, mode === 'create' && styles.tabTextActive]}>Create crew</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setMode('join');
              setError(null);
            }}
            style={[styles.tabButton, mode === 'join' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, mode === 'join' && styles.tabTextActive]}>Join crew</Text>
          </Pressable>
        </View>

        {mode === 'create' ? (
          <View style={styles.field}>
            <Text style={styles.label}>Crew name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Morning Crew"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              autoCapitalize="words"
            />
          </View>
        ) : (
          <View style={styles.field}>
            <Text style={styles.label}>Invite code</Text>
            <TextInput
              value={code}
              onChangeText={(t) => setCode(t.toUpperCase())}
              placeholder="ABC123"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, styles.codeInput]}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={8}
            />
          </View>
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable style={styles.submitButton} onPress={submit} disabled={busy}>
          {busy ? (
            <ActivityIndicator color={colors.accentText} />
          ) : (
            <Text style={styles.submitText}>{mode === 'create' ? 'Create crew' : 'Join crew'}</Text>
          )}
        </Pressable>

        <Pressable onPress={signOut} style={styles.signOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 28, gap: 14 },
  eyebrow: {
    fontFamily: fonts.bodySemibold,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.accent,
  },
  title: { fontFamily: fonts.num, fontSize: 26, color: colors.textPrimary, marginTop: 2 },
  subtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, marginBottom: 4 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  tabButtonActive: { backgroundColor: colors.accent },
  tabText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.textSecondary },
  tabTextActive: { color: colors.accentText },
  field: { gap: 6 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.textSecondary },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  codeInput: { fontFamily: fonts.num, letterSpacing: 2, fontSize: 18 },
  error: { fontFamily: fonts.body, fontSize: 13, color: colors.streak },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  submitText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.accentText },
  signOut: { alignItems: 'center', marginTop: 8 },
  signOutText: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
});
