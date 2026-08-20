import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';
import PolicySheet from '../components/PolicySheet';
import { colors, type as t } from '../theme';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<'email' | 'code'>('email');
  const [busy, setBusy] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

  async function sendCode() {
    const clean = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(clean)) {
      Alert.alert('Check the email', 'That address does not look right.');
      return;
    }
    // DPDP requires consent to be a clear affirmative action, not a pre-ticked
    // box or something buried in a footer.
    if (!agreed) {
      Alert.alert(
        'One thing first',
        'Please confirm you are 18 or over and agree to how Bhrmn handles your data.'
      );
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: clean,
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (error) Alert.alert('Could not send code', error.message);
    else setStage('code');
  }

  async function verify() {
    const clean = email.trim().toLowerCase();
    if (code.trim().length < 6) {
      Alert.alert('Check the code', 'Enter the full code from your email.');
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      email: clean,
      token: code.trim(),
      type: 'email',
    });
    setBusy(false);
    // On success the auth listener in AuthProvider swaps the screen for us.
    if (error) Alert.alert('That code did not work', error.message);
  }

  return (
    <KeyboardAvoidingView
      style={s.wrap}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.inner}>
        <Text style={s.wordmark}>bhrmn</Text>
        <Text style={s.tagline}>Your travel identity, verified.</Text>

        {stage === 'email' ? (
          <>
            <Text style={s.label}>EMAIL</Text>
            <TextInput
              style={s.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.inkFaint}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              editable={!busy}
            />
            <Pressable style={s.consent} onPress={() => setAgreed((a) => !a)}>
              <View style={[s.box, agreed && s.boxOn]}>
                {agreed && <Text style={s.tick}>✓</Text>}
              </View>
              <Text style={s.consentText}>
                I am 18 or over, and I agree to Bhrmn storing my trips and any travel
                documents I upload, as described in the{' '}
                <Text style={s.link} onPress={() => setShowPolicy(true)}>privacy notice</Text>.
              </Text>
            </Pressable>

            <Pressable style={[s.btn, busy && s.btnOff]} onPress={sendCode} disabled={busy}>
              {busy ? (
                <ActivityIndicator color={colors.sand} />
              ) : (
                <Text style={s.btnText}>Send me a code</Text>
              )}
            </Pressable>
          </>
        ) : (
          <>
            <Text style={s.label}>SIGN-IN CODE</Text>
            <Text style={s.sent}>Sent to {email.trim().toLowerCase()}</Text>
            <TextInput
              style={[s.input, s.codeInput]}
              value={code}
              onChangeText={(v) => setCode(v.replace(/\D/g, ''))}
              placeholder="00000000"
              placeholderTextColor={colors.inkFaint}
              keyboardType="number-pad"
              // Supabase OTP length is configurable (6-10). Do not hardcode 6.
              maxLength={10}
              textContentType="oneTimeCode"
              editable={!busy}
            />
            <Pressable style={[s.btn, busy && s.btnOff]} onPress={verify} disabled={busy}>
              {busy ? (
                <ActivityIndicator color={colors.sand} />
              ) : (
                <Text style={s.btnText}>Verify and continue</Text>
              )}
            </Pressable>
            <Pressable onPress={() => { setStage('email'); setCode(''); }} disabled={busy}>
              <Text style={s.altLink}>Use a different email</Text>
            </Pressable>
          </>
        )}
      </View>
      <PolicySheet visible={showPolicy} onClose={() => setShowPolicy(false)} />
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.paper },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  wordmark: { ...t.display, fontSize: 40, color: colors.indigo, marginBottom: 6 },
  tagline: { ...t.body, color: colors.inkSoft, marginBottom: 44 },
  label: { ...t.mono, fontSize: 11, color: colors.inkSoft, letterSpacing: 1, marginBottom: 8 },
  sent: { ...t.body, fontSize: 13, color: colors.inkSoft, marginBottom: 10 },
  input: {
    ...t.body,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.sand,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: colors.ink,
    marginBottom: 18,
  },
  codeInput: { fontSize: 22, letterSpacing: 5, textAlign: 'center' },
  btn: {
    backgroundColor: colors.indigo,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnOff: { opacity: 0.6 },
  btnText: { ...t.body, color: colors.sand, fontWeight: '600' },
  link: { color: colors.teal, textDecorationLine: 'underline' },
  altLink: { ...t.body, fontSize: 13, color: colors.inkSoft, textAlign: 'center', marginTop: 18 },
  consent: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 20 },
  box: {
    width: 20, height: 20, borderRadius: 5, borderWidth: 1, borderColor: colors.hairline,
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  boxOn: { backgroundColor: colors.teal, borderColor: colors.teal },
  tick: { color: colors.sand, fontSize: 13, lineHeight: 16 },
  consentText: { ...t.body, fontSize: 12.5, lineHeight: 19, color: colors.inkSoft, flex: 1 },
});
