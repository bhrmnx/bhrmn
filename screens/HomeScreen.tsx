import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../lib/auth';
import { colors, type as t } from '../theme';

export default function HomeScreen() {
  const { session, profile, signOut } = useAuth();

  return (
    <ScrollView style={s.wrap} contentContainerStyle={s.inner}>
      <Text style={s.kicker}>SIGNED IN</Text>
      <Text style={s.wordmark}>bhrmn</Text>

      <View style={s.card}>
        <Row label="HANDLE" value={profile ? `@${profile.handle}` : 'loading…'} />
        <Row label="NAME" value={profile?.display_name ?? '—'} />
        <Row label="EMAIL" value={session?.user.email ?? '—'} />
        <Row label="GHOST MODE" value={profile?.ghost_mode ? 'on (default)' : 'off'} />
      </View>

      <Text style={s.note}>
        Auth is working end to end. The profile row above was created automatically by a
        database trigger the moment your account existed — that is the identity record every
        trip, document and verification will hang off.
      </Text>

      <Pressable style={s.btn} onPress={signOut}>
        <Text style={s.btnText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.paper },
  inner: { padding: 28, paddingTop: 80 },
  kicker: { ...t.mono, fontSize: 11, letterSpacing: 1.4, color: colors.teal, marginBottom: 6 },
  wordmark: { ...t.display, fontSize: 34, color: colors.indigo, marginBottom: 28 },
  card: {
    backgroundColor: colors.sand,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 14,
    padding: 20,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  rowLabel: { ...t.mono, fontSize: 11, letterSpacing: 1, color: colors.inkSoft },
  rowValue: { ...t.body, fontSize: 15, color: colors.ink, flexShrink: 1, textAlign: 'right' },
  note: { ...t.body, fontSize: 13, lineHeight: 20, color: colors.inkSoft, marginTop: 22 },
  btn: {
    marginTop: 32,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { ...t.body, color: colors.ink },
});
