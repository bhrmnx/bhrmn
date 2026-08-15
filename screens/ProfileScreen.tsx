import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { DNA_OPTIONS } from '../lib/travelDna';
import { colors, type as t } from '../theme';

type Stats = {
  trip_count: number;
  verified_trip_count: number;
  country_count: number;
  city_count: number;
  days_travelled: number;
};

export default function ProfileScreen() {
  const { session, profile, signOut } = useAuth();
  const [homeCity, setHomeCity] = useState<string>('—');
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!profile) return;

    if (profile.home_city_id) {
      supabase
        .from('places')
        .select('name, parent:parent_id(name)')
        .eq('id', profile.home_city_id)
        .single()
        .then(({ data }: any) => {
          if (data) setHomeCity(`${data.name}${data.parent?.name ? `, ${data.parent.name}` : ''}`);
        });
    }

    supabase
      .from('profile_stats')
      .select('*')
      .eq('profile_id', profile.id)
      .single()
      .then(({ data }) => data && setStats(data as Stats));
  }, [profile?.id, profile?.home_city_id]);

  const dnaLabels = (profile?.dna_declared ?? [])
    .map((id) => DNA_OPTIONS.find((o) => o.id === id)?.label ?? id);

  return (
    <ScrollView style={s.wrap} contentContainerStyle={s.inner}>
      <Text style={s.kicker}>TRAVEL PASSPORT</Text>
      <Text style={s.name}>{profile?.display_name ?? '…'}</Text>
      <Text style={s.handle}>@{profile?.handle}</Text>

      <View style={s.card}>
        <View style={s.statsRow}>
          <Stat n={stats?.country_count ?? 0} l="COUNTRIES" />
          <Stat n={stats?.city_count ?? 0} l="CITIES" />
          <Stat n={stats?.trip_count ?? 0} l="TRIPS" />
          <Stat n={stats?.verified_trip_count ?? 0} l="VERIFIED" />
        </View>
        <View style={s.divider} />
        <Row label="HOME" value={homeCity} />
        <Row label="EMAIL" value={session?.user.email ?? '—'} />
        <Row label="GHOST MODE" value={profile?.ghost_mode ? 'on' : 'off'} />
      </View>

      <Text style={s.section}>TRAVEL DNA</Text>
      <View style={s.chips}>
        {dnaLabels.length === 0
          ? <Text style={s.empty}>None picked yet.</Text>
          : dnaLabels.map((l) => (
              <View key={l} style={s.chip}><Text style={s.chipText}>{l}</Text></View>
            ))}
      </View>

      <Text style={s.note}>
        Your passport is empty because you have not logged a trip yet. Every trip you add — and
        every one you verify with a real ticket — makes this harder to fake and harder to leave behind.
      </Text>

      <Pressable style={s.btn} onPress={signOut}>
        <Text style={s.btnText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

function Stat({ n, l }: { n: number; l: string }) {
  return (
    <View style={s.stat}>
      <Text style={s.statN}>{n}</Text>
      <Text style={s.statL}>{l}</Text>
    </View>
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
  inner: { padding: 28, paddingTop: 76, paddingBottom: 120 },
  kicker: { ...t.mono, fontSize: 11, letterSpacing: 1.6, color: colors.teal, marginBottom: 8 },
  name: { ...t.display, fontSize: 32, color: colors.indigo },
  handle: { ...t.body, fontSize: 15, color: colors.inkSoft, marginBottom: 24 },
  card: {
    backgroundColor: colors.sand, borderWidth: 1, borderColor: colors.hairline,
    borderRadius: 14, padding: 20,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { alignItems: 'center', flex: 1 },
  statN: { ...t.display, fontSize: 24, color: colors.indigo },
  statL: { ...t.mono, fontSize: 9, letterSpacing: 0.8, color: colors.inkSoft, marginTop: 3 },
  divider: { height: 1, backgroundColor: colors.hairline, marginVertical: 18 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 },
  rowLabel: { ...t.mono, fontSize: 11, letterSpacing: 1, color: colors.inkSoft },
  rowValue: { ...t.body, fontSize: 14, color: colors.ink, flexShrink: 1, textAlign: 'right' },
  section: { ...t.mono, fontSize: 11, letterSpacing: 1.4, color: colors.inkSoft, marginTop: 28, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1, borderColor: colors.teal, borderRadius: 20,
    paddingHorizontal: 13, paddingVertical: 6,
  },
  chipText: { ...t.body, fontSize: 13, color: colors.teal },
  empty: { ...t.body, fontSize: 13, color: colors.inkFaint },
  note: { ...t.body, fontSize: 13, lineHeight: 20, color: colors.inkSoft, marginTop: 26 },
  btn: {
    marginTop: 30, borderWidth: 1, borderColor: colors.hairline,
    borderRadius: 10, paddingVertical: 14, alignItems: 'center',
  },
  btnText: { ...t.body, color: colors.ink },
});
