import * as Crypto from 'expo-crypto';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

// SHA-256 of the access PIN. Not real security (anyone reading this bundle's
// source could brute-force a 6-digit PIN offline in seconds) — this is just a
// soft "keep casual visitors off the sign-up page" gate, not access control.
const PIN_HASH = '1ae1522db9452eb11cc84ed16cc8e8098064e8f602317c7ab7946a7d6b53c732';

export default function PinGateScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  const submit = async () => {
    setChecking(true);
    setError(false);
    const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
    setChecking(false);
    if (hash === PIN_HASH) {
      onUnlock();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <Text style={styles.eyebrow}>Gym Crew</Text>
          <Text style={styles.title}>Enter PIN</Text>
          <Text style={styles.subtitle}>This app is invite-only for now.</Text>

          <TextInput
            value={pin}
            onChangeText={(t) => {
              setPin(t.replace(/[^0-9]/g, ''));
              setError(false);
            }}
            placeholder="••••••"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={12}
            autoFocus
            onSubmitEditing={submit}
          />

          {error && <Text style={styles.error}>Wrong PIN — try again.</Text>}

          <Pressable style={styles.submitButton} onPress={submit} disabled={checking || pin.length === 0}>
            <Text style={styles.submitText}>{checking ? 'Checking…' : 'Continue'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 28, gap: 6 },
  eyebrow: {
    fontFamily: fonts.bodySemibold,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.accent,
  },
  title: { fontFamily: fonts.num, fontSize: 30, color: colors.textPrimary, marginTop: 2 },
  subtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.num,
    fontSize: 22,
    letterSpacing: 4,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  error: { fontFamily: fonts.body, fontSize: 13, color: colors.streak, marginTop: 10, textAlign: 'center' },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  submitText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.accentText },
});
