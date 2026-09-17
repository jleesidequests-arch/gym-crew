import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Enter an email and password');
      return;
    }
    if (mode === 'signUp' && !name.trim()) {
      setError('Enter a display name');
      return;
    }
    setBusy(true);
    const result =
      mode === 'signIn'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password, name.trim());
    setBusy(false);
    if (result) setError(result);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.eyebrow}>Gym Crew</Text>
          <Text style={styles.title}>{mode === 'signIn' ? 'Welcome back' : 'Create account'}</Text>
          <Text style={styles.subtitle}>
            {mode === 'signIn' ? 'Sign in to see your crew.' : 'Set up an account to join or start a crew.'}
          </Text>

          <View style={styles.form}>
            {mode === 'signUp' && (
              <View style={styles.field}>
                <Text style={styles.label}>Display name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Jordan Lee"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                secureTextEntry
              />
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <Pressable style={styles.submitButton} onPress={submit} disabled={busy}>
              {busy ? (
                <ActivityIndicator color={colors.accentText} />
              ) : (
                <Text style={styles.submitText}>{mode === 'signIn' ? 'Sign in' : 'Sign up'}</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                setError(null);
                setMode(mode === 'signIn' ? 'signUp' : 'signIn');
              }}
            >
              <Text style={styles.switchText}>
                {mode === 'signIn' ? "Don't have an account? " : 'Already have an account? '}
                <Text style={styles.switchTextAccent}>{mode === 'signIn' ? 'Sign up' : 'Sign in'}</Text>
              </Text>
            </Pressable>
          </View>
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
  form: { gap: 14 },
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
  error: { fontFamily: fonts.body, fontSize: 13, color: colors.streak },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  submitText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.accentText },
  switchText: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
  switchTextAccent: { color: colors.accent, fontFamily: fonts.bodySemibold },
});
